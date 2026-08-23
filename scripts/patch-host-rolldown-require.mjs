#!/usr/bin/env node
/**
 * Patch Vite/Rolldown host `rolldown-runtime-*.js` so CJS `require("react")`
 * (and other shared externals) resolve via the browser import map.
 *
 * Shell/vendor chunks call the helper as `t("react")` / `t(\`react\`)`. Without
 * this shim the SPA never mounts (stuck on PHP "Loading dashboard…").
 *
 * Usage: node scripts/patch-host-rolldown-require.mjs
 *        (defaults to assets/dashboard-build/assets/)
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { SHARED_RUNTIME_PACKAGES } from './shared-runtime-packages.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dashboardRoot = path.resolve(__dirname, '..')
const assetsDir = path.resolve(
  process.argv[2] || path.join(dashboardRoot, 'assets/dashboard-build/assets'),
)

const THROW_MARKERS = [
  'throw Error("Calling `require` for',
  "throw Error('Calling `require` for",
]

function findThrow(code) {
  for (const marker of THROW_MARKERS) {
    const start = code.indexOf(marker)
    if (start < 0) continue
    const open = code.indexOf('Error(', start)
    if (open < 0) {
      throw new Error(`malformed require throw after ${marker.slice(0, 40)}…`)
    }
    let depth = 0
    let end = -1
    for (let i = open + 'Error'.length; i < code.length; i++) {
      const ch = code[i]
      if (ch === '(') depth += 1
      else if (ch === ')') {
        depth -= 1
        if (depth === 0) {
          end = i + 1 // exclusive
          break
        }
      }
    }
    if (end < 0) {
      throw new Error(`unbalanced Error( in require throw`)
    }
    return { start, end }
  }
  return null
}

function patchFile(abs) {
  let code = readFileSync(abs, 'utf8')
  if (code.includes('__webinRequireMap')) {
    console.log(`[patch-host-rolldown-require] skip (already patched) ${path.basename(abs)}`)
    return false
  }

  const hit = findThrow(code)
  if (!hit) {
    console.log(`[patch-host-rolldown-require] skip (no require throw) ${path.basename(abs)}`)
    return false
  }

  // Host CJS wrappers only need React family in practice; map all shared pkgs.
  const pkgs = [...SHARED_RUNTIME_PACKAGES]
  const importLines = pkgs.map(
    (pkg, i) => `import * as __webin_req_ns_${i} from ${JSON.stringify(pkg)};`,
  )
  const mapEntries = pkgs.map(
    (pkg, i) => `  ${JSON.stringify(pkg)}: __webin_req_ns_${i}.default ?? __webin_req_ns_${i},`,
  )
  const shim = `const __webinRequireMap = {
${mapEntries.join('\n')}
};
function __webinRequire(id) {
  if (Object.prototype.hasOwnProperty.call(__webinRequireMap, id)) {
    return __webinRequireMap[id];
  }
  throw Error("Calling \`require\` for \\"" + id + "\\" in an environment that doesn't expose the \`require\` function.");
}
`

  code = code.slice(0, hit.start) + 'return __webinRequire(e)' + code.slice(hit.end)
  code = `${importLines.join('\n')}\n${shim}${code}`

  writeFileSync(abs, code, 'utf8')
  console.log(
    `[patch-host-rolldown-require] patched ${path.basename(abs)} (${pkgs.length} mapped)`,
  )
  return true
}

const files = readdirSync(assetsDir)
  .filter((name) => /^rolldown-runtime-.*\.js$/.test(name))
  .map((name) => path.join(assetsDir, name))

if (files.length === 0) {
  console.error(
    `[patch-host-rolldown-require] FAIL: no rolldown-runtime-*.js in ${assetsDir}`,
  )
  process.exit(1)
}

let patched = 0
for (const file of files) {
  if (patchFile(file)) patched += 1
}

// Also patch any host chunk that inlined the throw (should be rare).
for (const name of readdirSync(assetsDir)) {
  if (!name.endsWith('.js') || name.startsWith('rolldown-runtime-')) continue
  const abs = path.join(assetsDir, name)
  const code = readFileSync(abs, 'utf8')
  if (!code.includes('Calling `require` for') || code.includes('__webinRequireMap')) {
    continue
  }
  if (patchFile(abs)) patched += 1
}

console.log(`[patch-host-rolldown-require] done (${patched} file(s) patched)`)
