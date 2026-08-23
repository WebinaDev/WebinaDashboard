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
import type { OrderReportCategoryRow } from '@/types/orderReports'

export function CategoriesReportPanel() {
  const { t, i18n } = useTranslation()
  const store = useStoreCurrency()
  const state = useReportListState()
  const q = useReportListQuery<OrderReportCategoryRow>('categories', state.filterState.filters, {
    search: state.search,
    page: state.page,
    perPage: state.perPage,
    orderby: state.orderby,
    order: state.order,
  })
  useQueryErrorToast(q)
  const brands = useReportListQuery<OrderReportCategoryRow>('brands', state.filterState.filters, {
    search: state.search,
    page: 1,
    perPage: 10,
    orderby: 'revenue',
    order: 'desc',
  })
  const data = q.data
  const currency = data?.currency || store.currency

  const columns: ReportColumn<OrderReportCategoryRow>[] = [
    { id: 'name', header: t('reports.table.category'), sortable: true, cell: (r) => r.name },
    {
      id: 'quantity',
      header: t('reports.table.quantity'),
      align: 'end',
      sortable: true,
      cell: (r) => formatNumber(r.quantity, i18n.language),
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
      id: 'profit',
      header: t('reports.table.profit'),
      align: 'end',
      sortable: true,
      cell: (r) => (
        <MoneyDisplay amount={r.profit ?? 0} currency={currency} currencySymbol={store.currencySymbol} locale={i18n.language} />
      ),
    },
    {
      id: 'margin_pct',
      header: t('reports.table.margin'),
      align: 'end',
      sortable: true,
      cell: (r) => `${(r.margin_pct ?? 0).toFixed(1)}%`,
    },
  ]

  return (
    <div className="space-y-6">
      <ReportPeriodToolbar filterState={state.filterState} exportSection="categories" />
      {q.isLoading ? (
        <ReportsDashboardSkeleton showPageHeader={false} />
      ) : q.isError ? (
        <QueryErrorState message={q.error?.message} onRetry={() => void q.refetch()} />
      ) : data ? (
        <>
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
          {brands.data && brands.data.items.length > 0 ? (
            <Card className="shadow-sm">
              <CardContent className="space-y-3 pt-6">
                <p className="text-sm font-medium">{t('reports.table.topBrands')}</p>
                <ReportDataTable
                  rows={brands.data.items}
                  columns={columns.map((c) =>
                    c.id === 'name' ? { ...c, header: t('reports.table.brand') } : c,
                  )}
                  total={brands.data.total}
                  page={1}
                  perPage={10}
                  search=""
                  orderby="revenue"
                  order="desc"
                  locale={i18n.language}
                  onSearchChange={() => undefined}
                  onPageChange={() => undefined}
                  onSortChange={() => undefined}
                />
              </CardContent>
            </Card>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
