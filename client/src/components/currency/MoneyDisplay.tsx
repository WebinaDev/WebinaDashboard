import type { ReactNode } from 'react'

import { IrtIcon } from '@/components/currency/IrtIcon'
import { decodePriceEntities, isTomanCurrency, parseWcPriceText } from '@/lib/currency'
import { localizeDigits, toAsciiDigits } from '@/lib/digits'
import { formatNumber } from '@/lib/formatNumber'
import { cn } from '@/lib/utils'

type MoneyDisplayProps = {
  amount: number | string
  currency?: string | null
  currencySymbol?: string | null
  locale: string
  className?: string
  amountClassName?: string
  prefix?: ReactNode
}

const TOMAN_WORD = /تومان|toman|irt/gi

function numericFromAmount(amount: number | string): number {
  if (typeof amount === 'number') return Number.isFinite(amount) ? amount : 0
  const cleaned = toAsciiDigits(decodePriceEntities(amount))
    .replace(TOMAN_WORD, '')
    .replace(/[^\d.-]/g, '')
  const n = parseFloat(cleaned)
  return Number.isFinite(n) ? n : NaN
}

export function MoneyDisplay({
  amount,
  currency,
  currencySymbol,
  locale,
  className,
  amountClassName,
  prefix,
}: MoneyDisplayProps) {
  const numeric = numericFromAmount(amount)
  const formatted = Number.isFinite(numeric)
    ? formatNumber(numeric, locale)
    : localizeDigits(
        toAsciiDigits(decodePriceEntities(String(amount))).replace(TOMAN_WORD, '').trim(),
        locale
      )
  const toman =
    isTomanCurrency(currency, currencySymbol) || (!currency?.trim() && !currencySymbol?.trim())

  return (
    <span className={cn('inline-flex items-baseline gap-1', className)} dir="ltr">
      {prefix}
      {toman ? <IrtIcon /> : null}
      <span className={amountClassName}>{formatted}</span>
      {!toman && currency ? (
        <span className="text-muted-foreground text-[0.85em]">{currency}</span>
      ) : null}
    </span>
  )
}

type WcPriceTextProps = {
  text: string
  className?: string
  locale?: string
}

const TOMAN_HINT = /تومان|toman|irt/i

export function WcPriceText({ text, className, locale = 'en' }: WcPriceTextProps) {
  const parsed = parseWcPriceText(text)
  const decoded = decodePriceEntities(text)
  const asToman = parsed.isToman || TOMAN_HINT.test(decoded)

  if (!asToman) {
    return <span className={className}>{localizeDigits(decoded, locale)}</span>
  }
  return (
    <span className={cn('inline-flex items-baseline gap-1', className)} dir="ltr">
      <IrtIcon />
      <span>
        {localizeDigits(
          toAsciiDigits(parsed.amount || decoded.replace(TOMAN_HINT, '').trim()),
          locale
        )}
      </span>
    </span>
  )
}
