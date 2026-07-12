import { Navigate, useParams } from 'react-router-dom'

import { ModulePanel } from '@/components/ModulePanel'
import { BotProviderSwitcher } from '@/components/bots/BotProviderSwitcher'
import { DashboardSettingsPanel } from '@/components/settings/DashboardSettingsPanel'
import { ModulesSettingsPanel } from '@/components/settings/ModulesSettingsPanel'
import { SiteGeneralSettingsPanel } from '@/components/settings/SiteGeneralSettingsPanel'
import { SiteSmsSettingsPanel } from '@/components/settings/SiteSmsSettingsPanel'
import { WcSettingsSectionPanel } from '@/components/settings/WcSettingsSectionPanel'
import { SettingsSectionLayout, type SettingsNavItem } from '@/layouts/SettingsSectionLayout'
import { LicenseSettingsPanel } from '@/components/settings/LicenseSettingsPanel'
import { useBotProvider } from '@/hooks/useBotProvider'
import { isSiteSection } from '@/lib/settings-nav'
import { Card, CardContent } from '@/components/ui/card'

const NAV: SettingsNavItem[] = [
  { id: 'general', to: '/settings/site/general', labelKey: 'settings.site.sections.general' },
  { id: 'privacy', to: '/settings/site/privacy', labelKey: 'settings.site.sections.privacy' },
  { id: 'license', to: '/settings/site/license', labelKey: 'settings.site.sections.license' },
  { id: 'dashboard', to: '/settings/site/dashboard', labelKey: 'settings.site.sections.dashboard' },
  { id: 'modules', to: '/settings/site/modules', labelKey: 'settings.site.sections.modules' },
  { id: 'bots', to: '/settings/site/bots', labelKey: 'settings.site.sections.bots' },
  { id: 'system-logs', to: '/settings/site/system-logs', labelKey: 'settings.site.sections.systemLogs' },
  { id: 'analytics', to: '/settings/site/analytics', labelKey: 'settings.site.sections.analytics' },
  { id: 'sms', to: '/settings/site/sms', labelKey: 'settings.site.sections.sms' },
]

function BotSettingsSection() {
  const { provider, setProvider } = useBotProvider('bale')
  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardContent className="flex flex-wrap items-center gap-3 pt-6">
          <BotProviderSwitcher provider={provider} onChange={setProvider} />
        </CardContent>
      </Card>
      <ModulePanel slug="bale-bot-module" component="BotSettingsPanel" componentProps={{ provider }} />
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
      <ModulePanel slug="bale-bot-module" component="BotLogsPanel" componentProps={{ provider }} />
    </div>
  )
}

export default function SettingsSiteShell() {
  const { section } = useParams<{ section: string }>()

  if (!isSiteSection(section)) {
    return <Navigate to="/settings/site/general" replace />
  }

  return (
    <SettingsSectionLayout titleKey="settings.site.title" descriptionKey="settings.site.description" navItems={NAV}>
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
    </SettingsSectionLayout>
  )
}
