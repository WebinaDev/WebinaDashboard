import type { ComponentType } from 'react'

import TapsishopConnectorPage from './pages/TapsishopConnectorPage'

export const routes: Record<string, ComponentType> = {
  'settings/shop/tapsishop': TapsishopConnectorPage,
}

export default { routes }
