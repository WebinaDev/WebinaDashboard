import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'

import {
  SHARED_RUNTIME_PACKAGES,
} from './shared-runtime-packages.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dashboardRoot = path.resolve(__dirname, '..')
const clientDir = path.join(dashboardRoot, 'client')
const modulesDir = path.resolve(dashboardRoot, 'Modules')
const clientNodeModules = path.join(clientDir, 'node_modules')
const requireFromClient = createRequire(path.join(clientNodeModules, 'package.json'))

const react = requireFromClient('@vitejs/plugin-react').default
const { defineConfig } = requireFromClient('vite')

const MODULE_SLUGS = [
  'accounting-module',
  'ai-content-module',
  'analytics-module',
  'bale-bot-module',
  'basalam-module',
  'digikala-sellers-module',
  'digipay-upg-module',
  'sms-panel-module',
  'snapppay-gateway-module',
  'snapppay-search-module',
  'telegram-bot-module',
  'torobpay-gateway-module',
  'torob-products-extractor-module',
  'wfcp-module',
  'zarinpal-gateway-module',
  'coffee-profile-module',
  'bale-pay-gateway-module',
  'card-to-card-gateway-module',
  'wallet-gateway-module',
]

/** @type {Record<string, string>} */
const MODULE_ALIAS_PREFIX = {
  'accounting-module': '@module-accounting',
  'ai-content-module': '@module-ai-content',
  'analytics-module': '@module-analytics',
  'bale-bot-module': '@module-bale-bot',
  'basalam-module': '@module-basalam',
  'digikala-sellers-module': '@module-digikala-sellers',
  'digipay-upg-module': '@module-digipay-upg',
  'sms-panel-module': '@module-sms-panel',
  'snapppay-gateway-module': '@module-snapppay',
  'snapppay-search-module': '@module-snapppay-search',
  'telegram-bot-module': '@module-telegram-bot',
  'torobpay-gateway-module': '@module-torobpay',
  'torob-products-extractor-module': '@module-torob-extractor',
  'wfcp-module': '@module-wfcp',
  'zarinpal-gateway-module': '@module-zarinpal',
  'coffee-profile-module': '@module-coffee-profile',
  'bale-pay-gateway-module': '@module-bale-pay',
  'card-to-card-gateway-module': '@module-c2c',
  'wallet-gateway-module': '@module-wallet',
}

/** Force ESM for packages that still get inlined (not on the shared runtime list). */
const INLINE_ESM_ALIASES = {
  recharts: path.join(clientNodeModules, 'recharts/es6/index.js'),
  'lucide-react': path.join(clientNodeModules, 'lucide-react/dist/esm/lucide-react.mjs'),
}

function buildModuleAliases() {
  /** @type {Record<string, string>} */
  const alias = {
    '@': path.join(clientDir, 'src'),
    'react-remove-scroll': path.join(clientDir, 'src/lib/react-remove-scroll-shim.tsx'),
    ...INLINE_ESM_ALIASES,
  }
  for (const slug of MODULE_SLUGS) {
    const prefix = MODULE_ALIAS_PREFIX[slug]
    if (prefix) {
      alias[prefix] = path.join(modulesDir, slug, 'client')
    }
  }
  return alias
}

function resolveEsmPrefer(source) {
  if (INLINE_ESM_ALIASES[source] && existsSync(INLINE_ESM_ALIASES[source])) {
    return INLINE_ESM_ALIASES[source]
  }
  try {
    return requireFromClient.resolve(source)
  } catch {
    return null
  }
}

function modulesNodeModulesResolver() {
  return {
    name: 'webino-modules-node-modules-resolver',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!importer?.includes('/Modules/')) {
        return null
      }
      if (
        source.startsWith('.') ||
        source.startsWith('/') ||
        source.startsWith('@module-') ||
        source.startsWith('@/')
      ) {
        return null
      }
      if (SHARED_RUNTIME_PACKAGES.includes(source)) {
        return { id: source, external: true }
      }
      return resolveEsmPrefer(source)
    },
  }
}

const slug = process.env.MODULE_SLUG
if (!slug) {
  throw new Error('MODULE_SLUG environment variable is required')
}
if (!MODULE_SLUGS.includes(slug)) {
  throw new Error(`Unknown module slug: ${slug}`)
}

const moduleClientDir = path.join(modulesDir, slug, 'client')
const entry = path.join(moduleClientDir, 'module-entry.tsx')
const outDir = path.join(moduleClientDir, 'dist')

const sharedExternals = [...SHARED_RUNTIME_PACKAGES]

export default defineConfig({
  plugins: [modulesNodeModulesResolver(), react()],
  publicDir: false,
  // Module bundles are loaded via dynamic import() in the browser. Without this
  // define, any remaining inlined deps can leave bare process.env.NODE_ENV.
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    conditions: ['import', 'module', 'browser', 'default'],
    alias: buildModuleAliases(),
  },
  build: {
    lib: {
      entry,
      formats: ['es'],
      fileName: () => 'module.js',
    },
    outDir,
    emptyOutDir: true,
    sourcemap: false,
    minify: true,
    target: 'es2020',
    rollupOptions: {
      external: sharedExternals,
      output: {
        inlineDynamicImports: true,
      },
    },
  },
})
