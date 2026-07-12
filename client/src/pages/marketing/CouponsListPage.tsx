import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { CouponsBulkActions } from '@/components/coupons/CouponsBulkActions'
import { CouponsTable, type CouponTableRow } from '@/components/coupons/CouponsTable'
import { PostsPagination } from '@/components/magazine/PostsPagination'
import { PageShell } from '@/components/PageShell'
import { TableListSkeleton } from '@/components/TableListSkeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { formatNumber } from '@/lib/formatNumber'

const EMPTY_ITEMS: CouponTableRow[] = []

function buildCouponsQuery(page: number, perPage: number, search: string): string {
  const p = new URLSearchParams({ page: String(page), per_page: String(perPage) })
  if (search.trim()) p.set('search', search.trim())
  return `marketing/coupons?${p.toString()}`
}

export default function CouponsListPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const locale = i18n.language

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [trashingId, setTrashingId] = useState<number | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const q = useQuery({
    queryKey: ['coupons', 'list', page, perPage, search],
    queryFn: () =>
      apiFetch<{ items: CouponTableRow[]; page: number; per_page: number; found: number }>(
        buildCouponsQuery(page, perPage, search),
      ),
  })
  useQueryErrorToast(q)

  const items = q.data?.items ?? EMPTY_ITEMS
  const found = q.data?.found ?? 0

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

  const trashOne = useMutation({
    mutationFn: (id: number) => apiFetch(`marketing/coupons/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['coupons'] })
      toast.success(t('coupons.trashed'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  async function handleTrash(id: number) {
    setTrashingId(id)
    try {
      await trashOne.mutateAsync(id)
    } finally {
      setTrashingId(null)
    }
  }

  function handleBulkDone() {
    setSelectedIds([])
    void qc.invalidateQueries({ queryKey: ['coupons'] })
  }

  const selectedLabel = useMemo(() => {
    if (selectedIds.length === 0) return null
    return t('coupons.selectedCount', { count: formatNumber(selectedIds.length, locale) })
  }, [selectedIds.length, locale, t])

  return (
    <PageShell title={t('coupons.title')}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Button type="button" size="sm" asChild>
          <Link to="/marketing/coupons/new">
            <Plus className="size-4" />
            {t('coupons.addCoupon')}
          </Link>
        </Button>
      </div>

      <Card className="mb-4 shadow-sm">
        <CardContent className="flex flex-wrap items-end gap-4 pt-6">
          <div className="min-w-[12rem] flex-1">
            <div className="relative">
              <Search className="text-muted-foreground pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2" />
              <Input
                className="ps-9"
                placeholder={t('coupons.searchPlaceholder')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </div>
          <CouponsBulkActions selectedIds={selectedIds} onDone={handleBulkDone} />
        </CardContent>
      </Card>

      {selectedLabel ? <p className="text-muted-foreground mb-2 text-sm">{selectedLabel}</p> : null}

      <Card className="shadow-sm">
        <CardContent className="overflow-x-auto p-0">
          {q.isLoading ? (
            <TableListSkeleton rows={8} columns={7} />
          ) : (
            <CouponsTable
              items={items}
              locale={locale}
              selectedIds={selectedIds}
              onSelectedChange={setSelectedIds}
              onTrash={handleTrash}
              trashingId={trashingId}
              onTrashed={() => void qc.invalidateQueries({ queryKey: ['coupons'] })}
            />
          )}
          {!q.isLoading && found > 0 ? (
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
          ) : null}
        </CardContent>
      </Card>
    </PageShell>
  )
}
