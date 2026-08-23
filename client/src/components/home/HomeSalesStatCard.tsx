import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Area, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from 'recharts'

import { MoneyDisplay } from '@/components/currency/MoneyDisplay'
import { ChangePctBadge } from '@/components/home/HomeProductStatsCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer } from '@/components/ui/chart'
import { pctDelta } from '@/hooks/useOrderReports'
import { formatChartNumber } from '@/lib/chartLocale'
import { formatNumber } from '@/lib/formatNumber'
import type { DashboardOverviewSales } from '@/types/dashboardOverview'

type HomeSalesStatCardProps = {
  sales: DashboardOverviewSales
  currency: string
  currencySymbol?: string
  locale: string
}

export function HomeSalesStatCard({ sales, currency, currencySymbol, locale }: HomeSalesStatCardProps) {
  const { t } = useTranslation()
  const chartData = useMemo(
    () =>
      sales.series.map((row, idx) => ({
        label: row.label,
        revenue: row.revenue,
        orders: row.orders,
        compareRevenue: sales.compare_series[idx]?.revenue ?? 0,
      })),
    [sales.series, sales.compare_series],
  )
  const revenueDelta = pctDelta(sales.summary.revenue, sales.compare_summary.revenue)
  const gradId = 'home-sales-revenue-fill'

  return (
    <Card variant="stat">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {sales.range === 'last30' ? t('home.sales.last30') : t('home.sales.thisMonth')}
        </CardTitle>
        <Button asChild variant="outline" size="sm" className="h-7 text-xs">
          <Link to="/reports/overview">{t('home.sales.viewDetails')}</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-muted-foreground text-xs">{sales.month_label}</p>
        <MoneyDisplay
          amount={sales.summary.revenue}
          currency={currency}
          currencySymbol={currencySymbol}
          locale={locale}
          className="text-2xl font-semibold"
        />
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span>
            {formatNumber(sales.summary.order_count, locale)} {t('reports.orders')}
          </span>
          {revenueDelta !== null ? (
            <ChangePctBadge value={revenueDelta} />
          ) : (
            <ChangePctBadge value={null} />
          )}
        </div>
        <div className="h-28 min-h-0 min-w-0 sm:h-36">
          {chartData.length === 0 ? (
            <p className="text-muted-foreground flex h-full items-center justify-center text-xs">{t('reports.emptyHint')}</p>
          ) : (
            <ChartContainer
              config={{
                revenue: { label: t('reports.revenue'), color: 'var(--color-chart-1)' },
                orders: { label: t('reports.orders'), color: 'var(--color-chart-3)' },
                compareRevenue: { label: t('reports.comparePeriod'), color: 'var(--color-chart-4)' },
              }}
              className="h-full min-h-[7rem] w-full sm:min-h-[9rem]"
              initialDimension={{ width: 320, height: 144 }}
            >
              <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-revenue)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-revenue)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis dataKey="label" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                <YAxis tickFormatter={(v) => formatChartNumber(v, locale)} tick={{ fontSize: 9 }} width={40} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  fill={`url(#${gradId})`}
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="compareRevenue"
                  stroke="var(--color-chart-4)"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  opacity={0.65}
                />
                <Line type="monotone" dataKey="orders" stroke="var(--color-orders)" strokeWidth={1.5} dot={false} yAxisId={0} />
              </ComposedChart>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
