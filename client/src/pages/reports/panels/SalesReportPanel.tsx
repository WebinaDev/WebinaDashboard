import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { MoneyDisplay } from '@/components/currency/MoneyDisplay'
import { PriceTierChart } from '@/components/orders/reports/PriceTierChart'
import { ProfitChart } from '@/components/orders/reports/ProfitChart'
import { ReportKpiGrid } from '@/components/orders/reports/ReportKpiGrid'
import { ReportDataTable, type ReportColumn } from '@/components/reports/ReportDataTable'
import { ReportPeriodToolbar } from '@/components/reports/ReportPeriodToolbar'
import { QueryErrorState } from '@/components/QueryErrorState'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ReportsDashboardSkeleton } from '@/components/skeletons'
import { buildShopReportQuery, useOrderReportsFilters } from '@/hooks/useOrderReports'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { useStoreCurrency } from '@/hooks/useStoreCurrency'
import { apiFetch } from '@/lib/api'
import { formatNumber } from '@/lib/formatNumber'
import type { OrderReportProductProfitRow, OrderReportResponse } from '@/types/orderReports'

type SalesPnlResponse = OrderReportResponse & {
  items?: OrderReportProductProfitRow[]
  total?: number
  page?: number
  per_page?: number
  revenue?: number
  order_count?: number
}

export function SalesReportPanel() {
  const { t, i18n } = useTranslation()
  const store = useStoreCurrency()
  const filterState = useOrderReportsFilters()
  const { filters } = filterState
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [orderby, setOrderby] = useState('profit')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')

  const q = useQuery({
    queryKey: ['shop-reports', 'sales', filters, search, page, orderby, order],
    queryFn: () =>
      apiFetch<SalesPnlResponse>(
        buildShopReportQuery('shop/reports/sales', filters, {
          search: search || undefined,
          page,
          per_page: 25,
          orderby,
          order,
        }),
      ),
    retry: false,
  })
  useQueryErrorToast(q)
  const data = q.data
  const currency = data?.currency || store.currency
  const target = data?.summary?.target_margin_pct ?? 0

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
      id: 'avg_cost',
      header: t('reports.table.purchasePrice'),
      align: 'end',
      sortable: true,
      cell: (r) => (
        <MoneyDisplay amount={r.avg_cost ?? 0} currency={currency} currencySymbol={store.currencySymbol} locale={i18n.language} />
      ),
    },
    {
      id: 'avg_sell_price',
      header: t('reports.table.sellPrice'),
      align: 'end',
      sortable: true,
      cell: (r) => (
        <MoneyDisplay amount={r.avg_sell_price ?? 0} currency={currency} currencySymbol={store.currencySymbol} locale={i18n.language} />
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
      <ReportPeriodToolbar filterState={filterState} exportSection="sales" />
      {q.isLoading ? (
        <ReportsDashboardSkeleton showPageHeader={false} />
      ) : q.isError ? (
        <QueryErrorState message={q.error?.message} onRetry={() => void q.refetch()} />
      ) : data?.summary ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {data.summary.wfcp_enabled ? null : <Badge variant="secondary">{t('reports.wfcpDisabledHint')}</Badge>}
            <p className="text-muted-foreground text-xs">{t('reports.cogsApproxHint')}</p>
            {target > 0 ? (
              <p className="text-muted-foreground text-xs">
                {t('reports.targetMarginHint', {
                  target: target.toFixed(1),
                  actual: (data.summary.gross_margin_pct ?? 0).toFixed(1),
                })}
              </p>
            ) : null}
          </div>
          <ReportKpiGrid
            summary={data.summary}
            compareSummary={data.compare?.summary}
            currency={currency}
            currencySymbol={store.currencySymbol}
            locale={i18n.language}
          />
          <div className="grid min-h-0 gap-4 xl:grid-cols-2">
            <ProfitChart series={data.series ?? []} compareSeries={data.compare?.series} locale={i18n.language} />
            <PriceTierChart rows={data.by_price_tier ?? []} locale={i18n.language} />
          </div>
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <ReportDataTable
                rows={data.items ?? []}
                columns={columns}
                total={data.total ?? 0}
                page={data.page ?? 1}
                perPage={data.per_page ?? 25}
                search={search}
                orderby={orderby}
                order={order}
                locale={i18n.language}
                onSearchChange={(v) => {
                  setSearch(v)
                  setPage(1)
                }}
                onPageChange={setPage}
                onSortChange={(next) => {
                  if (orderby === next) setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
                  else {
                    setOrderby(next)
                    setOrder('desc')
                  }
                }}
              />
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
