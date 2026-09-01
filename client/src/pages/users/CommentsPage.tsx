import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Columns3, Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { CommentsTable } from '@/components/comments/CommentsTable'
import { CommentStatusTabs } from '@/components/comments/CommentStatusTabs'
import type {
  CommentColumnId,
  CommentColumnVisibility,
  CommentCounts,
  CommentRow,
  CommentStatusFilter,
} from '@/components/comments/types'
import { ListFiltersCollapsible } from '@/components/ListFiltersCollapsible'
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
import { Input } from '@/components/ui/input'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { formatNumber } from '@/lib/formatNumber'

const COLUMNS_STORAGE_KEY = 'webino-comments-list-columns'

const DEFAULT_COLUMNS: CommentColumnVisibility = {
  author: true,
  excerpt: true,
  post: true,
  date: true,
  status: true,
  email: false,
}

const EMPTY_COUNTS: CommentCounts = { all: 0, hold: 0, approve: 0, spam: 0, trash: 0 }

function loadColumnVisibility(): CommentColumnVisibility {
  try {
    const raw = localStorage.getItem(COLUMNS_STORAGE_KEY)
    if (!raw) return DEFAULT_COLUMNS
    const parsed = JSON.parse(raw) as Partial<CommentColumnVisibility>
    return { ...DEFAULT_COLUMNS, ...parsed }
  } catch {
    return DEFAULT_COLUMNS
  }
}

function saveColumnVisibility(cols: CommentColumnVisibility) {
  try {
    localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(cols))
  } catch {
    /* ignore */
  }
}

export default function CommentsPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const locale = i18n.language

  const [status, setStatus] = useState<CommentStatusFilter>('hold')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [columns, setColumns] = useState<CommentColumnVisibility>(loadColumnVisibility)
  const [quickEditId, setQuickEditId] = useState<number | null>(null)
  const [replyId, setReplyId] = useState<number | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const q = useQuery({
    queryKey: ['comments', status, page, perPage, search],
    queryFn: () => {
      const p = new URLSearchParams({
        status,
        page: String(page),
        per_page: String(perPage),
      })
      if (search.trim()) p.set('search', search.trim())
      return apiFetch<{ items: CommentRow[]; found: number; counts: CommentCounts }>(`comments?${p.toString()}`)
    },
  })
  useQueryErrorToast(q)

  const items = q.data?.items ?? []
  const found = q.data?.found ?? 0
  const counts = q.data?.counts ?? EMPTY_COUNTS

  const visibleColumnCount = useMemo(() => {
    let count = Object.values(columns).filter(Boolean).length
    count += 1
    return count
  }, [columns])

  const toggleColumn = useCallback((id: CommentColumnId, checked: boolean) => {
    setColumns((prev) => {
      const next = { ...prev, [id]: checked }
      saveColumnVisibility(next)
      return next
    })
  }, [])

  function invalidateList() {
    void qc.invalidateQueries({ queryKey: ['comments'] })
    setQuickEditId(null)
    setReplyId(null)
  }

  function handleStatusChange(next: CommentStatusFilter) {
    setStatus(next)
    setPage(1)
    setQuickEditId(null)
    setReplyId(null)
  }

  function handlePerPageChange(next: number) {
    setPerPage(next)
    setPage(1)
  }

  function toggleQuickEdit(id: number) {
    setReplyId(null)
    setQuickEditId((cur) => (cur === id ? null : id))
  }

  function toggleReply(id: number) {
    setQuickEditId(null)
    setReplyId((cur) => (cur === id ? null : id))
  }

  const patchStatus = useMutation({
    mutationFn: ({ id, nextStatus }: { id: number; nextStatus: string }) => {
      setBusyId(id)
      return apiFetch(`comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
    },
    onSuccess: () => {
      toast.success(t('common.saved'))
      invalidateList()
    },
    onError: (e: Error) => toastApiError(t, e),
    onSettled: () => setBusyId(null),
  })

  const remove = useMutation({
    mutationFn: (id: number) => {
      setBusyId(id)
      return apiFetch(`comments/${id}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      toast.success(t('common.deleted'))
      invalidateList()
    },
    onError: (e: Error) => toastApiError(t, e),
    onSettled: () => setBusyId(null),
  })

  return (
    <PageShell title={t('comments.title')}>
      <div className="mb-4">
        <CommentStatusTabs value={status} counts={counts} locale={locale} onChange={handleStatusChange} />
      </div>

      <ListFiltersCollapsible className="mb-4" activeCount={search.trim() ? 1 : 0}>
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-2.5 start-3 size-4" aria-hidden />
            <Input
              className="ps-9"
              placeholder={t('comments.searchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          {found > 0 ? (
            <p className="text-muted-foreground text-sm">{t('comments.foundCount', { count: formatNumber(found, locale) })}</p>
          ) : null}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                <Columns3 className="size-4" />
                {t('comments.toggleColumns')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>{t('comments.toggleColumns')}</DropdownMenuLabel>
              <DropdownMenuCheckboxItem checked={columns.author} onCheckedChange={(v) => toggleColumn('author', v === true)}>
                {t('comments.colAuthor')}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={columns.email} onCheckedChange={(v) => toggleColumn('email', v === true)}>
                {t('comments.colEmail')}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={columns.excerpt} onCheckedChange={(v) => toggleColumn('excerpt', v === true)}>
                {t('comments.colExcerpt')}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={columns.post} onCheckedChange={(v) => toggleColumn('post', v === true)}>
                {t('comments.colPost')}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={columns.date} onCheckedChange={(v) => toggleColumn('date', v === true)}>
                {t('comments.colDate')}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={columns.status} onCheckedChange={(v) => toggleColumn('status', v === true)}>
                {t('comments.colStatus')}
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </ListFiltersCollapsible>

      <Card className="shadow-sm">
        <CardContent className="overflow-x-auto p-0">
          {q.isLoading ? (
            <TableListSkeleton rows={6} columns={visibleColumnCount} />
          ) : (
            <CommentsTable
              items={items}
              columns={columns}
              locale={locale}
              statusFilter={status}
              emptyMessage={status === 'hold' ? t('comments.emptyQueue') : t('comments.emptyList')}
              visibleColumnCount={visibleColumnCount}
              quickEditId={quickEditId}
              replyId={replyId}
              busyId={busyId}
              onQuickEditToggle={toggleQuickEdit}
              onReplyToggle={toggleReply}
              onApprove={async (id) => {
                await patchStatus.mutateAsync({ id, nextStatus: 'approved' })
              }}
              onUnapprove={async (id) => {
                await patchStatus.mutateAsync({ id, nextStatus: 'hold' })
              }}
              onSpam={async (id) => {
                await patchStatus.mutateAsync({ id, nextStatus: 'spam' })
              }}
              onTrash={async (id) => {
                await patchStatus.mutateAsync({ id, nextStatus: 'trash' })
              }}
              onDelete={async (id) => {
                await remove.mutateAsync(id)
              }}
              onSaved={invalidateList}
            />
          )}
        </CardContent>
        {!q.isLoading && found > 0 ? (
          <PostsPagination page={page} perPage={perPage} found={found} onPageChange={setPage} onPerPageChange={handlePerPageChange} />
        ) : null}
      </Card>
    </PageShell>
  )
}
