import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api'
import {
  BOOTSTRAP_QUERY_KEY,
  getBootstrapSnapshot,
  normalizeBootstrapPayload,
} from '@/lib/bootstrapQuery'
import type { BootstrapPayload } from '@/types/modules'

export function useBootstrapQuery() {
  // Snapshot must be stable across renders — recreating it every render with
  // Date.now() as initialDataUpdatedAt caused query churn and cancelled module loads.
  const initial = useMemo(() => getBootstrapSnapshot(), [])

  return useQuery({
    queryKey: BOOTSTRAP_QUERY_KEY,
    queryFn: async () => {
      const data = await apiFetch<BootstrapPayload>('bootstrap')
      return normalizeBootstrapPayload(data)
    },
    initialData: initial,
    initialDataUpdatedAt: initial ? Date.now() : undefined,
    staleTime: 120_000,
    gcTime: 600_000,
    placeholderData: (prev) => prev ?? initial,
    // Snapshot is already embedded in the HTML — avoid an immediate REST round-trip.
    refetchOnMount: initial ? false : true,
  })
}
