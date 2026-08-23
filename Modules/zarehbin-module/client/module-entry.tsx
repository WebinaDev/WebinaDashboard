import type { ComponentType } from 'react'

import ZarehbinConnectorPage from './pages/ZarehbinConnectorPage'

export const routes: Record<string, ComponentType> = {
  'settings/shop/zarehbin': ZarehbinConnectorPage,
}

export default { routes }
