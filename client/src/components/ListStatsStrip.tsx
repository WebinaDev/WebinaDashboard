import { MoneyDisplay } from '@/components/currency/MoneyDisplay'
import { Card, CardContent } from '@/components/ui/card'
import { formatNumber } from '@/lib/formatNumber'
import { cn } from '@/lib/utils'

export type ListStatItem = {
  id: string
  label: string
  value: number
  money?: boolean
}

type ListStatsStripProps = {
  items: ListStatItem[]
  locale: string
  currency?: string
  currencySymbol?: string
  className?: string
}

export function ListStatsStrip({ items, locale, currency, currencySymbol, className }: ListStatsStripProps) {
  if (!items.length) return null
  const cols =
    items.length <= 3
      ? 'md:grid-cols-3'
      : items.length <= 4
        ? 'md:grid-cols-2 lg:grid-cols-4'
        : 'md:grid-cols-3 xl:grid-cols-6'

  return (
    <div
      className={cn(
        'flex gap-2.5 overflow-x-auto pb-1 md:grid md:overflow-visible md:pb-0',
        cols,
        className
      )}
    >
      {items.map((item) => (
        <Card key={item.id} variant="stat" className="min-w-[9.5rem] shrink-0 overflow-hidden md:min-w-0">
          <CardContent className="space-y-1 pt-3.5 pb-3">
            <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">{item.label}</p>
            {item.money && currency ? (
              <MoneyDisplay
                amount={item.value}
                currency={currency}
                currencySymbol={currencySymbol}
                locale={locale}
                amountClassName="text-base font-semibold tracking-tight sm:text-lg"
              />
            ) : (
              <p className="text-base font-semibold tracking-tight sm:text-lg">{formatNumber(item.value, locale)}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
