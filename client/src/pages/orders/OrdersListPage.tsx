import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMatch } from 'react-router-dom'

import { ListStatsStrip } from '@/components/ListStatsStrip'
import { PostsPagination } from '@/components/magazine/PostsPagination'
import { OrderStatusTabs, type StatusCount } from '@/components/orders/OrderStatusTabs'
import { OrdersBulkActions } from '@/components/orders/OrdersBulkActions'
import {
  OrdersFiltersBar,
  type OrdersFilterOptions,
  type OrdersListFilters,
} from '@/components/orders/OrdersFiltersBar'
import { OrdersTable, type OrderListRow, type OrderSortField, type OrderSortOrder } from '@/components/orders/OrdersTable'
import { PageShell } from '@/components/PageShell'
import { TableListSkeleton } from '@/components/TableListSkeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { useBootstrapQuery } from '@/hooks/useBootstrapQuery'
import { useStoreCurrency } from '@/hooks/useStoreCurrency'
import { apiFetch } from '@/lib/api'
import { normalizeCapabilities } from '@/lib/bootstrapQuery'
import { formatNumber } from '@/lib/formatNumber'

type StatusOption = { slug: string; label: string }

type OrdersListStats = {
  order_count: number
  revenue: number
  avg_order_value: number
  processing: number
  completed: number
  pending: number
  on_hold?: number
  currency?: string
}

const EMPTY_ITEMS: OrderListRow[] = []

const EMPTY_FILTERS: OrdersListFilters = {
  after: '',
  before: '',
  payment_method: '',
  utm_source: '',
  utm_medium: '',
  utm_campaign: '',
  marketplace: '',
  state: '',
  shipping_method: '',
  min_total: '',
  max_total: '',
  customer: '',
  customer_role: '',
}

function buildOrdersQuery(params: {
  page: number
  perPage: number
  search: string
  status: string
  group?: string
  orderby: OrderSortField
  order: OrderSortOrder
  filters: OrdersListFilters
}): string {
  const p = new URLSearchParams({
    page: String(params.page),
    per_page: String(params.perPage),
    orderby: params.orderby,
    order: params.order,
  })
  if (params.search.trim()) p.set('search', params.search.trim())
  if (params.group) p.set('group', params.group)
  else if (params.status) p.set('status', params.status)
  const f = params.filters
  if (f.after) p.set('after', f.after)
  if (f.before) p.set('before', f.before)
  if (f.payment_method) p.set('payment_method', f.payment_method)
  if (f.utm_source) p.set('utm_source', f.utm_source)
  if (f.utm_medium) p.set('utm_medium', f.utm_medium)
  if (f.utm_campaign) p.set('utm_campaign', f.utm_campaign)
  if (f.marketplace) p.set('marketplace', f.marketplace)
  if (f.state) p.set('state', f.state)
  if (f.shipping_method) p.set('shipping_method', f.shipping_method)
  if (f.min_total) p.set('min_total', f.min_total)
  if (f.max_total) p.set('max_total', f.max_total)
  if (f.customer.trim()) p.set('customer', f.customer.trim())
  if (f.customer_role) p.set('customer_role', f.customer_role)
  return `shop/orders?${p.toString()}`
}

export default function OrdersListPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const store = useStoreCurrency()
  const locale = i18n.language
  const boot = useBootstrapQuery()
  const canManageOrders = normalizeCapabilities(boot.data?.capabilities).includes('edit_shop_orders')
  const isPortal = Boolean(useMatch('/account/orders')) || !canManageOrders
  const detailBase = isPortal ? '/account/orders' : '/orders/list'

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<OrdersListFilters>(EMPTY_FILTERS)
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
    queryKey: ['orders', 'list', page, perPage, search, statusFilter, orderby, order, filters, isPortal],
    queryFn: () =>
      apiFetch<{
        items: OrderListRow[]
        page: number
        found: number
        status_counts: StatusCount[]
        stats?: OrdersListStats
      }>(
        buildOrdersQuery({
          page,
          perPage,
          search,
          status: isPortal ? '' : statusFilter,
          group: isPortal ? statusFilter : '',
          orderby,
          order,
          filters,
        }),
      ),
  })
  useQueryErrorToast(q)

  const statusesQ = useQuery({
    queryKey: ['orders', 'statuses'],
    queryFn: () => apiFetch<{ items: StatusOption[] }>('shop/orders/statuses'),
  })

  const optionsQ = useQuery({
    queryKey: ['orders', 'filter-options'],
    queryFn: () => apiFetch<OrdersFilterOptions>('shop/orders/filter-options'),
    staleTime: 120_000,
  })

  const items = q.data?.items ?? EMPTY_ITEMS
  const found = q.data?.found ?? 0
  const statusCounts = q.data?.status_counts ?? []
  const statuses = statusesQ.data?.items ?? []
  const stats = q.data?.stats

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

  function patchFilters(patch: Partial<OrdersListFilters>) {
    setFilters((prev) => ({ ...prev, ...patch }))
    setPage(1)
    setSelectedIds([])
  }

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

  const statItems = useMemo(() => {
    if (!stats) return []
    return [
      { id: 'orders', label: t('orders.stats.orders'), value: stats.order_count },
      { id: 'revenue', label: t('orders.stats.revenue'), value: stats.revenue, money: true },
      { id: 'aov', label: t('orders.stats.aov'), value: stats.avg_order_value, money: true },
      { id: 'processing', label: t('orders.stats.processing'), value: stats.processing },
      { id: 'completed', label: t('orders.stats.completed'), value: stats.completed },
      { id: 'pending', label: t('orders.stats.pending'), value: stats.pending },
    ]
  }, [stats, t, i18n.language])

  return (
    <PageShell
      title={isPortal ? t('orders.myOrdersTitle') : t('orders.title')}
      description={isPortal ? t('orders.myOrdersDescription') : t('orders.listDescription')}
    >
      {canManageOrders && !isPortal && statItems.length ? (
        <div className="mb-4">
          <ListStatsStrip
            items={statItems}
            locale={locale}
            currency={stats?.currency || store.currency}
            currencySymbol={store.currencySymbol}
          />
        </div>
      ) : null}

      <OrderStatusTabs counts={statusCounts} active={statusFilter} onChange={handleStatusChange} locale={locale} />

      <div className="mb-3 mt-4">
        <div className="relative mb-3 min-w-[12rem] max-w-md">
          <Search className="text-muted-foreground pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2" aria-hidden />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('orders.searchPlaceholder')}
            className="ps-9"
          />
        </div>
        {!isPortal ? <OrdersFiltersBar filters={filters} options={optionsQ.data} onChange={patchFilters} /> : null}
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          {t('orders.totalCount', { count: formatNumber(found, locale) })}
          {selectedLabel ? <span className="text-foreground ms-2 font-medium">{selectedLabel}</span> : null}
        </p>
        {canManageOrders && !isPortal ? (
          <OrdersBulkActions selectedIds={selectedIds} statuses={statuses} onDone={handleBulkDone} />
        ) : null}
      </div>

      <Card className="shadow-sm">
        <CardContent className="overflow-x-auto p-0">
          {q.isLoading ? (
            <TableListSkeleton rows={8} columns={12} />
          ) : (
            <>
              <OrdersTable
                items={items}
                locale={locale}
                selectedIds={canManageOrders && !isPortal ? selectedIds : []}
                onSelectedChange={canManageOrders && !isPortal ? setSelectedIds : () => undefined}
                orderby={orderby}
                order={order}
                onSort={handleSort}
                detailBase={detailBase}
                selectable={canManageOrders && !isPortal}
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
