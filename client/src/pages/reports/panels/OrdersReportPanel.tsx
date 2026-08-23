import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'

import { HourlyOrdersChart } from '@/components/orders/reports/HourlyOrdersChart'
import { PaymentBarChart } from '@/components/orders/reports/PaymentBarChart'
import { ReportKpiGrid } from '@/components/orders/reports/ReportKpiGrid'
import { SourceBarChart } from '@/components/orders/reports/SourceBarChart'
import { StatusPieChart } from '@/components/orders/reports/StatusPieChart'
import { WeekHourHeatmap } from '@/components/orders/reports/WeekHourHeatmap'
import { ReportPeriodToolbar } from '@/components/reports/ReportPeriodToolbar'
import { QueryErrorState } from '@/components/QueryErrorState'
import { ReportsDashboardSkeleton } from '@/components/skeletons'
import { buildOrderReportsQuery, useOrderReportsFilters } from '@/hooks/useOrderReports'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { useStoreCurrency } from '@/hooks/useStoreCurrency'
import { apiFetch } from '@/lib/api'
import type { OrderReportResponse } from '@/types/orderReports'

export function OrdersReportPanel() {
  const { t, i18n } = useTranslation()
  const store = useStoreCurrency()
  const filterState = useOrderReportsFilters()
  const { filters } = filterState

  const q = useQuery({
    queryKey: ['shop-reports', 'orders-panel', filters],
    queryFn: () => apiFetch<OrderReportResponse>(buildOrderReportsQuery(filters)),
    retry: false,
  })
  useQueryErrorToast(q)
  const data = q.data
  const currency = data?.currency || store.currency

  return (
    <div className="space-y-6">
      <ReportPeriodToolbar filterState={filterState} exportSection="orders" />
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
          <WeekHourHeatmap
            cells={data.heatmap ?? []}
            currency={currency}
            currencySymbol={store.currencySymbol}
            locale={i18n.language}
          />
          <div className="grid min-h-0 gap-4 lg:grid-cols-2">
            <StatusPieChart rows={data.by_status} />
            <PaymentBarChart rows={data.by_payment} locale={i18n.language} />
            <SourceBarChart rows={data.by_source} locale={i18n.language} />
            <HourlyOrdersChart rows={data.by_hour} locale={i18n.language} />
          </div>
          <p className="text-muted-foreground text-xs">
            {t('reports.itemsPerOrder')}: {(data.summary.items_per_order ?? 0).toFixed(2)}
          </p>
        </>
      ) : null}
    </div>
  )
}
