import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Area, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { formatChartNumber } from '@/lib/chartLocale'
import type { OrderReportCompare, OrderReportSeriesPoint } from '@/types/orderReports'

type RevenueOrdersChartProps = {
  series: OrderReportSeriesPoint[]
  compareSeries?: OrderReportCompare['series']
  locale: string
}

export function RevenueOrdersChart({ series, compareSeries, locale }: RevenueOrdersChartProps) {
  const { t } = useTranslation()
  const axisFmt = (v: number | string) => formatChartNumber(v, locale)

  const data = useMemo(() => {
    return series.map((row, idx) => ({
      label: row.label,
      revenue: row.revenue,
      orders: row.orders,
      compareRevenue: compareSeries?.[idx]?.revenue ?? 0,
    }))
  }, [series, compareSeries])

  const empty = data.length === 0
  const hasCompare = Boolean(compareSeries?.length)

  return (
    <Card className="min-w-0 overflow-hidden shadow-sm" variant="stat">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{t('reports.chart.revenueOrders')}</CardTitle>
      </CardHeader>
      <CardContent className="h-56 min-w-0 overflow-hidden pt-0 sm:h-72 lg:h-80">
        {empty ? (
          <p className="text-muted-foreground flex h-full items-center justify-center text-sm">{t('reports.emptyHint')}</p>
        ) : (
          <ChartContainer
            config={{
              revenue: { label: t('reports.revenue'), color: 'var(--color-chart-1)' },
              compareRevenue: { label: t('reports.comparePeriod'), color: 'var(--color-chart-2)' },
              orders: { label: t('reports.orders'), color: 'var(--color-chart-3)' },
            }}
            className="h-full min-w-0 w-full max-w-full"
          >
            <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="wd-rev-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-revenue)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-revenue)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="wd-rev-compare" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-compareRevenue)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="var(--color-compareRevenue)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} className="stroke-border/40" strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 10 }} />
              <YAxis yAxisId="left" tickFormatter={axisFmt} tickLine={false} axisLine={false} width={48} tick={{ fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={axisFmt} tickLine={false} axisLine={false} width={40} tick={{ fontSize: 10 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="var(--color-revenue)" fill="url(#wd-rev-fill)" strokeWidth={2} />
              {hasCompare ? (
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="compareRevenue"
                  stroke="var(--color-compareRevenue)"
                  fill="url(#wd-rev-compare)"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                />
              ) : null}
              <Line yAxisId="right" type="monotone" dataKey="orders" stroke="var(--color-orders)" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
