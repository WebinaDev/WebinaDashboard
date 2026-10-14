import { useQuery } from '@tanstack/react-query'

import { apiFetch, applyFreshNonce } from '@/lib/api'
import { AUTH_SESSION_QUERY_KEY, type AuthSession } from '@/lib/authLost'

export type { AuthSession }
export { AUTH_SESSION_QUERY_KEY }

export function useAuthSession() {
  const isLogged = Boolean(window.webinoDashboard?.isLogged)

  return useQuery({
    queryKey: AUTH_SESSION_QUERY_KEY,
    queryFn: async () => {
      const res = await apiFetch<AuthSession & { nonce?: string }>('auth/session')
      // Keep the REST nonce fresh while the SPA stays open (WP nonces expire in 12–24h).
      applyFreshNonce(res?.nonce)
      return { logged_in: Boolean(res?.logged_in) }
    },
    staleTime: 30_000,
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    initialData: { logged_in: isLogged },
    initialDataUpdatedAt: Date.now(),
  })
}
