import type { ComponentType } from 'react'

import { CoffeeProfileProductPanel } from './components/CoffeeProfileProductPanel'
import { CoffeeWeightPricingPanel } from './components/CoffeeWeightPricingPanel'
import CoffeeOriginEditorPage from './pages/CoffeeOriginEditorPage'
import CoffeeOriginsPage from './pages/CoffeeOriginsPage'
import CoffeePricingPage from './pages/CoffeePricingPage'
import CoffeeProfileSettingsPage from './pages/CoffeeProfileSettingsPage'

export const routes: Record<string, ComponentType> = {
  'shop/coffee-origins': CoffeeOriginsPage,
  'shop/coffee-origins/new': CoffeeOriginEditorPage,
  'shop/coffee-origins/:originId': CoffeeOriginEditorPage,
  'shop/coffee-pricing': CoffeePricingPage,
  'settings/shop/coffee-profile': CoffeeProfileSettingsPage,
}

export const components: Record<string, ComponentType> = {
  CoffeeProfileProductPanel,
  CoffeeWeightPricingPanel,
}

export default { routes, components }
