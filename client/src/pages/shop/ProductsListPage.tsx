import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Columns3, Printer } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { ListFiltersCollapsible } from '@/components/ListFiltersCollapsible'
import { ListStatsStrip } from '@/components/ListStatsStrip'
import { ProductFiltersBar } from '@/components/products/ProductFiltersBar'
import { ProductsTable } from '@/components/products/ProductsTable'
import type {
  ProductColumnId,
  ProductColumnVisibility,
  ProductFilters,
  ProductListRow,
  ProductLookup,
} from '@/components/products/types'
import { PostsPagination } from '@/components/magazine/PostsPagination'
import { PageShell } from '@/components/PageShell'
import type { OrderDocumentsSettings } from '@/components/settings/OrderDocumentsSettingsPanel'
import { TableListSkeleton } from '@/components/TableListSkeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { formatNumber } from '@/lib/formatNumber'
import { openPrintDocumentChecked, productLabelsPrintUrl } from '@/lib/orderPrint'
import type { DashboardOverviewResponse } from '@/types/dashboardOverview'

const COLUMNS_STORAGE_KEY = 'webino-products-list-columns'

const DEFAULT_FILTERS: ProductFilters = {
  search: '',
  category: '',
  brand: '',
  tag: '',
  type: '',
  stock_status: '',
  status: '',
  sort: 'date_desc',
  date_from: '',
  date_to: '',
}

const DEFAULT_COLUMNS: ProductColumnVisibility = {
  image: true,
  name: true,
  sku: true,
  purchase_price: true,
  retail: true,
  installment: false,
  credit: false,
  wholesale: false,
  discount: false,
  price: true,
  sale: false,
  stock: true,
  brand: true,
  categories: true,
  tags: false,
  date: true,
  views: false,
  status: false,
  type: false,
  marketplaces: true,
}

const COLUMN_LABELS: Record<ProductColumnId, string> = {
  image: 'products.colImage',
  name: 'products.colName',
  sku: 'products.colSku',
  purchase_price: 'products.colPurchase',
  retail: 'products.colRetail',
  installment: 'products.colInstallment',
  credit: 'products.colCredit',
  wholesale: 'products.colWholesale',
  discount: 'products.colDiscount',
  price: 'products.colPrice',
  sale: 'products.colSale',
  stock: 'products.colStock',
  brand: 'products.colBrand',
  categories: 'products.colCategories',
  tags: 'products.colTags',
  date: 'products.colDate',
  views: 'products.colViews',
  status: 'products.colStatus',
  type: 'products.colType',
  marketplaces: 'products.colMarketplaces',
}

function loadColumnVisibility(): ProductColumnVisibility {
  try {
    const raw = localStorage.getItem(COLUMNS_STORAGE_KEY)
    if (!raw) return DEFAULT_COLUMNS
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const merged = { ...DEFAULT_COLUMNS }
    for (const key of Object.keys(DEFAULT_COLUMNS) as ProductColumnId[]) {
      if (typeof parsed[key] === 'boolean') {
        merged[key] = parsed[key]
      }
    }
    return merged
  } catch {
    return DEFAULT_COLUMNS
  }
}

function saveColumnVisibility(cols: ProductColumnVisibility) {
  try {
    localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(cols))
  } catch {
    /* ignore */
  }
}

function buildQueryParams(filters: ProductFilters, page: number, perPage: number) {
  const p = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    sort: filters.sort || 'date_desc',
  })
  if (filters.search.trim()) p.set('search', filters.search.trim())
  if (filters.category) p.set('category', filters.category)
  if (filters.brand) p.set('brand', filters.brand)
  if (filters.tag) p.set('tag', filters.tag)
  if (filters.type) p.set('type', filters.type)
  if (filters.stock_status) p.set('stock_status', filters.stock_status)
  if (filters.status) p.set('status', filters.status)
  if (filters.date_from) p.set('date_from', filters.date_from)
  if (filters.date_to) p.set('date_to', filters.date_to)
  return p.toString()
}

