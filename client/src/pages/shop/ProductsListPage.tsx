import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Columns3 } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

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
import { TableListSkeleton } from '@/components/TableListSkeleton'
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

  const items = q.data?.items ?? []
  const found = q.data?.found ?? 0

  const visibleColumnCount = useMemo(() => Object.values(columns).filter(Boolean).length + 1, [columns])

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
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
        <Button asChild size="sm">
          <Link to="/shop/products/new">{t('products.add')}</Link>
        </Button>
      </div>

      <Card className="mb-4 shadow-sm">
        <CardContent className="space-y-4 pt-6">
          <ProductFiltersBar
            draft={draftFilters}
            lookup={lookup.data}
            onChange={setDraftFilters}
            onApply={applyFilters}
            onReset={resetFilters}
          />
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            {found > 0 ? (
              <p className="text-muted-foreground text-sm">{t('products.foundCount', { count: formatNumber(found, locale) })}</p>
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
        </CardContent>
      </Card>

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
    </PageShell>
  )
}
