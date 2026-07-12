import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { HourlyOrdersChart } from '@/components/orders/reports/HourlyOrdersChart'
import { PaymentBarChart } from '@/components/orders/reports/PaymentBarChart'
import { PriceTierChart } from '@/components/orders/reports/PriceTierChart'
import { ProfitChart } from '@/components/orders/reports/ProfitChart'
import { ReportExportButton } from '@/components/orders/reports/ReportExportButton'
import { ReportFilters } from '@/components/orders/reports/ReportFilters'
import { ReportKpiGrid } from '@/components/orders/reports/ReportKpiGrid'
import { RevenueOrdersChart } from '@/components/orders/reports/RevenueOrdersChart'
import { SourceBarChart } from '@/components/orders/reports/SourceBarChart'
import { StatusPieChart } from '@/components/orders/reports/StatusPieChart'
import { TopCategoriesTable } from '@/components/orders/reports/TopCategoriesTable'
import { TopCustomersTable } from '@/components/orders/reports/TopCustomersTable'
import { TopProductsProfitTable } from '@/components/orders/reports/TopProductsProfitTable'
import { TopProductsTable } from '@/components/orders/reports/TopProductsTable'
import { WeekHourHeatmap } from '@/components/orders/reports/WeekHourHeatmap'
import { QueryErrorState } from '@/components/QueryErrorState'
import { PageShell } from '@/components/PageShell'
import { ReportsDashboardSkeleton } from '@/components/skeletons'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { buildOrderReportsQuery, useOrderReportsFilters } from '@/hooks/useOrderReports'
import { useStoreCurrency } from '@/hooks/useStoreCurrency'
import { apiFetch } from '@/lib/api'
import type { OrderReportResponse } from '@/types/orderReports'

export default function SalesReportsPage() {
  const { t, i18n } = useTranslation()
  const store = useStoreCurrency()
  const filterState = useOrderReportsFilters()
  const { filters } = filterState

  const q = useQuery({
    queryKey: ['order-reports', filters],
    queryFn: () => apiFetch<OrderReportResponse>(buildOrderReportsQuery(filters)),
    retry: false,
  })
  useQueryErrorToast(q)

  const data = q.data
  const currency = data?.currency || store.currency

  return (
    <PageShell title={t('reports.title')} description={t('reports.descriptionFull')}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <ReportExportButton filters={filters} />
      </div>

      <ReportFilters
        preset={filterState.preset}
        from={filterState.from}
        to={filterState.to}
        interval={filterState.interval}
        compare={filterState.compare}
        statuses={filterState.statuses}
        onPresetChange={filterState.applyPreset}
        onFromChange={filterState.setCustomFrom}
        onToChange={filterState.setCustomTo}
        onIntervalChange={filterState.setInterval}
        onCompareChange={filterState.setCompare}
        onStatusesChange={filterState.setStatuses}
      />

      <div className="mt-6 space-y-6">
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

            <div className="grid min-h-0 gap-4 xl:grid-cols-2">
              <RevenueOrdersChart series={data.series} compareSeries={data.compare?.series} locale={i18n.language} />
              <ProfitChart series={data.series} compareSeries={data.compare?.series} locale={i18n.language} />
            </div>

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
              <PriceTierChart rows={data.by_price_tier ?? []} locale={i18n.language} />
              <HourlyOrdersChart rows={data.by_hour} locale={i18n.language} />
            </div>

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
            </div>
          </>
        ) : null}
      </div>
    </PageShell>
  )
}
