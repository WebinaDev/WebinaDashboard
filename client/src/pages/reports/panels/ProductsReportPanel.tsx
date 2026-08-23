import { useTranslation } from 'react-i18next'

import { MoneyDisplay } from '@/components/currency/MoneyDisplay'
import { ReportKpiGrid } from '@/components/orders/reports/ReportKpiGrid'
import { ReportDataTable, type ReportColumn } from '@/components/reports/ReportDataTable'
import { ReportPeriodToolbar } from '@/components/reports/ReportPeriodToolbar'
import { QueryErrorState } from '@/components/QueryErrorState'
import { Card, CardContent } from '@/components/ui/card'
import { ReportsDashboardSkeleton } from '@/components/skeletons'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { useReportListQuery, useReportListState } from '@/hooks/useShopReportList'
import { useStoreCurrency } from '@/hooks/useStoreCurrency'
import { formatNumber } from '@/lib/formatNumber'
import type { OrderReportProductProfitRow } from '@/types/orderReports'

export function ProductsReportPanel() {
  const { t, i18n } = useTranslation()
  const store = useStoreCurrency()
  const state = useReportListState()
  const q = useReportListQuery<OrderReportProductProfitRow>('products', state.filterState.filters, {
    search: state.search,
    page: state.page,
    perPage: state.perPage,
    orderby: state.orderby,
    order: state.order,
  })
  useQueryErrorToast(q)
  const data = q.data
  const currency = data?.currency || store.currency

  const columns: ReportColumn<OrderReportProductProfitRow>[] = [
    { id: 'name', header: t('reports.table.product'), sortable: true, cell: (r) => r.name },
    {
      id: 'quantity',
      header: t('reports.table.quantity'),
      align: 'end',
      sortable: true,
      cell: (r) => formatNumber(r.quantity, i18n.language),
    },
    {
      id: 'avg_sell_price',
      header: t('reports.table.avgSell'),
      align: 'end',
      sortable: true,
      cell: (r) => (
        <MoneyDisplay amount={r.avg_sell_price ?? 0} currency={currency} currencySymbol={store.currencySymbol} locale={i18n.language} />
      ),
    },
    {
      id: 'avg_cost',
      header: t('reports.table.avgCost'),
      align: 'end',
      sortable: true,
      cell: (r) => (
        <MoneyDisplay amount={r.avg_cost ?? 0} currency={currency} currencySymbol={store.currencySymbol} locale={i18n.language} />
      ),
    },
    {
      id: 'revenue',
      header: t('reports.revenue'),
      align: 'end',
      sortable: true,
      cell: (r) => (
        <MoneyDisplay amount={r.revenue} currency={currency} currencySymbol={store.currencySymbol} locale={i18n.language} />
      ),
    },
    {
      id: 'cogs',
      header: t('reports.table.cogs'),
      align: 'end',
      sortable: true,
      cell: (r) => (
        <MoneyDisplay amount={r.cogs} currency={currency} currencySymbol={store.currencySymbol} locale={i18n.language} />
      ),
    },
    {
      id: 'profit',
      header: t('reports.table.profit'),
      align: 'end',
      sortable: true,
      cell: (r) => (
        <MoneyDisplay amount={r.profit} currency={currency} currencySymbol={store.currencySymbol} locale={i18n.language} />
      ),
    },
    {
      id: 'margin_pct',
      header: t('reports.table.margin'),
      align: 'end',
      sortable: true,
      cell: (r) => `${r.margin_pct.toFixed(1)}%`,
    },
  ]

  return (
    <div className="space-y-6">
      <ReportPeriodToolbar filterState={state.filterState} exportSection="products" />
      {q.isLoading ? (
        <ReportsDashboardSkeleton showPageHeader={false} />
      ) : q.isError ? (
        <QueryErrorState message={q.error?.message} onRetry={() => void q.refetch()} />
      ) : data ? (
        <>
          <ReportKpiGrid
            summary={data.summary}
            currency={currency}
            currencySymbol={store.currencySymbol}
            locale={i18n.language}
          />
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <ReportDataTable
                rows={data.items}
                columns={columns}
                total={data.total}
                page={data.page}
                perPage={data.per_page}
                search={state.search}
                orderby={state.orderby}
                order={state.order}
                locale={i18n.language}
                onSearchChange={state.onSearchChange}
                onPageChange={state.setPage}
                onSortChange={state.onSortChange}
              />
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
