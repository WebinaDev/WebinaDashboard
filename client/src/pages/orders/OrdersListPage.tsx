import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PostsPagination } from '@/components/magazine/PostsPagination'
import { OrderStatusTabs, type StatusCount } from '@/components/orders/OrderStatusTabs'
import { OrdersBulkActions } from '@/components/orders/OrdersBulkActions'
import { OrdersTable, type OrderListRow, type OrderSortField, type OrderSortOrder } from '@/components/orders/OrdersTable'
import { PageShell } from '@/components/PageShell'
import { TableListSkeleton } from '@/components/TableListSkeleton'
import { Card, CardContent } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { formatNumber } from '@/lib/formatNumber'

type StatusOption = { slug: string; label: string }

const EMPTY_ITEMS: OrderListRow[] = []

function buildOrdersQuery(params: {
  page: number
  perPage: number
  search: string
  status: string
  orderby: OrderSortField
  order: OrderSortOrder
  after: string
  before: string
}): string {
  const p = new URLSearchParams({
    page: String(params.page),
    per_page: String(params.perPage),
    orderby: params.orderby,
    order: params.order,
  })
  if (params.search.trim()) p.set('search', params.search.trim())
  if (params.status) p.set('status', params.status)
  if (params.after) p.set('after', params.after)
  if (params.before) p.set('before', params.before)
  return `shop/orders?${p.toString()}`
}

export default function OrdersListPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const locale = i18n.language

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [after, setAfter] = useState('')
  const [before, setBefore] = useState('')
  const [orderby, setOrderby] = useState<OrderSortField>('date')
  const [order, setOrder] = useState<OrderSortOrder>('desc')
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const q = useQuery({
    queryKey: ['orders', 'list', page, perPage, search, statusFilter, orderby, order, after, before],
    queryFn: () =>
      apiFetch<{ items: OrderListRow[]; page: number; found: number; status_counts: StatusCount[] }>(
        buildOrdersQuery({ page, perPage, search, status: statusFilter, orderby, order, after, before }),
      ),
  })
  useQueryErrorToast(q)

  const statusesQ = useQuery({
    queryKey: ['orders', 'statuses'],
    queryFn: () => apiFetch<{ items: StatusOption[] }>('shop/orders/statuses'),
  })

  const items = q.data?.items ?? EMPTY_ITEMS
  const found = q.data?.found ?? 0
  const statusCounts = q.data?.status_counts ?? []
  const statuses = statusesQ.data?.items ?? []

  const itemIdKey = useMemo(() => items.map((r) => r.id).join(','), [items])

  useEffect(() => {
    setSelectedIds((prev) => {
      if (prev.length === 0) return prev
      const ids = new Set(items.map((r) => r.id))
      const next = prev.filter((id) => ids.has(id))
      if (next.length === prev.length) return prev
      return next
    })
  }, [itemIdKey, items])

  function handleStatusChange(slug: string) {
    setStatusFilter(slug)
    setPage(1)
    setSelectedIds([])
  }

  function handleSort(field: OrderSortField) {
    if (orderby === field) {
      setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setOrderby(field)
      setOrder('desc')
    }
    setPage(1)
  }

  function handleBulkDone() {
    setSelectedIds([])
    void qc.invalidateQueries({ queryKey: ['orders'] })
  }

  const selectedLabel = useMemo(() => {
    if (selectedIds.length === 0) return null
    return t('orders.selectedCount', { count: formatNumber(selectedIds.length, locale) })
  }, [selectedIds.length, locale, t])

  return (
    <PageShell title={t('orders.title')} description={t('orders.listDescription')}>
      <OrderStatusTabs counts={statusCounts} active={statusFilter} onChange={handleStatusChange} locale={locale} />

      <div className="mb-4 mt-4 flex flex-wrap items-end gap-3">
        <div className="relative min-w-[12rem] flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2" aria-hidden />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('orders.searchPlaceholder')}
            className="ps-9"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="orders-after" className="text-xs text-muted-foreground">
            {t('orders.dateFrom')}
          </Label>
          <DatePicker
            id="orders-after"
            value={after}
            onChange={(v) => {
              setAfter(v)
              setPage(1)
            }}
            className="w-[10.5rem]"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="orders-before" className="text-xs text-muted-foreground">
            {t('orders.dateTo')}
          </Label>
          <DatePicker
            id="orders-before"
            value={before}
            onChange={(v) => {
              setBefore(v)
              setPage(1)
            }}
            className="w-[10.5rem]"
          />
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {t('orders.totalCount', { count: formatNumber(found, locale) })}
          {selectedLabel ? <span className="ms-2 font-medium text-foreground">{selectedLabel}</span> : null}
        </p>
        <OrdersBulkActions selectedIds={selectedIds} statuses={statuses} onDone={handleBulkDone} />
      </div>

      <Card className="shadow-sm">
        <CardContent className="overflow-x-auto p-0">
          {q.isLoading ? (
            <TableListSkeleton rows={8} columns={9} />
          ) : (
            <>
              <OrdersTable
                items={items}
                locale={locale}
                selectedIds={selectedIds}
                onSelectedChange={setSelectedIds}
                orderby={orderby}
                order={order}
                onSort={handleSort}
              />
              <PostsPagination
                page={page}
                perPage={perPage}
                found={found}
                onPageChange={setPage}
                onPerPageChange={(next) => {
                  setPerPage(next)
                  setPage(1)
                }}
              />
            </>
          )}
        </CardContent>
      </Card>
    </PageShell>
  )
}
