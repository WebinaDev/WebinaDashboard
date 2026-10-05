import type { ComponentType } from 'react'

import TorobPaySettingsPage from './pages/TorobPaySettingsPage'

export const routes: Record<string, ComponentType> = {
  'settings/shop/torobpay': TorobPaySettingsPage,
  'settings/shop/torobpay/display': TorobPaySettingsPage,
  'settings/shop/torobpay/orders': TorobPaySettingsPage,
  'settings/shop/torobpay/campaign': TorobPaySettingsPage,
  'settings/shop/torobpay/logs': TorobPaySettingsPage,
}

export default { routes }
