import type { ComponentType } from 'react'

import BalePaySettingsPage from './pages/BalePaySettingsPage'

export const routes: Record<string, ComponentType> = {
  'settings/shop/bale-pay': BalePaySettingsPage,
}

export default { routes }
