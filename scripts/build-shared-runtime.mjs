#!/usr/bin/env node
/**
 * Build shared ESM runtime files for host SPA + dynamic module clients.
 * Output: assets/dashboard-build/shared/*.js + shared/import-map.json
 *
 * React package entries are CJS. We bundle via absolute file paths and
 * re-export named bindings so import maps expose real ESM named exports.
 */
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync, rmSync, existsSync, statSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  SHARED_RUNTIME_PACKAGES,
  sharedRuntimeFileName,
} from './shared-runtime-packages.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dashboardRoot = path.resolve(__dirname, '..')
const clientDir = path.join(dashboardRoot, 'client')
const nm = path.join(clientDir, 'node_modules')
const outDir = path.join(dashboardRoot, 'assets/dashboard-build/shared')
const requireFromClient = createRequire(path.join(nm, 'package.json'))
const esbuild = requireFromClient('esbuild')

/** Absolute file entries for each shared package (prefer ESM where available). */
const PACKAGE_FILES = {
  react: path.join(nm, 'react/index.js'),
  'react/jsx-runtime': path.join(nm, 'react/jsx-runtime.js'),
  'react/jsx-dev-runtime': path.join(nm, 'react/jsx-dev-runtime.js'),
  'react-dom': path.join(nm, 'react-dom/index.js'),
  'react-dom/client': path.join(nm, 'react-dom/client.js'),
  'react-router-dom': path.join(nm, 'react-router-dom/dist/index.mjs'),
  '@tanstack/query-core': path.join(nm, '@tanstack/query-core/build/modern/index.js'),
  '@tanstack/react-query': path.join(nm, '@tanstack/react-query/build/modern/index.js'),
  i18next: path.join(nm, 'i18next/dist/esm/i18next.js'),
  'react-i18next': path.join(nm, 'react-i18next/dist/es/index.js'),
  sonner: path.join(nm, 'sonner/dist/index.mjs'),
}

const REACT_NAMED = [
  'Activity', 'Children', 'Component', 'Fragment', 'Profiler', 'PureComponent',
  'StrictMode', 'Suspense', 'cache', 'cacheSignal', 'cloneElement', 'createContext',
  'createElement', 'createRef', 'forwardRef', 'isValidElement', 'lazy', 'memo',
  'startTransition', 'use', 'useActionState', 'useCallback', 'useContext',
  'useDebugValue', 'useDeferredValue', 'useEffect', 'useEffectEvent', 'useId',
  'useImperativeHandle', 'useInsertionEffect', 'useLayoutEffect', 'useMemo',
  'useOptimistic', 'useReducer', 'useRef', 'useState', 'useSyncExternalStore',
  'useTransition', 'version',
]

function entrySource(pkg) {
  const abs = PACKAGE_FILES[pkg]
  if (!abs || !existsSync(abs)) {
    throw new Error(`Missing package file for ${pkg}: ${abs}`)
  }
  const href = JSON.stringify(abs)

  if (pkg === 'react') {
    return `
import React from ${href};
export default React;
export const { ${REACT_NAMED.join(', ')} } = React;
`
  }
  if (pkg === 'react/jsx-runtime') {
    return `
import * as ns from ${href};
const m = ns.default ?? ns;
export const Fragment = m.Fragment;
export const jsx = m.jsx;
export const jsxs = m.jsxs;
export default m;
`
  }
  if (pkg === 'react/jsx-dev-runtime') {
    return `
import * as ns from ${href};
const m = ns.default ?? ns;
export const Fragment = m.Fragment;
export const jsxDEV = m.jsxDEV;
export default m;
`
  }
  if (pkg === 'react-dom') {
    return `
import ReactDOM from ${href};
export default ReactDOM;
export const {
  createPortal, flushSync, preconnect, prefetchDNS, preinit, preinitModule,
  preload, preloadModule, requestFormReset, unstable_batchedUpdates,
  useFormState, useFormStatus, version
} = ReactDOM;
`
  }
  if (pkg === 'react-dom/client') {
    return `
import ReactDOMClient from ${href};
export default ReactDOMClient;
export const { createRoot, hydrateRoot, version } = ReactDOMClient;
`
  }
  if (pkg === 'i18next') {
    return `
import * as ns from ${href};
const m = ns.default ?? ns;
export default m;
export * from ${href};
`
  }
  // react-query re-exports query-core via `export *`. With query-core external,
  // esbuild drops that transitive star — so surface it explicitly for import maps.
  if (pkg === '@tanstack/react-query') {
    return `
export * from "@tanstack/query-core";
export * from ${href};
`
  }
  // Pure ESM packages — re-export everything from the absolute path.
  return `export * from ${href};\n`
}

