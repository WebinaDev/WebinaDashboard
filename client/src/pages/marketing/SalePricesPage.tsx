import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { ApplySaleDiscountDialog } from '@/components/marketing/ApplySaleDiscountDialog'
import { ListFiltersCollapsible } from '@/components/ListFiltersCollapsible'
import { ProductFiltersBar } from '@/components/products/ProductFiltersBar'
import type { ProductFilters, ProductListRow, ProductLookup } from '@/components/products/types'
import { PostsPagination } from '@/components/magazine/PostsPagination'
import { PageShell } from '@/components/PageShell'
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
import { Checkbox } from '@/components/ui/checkbox'
import { LazyImage } from '@/components/ui/lazy-image'
import { MoneyDisplay } from '@/components/currency/MoneyDisplay'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { useStoreCurrency } from '@/hooks/useStoreCurrency'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'
import { formatNumber } from '@/lib/formatNumber'

const DEFAULT_FILTERS: ProductFilters = {
  search: '',
  category: '',
  brand: '',
  tag: '',
  type: '',
  stock_status: '',
  status: 'publish',
  catalog_visibility: '',
  sort: 'date_desc',
  date_from: '',
  date_to: '',
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
  if (filters.catalog_visibility) p.set('catalog_visibility', filters.catalog_visibility)
  return p.toString()
}

function filtersPayload(filters: ProductFilters): Record<string, string> {
  const out: Record<string, string> = { status: filters.status || 'publish' }
  if (filters.search.trim()) out.search = filters.search.trim()
  if (filters.category) out.category = filters.category
  if (filters.brand) out.brand = filters.brand
  if (filters.type) out.type = filters.type
  return out
}

