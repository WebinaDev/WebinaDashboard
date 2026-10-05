import type { ComponentType } from 'react'

import ZarinpalSettingsPage from './pages/zarinpal/ZarinpalSettingsPage'

export const routes: Record<string, ComponentType> = {
  'settings/shop/zarinpal': ZarinpalSettingsPage,
  'settings/shop/zarinpal/payments': ZarinpalSettingsPage,
  'settings/shop/zarinpal/operations': ZarinpalSettingsPage,
  'settings/shop/zarinpal/coverage': ZarinpalSettingsPage,
}

export default { routes }
