import type { ComponentType } from 'react'

import C2CReceiptsPage from './pages/C2CReceiptsPage'
import C2CSettingsPage from './pages/C2CSettingsPage'

export const routes: Record<string, ComponentType> = {
  'settings/shop/c2c': C2CSettingsPage,
  'shop/c2c-receipts': C2CReceiptsPage,
}

export default { routes }
