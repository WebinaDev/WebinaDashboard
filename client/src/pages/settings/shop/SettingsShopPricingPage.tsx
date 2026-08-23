import { Navigate, useParams } from 'react-router-dom'

import { ModuleDynamicRoute } from '@/components/ModuleDynamicRoute'
import { SettingsModulesChrome } from '@/components/settings/SettingsModulesChrome'
import { resolveWfcpPricingTab } from '@/pages/settings/shop/wfcpPricingTabs'

export default function SettingsShopPricingPage() {
  const { tab } = useParams()
  const resolved = resolveWfcpPricingTab(tab)
  if (tab && tab !== resolved) {
    return <Navigate to={`/settings/shop/pricing/${resolved}`} replace />
  }

  return (
    <SettingsModulesChrome>
      <ModuleDynamicRoute slug="wfcp-module" routePath="settings/shop/pricing/:tab" />
    </SettingsModulesChrome>
  )
}
