import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Columns3, Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { ProductCategoriesTable } from '@/components/product-categories/ProductCategoriesTable'
import type { ProductCategoryColumnId, ProductCategoryColumnVisibility, ProductCategoryRow } from '@/components/product-categories/types'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { formatNumber } from '@/lib/formatNumber'

const COLUMNS_STORAGE_KEY = 'webino-product-cats-list-columns'

const DEFAULT_COLUMNS: ProductCategoryColumnVisibility = {
  image: true,
  name: true,
  slug: true,
  parent: true,
  count: true,
  views: true,
}

const COLUMN_LABELS: Record<ProductCategoryColumnId, string> = {
  image: 'productCats.colImage',
  name: 'productCats.colName',
  slug: 'productCats.colSlug',
  parent: 'productCats.colParent',
  count: 'productCats.colCount',
  views: 'productCats.colViews',
}

function loadColumnVisibility(): ProductCategoryColumnVisibility {
  try {
    const raw = localStorage.getItem(COLUMNS_STORAGE_KEY)
    if (!raw) return DEFAULT_COLUMNS
    const parsed = JSON.parse(raw) as Partial<ProductCategoryColumnVisibility>
    return { ...DEFAULT_COLUMNS, ...parsed }
  } catch {
    return DEFAULT_COLUMNS
  }
}

function saveColumnVisibility(cols: ProductCategoryColumnVisibility) {
  try {
    localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(cols))
  } catch {
    /* ignore */
  }
}

export default function ProductCategoriesPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const locale = i18n.language

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [parentFilter, setParentFilter] = useState<string>('_all')
  const [columns, setColumns] = useState<ProductCategoryColumnVisibility>(loadColumnVisibility)
  const [busyId, setBusyId] = useState<number | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput), 300)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const q = useQuery({
    queryKey: ['product-categories', search, parentFilter],
    queryFn: () => {
      const p = new URLSearchParams({ sort: 'name_asc' })
      if (search.trim()) p.set('search', search.trim())
      if (parentFilter === '_root') p.set('parent', '0')
      else if (parentFilter !== '_all') p.set('parent', parentFilter)
      return apiFetch<{ items: ProductCategoryRow[]; found: number }>(`shop/product-categories?${p.toString()}`)
    },
  })
  useQueryErrorToast(q)

  const allCategoriesQ = useQuery({
    queryKey: ['product-categories', 'all-options'],
    queryFn: () => apiFetch<{ items: ProductCategoryRow[] }>('shop/product-categories?sort=name_asc'),
  })

  const items = q.data?.items ?? []
  const found = q.data?.found ?? 0
  const parentOptions = allCategoriesQ.data?.items ?? []

  const visibleColumnCount = useMemo(() => Object.values(columns).filter(Boolean).length + 1, [columns])

  const toggleColumn = useCallback((id: ProductCategoryColumnId, checked: boolean) => {
    setColumns((prev) => {
      const next = { ...prev, [id]: checked }
      saveColumnVisibility(next)
      return next
    })
  }, [])

  const remove = useMutation({
    mutationFn: (id: number) => {
      setBusyId(id)
      return apiFetch(`shop/product-categories/${id}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      toast.success(t('common.deleted'))
      void qc.invalidateQueries({ queryKey: ['product-categories'] })
    },
    onError: (e: Error) => toastApiError(t, e),
    onSettled: () => setBusyId(null),
  })

  return (
    <PageShell title={t('productCats.title')}>
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
        <Button asChild size="sm">
          <Link to="/shop/product-categories/new">{t('productCats.add')}</Link>
        </Button>
      </div>

      <Card className="mb-4 shadow-sm">
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-wrap items-end gap-3">
            <div className="relative min-w-[200px] flex-1">
              <Search className="text-muted-foreground pointer-events-none absolute top-2.5 start-3 size-4" aria-hidden />
              <Input
                className="ps-9"
                placeholder={t('productCats.searchPlaceholder')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>{t('productCats.filterParent')}</Label>
              <Select value={parentFilter} onValueChange={setParentFilter}>
                <SelectTrigger className="w-[min(100%,14rem)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">{t('productCats.filterAll')}</SelectItem>
                  <SelectItem value="_root">{t('productCats.filterParentRoot')}</SelectItem>
                  {parentOptions.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            {found > 0 ? (
              <p className="text-muted-foreground text-sm">{t('productCats.foundCount', { count: formatNumber(found, locale) })}</p>
            ) : (
              <span />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                  <Columns3 className="size-4" />
                  {t('productCats.toggleColumns')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>{t('productCats.toggleColumns')}</DropdownMenuLabel>
                {(Object.keys(COLUMN_LABELS) as ProductCategoryColumnId[]).map((id) => (
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
            <ProductCategoriesTable
              items={items}
              columns={columns}
              locale={locale}
              emptyMessage={t('productCats.emptyHint')}
              visibleColumnCount={visibleColumnCount}
              busyId={busyId}
              onDelete={async (id) => {
                await remove.mutateAsync(id)
              }}
            />
          )}
        </CardContent>
      </Card>
    </PageShell>
  )
}
