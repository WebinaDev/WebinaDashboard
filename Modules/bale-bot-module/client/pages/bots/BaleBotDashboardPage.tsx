import { SettingsModulesChrome } from '@/components/settings/SettingsModulesChrome'
import { BotDashboardPanel } from '../../components/bots/BotDashboardPanel'

export default function BaleBotDashboardPage() {
  return (
    <SettingsModulesChrome>
      <BotDashboardPanel provider="bale" />
    </SettingsModulesChrome>
  )
}
