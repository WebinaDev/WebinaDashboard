import dayjs from 'dayjs'
import 'dayjs/locale/fa'
import relativeTime from 'dayjs/plugin/relativeTime'
import jalali from 'jalaliday/dayjs'

import i18n from 'i18next'

import { FA_DIGITS, isFaLocale, localizeDigits, toPersianDigits } from '@/lib/digits'

export { isFaLocale, localizeDigits, toPersianDigits }

dayjs.extend(jalali)
dayjs.extend(relativeTime)

export function emptyDateLabel(t: (key: string) => string): string {
  return t('common.emptyValue')
}

export function formatDisplayDate(
  iso: string | undefined,
  locale: string,
  empty = '—',
): string {
  if (!iso) return empty
  const d = dayjs(iso)
  if (!d.isValid()) return empty
  if (isFaLocale(locale)) {
    return toPersianDigits(d.calendar('jalali').format('YYYY/MM/DD'))
  }
  return d.format('YYYY-MM-DD')
}

/** True when MySQL/REST returned a missing unix timestamp (0 / "0" / empty). */
export function isEmptyUnixTimestamp(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return true
  if (typeof value === 'number') return !Number.isFinite(value) || value <= 0
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed || trimmed === '0' || trimmed === 'null' || trimmed === 'undefined') return true
    if (/^\d+$/.test(trimmed)) return Number(trimmed) <= 0
  }
  return false
}

/**
 * First usable job timestamp. Skips BIGINT defaults of 0/"0" so created_at wins
 * over completed_at/started_at that were never set.
 */
export function pickJobTimestamp(
  ...candidates: Array<string | number | null | undefined>
): number | string | undefined {
  for (const raw of candidates) {
    if (isEmptyUnixTimestamp(raw)) continue
    if (typeof raw === 'number') return raw
    if (typeof raw === 'string') {
      const trimmed = raw.trim()
      if (/^\d+$/.test(trimmed)) return Number(trimmed)
      return trimmed
    }
  }
  return undefined
}

function parseDisplayInstant(iso: string | number): dayjs.Dayjs {
  if (typeof iso === 'number') return dayjs.unix(iso)
  const trimmed = String(iso).trim()
  if (/^\d+$/.test(trimmed)) return dayjs.unix(Number(trimmed))
  return dayjs(trimmed)
}

export function formatDisplayDateTime(
  iso: string | number | undefined,
  locale: string,
  empty = '—',
): string {
  if (isEmptyUnixTimestamp(iso)) return empty
  const d = parseDisplayInstant(iso as string | number)
  if (!d.isValid()) return empty
  if (isFaLocale(locale)) {
    const sep = i18n.t('date.timeSeparator')
    return toPersianDigits(d.calendar('jalali').locale('fa').format(`D MMMM YYYY${sep}HH:mm`))
  }
  return d.locale('en').format('YYYY-MM-DD HH:mm')
}

export function formatRelativeTime(iso: string | undefined, locale: string, empty = '—'): string {
  if (!iso) return empty
  const isFa = isFaLocale(locale)
  const s = dayjs(iso).locale(isFa ? 'fa' : 'en').fromNow()
  return isFa ? toPersianDigits(s) : s
}

/** Value for native datetime-local input (always Gregorian). */
export function toDateTimeLocalValue(iso: string | number | undefined): string {
  if (iso === undefined || iso === null || iso === '') return ''
  const d = typeof iso === 'number' ? dayjs.unix(iso) : dayjs(iso)
  if (!d.isValid()) return ''
  return d.format('YYYY-MM-DDTHH:mm')
}

/** Parse datetime-local string to Unix seconds. */
export function fromDateTimeLocalValue(value: string): number | null {
  if (!value.trim()) return null
  const d = dayjs(value)
  return d.isValid() ? d.unix() : null
}

/** Display placeholder for date-only fields. */
export function dateInputPlaceholder(locale: string, t: (key: string) => string): string {
  return isFaLocale(locale) ? t('date.placeholderJalali') : t('date.placeholderGregorian')
}

/** Normalize user-typed date to ISO date (YYYY-MM-DD) for API. */
export function parseDateInputToIso(value: string, locale: string): string {
  const v = value.trim()
  if (!v) return ''
  if (isFaLocale(locale)) {
    const normalized = v.replace(/[۰-۹]/g, (ch) => String(FA_DIGITS.indexOf(ch)))
    const d = dayjs(normalized, 'jYYYY/jMM/jDD').calendar('jalali')
    return d.isValid() ? d.format('YYYY-MM-DD') : v
  }
  const d = dayjs(v, 'YYYY-MM-DD')
  return d.isValid() ? d.format('YYYY-MM-DD') : v
}
