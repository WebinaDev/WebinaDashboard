/** Manifest route paths are relative to dashboard basename (no leading slash). */
export const SAFE_MODULE_ROUTE = /^[a-z0-9][a-z0-9/_:-]*$/

export function normalizeModuleRoutePath(path: string): string {
  return path.trim().replace(/^\/+/, '')
}

export function isSafeModuleRoutePath(path: string): boolean {
  const normalized = normalizeModuleRoutePath(path)
  if (!normalized || normalized.includes('..') || normalized.includes('//')) {
    return false
  }
  return SAFE_MODULE_ROUTE.test(normalized)
}
