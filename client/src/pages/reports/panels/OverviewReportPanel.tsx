import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Area, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from 'recharts'

import { TopCategoriesTable } from '@/components/orders/reports/TopCategoriesTable'
import { TopCouponsTable } from '@/components/orders/reports/TopCouponsTable'
import { TopCustomersTable } from '@/components/orders/reports/TopCustomersTable'
import { TopProductsProfitTable } from '@/components/orders/reports/TopProductsProfitTable'
import { TopProductsTable } from '@/components/orders/reports/TopProductsTable'
import { ReportKpiGrid } from '@/components/orders/reports/ReportKpiGrid'
import { ReportPeriodToolbar } from '@/components/reports/ReportPeriodToolbar'
import { QueryErrorState } from '@/components/QueryErrorState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ReportsDashboardSkeleton } from '@/components/skeletons'
import { buildOrderReportsQuery, useOrderReportsFilters } from '@/hooks/useOrderReports'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { useStoreCurrency } from '@/hooks/useStoreCurrency'
import { apiFetch } from '@/lib/api'
import { formatChartNumber } from '@/lib/chartLocale'
import type { OrderReportResponse, OrderReportSeriesPoint } from '@/types/orderReports'

const CHART_METRICS = [
  'revenue',
  'net',
  'orders',
  'items',
  'refunds',
  'coupons',
  'tax',
  'shipping',
  'profit',
  'cogs',
] as const

type ChartMetric = (typeof CHART_METRICS)[number]

function seriesMetric(row: OrderReportSeriesPoint | undefined, metric: ChartMetric): number {
  if (!row) return 0
  switch (metric) {
    case 'net':
      return row.net ?? Math.max(0, row.revenue - (row.refunds ?? 0))
    case 'coupons':
      return row.coupons ?? 0
    case 'tax':
      return row.tax ?? 0
    case 'shipping':
      return row.shipping ?? 0
    case 'refunds':
      return row.refunds ?? 0
    case 'revenue':
      return row.revenue
    case 'orders':
      return row.orders
    case 'items':
      return row.items
    case 'profit':
      return row.profit
    case 'cogs':
      return row.cogs
    default:
      return 0
  }
}

export function OverviewReportPanel() {
  const { t, i18n } = useTranslation()
  const store = useStoreCurrency()
  const filterState = useOrderReportsFilters()
  const { filters } = filterState
  const [metric, setMetric] = useState<ChartMetric>('revenue')

  const q = useQuery({
    queryKey: ['shop-reports', 'overview', filters],
    queryFn: () => apiFetch<OrderReportResponse>(buildOrderReportsQuery(filters)),
    retry: false,
  })
  useQueryErrorToast(q)

  const data = q.data
  const currency = data?.currency || store.currency

  const chartData = useMemo(
    () =>
      (data?.series ?? []).map((row, idx) => ({
        label: row.label,
        value: seriesMetric(row, metric),
        compare: filters.compare ? seriesMetric(data?.compare?.series?.[idx], metric) : undefined,
      })),
    [data, metric, filters.compare],
  )

  return (
    <div className="space-y-6">
      <ReportPeriodToolbar filterState={filterState} exportSection="overview" />
      {q.isLoading ? (
        <ReportsDashboardSkeleton showPageHeader={false} />
      ) : q.isError ? (
        <QueryErrorState message={q.error?.message} onRetry={() => void q.refetch()} />
      ) : data ? (
        <>
          <ReportKpiGrid
            summary={data.summary}
            compareSummary={data.compare?.summary}
            currency={currency}
            currencySymbol={store.currencySymbol}
            locale={i18n.language}
          />

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
              <CardTitle className="text-base font-medium">{t('reports.chart.overview')}</CardTitle>
              <Select value={metric} onValueChange={(v) => setMetric(v as ChartMetric)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHART_METRICS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {t(`reports.metric.${m}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{ value: { label: t(`reports.metric.${metric}`), color: 'hsl(var(--chart-1))' } }}
                className="h-[280px] w-full"
              >
                <ComposedChart data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={(v) => formatChartNumber(Number(v), i18n.language)} width={64} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    fill="var(--color-value)"
                    stroke="var(--color-value)"
                    fillOpacity={0.2}
                  />
                  {filters.compare ? (
                    <Line
                      type="monotone"
                      dataKey="compare"
                      stroke="hsl(var(--muted-foreground))"
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  ) : null}
                </ComposedChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid min-h-0 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <TopProductsProfitTable
              rows={data.top_products_profit ?? []}
              currency={currency}
              currencySymbol={store.currencySymbol}
              locale={i18n.language}
            />
            <TopProductsTable
              rows={data.top_products}
              currency={currency}
              currencySymbol={store.currencySymbol}
              locale={i18n.language}
            />
            <TopCategoriesTable
              rows={data.top_categories}
              currency={currency}
              currencySymbol={store.currencySymbol}
              locale={i18n.language}
            />
            <TopCustomersTable
              rows={data.top_customers}
              currency={currency}
              currencySymbol={store.currencySymbol}
              locale={i18n.language}
            />
            <TopCouponsTable
              rows={data.top_coupons ?? []}
              currency={currency}
              currencySymbol={store.currencySymbol}
              locale={i18n.language}
            />
          </div>
        </>
      ) : null}
    </div>
  )
}
