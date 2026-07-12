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
  const { data } = useBootstrapQuery()
  const [Panel, setPanel] = useState<ComponentType<Record<string, unknown>> | null>(null)
  const [failed, setFailed] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const retry = useCallback(() => {
    setFailed(false)
    setPanel(null)
    setReloadKey((k) => k + 1)
  }, [])

  useEffect(() => {
    let cancelled = false
    setPanel(null)
    setFailed(false)
    void getModuleComponent(data?.activeModuleClients, slug, component)
      .then((comp) => {
        if (cancelled) return
        if (!comp) {
          setFailed(true)
          return
        }
        setPanel(() => comp as ComponentType<Record<string, unknown>>)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [data?.activeModuleClients, slug, component, reloadKey])

  if (failed) {
    return <QueryErrorState message={t('modules.loadFailed')} onRetry={retry} />
  }

  if (!Panel) {
    return <RoutePageSkeleton />
  }
  return <Panel {...(componentProps ?? {})} />
}
