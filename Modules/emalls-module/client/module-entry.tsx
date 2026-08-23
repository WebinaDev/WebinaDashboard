import type { ComponentType } from 'react'

import EmallsConnectorPage from './pages/EmallsConnectorPage'

export const routes: Record<string, ComponentType> = {
  'settings/shop/emalls': EmallsConnectorPage,
}

export default { routes }
