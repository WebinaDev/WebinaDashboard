import type { ComponentType } from 'react'

import { BotLogsPanel } from './components/bots/BotLogsPanel'
import { BotSettingsPanel } from './components/bots/BotSettingsPanel'
import TelegramBotDashboardPage from './pages/bots/TelegramBotDashboardPage'

export const routes: Record<string, ComponentType> = {
  'bots/telegram': TelegramBotDashboardPage,
}

export const components: Record<string, ComponentType> = {
  BotSettingsPanel,
  BotLogsPanel,
}

export default { routes, components }
