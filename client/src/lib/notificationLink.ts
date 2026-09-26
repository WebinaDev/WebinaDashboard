/**
 * Convert a stored notification link (absolute or relative) into an in-app SPA path.
 * Strips `/dashboard` prefix and trailing slash (except root) so routes like
 * `shop/products/:productId` match without a trailing slash.
 */
export function toAppPath(link: string): string | null {
  if (!link) return null

  const stripTrailing = (path: string): string => {
    if (!path || path === '/') return path || '/'
    return path.replace(/\/+$/, '') || '/'
  }

  try {
    if (link.startsWith('/')) {
      let path: string
      if (link.startsWith('/dashboard')) {
        path = link.replace(/^\/dashboard/, '') || '/'
      } else {
        const base = (window.webinoDashboard?.baseUrl || '/dashboard/').replace(/\/$/, '')
        const basePath = new URL(base, window.location.origin).pathname.replace(/\/$/, '')
        if (link === basePath || link.startsWith(`${basePath}/`)) {
          path = link.slice(basePath.length) || '/'
        } else {
          path = link
        }
      }
      const [pathname, search = ''] = path.split('?')
      const clean = stripTrailing(pathname)
      return search ? `${clean}?${search}` : clean
    }

    const u = new URL(link, window.location.origin)
    const base = new URL(window.webinoDashboard?.baseUrl || '/dashboard/', window.location.origin)
    const basePath = base.pathname.replace(/\/$/, '')
    if (u.origin === base.origin && u.pathname.startsWith(basePath)) {
      const path = stripTrailing(u.pathname.slice(basePath.length) || '/')
      return `${path}${u.search}`
    }
  } catch {
    return null
  }
  return null
}

/**
 * Staff inbox: rewrite legacy customer portal order links to the admin order detail route.
 */
export function rewriteStaffOrderPath(appPath: string | null, isStaff: boolean): string | null {
  if (!appPath || !isStaff) return appPath
  const [pathname, search = ''] = appPath.split('?')
  const m = pathname.match(/^\/account\/orders\/(\d+)$/)
  if (!m) return appPath
  const next = `/orders/list/${m[1]}`
  return search ? `${next}?${search}` : next
}

/** toAppPath + staff order rewrite in one step. */
export function toNotificationNavPath(link: string, isStaff: boolean): string | null {
  return rewriteStaffOrderPath(toAppPath(link), isStaff)
}
