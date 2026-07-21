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

/** Clear cached module bundles after install, toggle, or version change. */
export function invalidateModuleBundleCache(slug?: string): void {
  if (slug) {
    bundleCache.delete(slug)
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
    // Legacy: wp-content/plugins/Modules/{slug}/... → WebinaDashboard/Modules/{slug}/...
    if (path.includes('/wp-content/plugins/Modules/')) {
      path = path.replace('/wp-content/plugins/Modules/', '/wp-content/plugins/WebinaDashboard/Modules/')
    }
    if (path.includes('/WebinaDashboard/Modules/') || path.includes('/plugins/WebinaDashboard/Modules/')) {
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
  const cached = bundleCache.get(slug)
  if (cached) {
    return cached
  }
  const resolved = normalizeModuleEntryUrl(entry)
  assertAllowedModuleEntry(resolved)
  const mod = await import(/* @vite-ignore */ resolved)
  const bundle = normalizeModuleBundle(mod as Record<string, unknown>)
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
  return bundle.routes?.[routePath] ?? null
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
