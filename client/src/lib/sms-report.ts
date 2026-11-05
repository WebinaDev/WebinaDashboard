import dayjs from 'dayjs'
import jalali from 'jalaliday/dayjs'

import { formatDisplayDateTime } from '@/lib/date'
import { translateSmsStatus } from '@/lib/sms-ui'

dayjs.extend(jalali)

/** Unwrap Edge/CRM list payloads. */
export function unwrapSmsList(data: unknown): Record<string, unknown>[] {
  if (!data) return []
  if (Array.isArray(data)) return data as Record<string, unknown>[]
  if (typeof data !== 'object') return []
  const d = data as Record<string, unknown>
  for (const key of [
    'entries',
    'messages',
    'data',
    'items',
    'list',
    'outbox',
    'inbox',
    'numbers',
    'rows',
    'recipients',
  ]) {
    if (Array.isArray(d[key])) return d[key] as Record<string, unknown>[]
  }
  // Nested { data: { data: [...] } }
  if (d.data && typeof d.data === 'object' && !Array.isArray(d.data)) {
    return unwrapSmsList(d.data)
  }
  return []
}

export function smsField(row: Record<string, unknown> | null | undefined, ...keys: string[]): string {
  if (!row) return ''
  for (const key of keys) {
    const v = row[key]
    if (v == null || v === '') continue
    if (typeof v === 'object') continue
    return String(v)
  }
  return ''
}

export function smsNum(row: Record<string, unknown> | null | undefined, ...keys: string[]): number | null {
  const s = smsField(row, ...keys)
  if (!s) return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

/** Jalali `1405/08/14 14:58` or `1405-08-14` → unix seconds. */
function jalaliToUnix(value: string): number | null {
  const m = value.match(
    /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/,
  )
  if (!m) return null
  const year = Number(m[1])
  if (year < 1300 || year > 1500) return null
  const d = dayjs()
    .calendar('jalali')
    .year(year)
    .month(Number(m[2]) - 1)
    .date(Number(m[3]))
    .hour(Number(m[4] ?? 0))
    .minute(Number(m[5] ?? 0))
    .second(Number(m[6] ?? 0))
    .millisecond(0)
  return d.isValid() ? d.calendar('gregory').unix() : null
}

/** Parse Edge unix (number|string), Jalali, or MySQL/ISO datetime into display value. */
export function formatSmsDateTime(
  value: unknown,
  locale: string,
  empty = '—',
): string {
  if (value == null || value === '') return empty
  if (typeof value === 'number' && Number.isFinite(value)) {
    const sec = value > 1e12 ? Math.floor(value / 1000) : value
    return formatDisplayDateTime(sec, locale, empty)
  }
  const s = String(value).trim()
  if (/^\d{10}$/.test(s)) {
    return formatDisplayDateTime(Number(s), locale, empty)
  }
  if (/^\d{13}$/.test(s)) {
    return formatDisplayDateTime(Math.floor(Number(s) / 1000), locale, empty)
  }
  const jalaliUnix = jalaliToUnix(s)
  if (jalaliUnix != null) {
    return formatDisplayDateTime(jalaliUnix, locale, empty)
  }
  // Naive `YYYY-MM-DD HH:mm:ss` is Tehran wall time, not UTC.
  const naive = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/)
  if (naive && Number(naive[1]) < 1700) {
    const iso = `${naive[1]}-${naive[2]}-${naive[3]}T${naive[4]}:${naive[5]}:${naive[6] ?? '00'}+03:30`
    return formatDisplayDateTime(iso, locale, empty)
  }
  return formatDisplayDateTime(s, locale, empty)
}

/** Edge outbox state_id → status key. */
const STATE_ID_MAP: Record<number, string> = {
  0: 'creating',
  1: 'queued',
  2: 'processing',
  3: 'rejected',
  4: 'invalid_recipients',
  5: 'send_queue',
  6: 'sent',
  7: 'cancelled',
  8: 'insufficient_credit',
  9: 'error',
}

