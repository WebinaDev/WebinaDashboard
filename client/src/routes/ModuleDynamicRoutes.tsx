import { Route } from 'react-router-dom'

import { ModuleDynamicRoute } from '@/components/ModuleDynamicRoute'
import { PermissionGate } from '@/components/PermissionGate'
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary'
import { RoutePageSkeleton } from '@/components/skeletons'
import { useBootstrapQuery } from '@/hooks/useBootstrapQuery'
import { isSafeModuleRoutePath, normalizeModuleRoutePath } from '@/lib/moduleRoute'
import { Suspense } from 'react'

export function useModuleDynamicRoutes() {
  const { data } = useBootstrapQuery()
  const clients = data?.activeModuleClients ?? []

  return clients.flatMap((client) => {
    if (!client?.slug || !Array.isArray(client.routes)) {
      return []
    }
    return client.routes
      .filter((route) => {
        const path = typeof route?.path === 'string' ? normalizeModuleRoutePath(route.path) : ''
        const hasPath = path.length > 0 && isSafeModuleRoutePath(path)
        const hasCapability = typeof route?.capability === 'string' && route.capability.trim().length > 0
        return hasPath && hasCapability
      })
      .map((route) => {
        const path = normalizeModuleRoutePath(route.path)
        return (
          <Route
            key={`${client.slug}:${path}`}
            path={path}
            element={
              <RouteErrorBoundary>
                <PermissionGate capability={route.capability}>
                  <Suspense fallback={<RoutePageSkeleton />}>
                    <ModuleDynamicRoute slug={client.slug} routePath={path} />
                  </Suspense>
                </PermissionGate>
              </RouteErrorBoundary>
            }
          />
        )
      })
  })
}
