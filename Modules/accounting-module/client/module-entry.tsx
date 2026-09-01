import type { ComponentType } from 'react'

import AccountingSettingsPage from './pages/accounting/AccountingSettingsPage'
import AccountingShell from './pages/accounting/AccountingShell'
import MyPayrollPage from './pages/accounting/MyPayrollPage'

export const routes: Record<string, ComponentType> = {
  'accounting/my-payroll': MyPayrollPage,
  'accounting/:section': AccountingShell,
  'settings/shop/accounting': AccountingSettingsPage,
  'settings/shop/accounting/company': AccountingSettingsPage,
  'settings/shop/accounting/sync': AccountingSettingsPage,
  'settings/shop/accounting/tax': AccountingSettingsPage,
  'settings/shop/accounting/hesabfa': AccountingSettingsPage,
  'settings/shop/accounting/payroll': AccountingSettingsPage,
}

export default { routes }
