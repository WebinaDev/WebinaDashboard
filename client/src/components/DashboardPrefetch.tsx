import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { getBootstrapSnapshot } from '@/lib/bootstrapQuery'
import { getSsrOverview } from '@/lib/ssrPage'

/**
 * Seed React Query from PHP-embedded snapshots after first paint.
 * Does not warm settings/home route chunks (those pull large panel graphs).
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
  }, [qc])

  return null
}
