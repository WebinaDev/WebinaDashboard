import { useCallback, useEffect, useState, type ComponentType } from 'react'
import { useTranslation } from 'react-i18next'

import { QueryErrorState } from '@/components/QueryErrorState'
import { RoutePageSkeleton } from '@/components/skeletons'
import { useBootstrapQuery } from '@/hooks/useBootstrapQuery'
import { getModuleComponent } from '@/lib/moduleRuntime'

type Props = {
  slug: string
  component: string
  componentProps?: Record<string, unknown>
}

export function ModulePanel({ slug, component, componentProps }: Props) {
  const { t } = useTranslation()
  const { data, isPending, isError } = useBootstrapQuery()
  const [Panel, setPanel] = useState<ComponentType<Record<string, unknown>> | null>(null)
  const [failed, setFailed] = useState(false)
  const [failDetail, setFailDetail] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const clients = data?.activeModuleClients
  const bootstrapReady = data !== undefined

  const retry = useCallback(() => {
    setFailed(false)
    setFailDetail(null)
    setPanel(null)
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
    setPanel(null)
    setFailed(false)
    setFailDetail(null)
    void getModuleComponent(clients, slug, component)
      .then((comp) => {
        if (cancelled) return
        if (!comp) {
          const reason = !clients?.some((c) => c.slug === slug)
            ? `module "${slug}" missing from activeModuleClients`
            : `component "${component}" not exported by "${slug}"`
          console.error('[Webino] ModulePanel load failed:', reason)
          setFailDetail(reason)
          setFailed(true)
          return
        }
        setPanel(() => comp as ComponentType<Record<string, unknown>>)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const msg = err instanceof Error ? err.message : String(err)
        console.error('[Webino] ModulePanel import failed:', slug, component, err)
        setFailDetail(msg)
        setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [bootstrapReady, isPending, isError, clients, slug, component, reloadKey])

  if (failed) {
    const message = failDetail
      ? `${t('modules.loadFailed')} (${failDetail})`
      : t('modules.loadFailed')
    return <QueryErrorState message={message} onRetry={retry} />
  }

  if (!bootstrapReady || !Panel) {
    return <RoutePageSkeleton />
  }
  return <Panel {...(componentProps ?? {})} />
}
