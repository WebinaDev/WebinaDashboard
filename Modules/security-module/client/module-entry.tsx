import type { ComponentType } from 'react'

import SecurityFirewallBlockingPage from './pages/SecurityFirewallBlockingPage'
import SecurityFirewallLivePage from './pages/SecurityFirewallLivePage'
import SecurityFirewallPage from './pages/SecurityFirewallPage'
import SecurityFirewallRulesPage from './pages/SecurityFirewallRulesPage'
import SecurityOverviewPage from './pages/SecurityOverviewPage'
import SecurityReportDetailPage from './pages/SecurityReportDetailPage'
import SecurityReportsPage from './pages/SecurityReportsPage'
import SecurityScanJobPage from './pages/SecurityScanJobPage'
import SecurityScanPage from './pages/SecurityScanPage'
import SecuritySettingsPage from './pages/SecuritySettingsPage'
import SecurityToolPage from './pages/SecurityToolPage'
import SecurityToolsPage from './pages/SecurityToolsPage'

export const routes: Record<string, ComponentType> = {
  'security': SecurityOverviewPage,
  'security/firewall': SecurityFirewallPage,
  'security/firewall/live': SecurityFirewallLivePage,
  'security/firewall/rules': SecurityFirewallRulesPage,
  'security/firewall/blocking': SecurityFirewallBlockingPage,
  'security/scan': SecurityScanPage,
  'security/scan/:jobid': SecurityScanJobPage,
  'security/tools': SecurityToolsPage,
  'security/tools/:tool': SecurityToolPage,
  'security/reports': SecurityReportsPage,
  'security/reports/:reportid': SecurityReportDetailPage,
  'security/settings': SecuritySettingsPage,
}

export default { routes }
