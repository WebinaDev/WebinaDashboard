import { Navigate, useParams } from 'react-router-dom'

import { ModulePanel } from '@/components/ModulePanel'
import { BotProviderSwitcher } from '@/components/bots/BotProviderSwitcher'
import { DashboardSettingsPanel } from '@/components/settings/DashboardSettingsPanel'
import { ModulesSettingsPanel } from '@/components/settings/ModulesSettingsPanel'
import { SettingsModulesChrome } from '@/components/settings/SettingsModulesChrome'
import { SiteGeneralSettingsPanel } from '@/components/settings/SiteGeneralSettingsPanel'
import { SiteSmsSettingsPanel } from '@/components/settings/SiteSmsSettingsPanel'
import { WcSettingsSectionPanel } from '@/components/settings/WcSettingsSectionPanel'
import { LicenseSettingsPanel } from '@/components/settings/LicenseSettingsPanel'
import { NotificationsSettingsPanel } from '@/components/notifications/NotificationsSettingsPanel'
import { useBotProvider } from '@/hooks/useBotProvider'
import { isSiteSection } from '@/lib/settings-nav'
import { Card, CardContent } from '@/components/ui/card'

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

export default function SettingsSiteShell() {
  const { section } = useParams<{ section: string }>()

  if (!isSiteSection(section)) {
    return <Navigate to="/settings/site/general" replace />
  }

  return (
    <SettingsModulesChrome titleKey="settings.site.title" descriptionKey="settings.site.description">
      {section === 'general' ? <SiteGeneralSettingsPanel /> : null}
      {section === 'privacy' ? <WcSettingsSectionPanel page="account" /> : null}
      {section === 'license' ? <LicenseSettingsPanel /> : null}
      {section === 'dashboard' ? <DashboardSettingsPanel /> : null}
      {section === 'modules' ? <ModulesSettingsPanel /> : null}
      {section === 'bots' ? <BotSettingsSection /> : null}
      {section === 'system-logs' ? <BotLogsSection /> : null}
      {section === 'analytics' ? (
        <ModulePanel slug="analytics-module" component="AnalyticsSettingsPanel" />
      ) : null}
      {section === 'sms' ? <SiteSmsSettingsPanel /> : null}
      {section === 'notifications' ? <NotificationsSettingsPanel /> : null}
    </SettingsModulesChrome>
  )
}
