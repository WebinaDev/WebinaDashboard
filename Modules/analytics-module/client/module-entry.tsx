import type { ComponentType } from 'react'

import { AnalyticsSettingsPanel } from './components/analytics/AnalyticsSettingsPanel'
import AnalyticsShell from './pages/AnalyticsShell'

export const routes: Record<string, ComponentType> = {
  'analytics/:section': AnalyticsShell,
}

export const components: Record<string, ComponentType> = {
  AnalyticsSettingsPanel,
}

export default { routes, components }
