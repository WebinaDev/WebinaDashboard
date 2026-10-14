import { useLocation } from 'react-router-dom'

import { ModuleDynamicRoute } from '@/components/ModuleDynamicRoute'

/**
 * Host marketplace entry — loads basalam-module client when installed.
 * Keep this free of a hard @module-basalam import so dashboard builds
 * succeed when the optional marketplace package is not on disk.
 *
 * The module bundle exports routes keyed by full path
 * (`settings/shop/basalam`, `settings/shop/basalam/products`, ...), so the
 * route key must be the current path — not the bare slug "basalam".
 */
const BASALAM_ROOT_ROUTE = 'settings/shop/basalam'

function basalamRouteFromPathname(pathname: string): string {
  const clean = pathname.replace(/^\/+|\/+$/g, '')
  const idx = clean.indexOf(BASALAM_ROOT_ROUTE)
  if (idx < 0) return BASALAM_ROOT_ROUTE
  return clean.slice(idx)
}

export default function BasalamConnectorPage() {
  const { pathname } = useLocation()
  return <ModuleDynamicRoute slug="basalam-module" routePath={basalamRouteFromPathname(pathname)} />
}
