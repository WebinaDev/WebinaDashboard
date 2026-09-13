import { lazy, Suspense } from 'react'
import { Navigate, useParams } from 'react-router-dom'

import { ModulePanel } from '@/components/ModulePanel'
import { BotProviderSwitcher } from '@/components/bots/BotProviderSwitcher'
import { SettingsModulesChrome } from '@/components/settings/SettingsModulesChrome'
import { RoutePageSkeleton } from '@/components/skeletons'
import { Card, CardContent } from '@/components/ui/card'
import { useBotProvider } from '@/hooks/useBotProvider'
import { isSiteSection } from '@/lib/settings-nav'

const SiteGeneralSettingsPanel = lazy(() =>
  import('@/components/settings/SiteGeneralSettingsPanel').then((m) => ({ default: m.SiteGeneralSettingsPanel })),
)
const WcSettingsSectionPanel = lazy(() =>
  import('@/components/settings/WcSettingsSectionPanel').then((m) => ({ default: m.WcSettingsSectionPanel })),
)
const LicenseSettingsPanel = lazy(() =>
  import('@/components/settings/LicenseSettingsPanel').then((m) => ({ default: m.LicenseSettingsPanel })),
)
const DashboardSettingsPanel = lazy(() =>
  import('@/components/settings/DashboardSettingsPanel').then((m) => ({ default: m.DashboardSettingsPanel })),
)
const StyleSettingsPanel = lazy(() =>
  import('@/components/settings/StyleSettingsPanel').then((m) => ({ default: m.StyleSettingsPanel })),
)
const PwaSettingsPanel = lazy(() =>
  import('@/components/settings/PwaSettingsPanel').then((m) => ({ default: m.PwaSettingsPanel })),
)
const ModulesSettingsPanel = lazy(() =>
  import('@/components/settings/ModulesSettingsPanel').then((m) => ({ default: m.ModulesSettingsPanel })),
)
const SiteSmsSettingsPanel = lazy(() =>
  import('@/components/settings/SiteSmsSettingsPanel').then((m) => ({ default: m.SiteSmsSettingsPanel })),
)
const NotificationsSettingsPanel = lazy(() =>
  import('@/components/notifications/NotificationsSettingsPanel').then((m) => ({
    default: m.NotificationsSettingsPanel,
  })),
)

function botModuleSlug(provider: string): string {
  return provider === 'telegram' ? 'telegram-bot-module' : 'bale-bot-module'
}

function BotSettingsSection() {
  const { provider, setProvider } = useBotProvider('bale')
  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardContent className="flex flex-wrap items-center gap-3 pt-6">
          <BotProviderSwitcher provider={provider} onChange={setProvider} />
        </CardContent>
      </Card>
      <ModulePanel
        slug={botModuleSlug(provider)}
        component="BotSettingsPanel"
        componentProps={{ provider }}
      />
    </div>
  )
}

function BotLogsSection() {
  const { provider, setProvider } = useBotProvider('bale')
  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardContent className="flex flex-wrap items-center gap-3 pt-6">
          <BotProviderSwitcher provider={provider} onChange={setProvider} />
        </CardContent>
      </Card>
      <ModulePanel slug={botModuleSlug(provider)} component="BotLogsPanel" componentProps={{ provider }} />
    </div>
  )
}

function PanelFallback() {
  return <RoutePageSkeleton />
}

export default function SettingsSiteShell() {
  const { section } = useParams<{ section: string }>()

  if (!isSiteSection(section)) {
    return <Navigate to="/settings/site/general" replace />
  }

  return (
    <SettingsModulesChrome titleKey="settings.site.title" descriptionKey="settings.site.description">
      <Suspense fallback={<PanelFallback />}>
        {section === 'general' ? <SiteGeneralSettingsPanel /> : null}
        {section === 'privacy' ? <WcSettingsSectionPanel page="account" /> : null}
        {section === 'license' ? <LicenseSettingsPanel /> : null}
        {section === 'dashboard' ? <DashboardSettingsPanel /> : null}
        {section === 'style' ? <StyleSettingsPanel /> : null}
        {section === 'pwa' ? <PwaSettingsPanel /> : null}
        {section === 'modules' ? <ModulesSettingsPanel /> : null}
        {section === 'bots' ? <BotSettingsSection /> : null}
        {section === 'system-logs' ? <BotLogsSection /> : null}
        {section === 'analytics' ? (
          <ModulePanel slug="analytics-module" component="AnalyticsSettingsPanel" />
        ) : null}
        {section === 'sms' ? <SiteSmsSettingsPanel /> : null}
        {section === 'notifications' ? <NotificationsSettingsPanel /> : null}
      </Suspense>
    </SettingsModulesChrome>
  )
}
