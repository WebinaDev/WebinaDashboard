import { ApiError } from '@/lib/apiError'

function cfg() {
  return window.webinoDashboard
}

const DEFAULT_TIMEOUT_MS = 30_000

function fetchTimeoutSignal(timeoutMs: number, userSignal?: AbortSignal | null): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

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

/** POST multipart (e.g. CSV); do not set Content-Type so the browser sets the boundary. */
export async function apiPostFormData<T>(
  path: string,
  form: FormData,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  const c = cfg()
  const url = path.startsWith('http') ? path : c.restUrl + path.replace(/^\//, '')
  const headers: HeadersInit = {}
  if (c.nonce) {
    ;(headers as Record<string, string>)['X-WP-Nonce'] = c.nonce
  }

  const { signal, clear } = fetchTimeoutSignal(timeoutMs)

  try {
    const res = await fetch(url, { method: 'POST', credentials: 'same-origin', body: form, headers, signal })
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
