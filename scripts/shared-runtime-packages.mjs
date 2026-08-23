/**
 * Packages shared between the dashboard SPA and dynamic module clients.
 * Must stay in sync with module-client-vite externals + PHP import map.
 */
export const SHARED_RUNTIME_PACKAGES = [
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
]

/** Filename under assets/dashboard-build/shared/ for a package specifier. */
export function sharedRuntimeFileName(pkg) {
  return `${pkg.replace(/[@/]/g, '_')}.js`
}
