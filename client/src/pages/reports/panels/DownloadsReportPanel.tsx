import { useTranslation } from 'react-i18next'

import { ReportDataTable, type ReportColumn } from '@/components/reports/ReportDataTable'
import { ReportPeriodToolbar } from '@/components/reports/ReportPeriodToolbar'
import { QueryErrorState } from '@/components/QueryErrorState'
import { Card, CardContent } from '@/components/ui/card'
import { ReportsDashboardSkeleton } from '@/components/skeletons'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { useReportListQuery, useReportListState } from '@/hooks/useShopReportList'
import { formatNumber } from '@/lib/formatNumber'
import type { OrderReportDownloadRow } from '@/types/orderReports'

export function DownloadsReportPanel() {
  const { t, i18n } = useTranslation()
  const state = useReportListState()
  const q = useReportListQuery<OrderReportDownloadRow>('downloads', state.filterState.filters, {
    search: state.search,
    page: state.page,
    perPage: state.perPage,
    orderby: state.orderby === 'revenue' ? 'downloads' : state.orderby,
    order: state.order,
  })
  useQueryErrorToast(q)
  const data = q.data

  const columns: ReportColumn<OrderReportDownloadRow>[] = [
    { id: 'name', header: t('reports.table.product'), sortable: true, cell: (r) => r.name },
    {
      id: 'downloads',
      header: t('reports.table.downloads'),
      align: 'end',
      sortable: true,
      cell: (r) => formatNumber(r.downloads, i18n.language),
    },
  ]

  return (
    <div className="space-y-6">
      <ReportPeriodToolbar filterState={state.filterState} exportSection="downloads" />
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
              emptyHint={t('reports.downloadsEmpty')}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
