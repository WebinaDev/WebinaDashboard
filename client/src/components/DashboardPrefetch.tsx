import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { getBootstrapSnapshot } from '@/lib/bootstrapQuery'
import { getSsrOverview } from '@/lib/ssrPage'

/**
 * Warm React Query cache + next settings/home chunks after first paint.
 */
export function DashboardPrefetch() {
  const qc = useQueryClient()

  useEffect(() => {
    const boot = getBootstrapSnapshot()
    if (boot) {
      qc.setQueryData(['bootstrap'], boot)
    }
    const overview = getSsrOverview()
    if (overview) {
      qc.setQueryData(['dashboard-overview'], overview)
    }

    const run = () => {
      void import('@/pages/settings/SettingsHubPage')
      void import('@/pages/settings/site/SettingsSiteShell')
      void import('@/pages/settings/shop/SettingsShopShell')
      void import('@/pages/HomePage')
    }

    let cancel: (() => void) | undefined
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(run, { timeout: 2000 })
      cancel = () => window.cancelIdleCallback(id)
    } else {
      const id = window.setTimeout(run, 400)
      cancel = () => window.clearTimeout(id)
    }
    return () => cancel?.()
  }, [qc])

  return null
}
