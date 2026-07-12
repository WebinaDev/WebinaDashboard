import { useCallback, useEffect, useState, type ComponentType } from 'react'
import { useTranslation } from 'react-i18next'

import { QueryErrorState } from '@/components/QueryErrorState'
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary'
import { RoutePageSkeleton } from '@/components/skeletons'
import { useBootstrapQuery } from '@/hooks/useBootstrapQuery'
import { getModuleRouteComponent } from '@/lib/moduleRuntime'

type Props = {
  slug: string
  routePath: string
}

export function ModuleDynamicRoute({ slug, routePath }: Props) {
  const { t } = useTranslation()
  const { data } = useBootstrapQuery()
  const [Page, setPage] = useState<ComponentType | null>(null)
  const [failed, setFailed] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const retry = useCallback(() => {
    setFailed(false)
    setPage(null)
    setReloadKey((k) => k + 1)
  }, [])

  useEffect(() => {
    let cancelled = false
    setPage(null)
    setFailed(false)
    void getModuleRouteComponent(data?.activeModuleClients, slug, routePath)
      .then((comp) => {
        if (cancelled) return
        if (!comp) {
          setFailed(true)
          return
        }
        setPage(() => comp)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [data?.activeModuleClients, slug, routePath, reloadKey])

  if (failed) {
    return <QueryErrorState message={t('modules.loadFailed')} onRetry={retry} />
  }
  if (!Page) {
    return <RoutePageSkeleton />
  }
  return (
    <RouteErrorBoundary>
      <Page />
    </RouteErrorBoundary>
  )
}
