import type { ComponentType } from 'react'

import { normalizeModuleRoutePath } from '@/lib/moduleRoute'

import { isAllowedRemoteUrl } from '@/lib/safeUrl'
import type { ActiveModuleClient } from '@/types/modules'

export type ModuleBundle = {
  routes?: Record<string, ComponentType>
  components?: Record<string, ComponentType>
}

type RouteArrayEntry = {
  path?: string
  element?: ComponentType
}

const bundleCache = new Map<string, ModuleBundle>()

/** Strip legacy `-module` path segments for tolerant route lookup after URL cleanup. */
export function stripModulePathSegment(path: string): string {
  return normalizeModuleRoutePath(path).replace(/-module(?=\/|$)/g, '')
}

/**
 * Resolve a route component with exact match first, then legacy `-module` aliases.
 * Prevents loadFailed when cached/old bundles and new manifests disagree on path schema.
 */
export function resolveBundleRoute(
  routes: Record<string, ComponentType> | undefined,
  routePath: string,
): ComponentType | null {
  if (!routes) {
    return null
  }
  const normalized = normalizeModuleRoutePath(routePath)
  if (routes[normalized]) {
    return routes[normalized]
  }
  if (routes[routePath]) {
    return routes[routePath]
  }
  const stripped = stripModulePathSegment(normalized)
  for (const [key, comp] of Object.entries(routes)) {
    if (normalizeModuleRoutePath(key) === normalized) {
      return comp
    }
    if (stripModulePathSegment(key) === stripped) {
      return comp
    }
  }
  return null
}

/** Clear cached module bundles after install, toggle, or version change. */
export function invalidateModuleBundleCache(slug?: string): void {
  if (slug) {
    for (const key of [...bundleCache.keys()]) {
      if (key === slug || key.startsWith(`${slug}::`)) {
        bundleCache.delete(key)
      }
    }
    return
  }
  bundleCache.clear()
}

function routesArrayToRecord(routes: unknown): Record<string, ComponentType> | undefined {
  if (!Array.isArray(routes)) {
    return undefined
  }
  const out: Record<string, ComponentType> = {}
  for (const entry of routes as RouteArrayEntry[]) {
    const path = typeof entry?.path === 'string' ? entry.path.trim().replace(/^\/+/, '') : ''
    const element = entry?.element
    if (path && typeof element === 'function') {
      out[path] = element
    }
  }
  return Object.keys(out).length > 0 ? out : undefined
}

function unwrapModuleExport(raw: unknown): Record<string, unknown> {
  if (typeof raw === 'function') {
    return unwrapModuleExport((raw as () => unknown)())
  }
  if (raw && typeof raw === 'object') {
    return raw as Record<string, unknown>
  }
  return {}
}

/** Normalize dynamic import result to { routes, components } regardless of export shape. */
export function normalizeModuleBundle(mod: Record<string, unknown>): ModuleBundle {
  const root = unwrapModuleExport(mod.default ?? mod)
  const routesRaw = root.routes ?? mod.routes
  const componentsRaw = root.components ?? mod.components

  let routes: Record<string, ComponentType> | undefined
  if (routesRaw && !Array.isArray(routesRaw) && typeof routesRaw === 'object') {
    routes = routesRaw as Record<string, ComponentType>
  } else {
    routes = routesArrayToRecord(routesRaw)
  }

  const components =
    componentsRaw && typeof componentsRaw === 'object' && !Array.isArray(componentsRaw)
      ? (componentsRaw as Record<string, ComponentType>)
      : undefined

  return { routes, components }
}

function assertAllowedModuleEntry(entry: string): void {
  const trimmed = entry.trim()
  if (!trimmed) {
    throw new Error('Module entry URL is empty')
  }
  if (trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../')) {
    if (trimmed.includes('..')) {
      throw new Error('Module entry path is not allowed')
    }
    return
  }
  if (!isAllowedRemoteUrl(trimmed)) {
    throw new Error('Module entry origin is not allowed')
  }
}

