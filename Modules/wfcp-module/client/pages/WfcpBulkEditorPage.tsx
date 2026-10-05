import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Columns3 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { MoneyDisplay } from '@/components/currency/MoneyDisplay'
import { ListFiltersCollapsible } from '@/components/ListFiltersCollapsible'
import { MobileListCard } from '@/components/MobileListCard'
import { PageShell } from '@/components/PageShell'
import { TableListSkeleton } from '@/components/TableListSkeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { FormattedNumberInput } from '@/components/ui/formatted-number-input'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LazyImage } from '@/components/ui/lazy-image'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { useStoreCurrency } from '@/hooks/useStoreCurrency'
import { apiFetch } from '@/lib/api'
import { formatNumber } from '@/lib/formatNumber'
import { cn } from '@/lib/utils'

type BulkRow = {
  id: number
  parent_id?: number
  parent_name?: string
  name: string
  variation_label?: string
  sku: string
  stock_status: string
  stock_quantity?: number | null
  manage_stock?: boolean
  image_url?: string
  purchase_price: number | null
  locked: boolean
  retail: number
  credit: number
  wholesale: number
  wc_regular: string | number
  wc_sale: string | number
  is_variation: boolean
  attributes: Record<string, string>
  min_qty?: number
  min_weight?: number
  sell_by?: string
  discount_percent?: number | null
}

type BulkResponse = {
  items: BulkRow[]
  page: number
  total_pages: number
  total_posts: number
}

type CatOption = { id: number; name: string; slug: string }
type BrandOption = { id: number; name: string; slug: string }

type BulkColumnId =
  | 'image'
  | 'name'
  | 'attrs'
  | 'sku'
  | 'stock_qty'
  | 'stock_status'
  | 'purchase'
  | 'retail'
  | 'wc_regular'
  | 'wc_sale'
  | 'min_qty'
  | 'min_weight'
  | 'sell_by'
  | 'discount'
  | 'lock'

type BulkColumnVisibility = Record<BulkColumnId, boolean>

const COLUMNS_STORAGE_KEY = 'webino-wfcp-bulk-columns'

const DEFAULT_COLUMNS: BulkColumnVisibility = {
  image: false,
  name: true,
  attrs: true,
  sku: true,
  stock_qty: true,
  stock_status: true,
  purchase: true,
  retail: true,
  wc_regular: false,
  wc_sale: false,
  min_qty: false,
  min_weight: false,
  sell_by: false,
  discount: false,
  lock: true,
}

const COLUMN_LABELS: Record<BulkColumnId, string> = {
  image: 'wfcp.colImage',
  name: 'wfcp.colName',
  attrs: 'wfcp.colAttrs',
  sku: 'wfcp.colSku',
  stock_qty: 'wfcp.colStockQty',
  stock_status: 'wfcp.colStock',
  purchase: 'wfcp.colPurchase',
  retail: 'wfcp.colRetail',
  wc_regular: 'wfcp.colWcRegular',
  wc_sale: 'wfcp.colWcSale',
  min_qty: 'wfcp.colMinQty',
  min_weight: 'wfcp.colMinWeight',
  sell_by: 'wfcp.colSellBy',
  discount: 'wfcp.colDiscount',
  lock: 'wfcp.colLock',
}

function loadColumnVisibility(): BulkColumnVisibility {
  try {
    const raw = localStorage.getItem(COLUMNS_STORAGE_KEY)
    if (!raw) return DEFAULT_COLUMNS
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const merged = { ...DEFAULT_COLUMNS }
    for (const key of Object.keys(DEFAULT_COLUMNS) as BulkColumnId[]) {
      if (typeof parsed[key] === 'boolean') merged[key] = parsed[key]
    }
    return merged
  } catch {
    return DEFAULT_COLUMNS
  }
}

function saveColumnVisibility(cols: BulkColumnVisibility) {
  try {
    localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(cols))
  } catch {
    /* ignore */
  }
}

function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = window.setTimeout(() => setV(value), ms)
    return () => window.clearTimeout(t)
  }, [value, ms])
  return v
}

function toRawNumber(value: string | number | null | undefined): string {
  if (value == null || value === '') return ''
  const n = typeof value === 'number' ? value : Number(String(value).replace(/,/g, ''))
  if (!Number.isFinite(n)) return String(value)
  return String(n)
}

