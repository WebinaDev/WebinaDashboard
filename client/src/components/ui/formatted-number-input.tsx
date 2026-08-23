import type { ComponentProps } from 'react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { Input } from '@/components/ui/input'
import { FA_DIGITS, isFaLocale } from '@/lib/digits'
import { cn } from '@/lib/utils'

const FA_DIGIT_MAP: Record<string, string> = Object.fromEntries(
  [...FA_DIGITS].map((d, i) => [d, String(i)]),
)

/** Strip grouping/separators and normalize Persian digits → ASCII numeric string. */
export function parseFormattedNumberInput(raw: string): string {
  let s = ''
  let sawDot = false
  for (const ch of raw) {
    if (FA_DIGIT_MAP[ch] != null) {
      s += FA_DIGIT_MAP[ch]
      continue
    }
    if (ch >= '0' && ch <= '9') {
      s += ch
      continue
    }
    if ((ch === '.' || ch === '٫') && !sawDot) {
      sawDot = true
      s += '.'
    }
  }
  return s
}

function formatDisplay(raw: string, locale: string): string {
  if (!raw) return ''
  const neg = raw.startsWith('-')
  const body = neg ? raw.slice(1) : raw
  const endsWithDot = body.endsWith('.')
  const [intPart, decPart] = body.split('.')
  const n = Number(intPart || '0')
  if (!Number.isFinite(n) && intPart !== '') return raw
  const lng = isFaLocale(locale) ? 'fa-IR' : 'en-US'
  let formatted = new Intl.NumberFormat(lng, { maximumFractionDigits: 0 }).format(
    intPart === '' ? 0 : n,
  )
  if (decPart != null || endsWithDot) {
    const decSep = isFaLocale(locale) ? '٫' : '.'
    const dec = decPart ?? ''
    formatted +=
      decSep +
      (isFaLocale(locale)
        ? dec.replace(/\d/g, (d) => FA_DIGITS[parseInt(d, 10)] ?? d)
        : dec)
  }
  return neg ? `-${formatted}` : formatted
}

type FormattedNumberInputProps = Omit<ComponentProps<typeof Input>, 'value' | 'onChange'> & {
  value: string
  onChange: (raw: string) => void
}

export function FormattedNumberInput({
  value,
  onChange,
  className,
  onBlur,
  ...props
}: FormattedNumberInputProps) {
  const { i18n } = useTranslation()
  const locale = i18n.language
  const display = useMemo(() => formatDisplay(value, locale), [value, locale])

  return (
    <Input
      {...props}
      inputMode="decimal"
      className={cn(className)}
      value={display}
      onChange={(e) => onChange(parseFormattedNumberInput(e.target.value))}
      onBlur={onBlur}
    />
  )
}
