import { ApiError } from '@/lib/apiError'
import { isAllowedRemoteUrl } from '@/lib/safeUrl'

function cfg() {
  return window.webinoDashboard
}

const DEFAULT_TIMEOUT_MS = 30_000

function isSameOriginUrl(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin)
    return parsed.origin === window.location.origin
  } catch {
    return false
  }
}

export function resolveApiUrl(path: string): string {
  const c = cfg()
  if (!path.startsWith('http')) {
    return c.restUrl + path.replace(/^\//, '')
  }
  if (isSameOriginUrl(path) || isAllowedRemoteUrl(path)) {
    return path
  }
  throw new ApiError('Request blocked: URL not allowed', { code: 'forbidden_url', status: 0 })
}

function fetchTimeoutSignal(init: RequestInit, timeoutMs: number): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

  const userSignal = init.signal
  if (userSignal) {
    if (userSignal.aborted) {
      controller.abort(userSignal.reason)
    } else {
      userSignal.addEventListener('abort', () => controller.abort(userSignal.reason), { once: true })
    }
  }

  return {
    signal: controller.signal,
    clear: () => window.clearTimeout(timeoutId),
  }
}

function ajaxActionForPath(path: string): string | null {
  const clean = path.replace(/^\//, '').split('?')[0]
  if (clean === 'bootstrap') {
    return 'webino_dashboard_bootstrap'
  }
  if (clean === 'auth/session') {
    return 'webino_dashboard_auth_session'
  }
  return null
}

async function apiFetchViaAjax<T>(path: string, timeoutMs: number): Promise<T> {
  const action = ajaxActionForPath(path)
  const c = cfg()
  if (!action || !c.ajaxUrl) {
    throw new ApiError('AJAX fallback unavailable', { code: 'no_ajax_fallback', status: 0 })
  }

  const body = new URLSearchParams()
  body.set('action', action)
  if (c.nonce) {
    body.set('nonce', c.nonce)
  }

  const { signal, clear } = fetchTimeoutSignal({}, timeoutMs)
  try {
    const res = await fetch(c.ajaxUrl, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body,
      signal,
    })
    const json = (await res.json().catch(() => ({}))) as {
      success?: boolean
      data?: T
      message?: string
    }
    if (!res.ok || !json.success) {
      throw new ApiError(json.message || res.statusText || 'AJAX failed', {
        code: 'ajax_fallback_failed',
        status: res.status,
      })
    }
    return json.data as T
  } finally {
    clear()
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  const url = resolveApiUrl(path)
  const c = cfg()
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string>),
  }
  const hasNonceHeader = Object.keys(headers).some((k) => k.toLowerCase() === 'x-wp-nonce')
  if (c.nonce && !hasNonceHeader) {
    headers['X-WP-Nonce'] = c.nonce
  }

  const { signal, clear } = fetchTimeoutSignal(init, timeoutMs)

  try {
    const res = await fetch(url, {
      ...init,
      credentials: 'same-origin',
      headers,
      signal,
    })
    const rawText = await res.text()
    let data: T & { message?: string; error?: string; code?: string }
    try {
      data = JSON.parse(rawText) as T & { message?: string; error?: string; code?: string }
    } catch {
      // WCDN often returns HTML "Upstream Error - Unauthorized/503" for /wp-json/*
      if (ajaxActionForPath(path)) {
        return apiFetchViaAjax<T>(path, timeoutMs)
      }
      throw new ApiError(
        rawText.includes('Upstream Error') || rawText.includes('Forbidden')
          ? 'REST blocked by CDN/WAF — use admin-ajax fallback or whitelist /wp-json/'
          : 'Invalid JSON response',
        { code: 'invalid_json', status: res.status },
      )
    }
    if (!res.ok) {
      const errBody = data as { message?: string; error?: string; code?: string }
      const msg =
        typeof errBody.message === 'string'
          ? errBody.message
          : typeof errBody.error === 'string'
            ? errBody.error
            : errBody.code || res.statusText
      if (ajaxActionForPath(path) && (res.status === 401 || res.status === 403 || res.status === 503)) {
        return apiFetchViaAjax<T>(path, timeoutMs)
      }
      throw new ApiError(msg, { code: errBody.code, status: res.status })
    }
    return data as T
  } catch (err) {
    if (err instanceof ApiError) {
      if (ajaxActionForPath(path) && (err.status === 0 || err.status >= 500 || err.code === 'invalid_json')) {
        try {
          return await apiFetchViaAjax<T>(path, timeoutMs)
        } catch {
          throw err
        }
      }
      throw err
    }
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('Request timed out', { code: 'timeout', status: 0 })
    }
    if (ajaxActionForPath(path)) {
      try {
        return await apiFetchViaAjax<T>(path, timeoutMs)
      } catch {
        throw err
      }
    }
    throw err
  } finally {
    clear()
  }
}

export async function apiUploadFile(
  path: string,
  file: File,
  fields?: Record<string, string>,
): Promise<{ id: number; url: string }> {
  const url = resolveApiUrl(path)
  const c = cfg()
  const body = new FormData()
  body.append('file', file)
  if (fields) {
    for (const [key, value] of Object.entries(fields)) {
      body.append(key, value)
    }
  }
  const headers: HeadersInit = {}
  if (c.nonce) {
    ;(headers as Record<string, string>)['X-WP-Nonce'] = c.nonce
  }

  const { signal, clear } = fetchTimeoutSignal({}, DEFAULT_TIMEOUT_MS)

  try {
    const res = await fetch(url, { method: 'POST', credentials: 'same-origin', body, headers, signal })
    const data = (await res.json().catch(() => ({}))) as { id?: number; url?: string; message?: string }
    if (!res.ok) {
      const errBody = data as { message?: string; error?: string; code?: string }
      const msg =
        typeof errBody.message === 'string'
          ? errBody.message
          : typeof errBody.error === 'string'
            ? errBody.error
            : errBody.code || res.statusText
      throw new ApiError(msg, { code: errBody.code, status: res.status })
    }
    if (!data.id || data.id < 1) {
      throw new ApiError('Invalid upload response', { code: 'invalid', status: res.status })
    }
    return { id: data.id, url: data.url ?? '' }
  } catch (err) {
    if (err instanceof ApiError) {
      throw err
    }
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('Request timed out', { code: 'timeout', status: 0 })
    }
    throw err
  } finally {
    clear()
  }
}
