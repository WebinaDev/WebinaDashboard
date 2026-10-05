import type { ComponentType } from 'react'

import DigipaySettingsPage from './pages/DigipaySettingsPage'

export const routes: Record<string, ComponentType> = {
  'settings/shop/digipay': DigipaySettingsPage,
  'settings/shop/digipay/transactions': DigipaySettingsPage,
}

export default { routes }
