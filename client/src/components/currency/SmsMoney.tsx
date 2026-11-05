import { MoneyDisplay } from '@/components/currency/MoneyDisplay'

type SmsMoneyProps = {
  amount: number | string | null | undefined
  locale: string
  className?: string
  amountClassName?: string
}

/** Toman amount with the same glyph and grouping used on product prices. */
export function SmsMoney({ amount, locale, className, amountClassName }: SmsMoneyProps) {
  const raw = typeof amount === 'number' ? amount : Number(String(amount ?? '').replace(/[^\d.-]/g, ''))
  const whole = Number.isFinite(raw) ? Math.round(raw) : 0

  return (
    <MoneyDisplay
      amount={whole}
      currency="IRT"
      locale={locale}
      className={className}
      amountClassName={amountClassName}
    />
  )
}