/**
 * Rewrite legacy sibling Modules URLs and force same-origin absolute URLs
 * so dynamic import works after Modules moved inside WebinaDashboard.
 */
export function normalizeModuleEntryUrl(entry: string): string {
  const trimmed = entry.trim()
  if (!trimmed) {
    return trimmed
  }
  try {
    const parsed = new URL(trimmed, window.location.origin)
    let path = parsed.pathname
    // Legacy: wp-content/plugins/Modules/{slug}/... → {plugin}/Modules/{slug}/...
    if (path.includes('/wp-content/plugins/Modules/')) {
      const pluginMatch = window.location.pathname.match(/\/wp-content\/plugins\/([^/]+)\//)
      const pluginFolder = pluginMatch?.[1] || 'WebinaDashboard'
      path = path.replace(
        '/wp-content/plugins/Modules/',
        `/wp-content/plugins/${pluginFolder}/Modules/`,
      )
    }
    if (path.includes('/Modules/') && path.includes('/wp-content/plugins/')) {
      return `${window.location.origin}${path}${parsed.search}`
    }
    // Same-origin absolute for any allowed absolute URL (avoids http/https host drift).
    if (parsed.origin === window.location.origin) {
      return `${window.location.origin}${path}${parsed.search}`
    }
    return parsed.href
  } catch {
    return trimmed
  }
}

export async function loadModuleBundle(slug: string, entry: string): Promise<ModuleBundle> {
  const resolved = normalizeModuleEntryUrl(entry)
  const cacheKey = `${slug}::${resolved}`
  const cached = bundleCache.get(cacheKey) ?? bundleCache.get(slug)
  if (cached) {
    bundleCache.set(cacheKey, cached)
    return cached
  }
  assertAllowedModuleEntry(resolved)
  const mod = await import(/* @vite-ignore */ resolved)
  const bundle = normalizeModuleBundle(mod as Record<string, unknown>)
  bundleCache.set(cacheKey, bundle)
  bundleCache.set(slug, bundle)
  return bundle
}

export function findModuleClient(
  clients: ActiveModuleClient[] | undefined,
  slug: string,
): ActiveModuleClient | undefined {
  return clients?.find((c) => c.slug === slug)
}

/** Resolve client bundle route key for module settings shell. */
export function resolveModuleSettingsRoutePath(
  clients: ActiveModuleClient[] | undefined,
  slug: string,
  sectionRoute?: string,
): string | null {
  const client = findModuleClient(clients, slug)
  const paths = client?.routes?.map((r) => r.path).filter(Boolean) ?? []
  if (paths.length === 0) {
    return null
  }
  if (sectionRoute) {
    const normalized = normalizeModuleRoutePath(sectionRoute)
    const exact = paths.find((p) => normalizeModuleRoutePath(p) === normalized)
    if (exact) {
      return exact
    }
    const stripped = stripModulePathSegment(normalized)
    const aliased = paths.find((p) => stripModulePathSegment(p) === stripped)
    if (aliased) {
      return aliased
    }
  }
  const settingsRoute = paths.find((p) => p.startsWith('settings/'))
  if (settingsRoute) {
    return settingsRoute
  }
  return paths[0] ?? null
}

export async function getModuleRouteComponent(
  clients: ActiveModuleClient[] | undefined,
  slug: string,
  routePath: string,
): Promise<ComponentType | null> {
  const client = findModuleClient(clients, slug)
  if (!client?.entry) {
    return null
  }
  const bundle = await loadModuleBundle(slug, client.entry)
  return resolveBundleRoute(bundle.routes, routePath)
}

export async function getModuleComponent(
  clients: ActiveModuleClient[] | undefined,
  slug: string,
  name: string,
): Promise<ComponentType | null> {
  const client = findModuleClient(clients, slug)
  if (!client?.entry) {
    return null
  }
  const bundle = await loadModuleBundle(slug, client.entry)
  return bundle.components?.[name] ?? null
}
