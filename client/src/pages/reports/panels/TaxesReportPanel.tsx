import { useTranslation } from 'react-i18next'

import { MoneyDisplay } from '@/components/currency/MoneyDisplay'
import { ReportDataTable, type ReportColumn } from '@/components/reports/ReportDataTable'
import { ReportPeriodToolbar } from '@/components/reports/ReportPeriodToolbar'
import { QueryErrorState } from '@/components/QueryErrorState'
import { Card, CardContent } from '@/components/ui/card'
import { ReportsDashboardSkeleton } from '@/components/skeletons'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { useReportListQuery, useReportListState } from '@/hooks/useShopReportList'
import { useStoreCurrency } from '@/hooks/useStoreCurrency'
import { formatNumber } from '@/lib/formatNumber'
import type { OrderReportTaxRow } from '@/types/orderReports'

export function TaxesReportPanel() {
  const { t, i18n } = useTranslation()
  const store = useStoreCurrency()
  const state = useReportListState()
  const q = useReportListQuery<OrderReportTaxRow>('taxes', state.filterState.filters, {
    search: state.search,
    page: state.page,
    perPage: state.perPage,
    orderby: state.orderby === 'revenue' ? 'total' : state.orderby,
    order: state.order,
  })
  useQueryErrorToast(q)
  const data = q.data
  const currency = data?.currency || store.currency

  const columns: ReportColumn<OrderReportTaxRow>[] = [
    { id: 'label', header: t('reports.table.taxName'), sortable: true, cell: (r) => r.label || r.code },
    { id: 'code', header: t('reports.table.taxCode'), sortable: true, cell: (r) => r.code },
    {
      id: 'rate_percent',
      header: t('reports.table.taxRate'),
      align: 'end',
      sortable: true,
      cell: (r) => `${r.rate_percent}%`,
    },
    {
      id: 'order_tax',
      header: t('reports.table.orderTax'),
      align: 'end',
      sortable: true,
      cell: (r) => (
        <MoneyDisplay amount={r.order_tax} currency={currency} currencySymbol={store.currencySymbol} locale={i18n.language} />
      ),
    },
    {
      id: 'shipping_tax',
      header: t('reports.table.shippingTax'),
      align: 'end',
      sortable: true,
      cell: (r) => (
        <MoneyDisplay amount={r.shipping_tax} currency={currency} currencySymbol={store.currencySymbol} locale={i18n.language} />
      ),
    },
    {
      id: 'total',
      header: t('reports.table.taxTotal'),
      align: 'end',
      sortable: true,
      cell: (r) => (
        <MoneyDisplay amount={r.total} currency={currency} currencySymbol={store.currencySymbol} locale={i18n.language} />
      ),
    },
    {
      id: 'orders',
      header: t('reports.orders'),
      align: 'end',
      sortable: true,
      cell: (r) => formatNumber(r.orders, i18n.language),
    },
  ]

  return (
    <div className="space-y-6">
      <ReportPeriodToolbar filterState={state.filterState} exportSection="taxes" />
      {q.isLoading ? (
        <ReportsDashboardSkeleton showPageHeader={false} />
      ) : q.isError ? (
        <QueryErrorState message={q.error?.message} onRetry={() => void q.refetch()} />
      ) : data ? (
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
      ) : null}
    </div>
  )
}
