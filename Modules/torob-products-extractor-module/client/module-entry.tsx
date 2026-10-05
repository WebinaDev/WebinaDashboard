import type { ComponentType } from 'react'

import TorobExtractorSettingsPage from './pages/TorobExtractorSettingsPage'

export const routes: Record<string, ComponentType> = {
  'settings/shop/torob-extractor': TorobExtractorSettingsPage,
}

export default { routes }
