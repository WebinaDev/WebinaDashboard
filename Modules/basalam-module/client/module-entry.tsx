import type { ComponentType } from 'react'

import BasalamHomePage from './pages/basalam/BasalamHomePage'
import BasalamProductsPage from './pages/basalam/BasalamProductsPage'
import BasalamOrdersPage from './pages/basalam/BasalamOrdersPage'
import BasalamCategoriesPage from './pages/basalam/BasalamCategoriesPage'
import BasalamSyncSettingsPage from './pages/basalam/BasalamSyncSettingsPage'
import BasalamFinancePage from './pages/basalam/BasalamFinancePage'
import BasalamLogsPage from './pages/basalam/BasalamLogsPage'
import BasalamBoothPage from './pages/basalam/BasalamBoothPage'
import BasalamHelpPage from './pages/basalam/BasalamHelpPage'
import BasalamOnboardingPage from './pages/basalam/BasalamOnboardingPage'
import BasalamInfoPage from './pages/basalam/BasalamInfoPage'
import BasalamTicketsPage from './pages/basalam/BasalamTicketsPage'
import { BasalamChatDock } from './components/BasalamChatDock'

export const routes: Record<string, ComponentType> = {
  'settings/shop/basalam': BasalamHomePage,
  'settings/shop/basalam/products': BasalamProductsPage,
  'settings/shop/basalam/orders': BasalamOrdersPage,
  'settings/shop/basalam/categories': BasalamCategoriesPage,
  'settings/shop/basalam/settings': BasalamSyncSettingsPage,
  'settings/shop/basalam/finance': BasalamFinancePage,
  'settings/shop/basalam/booth': BasalamBoothPage,
  'settings/shop/basalam/tickets': BasalamTicketsPage,
  'settings/shop/basalam/help': BasalamHelpPage,
  'settings/shop/basalam/info': BasalamInfoPage,
  'settings/shop/basalam/onboarding': BasalamOnboardingPage,
  'settings/shop/basalam/logs': BasalamLogsPage,
  // Legacy aliases
  'settings/shop/basalam/payments': BasalamHomePage,
  'settings/shop/basalam/wallet': BasalamFinancePage,
  'settings/shop/basalam/subscriptions': BasalamHomePage,
  'settings/shop/basalam/webhooks': BasalamBoothPage,
  'settings/shop/basalam/operations': BasalamProductsPage,
}

/**
 * Components the dashboard shell can mount outside a route.
 * `BasalamChatDock` is the floating buyer-chat launcher (it replaced the wp-admin chat widget).
 */
export const components = {
  BasalamChatDock,
}

export default { routes, components }
