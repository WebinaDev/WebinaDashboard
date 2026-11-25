#!/usr/bin/env node
/**
 * Every module with a client entry must be in BOTH build lists:
 *  - scripts/build-all-module-clients.sh SLUGS
 *  - scripts/module-client-vite.config.mjs MODULE_SLUGS (+ alias mapping)
 *
 * Drift is silent and expensive: a slug missing from the matrix keeps a
 * hand-written stub dist/module.js, so the module loads but renders nothing.
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const modulesDir = path.join(root, 'Modules')

const viteConfig = readFileSync(path.join(root, 'scripts/module-client-vite.config.mjs'), 'utf8')
const buildAll = readFileSync(path.join(root, 'scripts/build-all-module-clients.sh'), 'utf8')

function blockItems(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker)
  if (start < 0) return new Set()
  const end = source.indexOf(endMarker, start)
  const block = source.slice(start, end < 0 ? undefined : end)
  return new Set([...block.matchAll(/'([a-z0-9-]+-module)'/g)].map((m) => m[1]))
}

const viteSlugs = blockItems(viteConfig, 'const MODULE_SLUGS = [', ']')
const aliasSlugs = blockItems(viteConfig, 'const MODULE_ALIAS_PREFIX = {', '}')
const buildSlugs = new Set(
  [...buildAll.matchAll(/^\s{2}([a-z0-9-]+-module)$/gm)].map((m) => m[1]),
)

const entries = readdirSync(modulesDir)
  .filter((slug) => statSync(path.join(modulesDir, slug)).isDirectory())
  .filter((slug) => existsSync(path.join(modulesDir, slug, 'client', 'module-entry.tsx')))
  .sort()

let failed = 0
function fail(message) {
  console.error(`FAIL: ${message}`)
  failed = 1
}

for (const slug of entries) {
  const manifestPath = path.join(modulesDir, slug, 'manifest.json')
  const hasRoutes = existsSync(manifestPath)
    ? JSON.parse(readFileSync(manifestPath, 'utf8')).client?.routes?.length > 0
    : false

  if (!hasRoutes) continue

  if (!viteSlugs.has(slug)) fail(`${slug} has a client entry but is missing from MODULE_SLUGS`)
  if (!aliasSlugs.has(slug) && !slug.startsWith('wnc-')) {
    fail(`${slug} has a client entry but no @module-* alias mapping`)
  }
  if (!buildSlugs.has(slug)) fail(`${slug} has a client entry but is missing from build-all-module-clients.sh`)

  const dist = path.join(modulesDir, slug, 'client', 'dist', 'module.js')
  if (existsSync(dist)) {
    const source = readFileSync(dist, 'utf8')
    if (/^\/\/ stub/m.test(source) || source.includes('Placeholder bundle')) {
      fail(`${slug} dist/module.js is still the build stub — run scripts/build-all-module-clients.sh`)
    }
  }
}

for (const slug of buildSlugs) {
  if (!viteSlugs.has(slug)) fail(`build-all lists ${slug} but MODULE_SLUGS does not allow it`)
}

if (failed) {
  console.error('== verify-module-build-matrix FAILED ==')
  process.exit(1)
}
console.log(`== verify-module-build-matrix PASSED (${entries.length} client entries, ${buildSlugs.size} build slugs) ==`)
