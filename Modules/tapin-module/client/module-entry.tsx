import type { ComponentType } from 'react'

import { OrderTapinPanel } from './components/OrderTapinPanel'
import TapinCatalogPage from './pages/TapinCatalogPage'
import TapinFinancePage from './pages/TapinFinancePage'
import TapinOpsPage from './pages/TapinOpsPage'
import TapinSettingsPage from './pages/TapinSettingsPage'

export const routes: Record<string, ComponentType> = {
  'settings/shop/transport/tapin': TapinSettingsPage,
  'settings/shop/transport/tapin/ops': TapinOpsPage,
  'settings/shop/transport/tapin/finance': TapinFinancePage,
  'settings/shop/transport/tapin/catalog': TapinCatalogPage,
}

export const components: Record<string, ComponentType> = {
  OrderTapinPanel,
}

export default { routes, components }
