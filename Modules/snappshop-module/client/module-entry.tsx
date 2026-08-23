import type { ComponentType } from 'react'

import SnappshopConnectorPage from './pages/SnappshopConnectorPage'

export const routes: Record<string, ComponentType> = {
  'settings/shop/snappshop': SnappshopConnectorPage,
}

export default { routes }
