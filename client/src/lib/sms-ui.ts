/** Translate SMS delivery/status codes when i18n keys exist under marketing.sms.statuses.* */
export function translateSmsStatus(t: (key: string) => string, status: unknown): string {
  const raw = String(status ?? '').trim()
  if (!raw) return '—'
  const normalized = raw.toLowerCase().replace(/[\s-]+/g, '_')
  const key = `marketing.sms.statuses.${normalized}`
  const translated = t(key)
  return translated !== key ? translated : raw
}
