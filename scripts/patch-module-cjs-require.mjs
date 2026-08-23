#!/usr/bin/env node
/**
 * Patch Rolldown module.js so CJS require("react") (shared externals) uses ESM imports.
 *
 * Keeps all `import` declarations contiguous at the top (valid browser ESM),
 * then injects the require map helpers before the rest of the module body.
 *
 * Usage: node scripts/patch-module-cjs-require.mjs Modules/{slug}/client/dist/module.js
 */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { SHARED_RUNTIME_PACKAGES } from './shared-runtime-packages.mjs'

const file = process.argv[2]
if (!file) {
  console.error('Usage: patch-module-cjs-require.mjs <module.js>')
  process.exit(1)
}

const abs = path.resolve(file)
let code = readFileSync(abs, 'utf8')

if (code.includes('__webinRequireMap')) {
  process.exit(0)
}

const throwStart = code.indexOf('throw Error("Calling `require` for')
if (throwStart < 0) {
  process.exit(0)
}

const throwEnd = code.indexOf(');', throwStart)
if (throwEnd < 0) {
  console.error('FAIL: malformed require throw in', abs)
  process.exit(1)
}

const needed = SHARED_RUNTIME_PACKAGES.filter((pkg) => {
  const re = new RegExp(
    String.raw`\([\s\n]*["']${pkg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][\s\n]*\)`,
  )
  return re.test(code)
})
const pkgs = needed.length > 0 ? needed : ['react', 'react-dom', 'react/jsx-runtime']

const importLines = pkgs.map(
  (pkg, i) => `import * as __webin_req_ns_${i} from ${JSON.stringify(pkg)};`,
)
const mapEntries = pkgs.map(
  (pkg, i) => `  ${JSON.stringify(pkg)}: __webin_req_ns_${i}.default ?? __webin_req_ns_${i},`,
)

const shimConsts = `const __webinRequireMap = {
${mapEntries.join('\n')}
};
function __webinRequire(id) {
  if (Object.prototype.hasOwnProperty.call(__webinRequireMap, id)) {
    return __webinRequireMap[id];
  }
  throw Error("Calling \`require\` for \\"" + id + "\\" in an environment that doesn't expose the \`require\` function.");
}
`

// 1) Replace the throwing require body.
code = code.slice(0, throwStart) + 'return __webinRequire(e);' + code.slice(throwEnd + 2)

// 2) Prepend our imports, then insert shim after the full import block.
code = `${importLines.join('\n')}\n${code}`

const lines = code.split('\n')
let lastImportIdx = -1
for (let i = 0; i < lines.length; i++) {
  const trimmed = lines[i].trim()
  if (
    trimmed.startsWith('import ') ||
    trimmed.startsWith('import{') ||
    trimmed.startsWith('import*')
  ) {
    lastImportIdx = i
    continue
  }
  // Continuation / end of multi-line import
  if (
    lastImportIdx === i - 1 &&
    (trimmed.startsWith('}') ||
      trimmed.includes(' from ') ||
      trimmed.endsWith(';') ||
      trimmed === '')
  ) {
    if (trimmed !== '') lastImportIdx = i
    continue
  }
  if (lastImportIdx >= 0) break
}

if (lastImportIdx < 0) {
  console.error('FAIL: no import block found in', abs)
  process.exit(1)
}

code =
  lines.slice(0, lastImportIdx + 1).join('\n') +
  '\n' +
  shimConsts +
  lines.slice(lastImportIdx + 1).join('\n')

writeFileSync(abs, code, 'utf8')
console.log(
  `[patch-module-cjs-require] ${path.basename(path.dirname(path.dirname(path.dirname(abs))))} (${pkgs.length} mapped)`,
)
