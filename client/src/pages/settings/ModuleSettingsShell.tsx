import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useParams } from 'react-router-dom'

import { ModuleDynamicRoute } from '@/components/ModuleDynamicRoute'
import { QueryErrorState } from '@/components/QueryErrorState'
import { SettingsModulesChrome } from '@/components/settings/SettingsModulesChrome'
import { RoutePageSkeleton } from '@/components/skeletons'
import { useBootstrapQuery } from '@/hooks/useBootstrapQuery'
import { marketplaceSettingsSectionsFromBootstrap } from '@/lib/marketplace-api'
import { resolveModuleSettingsRoutePath } from '@/lib/moduleRuntime'

export default function ModuleSettingsShell() {
  const { t } = useTranslation()
  const { moduleSlug } = useParams<{ moduleSlug: string }>()
  const { data, isPending, isError } = useBootstrapQuery()

  const bootstrapReady = data !== undefined

  const section = useMemo(() => {
    return marketplaceSettingsSectionsFromBootstrap().find(
      (s) => s.slug === moduleSlug || (s as { moduleSlug?: string }).moduleSlug === moduleSlug,
    )
  }, [moduleSlug])

  const routePath = useMemo(() => {
    if (!moduleSlug || !bootstrapReady) {
      return null
    }
    return resolveModuleSettingsRoutePath(data?.activeModuleClients, moduleSlug, section?.route)
  }, [bootstrapReady, data?.activeModuleClients, moduleSlug, section?.route])

  if (!moduleSlug) {
    return <Navigate to="/settings/shop/general" replace />
  }

  if (section?.route && section.route !== `/settings/shop/ext/${moduleSlug}`) {
    const target = section.route.startsWith('/') ? section.route : `/${section.route}`
    return <Navigate to={target} replace />
  }

  return (
    <SettingsModulesChrome>
      {!bootstrapReady ? (
        isPending || !isError ? (
          <RoutePageSkeleton />
        ) : (
          <QueryErrorState message={t('modules.loadFailed')} />
        )
      ) : routePath ? (
        <ModuleDynamicRoute slug={moduleSlug} routePath={routePath} />
      ) : (
        <QueryErrorState message={t('modules.loadFailed')} />
      )}
    </SettingsModulesChrome>
  )
}
