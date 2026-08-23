import type { ComponentType } from 'react'

import TorobConnectorPage from './pages/TorobConnectorPage'

export const routes: Record<string, ComponentType> = {
  'settings/shop/torob': TorobConnectorPage,
}

export default { routes }
