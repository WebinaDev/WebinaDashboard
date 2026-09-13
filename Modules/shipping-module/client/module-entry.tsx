import type { ComponentType } from 'react'

import { OrderMapPanel } from './components/OrderMapPanel'
import { OrderPackagingPanel } from './components/OrderPackagingPanel'
import CitiesSettingsPage from './pages/CitiesSettingsPage'
import MapSettingsPage from './pages/MapSettingsPage'
import PackagingSettingsPage from './pages/PackagingSettingsPage'
import RulesSettingsPage from './pages/RulesSettingsPage'
import ToolsSettingsPage from './pages/ToolsSettingsPage'
import TransportHubPage from './pages/TransportHubPage'

export const routes: Record<string, ComponentType> = {
  'settings/shop/transport': TransportHubPage,
  'settings/shop/transport/packaging': PackagingSettingsPage,
  'settings/shop/transport/tools': ToolsSettingsPage,
  'settings/shop/transport/cities': CitiesSettingsPage,
  'settings/shop/transport/map': MapSettingsPage,
  'settings/shop/transport/rules': RulesSettingsPage,
}

export const components: Record<string, ComponentType> = {
  OrderPackagingPanel,
  OrderMapPanel,
}

export default { routes, components }
