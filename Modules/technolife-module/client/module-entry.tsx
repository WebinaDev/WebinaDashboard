import type { ComponentType } from 'react'

import TechnolifeConnectorPage from './pages/TechnolifeConnectorPage'

export const routes: Record<string, ComponentType> = {
  'settings/shop/technolife': TechnolifeConnectorPage,
}

export default { routes }
