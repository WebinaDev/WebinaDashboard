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
  const embedMinimal = Boolean(
    initial && (initial as BootstrapPayload & { embedMinimal?: boolean }).embedMinimal,
  )

  return useQuery({
    queryKey: BOOTSTRAP_QUERY_KEY,
    queryFn: async () => {
      const data = await apiFetch<BootstrapPayload>('bootstrap')
      return normalizeBootstrapPayload(data)
    },
    initialData: initial,
    // Minimal embed has empty activeModuleClients — must refetch immediately, not after staleTime.
    initialDataUpdatedAt: initial ? (embedMinimal ? 0 : Date.now()) : undefined,
    staleTime: embedMinimal ? 0 : 120_000,
    gcTime: 600_000,
    placeholderData: (prev) => prev ?? initial,
    refetchOnMount: embedMinimal ? 'always' : Boolean(!initial),
    refetchOnWindowFocus: false,
    retry: 1,
  })
}
