#!/usr/bin/env node
/**
 * Verify every `manifest.vendor.required_paths` entry is real and self-consistent:
 *  - path lives under vendor/
 *  - path is documented in the module's vendor/README.md (release review step)
 *  - a *vendor-loader.php in includes/ references the same relative path
 *  - bootstrap.php wires the loader with ::init() and the module-registry guard
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const modulesDir = path.join(root, 'Modules')
let failed = 0

function fail(message) {
  console.error(`FAIL: ${message}`)
  failed = 1
}

function ok(message) {
  console.log(`OK: ${message}`)
}

const slugs = readdirSync(modulesDir).filter((slug) => {
  const full = path.join(modulesDir, slug)
  return statSync(full).isDirectory() && existsSync(path.join(full, 'manifest.json'))
})

let withVendor = 0

for (const slug of slugs) {
  const dir = path.join(modulesDir, slug)
  const manifest = JSON.parse(readFileSync(path.join(dir, 'manifest.json'), 'utf8'))
  const required = manifest.vendor?.required_paths
  if (!required) continue
  withVendor += 1

  if (!Array.isArray(required) || required.length === 0) {
    fail(`${slug} vendor.required_paths must be a non-empty array`)
    continue
  }

  const readmePath = path.join(dir, 'vendor', 'README.md')
  const readme = existsSync(readmePath) ? readFileSync(readmePath, 'utf8') : ''

  const includesDir = path.join(dir, 'includes')
  const loaders = existsSync(includesDir)
    ? readdirSync(includesDir).filter((f) => f.endsWith('vendor-loader.php'))
    : []
  const loaderSource = loaders.map((f) => readFileSync(path.join(includesDir, f), 'utf8')).join('\n')

  const bootstrapPath = path.join(dir, 'bootstrap.php')
  const bootstrap = existsSync(bootstrapPath) ? readFileSync(bootstrapPath, 'utf8') : ''

  for (const rel of required) {
    if (typeof rel !== 'string' || !rel.startsWith('vendor/') || rel.includes('..')) {
      fail(`${slug} required_paths entry must be a vendor/ path: ${String(rel)}`)
      continue
    }
    const inner = rel.replace(/^vendor\//, '')
    if (!readme.includes(inner)) {
      fail(`${slug} vendor/README.md does not document ${inner}`)
    }
    if (loaders.length === 0) {
      fail(`${slug} declares vendor.required_paths but has no includes/*vendor-loader.php`)
    } else if (!loaderSource.includes(inner)) {
      fail(`${slug} vendor loader never references ${inner}`)
    }
    if (!bootstrap.includes('require_module_files')) {
      fail(`${slug} bootstrap missing require_module_files guard`)
    }
    if (!/Vendor_Loader::init\s*\(/.test(bootstrap)) {
      fail(`${slug} bootstrap never calls *Vendor_Loader::init()`)
    }
  }

  ok(`${slug} vendor contract (${required.length} required path(s), ${loaders.length} loader)`)
}

if (withVendor === 0) {
  fail('no module declares vendor.required_paths — release validation would be a no-op')
}

if (failed) {
  console.error('== verify-vendor-manifests FAILED ==')
  process.exit(1)
}
console.log(`== verify-vendor-manifests PASSED (${withVendor} modules) ==`)
