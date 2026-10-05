import type { ComponentType } from 'react'

import SnappPaySettingsPage from './pages/SnappPaySettingsPage'

export const routes: Record<string, ComponentType> = {
  'settings/shop/snapppay': SnappPaySettingsPage,
  'settings/shop/snapppay/logs': SnappPaySettingsPage,
}

export default { routes }
