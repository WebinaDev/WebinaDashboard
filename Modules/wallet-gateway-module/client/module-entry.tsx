import type { ComponentType } from 'react'

import WalletAccountPage from './pages/WalletAccountPage'
import WalletSettingsPage from './pages/WalletSettingsPage'
import WalletWithdrawalsPage from './pages/WalletWithdrawalsPage'

export const routes: Record<string, ComponentType> = {
  'settings/shop/wallet': WalletSettingsPage,
  'shop/wallet-withdrawals': WalletWithdrawalsPage,
  'account/wallet': WalletAccountPage,
}

export default { routes }
