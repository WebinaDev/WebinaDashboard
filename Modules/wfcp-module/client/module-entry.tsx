import type { ComponentType } from 'react'

import WfcpBulkEditorPage from './pages/WfcpBulkEditorPage'
import WfcpPriceChangerPage from './pages/WfcpPriceChangerPage'
import WfcpQuickAddPage from './pages/WfcpQuickAddPage'
import WfcpSettingsPage from './pages/WfcpSettingsPage'

export const routes: Record<string, ComponentType> = {
  'shop/wfcp/quick-add': WfcpQuickAddPage,
  'shop/wfcp/bulk-editor': WfcpBulkEditorPage,
  'shop/wfcp/price-changer': WfcpPriceChangerPage,
  'settings/shop/pricing/:tab': WfcpSettingsPage,
}

export default { routes }