export default function ProductsListPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const locale = i18n.language

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [draftFilters, setDraftFilters] = useState<ProductFilters>(DEFAULT_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState<ProductFilters>(DEFAULT_FILTERS)
  const [columns, setColumns] = useState<ProductColumnVisibility>(loadColumnVisibility)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [printingLabels, setPrintingLabels] = useState(false)
  const [englishSlugOpen, setEnglishSlugOpen] = useState(false)

  const lookup = useQuery({
    queryKey: ['products', 'lookup'],
    queryFn: () => apiFetch<ProductLookup>('shop/products/lookup'),
  })

  const q = useQuery({
    queryKey: ['products', page, perPage, appliedFilters],
    queryFn: () =>
      apiFetch<{ items: ProductListRow[]; found: number; page: number; per_page: number; total_pages: number }>(
        `shop/products?${buildQueryParams(appliedFilters, page, perPage)}`,
      ),
  })
  useQueryErrorToast(q)

  const statsQ = useQuery({
    queryKey: ['dashboard', 'overview', 'products-stats'],
    queryFn: () => apiFetch<DashboardOverviewResponse>('dashboard/overview'),
    staleTime: 60_000,
  })

  const docsQ = useQuery({
    queryKey: ['shop-settings', 'invoices'],
    queryFn: () => apiFetch<OrderDocumentsSettings>('shop/settings/invoices'),
    staleTime: 60_000,
  })
  const enableProductLabel = docsQ.data?.enable_product_label !== false

  const items = q.data?.items ?? []
  const found = q.data?.found ?? 0
  const productStats = statsQ.data?.products
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

  const productStatItems = useMemo(() => {
    if (!productStats) {
      return [{ id: 'found', label: t('products.stats.total'), value: found }]
    }
    return [
      { id: 'total', label: t('products.stats.total'), value: productStats.total },
      { id: 'publish', label: t('products.stats.publish'), value: productStats.by_status?.publish ?? 0 },
      { id: 'draft', label: t('products.stats.draft'), value: productStats.by_status?.draft ?? 0 },
      { id: 'outofstock', label: t('products.stats.outofstock'), value: productStats.by_stock?.outofstock ?? 0 },
      { id: 'instock', label: t('products.stats.instock'), value: productStats.by_stock?.instock ?? 0 },
    ]
  }, [found, productStats, t])

  const activeFilterCount = useMemo(() => {
    const f = appliedFilters
    let n = 0
    if (f.search.trim()) n += 1
    if (f.category) n += 1
    if (f.brand) n += 1
    if (f.tag) n += 1
    if (f.type) n += 1
    if (f.stock_status) n += 1
    if (f.status) n += 1
    if (f.date_from) n += 1
    if (f.date_to) n += 1
    if (f.sort && f.sort !== 'date_desc') n += 1
    return n
  }, [appliedFilters])

  const visibleColumnCount = useMemo(
    () => Object.values(columns).filter(Boolean).length + 1 + (enableProductLabel ? 1 : 0),
    [columns, enableProductLabel],
  )

  const toggleColumn = useCallback((id: ProductColumnId, checked: boolean) => {
    setColumns((prev) => {
      const next = { ...prev, [id]: checked }
      saveColumnVisibility(next)
      return next
    })
  }, [])

  function applyFilters() {
    setAppliedFilters(draftFilters)
    setPage(1)
  }

  function resetFilters() {
    setDraftFilters(DEFAULT_FILTERS)
    setAppliedFilters(DEFAULT_FILTERS)
    setPage(1)
  }

  function invalidateList() {
    void qc.invalidateQueries({ queryKey: ['products'] })
  }

  const duplicate = useMutation({
    mutationFn: (id: number) => {
      setBusyId(id)
      return apiFetch<{ id: number }>(`shop/products/${id}/duplicate`, { method: 'POST' })
    },
    onSuccess: (data) => {
      toast.success(t('products.duplicateOk'))
      invalidateList()
      if (data?.id) navigate(`/shop/products/${data.id}`)
    },
    onError: (e: Error) => toastApiError(t, e),
    onSettled: () => setBusyId(null),
  })

  const remove = useMutation({
    mutationFn: (id: number) => {
      setBusyId(id)
      return apiFetch(`shop/products/${id}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      toast.success(t('common.deleted'))
      invalidateList()
    },
    onError: (e: Error) => toastApiError(t, e),
    onSettled: () => setBusyId(null),
  })

  const applyEnglishSlugs = useMutation({
    mutationFn: () =>
      apiFetch<{
        updated: number
        skipped: number
        redirected: number
        failed: number
        ai_used: number
        remaining_without_english: number
      }>('shop/products/apply-english-slugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          with_ai: true,
          ids: selectedIds.length > 0 ? selectedIds : undefined,
          limit: 100,
          ai_limit: 50,
        }),
      }),
    onSuccess: (res) => {
      toast.success(
        t('products.applyEnglishSlugsDone', {
          updated: res.updated,
          redirected: res.redirected,
          skipped: res.skipped,
          failed: res.failed,
          remaining: res.remaining_without_english,
        }),
      )
      setEnglishSlugOpen(false)
      invalidateList()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  async function handlePrintWarehouseLabels() {
    if (selectedIds.length === 0) {
      toast.error(t('products.printWarehouseLabelsEmpty'))
      return
    }
    if (printingLabels) return
    setPrintingLabels(true)
    try {
      const result = await openPrintDocumentChecked(productLabelsPrintUrl(selectedIds))
      if (result === 'empty') {
        toast.error(t('products.printWarehouseLabelsEmpty'))
      }
    } catch (e) {
      toastApiError(t, e instanceof Error ? e : new Error(String(e)))
    } finally {
      setPrintingLabels(false)
    }
  }

  const syncChannel = useMutation({
    mutationFn: ({ id, provider }: { id: number; provider: 'bale' | 'telegram' }) => {
      setBusyId(id)
      return apiFetch(`shop/products/${id}/sync-channel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      })
    },
    onSuccess: () => toast.success(t('products.channelSyncOk')),
    onError: (e: Error) => toastApiError(t, e),
    onSettled: () => setBusyId(null),
  })

  return (
    <PageShell title={t('products.title')} description={t('products.listDescription')}>
      <div className="mb-4">
        <ListStatsStrip items={productStatItems} locale={locale} />
      </div>
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={applyEnglishSlugs.isPending}
          onClick={() => setEnglishSlugOpen(true)}
        >
          {t('products.applyEnglishSlugs')}
          {selectedIds.length > 0 ? (
            <span className="text-muted-foreground ms-1">({selectedIds.length})</span>
          ) : null}
        </Button>
        {enableProductLabel ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={printingLabels}
            onClick={() => void handlePrintWarehouseLabels()}
          >
            <Printer className="size-4" aria-hidden />
            {t('products.printWarehouseLabels')}
            {selectedIds.length > 0 ? (
              <span className="text-muted-foreground ms-1">({selectedIds.length})</span>
            ) : null}
          </Button>
        ) : null}
        <Button asChild size="sm">
          <Link to="/shop/products/new">{t('products.add')}</Link>
        </Button>
      </div>

      <ListFiltersCollapsible className="mb-4" activeCount={activeFilterCount}>
        <ProductFiltersBar
          draft={draftFilters}
          lookup={lookup.data}
          onChange={setDraftFilters}
          onApply={applyFilters}
          onReset={resetFilters}
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          {found > 0 ? (
            <p className="text-muted-foreground text-sm">
              {t('products.foundCount', { count: formatNumber(found, locale) })}
              {selectedIds.length > 0 ? (
                <span className="text-foreground ms-2 font-medium">
                  {t('products.selectedCount', { count: formatNumber(selectedIds.length, locale) })}
                </span>
              ) : null}
            </p>
          ) : (
            <span />
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                <Columns3 className="size-4" />
                {t('products.toggleColumns')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-80 w-52 overflow-y-auto">
              <DropdownMenuLabel>{t('products.toggleColumns')}</DropdownMenuLabel>
              {(Object.keys(COLUMN_LABELS) as ProductColumnId[]).map((id) => (
                <DropdownMenuCheckboxItem key={id} checked={columns[id]} onCheckedChange={(v) => toggleColumn(id, v === true)}>
                  {t(COLUMN_LABELS[id])}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </ListFiltersCollapsible>

      <Card className="shadow-sm">
        <CardContent className="overflow-x-auto p-0">
          {q.isLoading ? (
            <TableListSkeleton rows={8} columns={visibleColumnCount} />
          ) : (
            <ProductsTable
              items={items}
              columns={columns}
              locale={locale}
              emptyMessage={t('products.emptyList')}
              visibleColumnCount={visibleColumnCount}
              busyId={busyId}
              selectable
              selectedIds={selectedIds}
              onSelectedChange={setSelectedIds}
              onDuplicate={async (id) => {
                await duplicate.mutateAsync(id)
              }}
              onDelete={async (id) => {
                await remove.mutateAsync(id)
              }}
              onSyncChannel={async (id, provider) => {
                await syncChannel.mutateAsync({ id, provider })
              }}
            />
          )}
        </CardContent>
        {!q.isLoading && found > 0 ? (
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
        ) : null}
      </Card>

      <AlertDialog open={englishSlugOpen} onOpenChange={setEnglishSlugOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('products.applyEnglishSlugs')}</AlertDialogTitle>
            <AlertDialogDescription>{t('products.applyEnglishSlugsConfirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={applyEnglishSlugs.isPending}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              disabled={applyEnglishSlugs.isPending}
              onClick={(e) => {
                e.preventDefault()
                void applyEnglishSlugs.mutateAsync()
              }}
            >
              {t('products.applyEnglishSlugs')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  )
}
