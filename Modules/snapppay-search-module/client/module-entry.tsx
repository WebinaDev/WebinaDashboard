import type { ComponentType } from 'react'

import SnappPaySearchConnectorPage from './pages/SnappPaySearchConnectorPage'

export const routes: Record<string, ComponentType> = {
  'settings/shop/snapppay-search': SnappPaySearchConnectorPage,
}

export default { routes }
