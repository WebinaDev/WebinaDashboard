import type { ComponentType } from 'react'

import DigikalaHomePage from './pages/digikala/DigikalaHomePage'
import DigikalaProductsPage from './pages/digikala/DigikalaProductsPage'
import DigikalaOrdersPage from './pages/digikala/DigikalaOrdersPage'
import DigikalaJobsPage from './pages/digikala/DigikalaJobsPage'
import DigikalaSettingsPageFull from './pages/digikala/DigikalaSettingsPageFull'
import DigikalaLogsPage from './pages/digikala/DigikalaLogsPage'

export const routes: Record<string, ComponentType> = {
  'settings/shop/digikala': DigikalaHomePage,
  'settings/shop/digikala/products': DigikalaProductsPage,
  'settings/shop/digikala/orders': DigikalaOrdersPage,
  'settings/shop/digikala/jobs': DigikalaJobsPage,
  'settings/shop/digikala/settings': DigikalaSettingsPageFull,
  'settings/shop/digikala/logs': DigikalaLogsPage,
  'settings/shop/digikala/sync': DigikalaProductsPage,
}

export default { routes }
