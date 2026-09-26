import type { ComponentType } from 'react'

import ProductCatalogPage from './pages/ProductCatalogPage'
import ProductCatalogSettingsPage from './pages/ProductCatalogSettingsPage'

export const routes: Record<string, ComponentType> = {
  'shop/product-catalog': ProductCatalogPage,
  'settings/shop/product-catalog': ProductCatalogSettingsPage,
}

export default { routes }
