import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Download } from 'lucide-react'

import { MoneyDisplay } from '@/components/currency/MoneyDisplay'
import { ReportDataTable, type ReportColumn } from '@/components/reports/ReportDataTable'
import { QueryErrorState } from '@/components/QueryErrorState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ReportsDashboardSkeleton } from '@/components/skeletons'
import { downloadReportCsv } from '@/hooks/useOrderReports'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { useStoreCurrency } from '@/hooks/useStoreCurrency'
import { apiFetch } from '@/lib/api'
import { formatNumber } from '@/lib/formatNumber'
import type { InventoryReportResponse, InventoryReportRow } from '@/types/orderReports'

const VALUE_BASES = ['purchase', 'retail', 'current', 'wholesale', 'credit'] as const

export function StockReportPanel() {
  const { t, i18n } = useTranslation()
  const store = useStoreCurrency()
  const [filter, setFilter] = useState('all')
  const [valueBase, setValueBase] = useState<(typeof VALUE_BASES)[number]>('purchase')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [orderby, setOrderby] = useState('name')
  const [order, setOrder] = useState<'asc' | 'desc'>('asc')

  const q = useQuery({
    queryKey: ['shop-reports', 'stock', filter, search, page, orderby, order],
    queryFn: () => {
      const p = new URLSearchParams()
      p.set('stock_filter', filter)
      p.set('page', String(page))
      p.set('per_page', '25')
      p.set('orderby', orderby)
      p.set('order', order)
      if (search) p.set('search', search)
      return apiFetch<InventoryReportResponse>(`shop/reports/stock?${p.toString()}`)
    },
    retry: false,
  })
  useQueryErrorToast(q)
  const data = q.data
  const currency = data?.currency || store.currency
  const summary = data?.summary

  const columns: ReportColumn<InventoryReportRow>[] = [
    { id: 'name', header: t('reports.table.product'), sortable: true, cell: (r) => r.name },
    { id: 'sku', header: t('reports.table.sku'), sortable: true, cell: (r) => r.sku || '—' },
    {
      id: 'stock_qty',
      header: t('reports.table.stock'),
      align: 'end',
      sortable: true,
      cell: (r) => (
        <span className="inline-flex items-center gap-1">
          {formatNumber(r.stock_qty, i18n.language)}
          {r.is_low_stock ? <Badge variant="destructive">{t('reports.stock.low')}</Badge> : null}
        </span>
      ),
    },
    {
      id: 'stock_status',
      header: t('reports.table.stockStatus'),
      sortable: true,
      cell: (r) => t(`reports.stockStatus.${r.stock_status}`, { defaultValue: r.stock_status }),
    },
    {
      id: 'price_purchase',
      header: t('reports.table.purchasePrice'),
      align: 'end',
      sortable: true,
      cell: (r) => (
        <MoneyDisplay
          amount={r.prices.purchase ?? 0}
          currency={currency}
          currencySymbol={store.currencySymbol}
          locale={i18n.language}
        />
      ),
    },
    {
      id: 'price_retail',
      header: t('reports.tier.retail'),
      align: 'end',
      sortable: true,
      cell: (r) => (
        <MoneyDisplay amount={r.prices.retail ?? 0} currency={currency} currencySymbol={store.currencySymbol} locale={i18n.language} />
      ),
    },
    {
      id: 'price_current',
      header: t('reports.table.currentPrice'),
      align: 'end',
      sortable: true,
      cell: (r) => (
        <MoneyDisplay amount={r.prices.current ?? 0} currency={currency} currencySymbol={store.currencySymbol} locale={i18n.language} />
      ),
    },
    {
      id: 'price_wholesale',
      header: t('reports.tier.wholesale'),
      align: 'end',
      sortable: true,
      cell: (r) => (
        <MoneyDisplay
          amount={r.prices.wholesale ?? 0}
          currency={currency}
          currencySymbol={store.currencySymbol}
          locale={i18n.language}
        />
      ),
    },
    {
      id: `value_${valueBase}`,
      header: t('reports.table.stockValue'),
      align: 'end',
      sortable: true,
      cell: (r) => (
        <MoneyDisplay
          amount={r.values[valueBase] ?? 0}
          currency={currency}
          currencySymbol={store.currencySymbol}
          locale={i18n.language}
        />
      ),
    },
    {
      id: 'potential_profit',
      header: t('reports.table.potentialProfit'),
      align: 'end',
      sortable: true,
      cell: (r) => (
        <MoneyDisplay
          amount={r.potential_profit}
          currency={currency}
          currencySymbol={store.currencySymbol}
          locale={i18n.language}
        />
      ),
    },
  ]

  const kpiItems = summary
    ? [
        { label: t('reports.stock.skuCount'), value: formatNumber(summary.sku_count, i18n.language) },
        { label: t('reports.stock.units'), value: formatNumber(summary.units_in_stock, i18n.language) },
        { label: t('reports.stock.outofstock'), value: formatNumber(summary.outofstock_count, i18n.language) },
        { label: t('reports.stock.low'), value: formatNumber(summary.low_stock_count, i18n.language) },
        { label: t('reports.stock.missingCost'), value: formatNumber(summary.missing_cost_count, i18n.language) },
        {
          label: t('reports.stock.valuePurchase'),
          value: (
            <MoneyDisplay
              amount={summary.value_purchase}
              currency={currency}
              currencySymbol={store.currencySymbol}
              locale={i18n.language}
            />
          ),
        },
        {
          label: t('reports.stock.valueRetail'),
          value: (
            <MoneyDisplay
              amount={summary.value_retail}
              currency={currency}
              currencySymbol={store.currencySymbol}
              locale={i18n.language}
            />
          ),
        },
        {
          label: t('reports.stock.valueWholesale'),
          value: (
            <MoneyDisplay
              amount={summary.value_wholesale}
              currency={currency}
              currencySymbol={store.currencySymbol}
              locale={i18n.language}
            />
          ),
        },
        {
          label: t('reports.stock.potentialProfit'),
          value: (
            <MoneyDisplay
              amount={summary.potential_profit}
              currency={currency}
              currencySymbol={store.currencySymbol}
              locale={i18n.language}
            />
          ),
        },
      ]
    : []

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const p = new URLSearchParams()
            p.set('stock_filter', filter)
            if (search) p.set('search', search)
            void downloadReportCsv(`shop/reports/stock/export?${p.toString()}`, `inventory-${new Date().toISOString().slice(0, 10)}.csv`)
          }}
        >
          <Download className="me-1.5 size-4" />
          {t('reports.exportCsv')}
        </Button>
        <div className="flex flex-wrap gap-2">
          <Select
            value={filter}
            onValueChange={(v) => {
              setFilter(v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['all', 'instock', 'outofstock', 'lowstock', 'missing_cost'].map((f) => (
                <SelectItem key={f} value={f}>
                  {t(`reports.stockFilter.${f}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={valueBase} onValueChange={(v) => setValueBase(v as (typeof VALUE_BASES)[number])}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('reports.stock.valueBase')} />
            </SelectTrigger>
            <SelectContent>
              {VALUE_BASES.map((b) => (
                <SelectItem key={b} value={b}>
                  {t(`reports.stock.valueBy.${b}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-muted-foreground text-xs">{t('reports.cogsApproxHint')}</p>

      {q.isLoading ? (
        <ReportsDashboardSkeleton showPageHeader={false} />
      ) : q.isError ? (
        <QueryErrorState message={q.error?.message} onRetry={() => void q.refetch()} />
      ) : data ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {kpiItems.map((item) => (
              <Card key={item.label} className="shadow-sm">
                <CardContent className="space-y-1 pt-4">
                  <p className="text-muted-foreground text-xs">{item.label}</p>
                  <div className="text-lg font-semibold">{item.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <ReportDataTable
                rows={data.items}
                columns={columns}
                total={data.total}
                page={data.page}
                perPage={data.per_page}
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
