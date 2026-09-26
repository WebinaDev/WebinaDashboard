import type { ReactNode } from 'react'

import { MoneyDisplay } from '@/components/currency/MoneyDisplay'
import { decodePriceEntities } from '@/lib/currency'
import { localizeDigits } from '@/lib/digits'
import { cn } from '@/lib/utils'

type NotificationTextProps = {
  text: string
  locale: string
  className?: string
}

const CURRENCY_WORD = /تومان|toman|irt|ریال/giu
const AMOUNT_NUM =
  /[\d٠-٩۰-۹]+(?:[.,٬\s][\d٠-٩۰-۹]+)*/

/**
 * Amount after «مبلغ:» (optional orphan currency / nbsp) or standalone
 * thousand-separated / currency-suffixed number → MoneyDisplay.
 */
const MONEY_CHUNK = new RegExp(
  `(?:مبلغ\\s*:\\s*)?(?:${CURRENCY_WORD.source}\\s*)?(${AMOUNT_NUM.source})(?:\\s*${CURRENCY_WORD.source})?`,
  'giu',
)

function cleanText(raw: string): string {
  return decodePriceEntities(raw)
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function isMoneyMatch(full: string, amount: string): boolean {
  if (!amount || !/[\d٠-٩۰-۹]/.test(amount)) return false
  if (/مبلغ\s*:/u.test(full)) return true
  if (/تومان|toman|irt|ریال/iu.test(full)) return true
  if (/[\d٠-٩۰-۹]{1,3}(?:[.,٬][\d٠-٩۰-۹]{3})+/.test(amount)) return true
  return false
}

export function NotificationText({ text, locale, className }: NotificationTextProps) {
  if (!text) return null

  const cleaned = cleanText(text)
  // Strip orphan currency words left from legacy bodies («مبلغ: تومان » before digits).
  const normalized = cleaned.replace(
    /مبلغ\s*:\s*(?:تومان|toman|irt|ریال)\s*/giu,
    'مبلغ: ',
  )

  const parts: ReactNode[] = []
  let last = 0
  let key = 0
  const re = new RegExp(MONEY_CHUNK.source, MONEY_CHUNK.flags)
  let m: RegExpExecArray | null
  while ((m = re.exec(normalized)) !== null) {
    const full = m[0]
    const amount = m[1]
    if (!isMoneyMatch(full, amount)) {
      continue
    }
    if (m.index > last) {
      parts.push(
        <span key={`t-${key++}`}>{localizeDigits(normalized.slice(last, m.index), locale)}</span>,
      )
    }
    // Keep «مبلغ: » label as plain text when present.
    const labelMatch = full.match(/^مبلغ\s*:\s*/u)
    if (labelMatch) {
      parts.push(<span key={`t-${key++}`}>{labelMatch[0]}</span>)
    }
    parts.push(
      <MoneyDisplay key={`m-${key++}`} amount={amount} locale={locale} className="mx-0.5" />,
    )
    last = m.index + full.length
  }
  if (last < normalized.length) {
    parts.push(<span key={`t-${key++}`}>{localizeDigits(normalized.slice(last), locale)}</span>)
  }

  return (
    <span className={cn(className)}>{parts.length ? parts : localizeDigits(normalized, locale)}</span>
  )
}
