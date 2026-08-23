import { useTranslation } from 'react-i18next'

import { MoneyDisplay } from '@/components/currency/MoneyDisplay'
import { ReportDataTable, type ReportColumn } from '@/components/reports/ReportDataTable'
import { ReportPeriodToolbar } from '@/components/reports/ReportPeriodToolbar'
import { QueryErrorState } from '@/components/QueryErrorState'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ReportsDashboardSkeleton } from '@/components/skeletons'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { useReportListQuery, useReportListState } from '@/hooks/useShopReportList'
import { useStoreCurrency } from '@/hooks/useStoreCurrency'
import { formatNumber } from '@/lib/formatNumber'
import type { OrderReportCustomerRow } from '@/types/orderReports'

export function CustomersReportPanel() {
  const { t, i18n } = useTranslation()
  const store = useStoreCurrency()
  const state = useReportListState()
  const q = useReportListQuery<OrderReportCustomerRow>('customers', state.filterState.filters, {
    search: state.search,
    page: state.page,
    perPage: state.perPage,
    orderby: state.orderby,
    order: state.order,
  })
  useQueryErrorToast(q)
  const data = q.data
  const currency = data?.currency || store.currency

  const columns: ReportColumn<OrderReportCustomerRow>[] = [
    { id: 'name', header: t('reports.table.customer'), sortable: true, cell: (r) => r.name },
    { id: 'email', header: t('reports.table.email'), sortable: true, cell: (r) => r.email || '—' },
    {
      id: 'is_new',
      header: t('reports.table.customerType'),
      cell: (r) => (
        <Badge variant="secondary">{r.is_new ? t('reports.customerNew') : t('reports.customerReturning')}</Badge>
      ),
    },
    {
      id: 'orders',
      header: t('reports.orders'),
      align: 'end',
      sortable: true,
      cell: (r) => formatNumber(r.orders, i18n.language),
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
      id: 'aov',
      header: t('reports.kpi.aov'),
      align: 'end',
      sortable: true,
      cell: (r) => (
        <MoneyDisplay amount={r.aov ?? 0} currency={currency} currencySymbol={store.currencySymbol} locale={i18n.language} />
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <ReportPeriodToolbar filterState={state.filterState} exportSection="customers" />
      {q.isLoading ? (
        <ReportsDashboardSkeleton showPageHeader={false} />
      ) : q.isError ? (
        <QueryErrorState message={q.error?.message} onRetry={() => void q.refetch()} />
      ) : data ? (
        <>
          <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
            <span>
              {t('reports.kpi.newCustomers')}: {formatNumber(data.summary.new_customers ?? 0, i18n.language)}
            </span>
            <span>
              {t('reports.kpi.returningCustomers')}: {formatNumber(data.summary.returning_customers ?? 0, i18n.language)}
            </span>
          </div>
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
