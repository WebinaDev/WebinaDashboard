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
  if (clean === 'dashboard/overview') {
    return 'webino_dashboard_overview'
  }
  if (clean === 'dashboard/sms-panel') {
    return 'webino_dashboard_sms_panel'
  }
  if (clean === 'digikala/keys/generate') {
    return 'webino_dashboard_digikala_keys_generate'
  }
  if (clean === 'digikala/keys') {
    return 'webino_dashboard_digikala_keys'
  }
  if (clean === 'digikala/token/issue') {
    return 'webino_dashboard_digikala_token_issue'
  }
  if (clean === 'digikala/auth/status') {
    return 'webino_dashboard_digikala_auth_status'
  }
  if (clean === 'digikala/settings') {
    return 'webino_dashboard_digikala_settings'
  }
  if (clean === 'digikala/products/mapped') {
    return 'webino_dashboard_digikala_products_mapped'
  }
  if (clean === 'digikala/webhook/subscribe') {
    return 'webino_dashboard_digikala_webhook_subscribe'
  }
  if (/^digikala\/products\/\d+\/map$/.test(clean)) {
    return 'webino_dashboard_digikala_product_map'
  }
  if (/^digikala\/products\/\d+\/sync$/.test(clean)) {
    return 'webino_dashboard_digikala_product_sync'
  }
  if (/^digikala\/products\/\d+\/maps$/.test(clean)) {
    return 'webino_dashboard_digikala_product_maps'
  }
  if (/^digikala\/orders\/\d+\/cancel$/.test(clean)) {
    return 'webino_dashboard_digikala_order_cancel'
  }
  if (/^digikala\/orders\/\d+\/sbs-status$/.test(clean)) {
    return 'webino_dashboard_digikala_order_sbs'
  }
  if (clean === 'basalam/oauth/start') {
    return 'webino_dashboard_basalam_oauth_start'
  }
  if (clean === 'basalam/oauth/complete') {
    return 'webino_dashboard_basalam_oauth_complete'
  }
  // Product editor — prefer admin-ajax when CDN/WAF blocks /wp-json/.
  if (clean === 'shop/products/lookup' || clean.startsWith('shop/products')) {
    return 'webino_dashboard_shop_rest'
  }
  // Bot SPA pages — single ajax proxy for all bots/* management routes.
  if (
    clean.startsWith('bots/bale/') ||
    clean.startsWith('bots/telegram/') ||
    clean.startsWith('bots/parity/')
  ) {
    // Never route public webhook/health through ajax (not used by SPA anyway).
    if (!/^bots\/(bale|telegram)\/(webhook|health)(\/|$)/.test(clean)) {
      return 'webino_dashboard_bots_rest'
    }
  }
  return null
}

function restNonJsonMessage(rawText: string, status: number): { message: string; code: string } {
  const lower = rawText.toLowerCase()
  if (
    lower.includes('briefly unavailable for scheduled maintenance') ||
    lower.includes('site is undergoing maintenance') ||
    lower.includes('در حال به‌روزرسانی') ||
    lower.includes('maintenance')
  ) {
    return { message: 'Site is updating', code: 'site_updating' }
  }
  if (rawText.includes('Upstream Error') || status === 502 || status === 520 || status === 521 || status === 522) {
    return {
      message: 'REST blocked by CDN/WAF — whitelist /wp-json/ or use admin-ajax',
      code: 'rest_cdn_blocked',
    }
  }
  if (rawText.trim().startsWith('<') || rawText.includes('<!DOCTYPE') || rawText.includes('<html')) {
    return { message: `Invalid JSON response (HTML, HTTP ${status || 0})`, code: 'invalid_json' }
  }
  return { message: 'Invalid JSON response', code: 'invalid_json' }
}

function ajaxNonJsonMessage(rawText: string, status: number): string {
  const lower = rawText.toLowerCase()
  if (rawText.includes('Upstream Error') || rawText.includes('Forbidden') || status === 403) {
    return 'admin-ajax blocked by CDN/WAF (Upstream Forbidden) — whitelist admin-ajax.php or retry'
  }
  if (lower.includes('timed out') || lower.includes('timeout') || status === 504 || status === 524) {
    return 'Request timed out — RSA-4096 generation can take over a minute on weak hosts'
  }
  if (rawText.trim().startsWith('<') || rawText.includes('<!DOCTYPE') || rawText.includes('<html')) {
    return `Invalid AJAX response (HTML, HTTP ${status || 0})`
  }
  return `Invalid AJAX response (HTTP ${status || 0})`
}

async function apiFetchViaAjax<T>(path: string, timeoutMs: number, init: RequestInit = {}): Promise<T> {
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
  const pathNoQuery = path.replace(/^\//, '').split('?')[0]
  const queryPart = path.includes('?') ? path.slice(path.indexOf('?') + 1) : ''
  body.set('rest_path', pathNoQuery)

  const method = (init.method || 'GET').toUpperCase()
  body.set('rest_method', method)
  if (queryPart) {
    body.set('rest_query', queryPart)
  }
  if (method !== 'GET' && method !== 'HEAD' && init.body != null) {
    const raw = typeof init.body === 'string' ? init.body : ''
    if (raw) {
      body.set('payload', raw)
    }
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
    const rawText = await res.text()
    let json: {
      success?: boolean
      data?: T & { message?: string; code?: string }
      message?: string
    }
    try {
      json = JSON.parse(rawText) as typeof json
    } catch {
      throw new ApiError(ajaxNonJsonMessage(rawText, res.status), {
        code: 'invalid_json',
        status: res.status,
      })
    }
    if (!json.success) {
      const msg =
        (typeof json.data?.message === 'string' && json.data.message) ||
        json.message ||
        'Request failed'
      throw new ApiError(msg, {
        code: (typeof json.data?.code === 'string' && json.data.code) || 'ajax_fallback_failed',
        status: res.status,
      })
    }
    return json.data as T
  } catch (err) {
    if (err instanceof ApiError) {
      throw err
    }
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('Request timed out', { code: 'timeout', status: 0 })
    }
    if (err instanceof TypeError) {
      throw new ApiError('Network unavailable', { code: 'network_offline', status: 0 })
    }
    throw err
  } finally {
    clear()
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  // Mapped paths: prefer admin-ajax first (CDN often blocks /wp-json/).
  if (ajaxActionForPath(path) && cfg().ajaxUrl) {
    return apiFetchViaAjax<T>(path, timeoutMs, init)
  }

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
      const mapped = restNonJsonMessage(rawText, res.status)
      throw new ApiError(mapped.message, { code: mapped.code, status: res.status })
    }
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
    if (err instanceof TypeError) {
      throw new ApiError('Network unavailable', { code: 'network_offline', status: 0 })
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
