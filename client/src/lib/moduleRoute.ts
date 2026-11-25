/**
 * Manifest route paths are relative to dashboard basename (no leading slash).
 *
 * Segments may contain React Router params (`:originId`) which are camelCase, so
 * uppercase letters must be allowed after the first character. The first
 * character stays lowercase to keep public URLs canonical (no `Shop/...`).
 */
export const SAFE_MODULE_ROUTE = /^[a-z0-9][a-zA-Z0-9/_:-]*$/

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
