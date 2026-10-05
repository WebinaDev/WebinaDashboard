import { SettingsModulesChrome } from '@/components/settings/SettingsModulesChrome'
import { BotDashboardPanel } from '../../components/bots/BotDashboardPanel'

export default function TelegramBotDashboardPage() {
  return (
    <SettingsModulesChrome>
      <BotDashboardPanel provider="telegram" />
    </SettingsModulesChrome>
  )
}
