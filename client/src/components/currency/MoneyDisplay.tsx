import type { ReactNode } from 'react'

import { IrtIcon } from '@/components/currency/IrtIcon'
import { decodePriceEntities, isTomanCurrency, parseWcPriceText } from '@/lib/currency'
import { localizeDigits } from '@/lib/digits'
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

export function MoneyDisplay({
  amount,
  currency,
  currencySymbol,
  locale,
  className,
  amountClassName,
  prefix,
}: MoneyDisplayProps) {
  const cleaned =
    typeof amount === 'string' ? decodePriceEntities(amount).replace(/[^\d.-]/g, '') : ''
  const numeric = typeof amount === 'number' ? amount : parseFloat(cleaned)
  const formatted =
    typeof amount === 'string' && Number.isNaN(numeric)
      ? decodePriceEntities(amount)
      : formatNumber(Number.isFinite(numeric) ? numeric : 0, locale)
  const toman =
    isTomanCurrency(currency, currencySymbol) || (!currency?.trim() && !currencySymbol?.trim())

  return (
    <span className={cn('inline-flex items-baseline gap-1', className)}>
      {prefix}
      <span className={amountClassName}>{formatted}</span>
      {toman ? <IrtIcon /> : currency ? <span className="text-muted-foreground text-[0.85em]">{currency}</span> : null}
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
    <span className={cn('inline-flex items-baseline gap-1', className)}>
      <span>{localizeDigits(parsed.amount || decoded.replace(TOMAN_HINT, '').trim(), locale)}</span>
      <IrtIcon />
    </span>
  )
}
