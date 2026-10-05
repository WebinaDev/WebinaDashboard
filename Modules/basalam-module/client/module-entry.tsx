import type { ComponentType } from 'react'

import BasalamHomePage from './pages/basalam/BasalamHomePage'
import BasalamProductsPage from './pages/basalam/BasalamProductsPage'
import BasalamOrdersPage from './pages/basalam/BasalamOrdersPage'
import BasalamCategoriesPage from './pages/basalam/BasalamCategoriesPage'
import BasalamSyncSettingsPage from './pages/basalam/BasalamSyncSettingsPage'
import BasalamFinancePage from './pages/basalam/BasalamFinancePage'
import BasalamLogsPage from './pages/basalam/BasalamLogsPage'
import BasalamBoothPage from './pages/basalam/BasalamBoothPage'

export const routes: Record<string, ComponentType> = {
  'settings/shop/basalam': BasalamHomePage,
  'settings/shop/basalam/products': BasalamProductsPage,
  'settings/shop/basalam/orders': BasalamOrdersPage,
  'settings/shop/basalam/categories': BasalamCategoriesPage,
  'settings/shop/basalam/settings': BasalamSyncSettingsPage,
  'settings/shop/basalam/finance': BasalamFinancePage,
  'settings/shop/basalam/booth': BasalamBoothPage,
  'settings/shop/basalam/tickets': BasalamHomePage,
  'settings/shop/basalam/logs': BasalamLogsPage,
  // Legacy aliases
  'settings/shop/basalam/payments': BasalamHomePage,
  'settings/shop/basalam/wallet': BasalamFinancePage,
  'settings/shop/basalam/subscriptions': BasalamHomePage,
  'settings/shop/basalam/webhooks': BasalamBoothPage,
  'settings/shop/basalam/operations': BasalamProductsPage,
}

export default { routes }