/** Editable number with Persian digits + thousand separators (matches product editor). */
function InlineFormattedNumber({
  value,
  disabled,
  className,
  onCommit,
}: {
  value: string | number | null | undefined
  disabled?: boolean
  className?: string
  onCommit: (next: string) => Promise<void>
}) {
  const [draft, setDraft] = useState(() => toRawNumber(value))
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setDraft(toRawNumber(value))
  }, [value])

  async function commit() {
    const next = draft.trim()
    const prev = toRawNumber(value)
    if (next === prev || disabled) return
    setBusy(true)
    try {
      await onCommit(next)
    } finally {
      setBusy(false)
    }
  }

  return (
    <FormattedNumberInput
      className={cn('h-9 w-full min-w-0 text-sm md:h-8 md:w-28 md:text-xs', className)}
      value={draft}
      disabled={disabled || busy}
      onChange={setDraft}
      onBlur={() => void commit()}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur()
      }}
    />
  )
}

function rowAttrLabel(row: BulkRow) {
  if (row.variation_label) return row.variation_label
  return Object.values(row.attributes || {}).join(' · ')
}

function editorId(row: BulkRow) {
  return row.is_variation ? (row.parent_id ?? row.id) : row.id
}

export default function WfcpBulkEditorPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const locale = i18n.language
  const store = useStoreCurrency()

  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const search = useDebounced(searchInput, 350)
  const [category, setCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [stock, setStock] = useState('')
  const [type, setType] = useState('')
  const [locked, setLocked] = useState('')
  const [hasPurchase, setHasPurchase] = useState('')
  const [sort, setSort] = useState('date_desc')
  const [columns, setColumns] = useState<BulkColumnVisibility>(loadColumnVisibility)

  useEffect(() => {
    setPage(1)
  }, [search, category, brand, stock, type, locked, hasPurchase, sort])

  const visibleColumnCount = useMemo(
    () => Object.values(columns).filter(Boolean).length,
    [columns]
  )

  function toggleColumn(id: BulkColumnId, on: boolean) {
    setColumns((prev) => {
      const next = { ...prev, [id]: on }
      saveColumnVisibility(next)
      return next
    })
  }

  const catsQ = useQuery({
    queryKey: ['product-categories', 'wfcp-filter'],
    queryFn: () => apiFetch<{ items: CatOption[] }>('shop/product-categories?sort=name_asc&per_page=200'),
  })

  const lookupQ = useQuery({
    queryKey: ['wfcp', 'lookup'],
    queryFn: () => apiFetch<{ categories: CatOption[]; brands: BrandOption[] }>('wfcp/lookup'),
  })

  const q = useQuery({
    queryKey: ['wfcp', 'bulk-products', page, search, category, brand, stock, type, locked, hasPurchase, sort],
    queryFn: () => {
      const p = new URLSearchParams()
      p.set('page', String(page))
      if (search.trim()) p.set('search', search.trim())
      if (category) p.set('category', category)
      if (brand) p.set('brand', brand)
      if (stock) p.set('stock_status', stock)
      if (type) p.set('type', type)
      if (locked) p.set('locked', locked)
      if (hasPurchase) p.set('has_purchase', hasPurchase)
      if (sort) p.set('sort', sort)
      return apiFetch<BulkResponse>(`wfcp/bulk-products?${p.toString()}`)
    },
  })
  useQueryErrorToast(q)

  const invalidate = useCallback(() => {
    void qc.invalidateQueries({ queryKey: ['wfcp', 'bulk-products'] })
  }, [qc])

  const patchPurchase = useMutation({
    mutationFn: ({ id, purchase_price }: { id: number; purchase_price: number }) =>
      apiFetch(`wfcp/bulk-products/${id}/purchase-price`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchase_price }),
      }),
    onSuccess: () => {
      invalidate()
      toast.success(t('wfcp.savedInline'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const patchWc = useMutation({
    mutationFn: ({ id, price, price_type }: { id: number; price: string; price_type: 'regular' | 'sale' }) =>
      apiFetch(`wfcp/bulk-products/${id}/wc-price`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price, price_type }),
      }),
    onSuccess: () => {
      invalidate()
      toast.success(t('wfcp.savedInline'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const patchStock = useMutation({
    mutationFn: (payload: {
      id: number
      stock_status?: string
      stock_quantity?: number | null
      manage_stock?: boolean
    }) =>
      apiFetch(`wfcp/bulk-products/${payload.id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stock_status: payload.stock_status,
          stock_quantity: payload.stock_quantity,
          manage_stock: payload.manage_stock,
        }),
      }),
    onSuccess: () => {
      invalidate()
      toast.success(t('wfcp.savedInline'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const patchLock = useMutation({
    mutationFn: ({ id, locked: next }: { id: number; locked: boolean }) =>
      apiFetch(`wfcp/bulk-products/${id}/lock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locked: next }),
      }),
    onSuccess: () => {
      invalidate()
      toast.success(t('wfcp.savedInline'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const patchWholesale = useMutation({
    mutationFn: ({
      id,
      min_qty,
      min_weight,
      sell_by,
      discount_percent,
    }: {
      id: number
      min_qty?: number
      min_weight?: number
      sell_by?: string
      discount_percent?: number
    }) =>
      apiFetch(`wfcp/bulk-products/${id}/wholesale-rule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ min_qty, min_weight, sell_by, discount_percent }),
      }),
    onSuccess: () => {
      invalidate()
      toast.success(t('wfcp.savedInline'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const items = q.data?.items ?? []
  const totalPages = Math.max(1, q.data?.total_pages ?? 1)
  const cats = catsQ.data?.items ?? lookupQ.data?.categories ?? []
  const brands = lookupQ.data?.brands ?? []

  function renderNameCell(row: BulkRow) {
    const attrs = rowAttrLabel(row)
    return (
      <div className="min-w-0">
        <Link to={`/shop/products/${editorId(row)}`} className="line-clamp-2 font-medium hover:underline">
          {row.parent_name || row.name}
        </Link>
        {row.is_variation && attrs ? (
          <span className="text-muted-foreground mt-0.5 block text-xs">{attrs}</span>
        ) : null}
        <span className="text-muted-foreground mt-0.5 block text-[10px]">#{row.id}</span>
      </div>
    )
  }

  function renderStockStatus(row: BulkRow) {
    return (
      <Select
        value={row.stock_status || 'instock'}
        onValueChange={(v) => void patchStock.mutateAsync({ id: row.id, stock_status: v })}
      >
        <SelectTrigger className="h-8 w-full text-xs md:w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="instock">{t('wfcp.stock.instock')}</SelectItem>
          <SelectItem value="outofstock">{t('wfcp.stock.outofstock')}</SelectItem>
          <SelectItem value="onbackorder">{t('wfcp.stock.onbackorder')}</SelectItem>
        </SelectContent>
      </Select>
    )
  }

  function renderStockQty(row: BulkRow) {
    return (
      <InlineFormattedNumber
        value={row.manage_stock ? (row.stock_quantity ?? '') : ''}
        className="md:w-20"
        onCommit={async (next) => {
          if (next.trim() === '') {
            await patchStock.mutateAsync({ id: row.id, manage_stock: false, stock_quantity: null })
            return
          }
          const n = parseFloat(next)
          if (!Number.isFinite(n) || n < 0) return
          await patchStock.mutateAsync({ id: row.id, manage_stock: true, stock_quantity: n })
        }}
      />
    )
  }

  function renderRetail(row: BulkRow) {
    if (!row.retail) return <span className="text-muted-foreground">—</span>
    return (
      <MoneyDisplay
        amount={row.retail}
        currency={store.currency}
        currencySymbol={store.currencySymbol}
        locale={locale}
      />
    )
  }

  function renderPurchase(row: BulkRow) {
    return (
      <InlineFormattedNumber
        value={row.purchase_price}
        disabled={row.locked}
        onCommit={async (next) => {
          const n = parseFloat(next)
          if (!Number.isFinite(n) || n <= 0) return
          await patchPurchase.mutateAsync({ id: row.id, purchase_price: n })
        }}
      />
    )
  }

  function renderWcRegular(row: BulkRow) {
    return (
      <InlineFormattedNumber
        value={row.wc_regular}
        disabled={row.locked}
        onCommit={async (next) => {
          await patchWc.mutateAsync({ id: row.id, price: next, price_type: 'regular' })
        }}
      />
    )
  }

  function renderWcSale(row: BulkRow) {
    return (
      <InlineFormattedNumber
        value={row.wc_sale}
        disabled={row.locked}
        onCommit={async (next) => {
          await patchWc.mutateAsync({ id: row.id, price: next, price_type: 'sale' })
        }}
      />
    )
  }

  return (
    <PageShell title={t('wfcp.bulkTitle')} description={t('wfcp.bulkDescription')}>
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              <Columns3 className="size-4" />
              {t('wfcp.columns')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
            <DropdownMenuLabel>{t('wfcp.columns')}</DropdownMenuLabel>
            {(Object.keys(COLUMN_LABELS) as BulkColumnId[]).map((id) => (
              <DropdownMenuCheckboxItem
                key={id}
                checked={columns[id]}
                onCheckedChange={(v) => toggleColumn(id, v === true)}
              >
                {t(COLUMN_LABELS[id])}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ListFiltersCollapsible className="mb-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-1 xl:col-span-2">
            <Label>{t('wfcp.search')}</Label>
            <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder={t('wfcp.search')} />
          </div>
          <div className="space-y-1">
            <Label>{t('wfcp.filterCategory')}</Label>
            <Select value={category || '__all'} onValueChange={(v) => setCategory(v === '__all' ? '' : v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">{t('wfcp.all')}</SelectItem>
                {cats.map((c) => (
                  <SelectItem key={c.id} value={c.slug}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>{t('wfcp.filterBrand')}</Label>
            <Select value={brand || '__all'} onValueChange={(v) => setBrand(v === '__all' ? '' : v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">{t('wfcp.all')}</SelectItem>
                {brands.map((b) => (
                  <SelectItem key={b.id} value={b.slug}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>{t('wfcp.stock')}</Label>
            <Select value={stock || '__all'} onValueChange={(v) => setStock(v === '__all' ? '' : v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">{t('wfcp.all')}</SelectItem>
                <SelectItem value="instock">{t('wfcp.stock.instock')}</SelectItem>
                <SelectItem value="outofstock">{t('wfcp.stock.outofstock')}</SelectItem>
                <SelectItem value="onbackorder">{t('wfcp.stock.onbackorder')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>{t('wfcp.filterType')}</Label>
            <Select value={type || '__all'} onValueChange={(v) => setType(v === '__all' ? '' : v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">{t('wfcp.all')}</SelectItem>
                <SelectItem value="simple">{t('products.typeSimple')}</SelectItem>
                <SelectItem value="variable">{t('products.typeVariable')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>{t('wfcp.filterLocked')}</Label>
            <Select value={locked || '__all'} onValueChange={(v) => setLocked(v === '__all' ? '' : v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">{t('wfcp.all')}</SelectItem>
                <SelectItem value="1">{t('wfcp.locked')}</SelectItem>
                <SelectItem value="0">{t('wfcp.unlocked')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>{t('wfcp.filterHasPurchase')}</Label>
            <Select value={hasPurchase || '__all'} onValueChange={(v) => setHasPurchase(v === '__all' ? '' : v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">{t('wfcp.all')}</SelectItem>
                <SelectItem value="1">{t('wfcp.hasPurchaseYes')}</SelectItem>
                <SelectItem value="0">{t('wfcp.hasPurchaseNo')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>{t('wfcp.sort')}</Label>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">{t('wfcp.sort.date_desc')}</SelectItem>
                <SelectItem value="date_asc">{t('wfcp.sort.date_asc')}</SelectItem>
                <SelectItem value="name_asc">{t('wfcp.sort.name_asc')}</SelectItem>
                <SelectItem value="name_desc">{t('wfcp.sort.name_desc')}</SelectItem>
                <SelectItem value="price_asc">{t('wfcp.sort.price_asc')}</SelectItem>
                <SelectItem value="price_desc">{t('wfcp.sort.price_desc')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </ListFiltersCollapsible>

      {q.isLoading ? (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <TableListSkeleton rows={8} columns={Math.max(4, visibleColumnCount)} />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {items.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">{t('wfcp.emptyBulk')}</p>
            ) : (
              items.map((row) => (
                <MobileListCard
                  key={row.id}
                  className={cn('min-w-0', row.locked && 'bg-muted/30')}
                  media={
                    <div className="flex gap-3">
                      {columns.image ? (
                        row.image_url ? (
                          <LazyImage
                            src={row.image_url}
                            alt={row.name}
                            className="size-14 shrink-0 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="bg-muted text-muted-foreground flex size-14 shrink-0 items-center justify-center rounded-lg text-xs">
                            —
                          </div>
                        )
                      ) : null}
                      <div className="min-w-0 flex-1">{renderNameCell(row)}</div>
                    </div>
                  }
                >
                  <div className="space-y-3">
                    {columns.sku ? (
                      <div>
                        <p className="text-muted-foreground mb-1 text-xs">{t('wfcp.colSku')}</p>
                        <p className="break-all text-sm">{row.sku || '—'}</p>
                      </div>
                    ) : null}
                    {columns.stock_status ? (
                      <div>
                        <p className="text-muted-foreground mb-1 text-xs">{t('wfcp.colStock')}</p>
                        <div className="w-full [&_button]:w-full">{renderStockStatus(row)}</div>
                      </div>
                    ) : null}
                    {columns.stock_qty ? (
                      <div>
                        <p className="text-muted-foreground mb-1 text-xs">{t('wfcp.colStockQty')}</p>
                        {renderStockQty(row)}
                      </div>
                    ) : null}
                    {columns.purchase ? (
                      <div>
                        <p className="text-muted-foreground mb-1 text-xs">{t('wfcp.colPurchase')}</p>
                        {renderPurchase(row)}
                      </div>
                    ) : null}
                    {columns.retail ? (
                      <div className="bg-muted/40 flex items-center justify-between gap-2 rounded-lg px-3 py-2">
                        <span className="text-muted-foreground text-xs">{t('wfcp.colRetail')}</span>
                        <span className="min-w-0 text-end font-medium">{renderRetail(row)}</span>
                      </div>
                    ) : null}
                    {columns.wc_regular ? (
                      <div>
                        <p className="text-muted-foreground mb-1 text-xs">{t('wfcp.colWcRegular')}</p>
                        {renderWcRegular(row)}
                      </div>
                    ) : null}
                    {columns.wc_sale ? (
                      <div>
                        <p className="text-muted-foreground mb-1 text-xs">{t('wfcp.colWcSale')}</p>
                        {renderWcSale(row)}
                      </div>
                    ) : null}
                    {columns.lock ? (
                      <label className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                        <Checkbox
                          checked={row.locked}
                          onCheckedChange={(v) => void patchLock.mutateAsync({ id: row.id, locked: v === true })}
                        />
                        <span>{row.locked ? t('wfcp.locked') : t('wfcp.unlocked')}</span>
                      </label>
                    ) : null}
                  </div>
                </MobileListCard>
              ))
            )}
          </div>

          <Card className="hidden shadow-sm md:block">
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.image ? <TableHead className="w-14">{t('wfcp.colImage')}</TableHead> : null}
                    {columns.name ? <TableHead>{t('wfcp.colName')}</TableHead> : null}
                    {columns.attrs ? <TableHead>{t('wfcp.colAttrs')}</TableHead> : null}
                    {columns.sku ? <TableHead>{t('wfcp.colSku')}</TableHead> : null}
                    {columns.stock_qty ? <TableHead>{t('wfcp.colStockQty')}</TableHead> : null}
                    {columns.stock_status ? <TableHead>{t('wfcp.colStock')}</TableHead> : null}
                    {columns.purchase ? <TableHead>{t('wfcp.colPurchase')}</TableHead> : null}
                    {columns.retail ? <TableHead>{t('wfcp.colRetail')}</TableHead> : null}
                    {columns.wc_regular ? <TableHead>{t('wfcp.colWcRegular')}</TableHead> : null}
                    {columns.wc_sale ? <TableHead>{t('wfcp.colWcSale')}</TableHead> : null}
                    {columns.min_qty ? <TableHead>{t('wfcp.colMinQty')}</TableHead> : null}
                    {columns.min_weight ? <TableHead>{t('wfcp.colMinWeight')}</TableHead> : null}
                    {columns.sell_by ? <TableHead>{t('wfcp.colSellBy')}</TableHead> : null}
                    {columns.discount ? <TableHead>{t('wfcp.colDiscount')}</TableHead> : null}
                    {columns.lock ? <TableHead>{t('wfcp.colLock')}</TableHead> : null}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={Math.max(1, visibleColumnCount)}
                        className="text-muted-foreground py-8 text-center text-sm"
                      >
                        {t('wfcp.emptyBulk')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((row) => {
                      const attrLabel = rowAttrLabel(row)
                      return (
                        <TableRow key={row.id} className={cn(row.locked && 'bg-muted/30')}>
                          {columns.image ? (
                            <TableCell>
                              {row.image_url ? (
                                <LazyImage src={row.image_url} alt={row.name} className="size-10 rounded object-cover" />
                              ) : (
                                <span className="text-muted-foreground text-xs">—</span>
                              )}
                            </TableCell>
                          ) : null}
                          {columns.name ? <TableCell className="max-w-[16rem]">{renderNameCell(row)}</TableCell> : null}
                          {columns.attrs ? (
                            <TableCell className="text-muted-foreground max-w-[10rem] text-xs">
                              {attrLabel || '—'}
                            </TableCell>
                          ) : null}
                          {columns.sku ? <TableCell className="text-xs">{row.sku || '—'}</TableCell> : null}
                          {columns.stock_qty ? <TableCell>{renderStockQty(row)}</TableCell> : null}
                          {columns.stock_status ? <TableCell>{renderStockStatus(row)}</TableCell> : null}
                          {columns.purchase ? <TableCell>{renderPurchase(row)}</TableCell> : null}
                          {columns.retail ? <TableCell>{renderRetail(row)}</TableCell> : null}
                          {columns.wc_regular ? <TableCell>{renderWcRegular(row)}</TableCell> : null}
                          {columns.wc_sale ? <TableCell>{renderWcSale(row)}</TableCell> : null}
                          {columns.min_qty ? (
                            <TableCell>
                              <InlineFormattedNumber
                                value={row.min_qty ?? 0}
                                onCommit={async (next) => {
                                  const n = parseFloat(next)
                                  if (!Number.isFinite(n) || n < 0) return
                                  await patchWholesale.mutateAsync({ id: row.id, min_qty: n })
                                }}
                              />
                            </TableCell>
                          ) : null}
                          {columns.min_weight ? (
                            <TableCell>
                              <InlineFormattedNumber
                                value={row.min_weight ?? 0}
                                onCommit={async (next) => {
                                  const n = parseFloat(next)
                                  if (!Number.isFinite(n) || n < 0) return
                                  await patchWholesale.mutateAsync({ id: row.id, min_weight: n })
                                }}
                              />
                            </TableCell>
                          ) : null}
                          {columns.sell_by ? (
                            <TableCell>
                              <Select
                                value={row.sell_by === 'weight' ? 'weight' : 'unit'}
                                onValueChange={(v) => void patchWholesale.mutateAsync({ id: row.id, sell_by: v })}
                              >
                                <SelectTrigger className="h-8 w-28 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="unit">{t('wfcp.sellByUnit')}</SelectItem>
                                  <SelectItem value="weight">{t('wfcp.sellByWeight')}</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          ) : null}
                          {columns.discount ? (
                            <TableCell>
                              <InlineFormattedNumber
                                value={row.discount_percent ?? ''}
                                onCommit={async (next) => {
                                  const n = parseFloat(next)
                                  if (!Number.isFinite(n) || n < 0) return
                                  await patchWholesale.mutateAsync({ id: row.id, discount_percent: n })
                                }}
                              />
                            </TableCell>
                          ) : null}
                          {columns.lock ? (
                            <TableCell>
                              <label className="flex items-center gap-2 text-xs">
                                <Checkbox
                                  checked={row.locked}
                                  onCheckedChange={(v) =>
                                    void patchLock.mutateAsync({ id: row.id, locked: v === true })
                                  }
                                />
                                <span>{row.locked ? t('wfcp.locked') : t('wfcp.unlocked')}</span>
                              </label>
                            </TableCell>
                          ) : null}
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground text-sm">
          {t('wfcp.pageOf', {
            page: formatNumber(page, locale),
            total: formatNumber(totalPages, locale),
          })}
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            {t('wfcp.prev')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            {t('wfcp.next')}
          </Button>
        </div>
      </div>
    </PageShell>
  )
}
