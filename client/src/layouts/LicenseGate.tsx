import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { Skeleton } from '@/components/ui/skeleton'
import { useBootstrapQuery } from '@/hooks/useBootstrapQuery'
import { getBootstrapSnapshot } from '@/lib/bootstrapQuery'

function LicenseLoading() {
  return (
    <div className="flex min-h-[40vh] flex-col gap-3 p-6" aria-busy="true">
      <Skeleton className="h-8 w-48 max-w-full" />
      <Skeleton className="h-32 w-full max-w-full" />
    </div>
  )
}

/**
 * License alarm only: soft banner while inactive; hard lock after server nag grace.
 * Never blocks the SPA while bootstrap loads — license is always on window.
 */
export function LicenseGate({ children }: { children?: ReactNode }) {
  const loc = useLocation()
  const bq = useBootstrapQuery()
  const boot = bq.data ?? getBootstrapSnapshot()
  const lic = boot?.license ?? window.webinoDashboard?.license

  const path = (loc.pathname.replace(/\/$/, '') || '/').replace(/^\/+/, '')
  if (path === 'license' || path.startsWith('license/')) {
    return children ? <>{children}</> : <Outlet />
  }

  // Never block the whole app while bootstrap loads — license is always on window.
  if ((bq.isPending || bq.isLoading) && !boot && !lic) {
    return <LicenseLoading />
  }

  if (lic?.force_license_page) {
    return <Navigate to="/license" replace />
  }

  return children ? <>{children}</> : <Outlet />
}
