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
  const { data, isPending, isError } = useBootstrapQuery()
  const [Page, setPage] = useState<ComponentType | null>(null)
  const [failed, setFailed] = useState(false)
  const [failDetail, setFailDetail] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const clients = data?.activeModuleClients
  const bootstrapReady = data !== undefined

  const retry = useCallback(() => {
    setFailed(false)
    setFailDetail(null)
    setPage(null)
    setReloadKey((k) => k + 1)
  }, [])

  useEffect(() => {
    if (!bootstrapReady) {
      if (!isPending && isError) {
        setFailDetail('bootstrap unavailable')
        setFailed(true)
      }
      return
    }
    let cancelled = false
    setPage(null)
    setFailed(false)
    setFailDetail(null)
    void getModuleRouteComponent(clients, slug, routePath)
      .then((comp) => {
        if (cancelled) return
        if (!comp) {
          const reason = !clients?.some((c) => c.slug === slug)
            ? `module "${slug}" missing from activeModuleClients`
            : `route "${routePath}" not exported by "${slug}"`
          console.error('[Webino] ModuleDynamicRoute load failed:', reason)
          setFailDetail(reason)
          setFailed(true)
          return
        }
        setPage(() => comp)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const msg = err instanceof Error ? err.message : String(err)
        console.error('[Webino] ModuleDynamicRoute import failed:', slug, routePath, err)
        setFailDetail(msg)
        setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [bootstrapReady, isPending, isError, clients, slug, routePath, reloadKey])

  if (failed) {
    const message = failDetail
      ? `${t('modules.loadFailed')} (${failDetail})`
      : t('modules.loadFailed')
    return <QueryErrorState message={message} onRetry={retry} />
  }
  if (!bootstrapReady || !Page) {
    return <RoutePageSkeleton />
  }
  return (
    <RouteErrorBoundary>
      <Page />
    </RouteErrorBoundary>
  )
}
