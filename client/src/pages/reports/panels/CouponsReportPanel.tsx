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
import type { OrderReportCouponRow } from '@/types/orderReports'

export function CouponsReportPanel() {
  const { t, i18n } = useTranslation()
  const store = useStoreCurrency()
  const state = useReportListState()
  const q = useReportListQuery<OrderReportCouponRow>('coupons', state.filterState.filters, {
    search: state.search,
    page: state.page,
    perPage: state.perPage,
    orderby: state.orderby === 'revenue' ? 'count' : state.orderby,
    order: state.order,
  })
  useQueryErrorToast(q)
  const data = q.data
  const currency = data?.currency || store.currency

  const columns: ReportColumn<OrderReportCouponRow>[] = [
    { id: 'code', header: t('reports.table.coupon'), sortable: true, cell: (r) => r.code },
    {
      id: 'count',
      header: t('reports.table.usage'),
      align: 'end',
      sortable: true,
      cell: (r) => formatNumber(r.count, i18n.language),
    },
    {
      id: 'discount',
      header: t('reports.kpi.discounts'),
      align: 'end',
      sortable: true,
      cell: (r) => (
        <MoneyDisplay amount={r.discount ?? 0} currency={currency} currencySymbol={store.currencySymbol} locale={i18n.language} />
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
  ]

  return (
    <div className="space-y-6">
      <ReportPeriodToolbar filterState={state.filterState} exportSection="coupons" />
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
