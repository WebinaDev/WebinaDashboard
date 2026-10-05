import type { ComponentType } from 'react'

import { BotLogsPanel } from './components/bots/BotLogsPanel'
import { BotSettingsPanel } from './components/bots/BotSettingsPanel'
import BaleBotDashboardPage from './pages/bots/BaleBotDashboardPage'
import BotBroadcastPage from './pages/marketing/BotBroadcastPage'
import BotCampaignsPage from './pages/marketing/BotCampaignsPage'

export const routes: Record<string, ComponentType> = {
  'bots/bale': BaleBotDashboardPage,
  'marketing/bot-broadcast': BotBroadcastPage,
  'marketing/bot-campaigns': BotCampaignsPage,
}

export const components: Record<string, ComponentType> = {
  BotSettingsPanel,
  BotLogsPanel,
}

export default { routes, components }
