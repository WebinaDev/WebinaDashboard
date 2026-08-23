/// <reference types="vitest/config" />
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

/** Keep in sync with scripts/shared-runtime-packages.mjs */
const SHARED_RUNTIME_PACKAGES = [
  'react',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
  'react-dom',
  'react-dom/client',
  'react-router-dom',
  '@tanstack/query-core',
  '@tanstack/react-query',
  'i18next',
  'react-i18next',
  'sonner',
] as const

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientNodeModules = path.resolve(__dirname, 'node_modules')
const requireFromClient = createRequire(path.join(clientNodeModules, 'package.json'))

/** Prefer ESM resolves for Modules trees (avoid CJS → Rolldown helper shadowing). */
function modulesNodeModulesResolver(): Plugin {
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
      if ((SHARED_RUNTIME_PACKAGES as readonly string[]).includes(source)) {
        return { id: source, external: true }
      }
      const esmAliases: Record<string, string> = {
        recharts: path.join(clientNodeModules, 'recharts/es6/index.js'),
      }
      if (esmAliases[source]) {
        return esmAliases[source]
      }
      try {
        return requireFromClient.resolve(source)
      } catch {
        return null
      }
    },
  }
}

/** Heavy UI — keep out of the initial shell chunk (loaded with route/feature chunks). */
const SHELL_EXCLUDED_PREFIXES = [
  '/src/components/home/',
  '/src/components/orders/reports/',
  '/src/components/orders/OrdersTable',
  '/src/components/magazine/RichTextEditor',
  '/src/components/analytics-module/',
  '/Modules/analytics-module/client/components/',
  '/src/components/ui/chart.tsx',
  '/src/components/ui/chart.ts',
]

/**
 * Initial dashboard shell: layout, sidebar, core hooks/lib, chrome UI.
 * Everything else under components/ loads with lazy routes.
 */
function isDashboardShellSrc(id: string): boolean {
  const norm = id.replace(/\\/g, '/')
  if (!norm.includes('/src/')) {
    return false
  }
  if (norm.includes('/src/pages/') || norm.includes('/src/routes/')) {
    return false
  }
  if (norm.includes('/src/main.tsx') || norm.includes('/src/App.tsx')) {
    return false
  }
  if (SHELL_EXCLUDED_PREFIXES.some((p) => norm.includes(p))) {
    return false
  }

  return (
    norm.includes('/src/layouts/') ||
    norm.includes('/src/components/blocks/sidebar-07/') ||
    norm.includes('/src/components/ui/') ||
    norm.includes('/src/components/PermissionGate') ||
    norm.includes('/src/components/RouteErrorBoundary') ||
    norm.includes('/src/components/LanguageMenu') ||
    norm.includes('/src/components/AccentMenu') ||
    norm.includes('/src/components/ThemeMenu') ||
    norm.includes('/src/components/app-sidebar') ||
    norm.includes('/src/components/nav-user') ||
    norm.includes('/src/lib/') ||
    norm.includes('/src/hooks/') ||
    norm.includes('/src/theme/') ||
    norm.includes('/src/i18n/')
  )
}

const sharedExternals = [...SHARED_RUNTIME_PACKAGES]

export default defineConfig({
  plugins: [modulesNodeModulesResolver(), react(), tailwindcss()],
  resolve: {
    dedupe: [
      'react',
      'react-dom',
      'prosemirror-model',
      'prosemirror-view',
      'prosemirror-state',
      'prosemirror-transform',
      'prosemirror-commands',
      'prosemirror-keymap',
    ],
    conditions: ['import', 'module', 'browser', 'default'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      recharts: path.join(clientNodeModules, 'recharts/es6/index.js'),
      'react-remove-scroll': path.resolve(__dirname, './src/lib/react-remove-scroll-shim.tsx'),
      '@module-wfcp': path.resolve(__dirname, '../Modules/wfcp-module/client'),
      '@module-sms-panel': path.resolve(__dirname, '../Modules/sms-panel-module/client'),
      '@module-ai-content': path.resolve(__dirname, '../Modules/ai-content-module/client'),
      '@module-analytics': path.resolve(__dirname, '../Modules/analytics-module/client'),
      '@module-bale-bot': path.resolve(__dirname, '../Modules/bale-bot-module/client'),
      '@module-telegram-bot': path.resolve(__dirname, '../Modules/telegram-bot-module/client'),
      '@module-basalam': path.resolve(__dirname, '../Modules/basalam-module/client'),
      '@module-digikala-sellers': path.resolve(__dirname, '../Modules/digikala-sellers-module/client'),
      '@module-digipay-upg': path.resolve(__dirname, '../Modules/digipay-upg-module/client'),
      '@module-zarinpal': path.resolve(__dirname, '../Modules/zarinpal-gateway-module/client'),
      '@module-snapppay': path.resolve(__dirname, '../Modules/snapppay-gateway-module/client'),
      '@module-torobpay': path.resolve(__dirname, '../Modules/torobpay-gateway-module/client'),
      '@module-torob-extractor': path.resolve(__dirname, '../Modules/torob-products-extractor-module/client'),
    },
  },
  base: './',
  build: {
    outDir: '../assets/dashboard-build',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      external: sharedExternals,
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Shared runtime packages are external — never chunk them here.
            if (
              sharedExternals.some(
                (pkg) => id.includes(`/node_modules/${pkg}/`) || id.includes(`/node_modules/${pkg}\\`),
              )
            ) {
              return undefined
            }
            if (id.includes('@tanstack/react-table')) return 'vendor-tanstack-table'
            if (id.includes('@dnd-kit')) return 'vendor-dnd-kit'
            if (id.includes('recharts')) return 'vendor-recharts'
            if (id.includes('@tiptap') || id.includes('prosemirror')) return 'vendor-tiptap'
            if (id.includes('lucide-react')) return 'vendor-lucide'
            if (id.includes('@radix-ui') || id.includes('/radix-ui/')) return 'vendor-radix'
            if (id.includes('zod')) return 'vendor-zod'
            if (id.includes('dayjs') || id.includes('jalaliday')) return 'vendor-dayjs'
            if (id.includes('vaul')) return 'vendor-vaul'
            return 'vendor'
          }
          if (isDashboardShellSrc(id)) {
            return 'dashboard-shell'
          }
          return undefined
        },
      },
    },
  },
})
