import { apiFetch } from '@/lib/api'

/** Fail-fast timeout for ModirPayamak proxy routes (ms). */
export const SMS_FETCH_TIMEOUT_MS = 10_000

export const smsQueryOptions = {
  retry: false as const,
  staleTime: 60_000,
}

function smsFetch<T>(path: string, init?: RequestInit) {
  return apiFetch<T>(path, init ?? {}, SMS_FETCH_TIMEOUT_MS)
}

export interface SmsAccount {
  domain: string
  balance: number
  default_from: string
  status: string
  price_per_unit?: number
}

export interface SmsPackage {
  id: number
  name: string
  amount: number
  bonus: number
}

export interface SmsMessage {
  id: number
  domain: string
  sending_type: string
  cost: number
  status: string
  created_at?: string
}

export interface SmsShortcode {
  key: string
  label: string
  scope: string
}

export interface SmsTemplateRow {
  id?: number
  domain?: string
  scope: string
  event_key: string
  body: string
  pattern_code?: string | null
  enabled?: number | boolean
}

export interface ShopSmsSettings {
  enabled?: boolean
  admin_phones?: string[]
  sender_line_service?: string
  sender_line_dedicated?: string
  use_service_line?: boolean
  events?: Record<string, { customer: boolean; admin: boolean }>
}

export interface SiteSmsSettings {
  enabled?: boolean
  sender_line_service?: string
  sender_line_dedicated?: string
  otp_login_enabled?: boolean
  otp_register_enabled?: boolean
  otp_expiry_minutes?: number
  otp_max_attempts?: number
  otp_length?: number
  otp_login_template?: string
  otp_register_template?: string
}

export interface ShopSmsPayload {
  provider: string
  unavailable?: boolean
  settings: ShopSmsSettings
  event_keys?: string[]
  templates?: SmsTemplateRow[]
  shortcodes?: SmsShortcode[]
  registry?: { scope: string; event_key: string; ippanel_code?: string; sync_status?: string }[]
}

export type SmsApiEnvelope = {
  ok?: boolean
  unavailable?: boolean
  message?: string
}

export type SmsDashboardPayload = SmsApiEnvelope & {
  account?: SmsAccount
  messages?: SmsMessage[]
}

export function fetchSmsDashboard() {
  return smsFetch<SmsDashboardPayload>('modirpayamak/dashboard')
}

export function fetchSmsAccount() {
  return smsFetch<SmsApiEnvelope & { account?: SmsAccount }>('modirpayamak/account')
}

export function fetchSmsPackages() {
  return smsFetch<SmsApiEnvelope & { packages?: SmsPackage[] }>('modirpayamak/packages')
}

export function initSmsTopup(packageId: number) {
  return smsFetch<SmsApiEnvelope & { payment_url?: string; order_id?: number }>('modirpayamak/topup/init', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ package_id: packageId }),
  })
}

export function verifySmsTopup(body: { authority?: string; status?: string; order_id?: number }) {
  return apiFetch<{ ok: boolean; credited?: boolean }>('modirpayamak/topup/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export function sendSms(body: Record<string, unknown>) {
  return apiFetch<{ ok: boolean; cost?: number }>('modirpayamak/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export function sendSmsP2p(body: Record<string, unknown>) {
  return apiFetch<{ ok: boolean }>('modirpayamak/send/peer-to-peer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export function calculateSmsPrice(body: Record<string, unknown>) {
  return apiFetch<{ ok: boolean; edge?: unknown; customer_cost?: number }>('modirpayamak/send/calculate-price', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export function fetchSmsMessages(page = 1) {
  return smsFetch<SmsApiEnvelope & { messages?: SmsMessage[] }>(`modirpayamak/reports/messages?page=${page}`)
}

export function fetchSmsInbox(page = 1, limit = 20) {
  return apiFetch<{ ok: boolean; data?: unknown }>(`modirpayamak/reports/inbox?page=${page}&limit=${limit}`)
}

export function fetchSmsOutbox(page = 1, limit = 20) {
  return apiFetch<{ ok: boolean; data?: unknown }>(`modirpayamak/reports/outbox?page=${page}&limit=${limit}`)
}

export function fetchSmsPatterns(page = 1, perPage = 20) {
  return apiFetch<{ ok: boolean; data?: unknown }>(`modirpayamak/patterns?page=${page}&per_page=${perPage}`)
}

export function fetchSmsNumbers() {
  return apiFetch<{ ok: boolean; data?: unknown }>('modirpayamak/numbers')
}

export function syncSmsPattern(body: { scope: string; event_key: string }) {
  return apiFetch<{ ok: boolean }>('modirpayamak/patterns/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export function fetchSmsPatternRegistry() {
  return apiFetch<{ ok: boolean; registry: unknown[] }>('modirpayamak/patterns/registry')
}

export function fetchSmsPhonebooks() {
  return apiFetch<{ ok: boolean; phonebooks: { id: number; name: string }[] }>('modirpayamak/phonebooks')
}

export function fetchSmsPhonebooksEdge() {
  return apiFetch<{ ok: boolean; data?: unknown }>('modirpayamak/phonebooks/edge')
}

export function createSmsPhonebook(name: string) {
  return apiFetch<{ ok: boolean; id: number }>('modirpayamak/phonebooks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
}

export function fetchShopSmsSettings() {
  return apiFetch<ShopSmsPayload>('shop/settings/sms')
}

export function saveShopSmsSettings(payload: { settings?: ShopSmsSettings; templates?: SmsTemplateRow[] }) {
  return apiFetch('shop/settings/sms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function fetchSiteSmsSettings() {
  return apiFetch<{ ok: boolean; unavailable?: boolean; settings: SiteSmsSettings }>('site/settings/sms')
}

export function saveSiteSmsSettings(settings: SiteSmsSettings) {
  return apiFetch('site/settings/sms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ settings }),
  })
}

export function fetchSmsTemplates(scope?: string) {
  const q = scope ? `?scope=${encodeURIComponent(scope)}` : ''
  return apiFetch<{ ok: boolean; templates: SmsTemplateRow[] }>(`modirpayamak/templates${q}`)
}

export function saveSmsTemplates(templates: SmsTemplateRow[]) {
  return apiFetch('modirpayamak/templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ templates }),
  })
}

export function fetchSmsShortcodes() {
  return apiFetch<{ ok: boolean; shortcodes: SmsShortcode[]; event_keys: string[] }>('modirpayamak/templates/shortcodes')
}

export function fetchNewsletterSubscribers(productId = 0, page = 1) {
  return apiFetch<{ ok: boolean; subscribers: { id: number; phone: string; product_id: number }[] }>(
    `modirpayamak/newsletter/subscribers?product_id=${productId}&page=${page}`
  )
}

export function sendNewsletterCampaign(body: { product_id?: number; message: string; vars?: Record<string, string> }) {
  return apiFetch<{ ok: boolean; sent?: number; total?: number }>('modirpayamak/newsletter/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
