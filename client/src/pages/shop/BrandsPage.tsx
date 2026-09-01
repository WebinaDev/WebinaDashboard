import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Columns3, Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { ListFiltersCollapsible } from '@/components/ListFiltersCollapsible'
import { BrandsTable } from '@/components/brands/BrandsTable'
import type { BrandColumnId, BrandColumnVisibility, BrandRow } from '@/components/brands/types'
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

const COLUMNS_STORAGE_KEY = 'webino-brands-list-columns'

const DEFAULT_COLUMNS: BrandColumnVisibility = {
  image: true,
  name: true,
  slug: true,
  parent: true,
  count: true,
  views: true,
}

const COLUMN_LABELS: Record<BrandColumnId, string> = {
  image: 'brands.colImage',
  name: 'brands.colName',
  slug: 'brands.colSlug',
  parent: 'brands.colParent',
  count: 'brands.colCount',
  views: 'brands.colViews',
}

function loadColumnVisibility(): BrandColumnVisibility {
  try {
    const raw = localStorage.getItem(COLUMNS_STORAGE_KEY)
    if (!raw) return DEFAULT_COLUMNS
    const parsed = JSON.parse(raw) as Partial<BrandColumnVisibility>
    return { ...DEFAULT_COLUMNS, ...parsed }
  } catch {
    return DEFAULT_COLUMNS
  }
}

function saveColumnVisibility(cols: BrandColumnVisibility) {
  try {
    localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(cols))
  } catch {
    /* ignore */
  }
}

export default function BrandsPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const locale = i18n.language

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [parentFilter, setParentFilter] = useState<string>('_all')
  const [columns, setColumns] = useState<BrandColumnVisibility>(loadColumnVisibility)
  const [busyId, setBusyId] = useState<number | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput), 300)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const q = useQuery({
    queryKey: ['brands', search, parentFilter],
    queryFn: () => {
      const p = new URLSearchParams({ sort: 'name_asc' })
      if (search.trim()) p.set('search', search.trim())
      if (parentFilter === '_root') p.set('parent', '0')
      else if (parentFilter !== '_all') p.set('parent', parentFilter)
      return apiFetch<{ items: BrandRow[]; found: number }>(`shop/brands?${p.toString()}`)
    },
  })
  useQueryErrorToast(q)

  const allBrandsQ = useQuery({
    queryKey: ['brands', 'all-options'],
    queryFn: () => apiFetch<{ items: BrandRow[] }>('shop/brands?sort=name_asc'),
  })

  const items = q.data?.items ?? []
  const found = q.data?.found ?? 0
  const parentOptions = allBrandsQ.data?.items ?? []

  const visibleColumnCount = useMemo(() => Object.values(columns).filter(Boolean).length + 1, [columns])

  const toggleColumn = useCallback((id: BrandColumnId, checked: boolean) => {
    setColumns((prev) => {
      const next = { ...prev, [id]: checked }
      saveColumnVisibility(next)
      return next
    })
  }, [])

  const remove = useMutation({
    mutationFn: (id: number) => {
      setBusyId(id)
      return apiFetch(`shop/brands/${id}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      toast.success(t('common.deleted'))
      void qc.invalidateQueries({ queryKey: ['brands'] })
    },
    onError: (e: Error) => toastApiError(t, e),
    onSettled: () => setBusyId(null),
  })

  return (
    <PageShell title={t('brands.title')}>
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
        <Button asChild size="sm">
          <Link to="/shop/brands/new">{t('brands.add')}</Link>
        </Button>
      </div>

      <ListFiltersCollapsible
        className="mb-4"
        activeCount={(search.trim() ? 1 : 0) + (parentFilter !== '_all' ? 1 : 0)}
      >
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-2.5 start-3 size-4" aria-hidden />
            <Input
              className="ps-9"
              placeholder={t('brands.searchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>{t('brands.filterParent')}</Label>
            <Select value={parentFilter} onValueChange={setParentFilter}>
              <SelectTrigger className="w-[min(100%,14rem)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">{t('brands.filterAll')}</SelectItem>
                <SelectItem value="_root">{t('brands.filterParentRoot')}</SelectItem>
                {parentOptions.map((b) => (
                  <SelectItem key={b.id} value={String(b.id)}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          {found > 0 ? (
            <p className="text-muted-foreground text-sm">{t('brands.foundCount', { count: formatNumber(found, locale) })}</p>
          ) : (
            <span />
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                <Columns3 className="size-4" />
                {t('brands.toggleColumns')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>{t('brands.toggleColumns')}</DropdownMenuLabel>
              {(Object.keys(COLUMN_LABELS) as BrandColumnId[]).map((id) => (
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
            <BrandsTable
              items={items}
              columns={columns}
              locale={locale}
              emptyMessage={t('brands.emptyHint')}
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
