import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dashboardRoot = path.resolve(__dirname, '..')
const clientDir = path.join(dashboardRoot, 'client')
const modulesDir = path.resolve(dashboardRoot, 'Modules')
const clientNodeModules = path.join(clientDir, 'node_modules')
const requireFromClient = createRequire(path.join(clientNodeModules, 'package.json'))

const react = requireFromClient('@vitejs/plugin-react').default
const { defineConfig } = requireFromClient('vite')

const MODULE_SLUGS = [
  'analytics-module',
  'bale-bot-module',
  'basalam-module',
  'digikala-sellers-module',
  'digipay-upg-module',
  'sms-panel-module',
  'snapppay-gateway-module',
  'telegram-bot-module',
  'torobpay-gateway-module',
  'torob-products-extractor-module',
  'wfcp-module',
  'zarinpal-gateway-module',
]

/** @type {Record<string, string>} */
const MODULE_ALIAS_PREFIX = {
  'analytics-module': '@module-analytics',
  'bale-bot-module': '@module-bale-bot',
  'basalam-module': '@module-basalam',
  'digikala-sellers-module': '@module-digikala-sellers',
  'digipay-upg-module': '@module-digipay-upg',
  'sms-panel-module': '@module-sms-panel',
  'snapppay-gateway-module': '@module-snapppay',
  'telegram-bot-module': '@module-telegram-bot',
  'torobpay-gateway-module': '@module-torobpay',
  'torob-products-extractor-module': '@module-torob-extractor',
  'wfcp-module': '@module-wfcp',
  'zarinpal-gateway-module': '@module-zarinpal',
}

function buildModuleAliases() {
  /** @type {Record<string, string>} */
  const alias = {
    '@': path.join(clientDir, 'src'),
    react: path.join(clientNodeModules, 'react'),
    'react-dom': path.join(clientNodeModules, 'react-dom'),
    'react/jsx-runtime': path.join(clientNodeModules, 'react/jsx-runtime'),
  }
  for (const slug of MODULE_SLUGS) {
    const prefix = MODULE_ALIAS_PREFIX[slug]
    if (prefix) {
      alias[prefix] = path.join(modulesDir, slug, 'client')
    }
  }
  return alias
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
      try {
        return requireFromClient.resolve(source)
      } catch {
        return null
      }
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

export default defineConfig({
  plugins: [modulesNodeModulesResolver(), react()],
  publicDir: false,
  resolve: {
    dedupe: ['react', 'react-dom'],
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
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
})