export function resolveOutboxStatus(
  t: (key: string) => string,
  row: Record<string, unknown>,
): string {
  // Edge often returns a localized Persian `status` (e.g. «پایان یافته»).
  const status = smsField(row, 'status')
  if (status && /[\u0600-\u06FF]/.test(status)) {
    return status
  }
  const stateId = smsNum(row, 'state_id')
  if (stateId != null && STATE_ID_MAP[stateId]) {
    return translateSmsStatus(t, STATE_ID_MAP[stateId])
  }
  const state = smsField(row, 'state')
  if (state === 'finish' || state === 'finished') {
    return translateSmsStatus(t, 'finished')
  }
  if (status) return translateSmsStatus(t, status)
  if (state) return translateSmsStatus(t, state)
  return '—'
}

export function outboxId(row: Record<string, unknown>): string {
  return smsField(row, 'messages_outbox_id', 'outbox_id', 'bulk_id', 'id') || '—'
}

export function outboxSender(row: Record<string, unknown>): string {
  return smsField(row, 'number', 'from_number', 'sender', 'line') || '—'
}

export function outboxMessage(row: Record<string, unknown>): string {
  return smsField(row, 'message', 'body', 'text', 'summary') || '—'
}

export function outboxType(row: Record<string, unknown>): string {
  return smsField(row, 'type', 'sending_type') || '—'
}

export function outboxTime(row: Record<string, unknown>): unknown {
  return row.time_send ?? row.time ?? row.send_time ?? row.created_at ?? row.scheduled_at
}

export function parseJsonMaybe(raw: unknown): unknown {
  if (raw == null) return null
  if (typeof raw === 'object') return raw
  if (typeof raw !== 'string') return raw
  const s = raw.trim()
  if (!s) return null
  try {
    return JSON.parse(s)
  } catch {
    return raw
  }
}

export function localRecipientsPreview(row: Record<string, unknown>): string {
  const parsed = parseJsonMaybe(row.recipients)
  if (Array.isArray(parsed)) {
    return parsed.map(String).filter(Boolean).join(', ') || '—'
  }
  if (typeof parsed === 'string' && parsed) return parsed
  return smsField(row, 'recipient', 'phone', 'to') || '—'
}

export function localMessagePreview(row: Record<string, unknown>): string {
  const body = parseJsonMaybe(row.message_body)
  if (body && typeof body === 'object' && !Array.isArray(body)) {
    const o = body as Record<string, unknown>
    const msg = smsField(o, 'message', 'body', 'text')
    if (msg) return msg
    const code = smsField(o, 'code', 'pattern_code')
    if (code) return `pattern:${code}`
  }
  if (typeof body === 'string' && body) return body
  return smsField(row, 'message', 'body', 'text') || '—'
}

export function normalizeSmsLines(
  payload: unknown,
): Array<{ id?: number; number: string; role: string; label?: string }> {
  const out: Array<{ id?: number; number: string; role: string; label?: string }> = []
  for (const row of unwrapSmsList(payload)) {
    const number = smsField(row, 'number', 'line', 'from_number', 'sender', 'phone')
    if (!number) continue
    const roleRaw = smsField(row, 'role', 'type', 'line_type').toLowerCase()
    let role = 'service'
    if (/personal|marketing|dedicated|webservice|advert|اختصاص/.test(roleRaw)) role = 'personal'
    else if (roleRaw && !/pattern|shared|service|خدماتی|پترن/.test(roleRaw)) role = roleRaw
    const label = smsField(row, 'label', 'title', 'name')
    const id = smsNum(row, 'id')
    out.push({ number, role, label: label || undefined, id: id ?? undefined })
  }
  return out
}

export function isUnixFuture(value: unknown): boolean {
  if (value == null || value === '') return false
  let ms = 0
  if (typeof value === 'number') {
    ms = value > 1e12 ? value : value * 1000
  } else {
    const s = String(value).trim()
    if (/^\d{10}$/.test(s)) ms = Number(s) * 1000
    else if (/^\d{13}$/.test(s)) ms = Number(s)
    else {
      const t = Date.parse(s)
      if (Number.isNaN(t)) return false
      ms = t
    }
  }
  return ms > Date.now()
}
