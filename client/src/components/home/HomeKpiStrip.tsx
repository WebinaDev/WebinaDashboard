import { TrendingDown, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { MoneyDisplay } from '@/components/currency/MoneyDisplay'
import { Card, CardContent } from '@/components/ui/card'
import { pctDelta } from '@/hooks/useOrderReports'
import { formatNumber } from '@/lib/formatNumber'
import type { OrderReportCompare, OrderReportSummary } from '@/types/orderReports'

type HomeKpiStripProps = {
  summary: OrderReportSummary
  compareSummary?: OrderReportCompare['summary']
  currency: string
  currencySymbol?: string
  locale: string
}

const HOME_KPIS: Array<{
  key: keyof OrderReportSummary
  labelKey: string
  money?: boolean
  integer?: boolean
  percent?: boolean
}> = [
  { key: 'revenue', labelKey: 'reports.kpi.revenue', money: true },
  { key: 'gross_profit', labelKey: 'reports.kpi.grossProfit', money: true },
  { key: 'avg_order_value', labelKey: 'reports.kpi.aov', money: true },
  { key: 'order_count', labelKey: 'reports.kpi.orders', integer: true },
  { key: 'items_sold', labelKey: 'reports.kpi.itemsSold', integer: true },
  { key: 'gross_margin_pct', labelKey: 'reports.kpi.grossMargin', percent: true },
]

function Delta({ current, previous }: { current: number; previous?: number }) {
  const { t } = useTranslation()
  if (previous === undefined) return null
  const delta = pctDelta(current, previous)
  if (delta === null) {
    return <span className="text-muted-foreground text-[10px]">{t('reports.deltaNew')}</span>
  }
  const up = delta >= 0
  const Icon = up ? TrendingUp : TrendingDown
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] ${up ? 'text-emerald-600' : 'text-red-600'}`}>
      <Icon className="size-3" />
      {Math.abs(delta).toFixed(1)}%
    </span>
  )
}

export function HomeKpiStrip({ summary, compareSummary, currency, currencySymbol, locale }: HomeKpiStripProps) {
  const { t } = useTranslation()

  return (
    <section className="space-y-2" aria-label={t('home.sections.sales')}>
      <h2 className="text-sm font-semibold tracking-tight">{t('home.sections.kpis')}</h2>
      <div className="flex gap-2.5 overflow-x-auto pb-1 md:grid md:grid-cols-3 md:overflow-visible md:pb-0 xl:grid-cols-6">
        {HOME_KPIS.map((kpi) => {
          const value = Number(summary[kpi.key] ?? 0)
          const prev = compareSummary?.[kpi.key]
          return (
            <Card key={kpi.key} variant="stat" className="min-w-[9.5rem] shrink-0 overflow-hidden md:min-w-0">
              <CardContent className="space-y-1 pt-3.5 pb-3">
                <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                  {t(kpi.labelKey)}
                </p>
                <div className="flex items-baseline justify-between gap-1.5">
                  {kpi.money ? (
                    <MoneyDisplay
                      amount={value}
                      currency={currency}
                      currencySymbol={currencySymbol}
                      locale={locale}
                      amountClassName="text-base font-semibold tracking-tight sm:text-lg"
                    />
                  ) : kpi.percent ? (
                    <p className="text-base font-semibold tracking-tight sm:text-lg">{value.toFixed(1)}%</p>
                  ) : (
                    <p className="text-base font-semibold tracking-tight sm:text-lg">
                      {formatNumber(value, locale)}
                    </p>
                  )}
                  <Delta current={value} previous={prev !== undefined ? Number(prev) : undefined} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
