import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useParams } from 'react-router-dom'

import { ModuleDynamicRoute } from '@/components/ModuleDynamicRoute'
import { QueryErrorState } from '@/components/QueryErrorState'
import { useBootstrapQuery } from '@/hooks/useBootstrapQuery'
import { SettingsSectionLayout } from '@/layouts/SettingsSectionLayout'
import { marketplaceSettingsSectionsFromBootstrap } from '@/lib/marketplace-api'
import { resolveModuleSettingsRoutePath } from '@/lib/moduleRuntime'
import { shopNavItemsWithModules } from '@/pages/settings/shop/settings-shop-nav'

export default function ModuleSettingsShell() {
  const { t } = useTranslation()
  const { moduleSlug } = useParams<{ moduleSlug: string }>()
  const { data } = useBootstrapQuery()

  const section = useMemo(() => {
    return marketplaceSettingsSectionsFromBootstrap().find((s) => s.slug === moduleSlug)
  }, [moduleSlug])

  const routePath = useMemo(() => {
    if (!moduleSlug) {
      return null
    }
    return resolveModuleSettingsRoutePath(data?.activeModuleClients, moduleSlug, section?.route)
  }, [data?.activeModuleClients, moduleSlug, section?.route])

  if (!moduleSlug) {
    return <Navigate to="/settings/shop/general" replace />
  }

  if (section?.route && section.route !== `/settings/shop/module/${moduleSlug}`) {
    return <Navigate to={section.route.replace(/^\//, '')} replace />
  }

  return (
    <SettingsSectionLayout
      titleKey="marketplace.moduleSettingsTitle"
      descriptionKey="marketplace.moduleSettingsDesc"
      navItems={shopNavItemsWithModules()}
    >
      {routePath ? (
        <ModuleDynamicRoute slug={moduleSlug} routePath={routePath} />
      ) : (
        <QueryErrorState message={t('modules.loadFailed')} />
      )}
    </SettingsSectionLayout>
  )
}
