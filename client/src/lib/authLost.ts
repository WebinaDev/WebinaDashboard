import type { QueryClient } from '@tanstack/react-query'

import type { ApiError } from '@/lib/apiError'
import { getQueryClient } from '@/lib/queryClient'

export type AuthSession = {
  logged_in: boolean
}

export const AUTH_SESSION_QUERY_KEY = ['auth', 'session'] as const

const AUTH_LOST_CODES = new Set([
  'rest_cookie_invalid_nonce',
  'rest_not_logged_in',
  'invalid_nonce',
  'ajax_referer_failed',
  '-1',
])

export function isAuthLostError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const e = err as Partial<ApiError> & { message?: string; code?: string; status?: number }
  if (e.status === 401) return true
  const code = typeof e.code === 'string' ? e.code : ''
  if (AUTH_LOST_CODES.has(code)) return true
  const msg = typeof e.message === 'string' ? e.message.toLowerCase() : ''
  if (msg.includes('cookie nonce is invalid')) return true
  if (msg.includes('rest_cookie_invalid_nonce')) return true
  // Dead session often surfaces as WP ajax -1 / 403 with empty body on check_ajax_referer
  if (e.status === 403 && (code === '-1' || msg === '-1' || msg.includes('are you sure you want to do this'))) {
    return true
  }
  return false
}

/** Force AuthGate to treat the user as logged out (SPA navigate to /login). */
export function markLoggedOut(client?: QueryClient | null): void {
  const qc = client ?? getQueryClient()
  if (!qc) return
  qc.setQueryData<AuthSession>(AUTH_SESSION_QUERY_KEY, { logged_in: false })
}

export function maybeMarkLoggedOut(err: unknown): void {
  if (isAuthLostError(err)) {
    markLoggedOut()
  }
}