function externalsFor(pkg) {
  // Keep peer shared packages as bare imports so the browser import map unifies them.
  return SHARED_RUNTIME_PACKAGES.filter((p) => p !== pkg)
}

async function buildOne(pkg) {
  const fileName = sharedRuntimeFileName(pkg)
  const outfile = path.join(outDir, fileName)

  await esbuild.build({
    absWorkingDir: clientDir,
    stdin: {
      contents: entrySource(pkg),
      resolveDir: clientDir,
      sourcefile: `shared-entry-${fileName}`,
    },
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: ['es2020'],
    outfile,
    external: externalsFor(pkg),
    packages: 'bundle',
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
    logLevel: 'warning',
    mainFields: ['module', 'browser', 'main'],
    conditions: ['import', 'module', 'browser', 'default'],
  })

  // esbuild may leave __require("react") for CJS deps with external peers — rewrite to ESM import.
  patchDynamicRequires(outfile, externalsFor(pkg))
  ensureReactQueryCoreReexports(pkg, outfile)

  return { pkg, file: `shared/${fileName}` }
}

/**
 * Ensure QueryClient (and other query-core symbols) are importable from the
 * shared @tanstack/react-query file. Host SPA does
 * `import { QueryClient } from "@tanstack/react-query"`.
 *
 * @param {string} pkg
 * @param {string} outfile
 */
function ensureReactQueryCoreReexports(pkg, outfile) {
  if (pkg !== '@tanstack/react-query') {
    return
  }
  let code = readFileSync(outfile, 'utf8')
  if (/export\s*\*\s*from\s*["']@tanstack\/query-core["']/.test(code)) {
    return
  }
  code += '\nexport * from "@tanstack/query-core";\n'
  writeFileSync(outfile, code, 'utf8')
}

/**
 * Replace esbuild's __require("react") (throws in browser ESM) with a real import binding.
 *
 * @param {string} outfile
 * @param {string[]} externals
 */
function patchDynamicRequires(outfile, externals) {
  let code = readFileSync(outfile, 'utf8')
  const needed = []
  for (const ext of externals) {
    const re = new RegExp(
      String.raw`__require\(["']${ext.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']\)`,
      'g',
    )
    if (!re.test(code)) continue
    needed.push(ext)
  }
  if (needed.length === 0) {
    return
  }

  const imports = []
  const replacements = []
  for (const [i, ext] of needed.entries()) {
    const id = `__webin_ext_${i}`
    imports.push(`import * as ${id}_ns from ${JSON.stringify(ext)};`)
    imports.push(`const ${id} = ${id}_ns.default ?? ${id}_ns;`)
    const re = new RegExp(
      String.raw`__require\(["']${ext.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']\)`,
      'g',
    )
    code = code.replace(re, id)
  }
  code = `${imports.join('\n')}\n${code}`
  writeFileSync(outfile, code, 'utf8')
}

rmSync(outDir, { recursive: true, force: true })
mkdirSync(outDir, { recursive: true })

const built = []
for (const pkg of SHARED_RUNTIME_PACKAGES) {
  const row = await buildOne(pkg)
  built.push(row)
  console.log(`[shared-runtime] ${pkg} -> ${row.file} (${statSync(path.join(outDir, sharedRuntimeFileName(pkg))).size} bytes)`)
}

writeFileSync(
  path.join(outDir, 'import-map.json'),
  JSON.stringify(
    {
      builtAt: new Date().toISOString(),
      packages: Object.fromEntries(built.map(({ pkg, file }) => [pkg, file])),
    },
    null,
    2,
  ) + '\n',
  'utf8',
)

console.log('[shared-runtime] OK', built.length, 'packages')
