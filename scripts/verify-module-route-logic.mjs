#!/usr/bin/env node
/**
 * Unit-style checks for module route validation (mirrors client/src/lib/moduleRoute.ts).
 */
const SAFE_MODULE_ROUTE = /^[a-z0-9][a-z0-9/_:-]*$/

function normalizeModuleRoutePath(path) {
  return path.trim().replace(/^\/+/, '')
}

function isSafeModuleRoutePath(path) {
  const normalized = normalizeModuleRoutePath(path)
  if (!normalized || normalized.includes('..') || normalized.includes('//')) {
    return false
  }
  return SAFE_MODULE_ROUTE.test(normalized)
}

function routesArrayToRecord(routes) {
  if (!Array.isArray(routes)) return undefined
  const out = {}
  for (const entry of routes) {
    const path = typeof entry?.path === 'string' ? entry.path.trim().replace(/^\/+/, '') : ''
    if (path && typeof entry.element === 'function') {
      out[path] = entry.element
    }
  }
  return Object.keys(out).length > 0 ? out : undefined
}

function unwrapModuleExport(raw) {
  if (typeof raw === 'function') {
    return unwrapModuleExport(raw())
  }
  if (raw && typeof raw === 'object') {
    return raw
  }
  return {}
}

function normalizeModuleBundle(mod) {
  const root = unwrapModuleExport(mod.default ?? mod)
  const routesRaw = root.routes ?? mod.routes
  let routes
  if (routesRaw && !Array.isArray(routesRaw) && typeof routesRaw === 'object') {
    routes = routesRaw
  } else {
    routes = routesArrayToRecord(routesRaw)
  }
  const componentsRaw = root.components ?? mod.components
  const components =
    componentsRaw && typeof componentsRaw === 'object' && !Array.isArray(componentsRaw)
      ? componentsRaw
      : undefined
  return { routes, components }
}

let failed = 0

function assert(name, cond) {
  if (!cond) {
    console.error(`FAIL: ${name}`)
    failed = 1
  } else {
    console.log(`OK: ${name}`)
  }
}

assert('accepts wfcp path', isSafeModuleRoutePath('shop/wfcp-module/quick-add'))
assert('accepts param segment', isSafeModuleRoutePath('analytics-module/:section'))
assert('accepts settings param', isSafeModuleRoutePath('settings/wfcp-module/:tab'))
assert('strips leading slash', isSafeModuleRoutePath('/shop/wfcp-module/quick-add'))
assert('rejects traversal', !isSafeModuleRoutePath('../evil'))
assert('rejects double slash', !isSafeModuleRoutePath('shop//evil'))

const Page = () => null
const fromArray = normalizeModuleBundle({
  routes: [
    { path: 'settings/shop/basalam-module', element: Page },
    { path: '/settings/shop/basalam-module/payments', element: Page },
  ],
})
assert(
  'array routes normalize',
  fromArray.routes?.['settings/shop/basalam-module'] === Page &&
    fromArray.routes?.['settings/shop/basalam-module/payments'] === Page,
)

const fromFn = normalizeModuleBundle({
  default: () => ({ routes: { 'bots/bale': Page } }),
})
assert('function export unwrap', fromFn.routes?.['bots/bale'] === Page)

function stripModulePathSegment(path) {
  return normalizeModuleRoutePath(path).replace(/-module(?=\/|$)/g, '')
}

function resolveBundleRoute(routes, routePath) {
  if (!routes) return null
  const normalized = normalizeModuleRoutePath(routePath)
  if (routes[normalized]) return routes[normalized]
  if (routes[routePath]) return routes[routePath]
  const stripped = stripModulePathSegment(normalized)
  for (const [key, comp] of Object.entries(routes)) {
    if (normalizeModuleRoutePath(key) === normalized) return comp
    if (stripModulePathSegment(key) === stripped) return comp
  }
  return null
}

const legacyRoutes = {
  'analytics-module/:section': Page,
  'shop/wfcp-module/quick-add': Page,
}
assert(
  'legacy analytics alias',
  resolveBundleRoute(legacyRoutes, 'analytics/:section') === Page,
)
assert(
  'legacy wfcp alias',
  resolveBundleRoute(legacyRoutes, 'shop/wfcp/quick-add') === Page,
)
assert(
  'clean path exact',
  resolveBundleRoute({ 'settings/shop/snapppay': Page }, 'settings/shop/snapppay') === Page,
)
assert('strip module segment', stripModulePathSegment('shop/wfcp-module/quick-add') === 'shop/wfcp/quick-add')

if (failed) {
  process.exit(1)
}
