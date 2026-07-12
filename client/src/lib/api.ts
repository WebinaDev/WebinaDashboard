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
    const data = (await res.json().catch(() => ({}))) as T & { message?: string; error?: string }
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
    return data as T
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
