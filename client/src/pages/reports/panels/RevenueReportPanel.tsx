import { useTranslation } from 'react-i18next'

import { ReportKpiGrid } from '@/components/orders/reports/ReportKpiGrid'
import { RevenueOrdersChart } from '@/components/orders/reports/RevenueOrdersChart'
import { ReportPeriodToolbar } from '@/components/reports/ReportPeriodToolbar'
import { QueryErrorState } from '@/components/QueryErrorState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MoneyDisplay } from '@/components/currency/MoneyDisplay'
import { ReportsDashboardSkeleton } from '@/components/skeletons'
import { buildShopReportQuery, useOrderReportsFilters } from '@/hooks/useOrderReports'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { useStoreCurrency } from '@/hooks/useStoreCurrency'
import { apiFetch } from '@/lib/api'
import { formatNumber } from '@/lib/formatNumber'
import { useQuery } from '@tanstack/react-query'
import type { OrderReportResponse } from '@/types/orderReports'

export function RevenueReportPanel() {
  const { t, i18n } = useTranslation()
  const store = useStoreCurrency()
  const filterState = useOrderReportsFilters()
  const { filters } = filterState

  const q = useQuery({
    queryKey: ['shop-reports', 'revenue', filters],
    queryFn: () =>
      apiFetch<OrderReportResponse>(buildShopReportQuery('shop/reports/revenue', filters)),
    retry: false,
  })
  useQueryErrorToast(q)
  const data = q.data
  const currency = data?.currency || store.currency

  return (
    <div className="space-y-6">
      <ReportPeriodToolbar filterState={filterState} exportSection="revenue" />
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
          <RevenueOrdersChart series={data.series} compareSeries={data.compare?.series} locale={i18n.language} />
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-medium">{t('reports.table.intervals')}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('reports.table.period')}</TableHead>
                    <TableHead className="text-end">{t('reports.kpi.revenue')}</TableHead>
                    <TableHead className="text-end">{t('reports.metric.net')}</TableHead>
                    <TableHead className="text-end">{t('reports.kpi.refunds')}</TableHead>
                    <TableHead className="text-end">{t('reports.kpi.discounts')}</TableHead>
                    <TableHead className="text-end">{t('reports.kpi.tax')}</TableHead>
                    <TableHead className="text-end">{t('reports.kpi.shipping')}</TableHead>
                    <TableHead className="text-end">{t('reports.orders')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.series.map((row) => (
                    <TableRow key={row.key}>
                      <TableCell>{row.label}</TableCell>
                      <TableCell className="text-end">
                        <MoneyDisplay amount={row.revenue} currency={currency} currencySymbol={store.currencySymbol} locale={i18n.language} />
                      </TableCell>
                      <TableCell className="text-end">
                        <MoneyDisplay
                          amount={row.net ?? Math.max(0, row.revenue - (row.refunds ?? 0))}
                          currency={currency}
                          currencySymbol={store.currencySymbol}
                          locale={i18n.language}
                        />
                      </TableCell>
                      <TableCell className="text-end">
                        <MoneyDisplay amount={row.refunds ?? 0} currency={currency} currencySymbol={store.currencySymbol} locale={i18n.language} />
                      </TableCell>
                      <TableCell className="text-end">
                        <MoneyDisplay amount={row.coupons ?? 0} currency={currency} currencySymbol={store.currencySymbol} locale={i18n.language} />
                      </TableCell>
                      <TableCell className="text-end">
                        <MoneyDisplay amount={row.tax ?? 0} currency={currency} currencySymbol={store.currencySymbol} locale={i18n.language} />
                      </TableCell>
                      <TableCell className="text-end">
                        <MoneyDisplay amount={row.shipping ?? 0} currency={currency} currencySymbol={store.currencySymbol} locale={i18n.language} />
                      </TableCell>
                      <TableCell className="text-end">{formatNumber(row.orders, i18n.language)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