export default function SalePricesPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const store = useStoreCurrency()
  const locale = i18n.language

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [draftFilters, setDraftFilters] = useState<ProductFilters>(DEFAULT_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState<ProductFilters>(DEFAULT_FILTERS)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [applyOpen, setApplyOpen] = useState(false)
  const [removeOpen, setRemoveOpen] = useState(false)
  const [scopeMode, setScopeMode] = useState<'selected' | 'filters'>('selected')

  const lookupQ = useQuery({
    queryKey: ['products', 'lookup'],
    queryFn: () => apiFetch<ProductLookup>('shop/products/lookup'),
    staleTime: 60_000,
  })

  const q = useQuery({
    queryKey: ['sale-prices', 'list', page, perPage, appliedFilters],
    queryFn: () =>
      apiFetch<{ items: ProductListRow[]; found: number; page: number; per_page: number }>(
        `shop/products?${buildQueryParams(appliedFilters, page, perPage)}`,
      ),
  })
  useQueryErrorToast(q)

  const items = q.data?.items ?? []
  const found = q.data?.found ?? 0

  useEffect(() => {
    setSelectedIds((prev) => {
      if (!prev.length) return prev
      const ids = new Set(items.map((r) => r.id))
      const next = prev.filter((id) => ids.has(id))
      return next.length === prev.length ? prev : next
    })
  }, [items])

  const allPageSelected = items.length > 0 && items.every((r) => selectedIds.includes(r.id))

  function toggleAllPage(checked: boolean) {
    if (checked) {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...items.map((r) => r.id)])))
    } else {
      const drop = new Set(items.map((r) => r.id))
      setSelectedIds((prev) => prev.filter((id) => !drop.has(id)))
    }
  }

  function toggleOne(id: number, checked: boolean) {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)))
  }

  const removeMut = useMutation({
    mutationFn: () => {
      const body: Record<string, unknown> = { action: 'remove' }
      if (scopeMode === 'selected') {
        body.product_ids = selectedIds
      } else {
        body.filters = filtersPayload(appliedFilters)
      }
      return apiFetch<{ ok: number; skipped: number }>('shop/products/bulk-sale', {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: (res) => {
      toast.success(t('salePrices.removeDone', { ok: res.ok }))
      setRemoveOpen(false)
      void qc.invalidateQueries({ queryKey: ['sale-prices'] })
      void qc.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const selectionLabel = useMemo(() => {
    if (selectedIds.length === 0) return t('salePrices.selectHint')
    return t('salePrices.selectedCount', { count: formatNumber(selectedIds.length, locale) })
  }, [selectedIds.length, locale, t])

  function openApply(mode: 'selected' | 'filters') {
    if (mode === 'selected' && selectedIds.length === 0) {
      toast.error(t('salePrices.needSelection'))
      return
    }
    setScopeMode(mode)
    setApplyOpen(true)
  }

  function openRemove(mode: 'selected' | 'filters') {
    if (mode === 'selected' && selectedIds.length === 0) {
      toast.error(t('salePrices.needSelection'))
      return
    }
    setScopeMode(mode)
    setRemoveOpen(true)
  }

  return (
    <PageShell title={t('salePrices.title')}>
      <div className="bg-sky-500/10 text-sky-950 dark:text-sky-100 mb-4 rounded-xl px-4 py-3 text-sm leading-relaxed">
        {t('salePrices.banner')}
      </div>

      <ListFiltersCollapsible
        className="mb-4"
        activeCount={
          [appliedFilters.search, appliedFilters.category, appliedFilters.brand, appliedFilters.type].filter(Boolean)
            .length
        }
      >
        <ProductFiltersBar
          draft={draftFilters}
          onChange={setDraftFilters}
          lookup={lookupQ.data}
          onApply={() => {
            setAppliedFilters(draftFilters)
            setPage(1)
          }}
          onReset={() => {
            setDraftFilters(DEFAULT_FILTERS)
            setAppliedFilters(DEFAULT_FILTERS)
            setPage(1)
          }}
        />
      </ListFiltersCollapsible>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={allPageSelected}
            onCheckedChange={(v) => toggleAllPage(!!v)}
            aria-label={t('salePrices.selectAllPage')}
          />
          <span className="text-muted-foreground">{selectionLabel}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => openApply('filters')}>
            {t('salePrices.applyAllFiltered')}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => openRemove('filters')}>
            {t('salePrices.removeAllFiltered')}
          </Button>
        </div>
      </div>

      <Card className="mb-20">
        <CardContent className="p-0">
          {q.isLoading ? (
            <TableListSkeleton rows={8} />
          ) : items.length === 0 ? (
            <p className="text-muted-foreground p-6 text-sm">{t('salePrices.empty')}</p>
          ) : (
            <ul className="divide-border divide-y">
              {items.map((row) => {
                const checked = selectedIds.includes(row.id)
                const price = Number(row.sale || row.regular || row.price) || 0
                return (
                  <li key={row.id} className="flex items-center gap-3 px-4 py-3">
                    <Checkbox checked={checked} onCheckedChange={(v) => toggleOne(row.id, !!v)} />
                    <LazyImage
                      src={row.image_url}
                      alt=""
                      className="size-12 shrink-0 rounded-md object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{row.name}</p>
                      {row.sku ? <p className="text-muted-foreground text-xs">{row.sku}</p> : null}
                    </div>
                    <div className="shrink-0 text-sm font-medium">
                      <MoneyDisplay
                        amount={price}
                        currency={store.currency}
                        currencySymbol={store.currencySymbol}
                        locale={locale}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <PostsPagination
        page={page}
        perPage={perPage}
        found={found}
        onPageChange={setPage}
        onPerPageChange={(n) => {
          setPerPage(n)
          setPage(1)
        }}
      />

      <div className="bg-background/95 border-border fixed inset-x-0 bottom-0 z-40 border-t p-3 backdrop-blur md:static md:mt-4 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
        <div className="mx-auto flex max-w-3xl flex-wrap justify-end gap-2 md:max-w-none">
          <Button type="button" variant="outline" onClick={() => openRemove('selected')}>
            {t('salePrices.remove')}
          </Button>
          <Button type="button" onClick={() => openApply('selected')}>
            {t('salePrices.apply')}
          </Button>
        </div>
      </div>

      <ApplySaleDiscountDialog
        open={applyOpen}
        onOpenChange={setApplyOpen}
        productIds={selectedIds}
        filters={filtersPayload(appliedFilters)}
        scopeMode={scopeMode}
        onApplied={() => {
          void qc.invalidateQueries({ queryKey: ['sale-prices'] })
          void qc.invalidateQueries({ queryKey: ['products'] })
        }}
      />

      <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('salePrices.removeConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('salePrices.removeConfirmBody')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                removeMut.mutate()
              }}
            >
              {t('salePrices.remove')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  )
}
