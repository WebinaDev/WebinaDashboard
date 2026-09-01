import { useQuery } from '@tanstack/react-query'
import { Columns3 } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { PostsPagination } from '@/components/magazine/PostsPagination'
import { ListStatsStrip } from '@/components/ListStatsStrip'
import { MobileListCard } from '@/components/MobileListCard'
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { formatDisplayDate } from '@/lib/date'
import { translatePostStatus } from '@/lib/enumLabels'
import { formatNumber } from '@/lib/formatNumber'
import { cn } from '@/lib/utils'

type Row = {
  id: number
  title: string
  status: string
  date: string
  excerpt?: string
  seo_score?: number | null
  focus_keyword?: string
}

type ColumnId = 'title' | 'status' | 'date' | 'excerpt' | 'seo'

type ColumnVisibility = Record<ColumnId, boolean>

const COLUMNS_STORAGE_KEY = 'webino-posts-list-columns'

const DEFAULT_COLUMNS: ColumnVisibility = {
  title: true,
  status: true,
  date: true,
  excerpt: false,
  seo: true,
}

function loadColumnVisibility(): ColumnVisibility {
  try {
    const raw = localStorage.getItem(COLUMNS_STORAGE_KEY)
    if (!raw) return DEFAULT_COLUMNS
    const parsed = JSON.parse(raw) as Partial<ColumnVisibility>
    return { ...DEFAULT_COLUMNS, ...parsed }
  } catch {
    return DEFAULT_COLUMNS
  }
}

function saveColumnVisibility(cols: ColumnVisibility) {
  try {
    localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(cols))
  } catch {
    /* ignore */
  }
}

export default function PostsListPage() {
  const { t, i18n } = useTranslation()
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [columns, setColumns] = useState<ColumnVisibility>(loadColumnVisibility)

  const q = useQuery({
    queryKey: ['posts', 'list', page, perPage],
    queryFn: () =>
      apiFetch<{
        items: Row[]
        page: number
        found: number
        stats?: { total: number; publish: number; draft: number; pending: number }
      }>(`content/posts?page=${page}&per_page=${perPage}`),
  })
  useQueryErrorToast(q)

  const items = q.data?.items ?? []
  const found = q.data?.found ?? 0
  const stats = q.data?.stats
  const locale = i18n.language

  const statItems = useMemo(() => {
    if (!stats) return []
    return [
      { id: 'total', label: t('posts.stats.total'), value: stats.total },
      { id: 'publish', label: t('posts.stats.publish'), value: stats.publish },
      { id: 'draft', label: t('posts.stats.draft'), value: stats.draft },
      { id: 'pending', label: t('posts.stats.pending'), value: stats.pending },
    ]
  }, [stats, t, i18n.language])

  const visibleColumnCount = useMemo(() => {
    let count = Object.values(columns).filter(Boolean).length
    count += 1 // actions column
    return count
  }, [columns])

  const toggleColumn = useCallback((id: ColumnId, checked: boolean) => {
    setColumns((prev) => {
      const next = { ...prev, [id]: checked }
      saveColumnVisibility(next)
      return next
    })
  }, [])

  function handlePerPageChange(next: number) {
    setPerPage(next)
    setPage(1)
  }

  return (
    <PageShell title={t('posts.title')} description={t('posts.listDescription')}>
      {statItems.length ? (
        <div className="mb-4">
          <ListStatsStrip items={statItems} locale={locale} />
        </div>
      ) : null}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {t('posts.totalCount', { count: formatNumber(found, locale) })}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                <Columns3 className="size-4" />
                {t('posts.toggleColumns')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>{t('posts.toggleColumns')}</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={columns.title}
                onCheckedChange={(v) => toggleColumn('title', v === true)}
              >
                {t('posts.colTitle')}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columns.status}
                onCheckedChange={(v) => toggleColumn('status', v === true)}
              >
                {t('posts.colStatus')}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columns.date}
                onCheckedChange={(v) => toggleColumn('date', v === true)}
              >
                {t('posts.colDate')}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columns.excerpt}
                onCheckedChange={(v) => toggleColumn('excerpt', v === true)}
              >
                {t('posts.colExcerpt')}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columns.seo}
                onCheckedChange={(v) => toggleColumn('seo', v === true)}
              >
                {t('posts.colSeo')}
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button asChild size="sm">
            <Link to="/magazine/new">{t('posts.add')}</Link>
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="overflow-x-auto p-0">
          {q.isLoading ? (
            <TableListSkeleton rows={8} columns={visibleColumnCount} />
          ) : (
            <>
              <div className="space-y-3 p-3 md:hidden">
                {items.length === 0 ? (
                  <div className="text-muted-foreground py-8 text-center text-sm">
                    <p className="mb-3">{t('posts.emptyHint')}</p>
                    <Button asChild size="sm">
                      <Link to="/magazine/new">{t('posts.add')}</Link>
                    </Button>
                  </div>
                ) : (
                  items.map((row) => (
                    <MobileListCard
                      key={row.id}
                      media={
                        <div className="space-y-1">
                          <p className="font-medium">{row.title}</p>
                          <p className="text-muted-foreground text-xs">
                            {translatePostStatus(t, row.status)} · {formatDisplayDate(row.date, locale)}
                          </p>
                        </div>
                      }
                      actions={
                        <Button asChild variant="outline" size="sm" className="w-full">
                          <Link to={`/magazine/posts/${row.id}`}>{t('common.edit')}</Link>
                        </Button>
                      }
                    >
                      {row.excerpt?.trim() ? (
                        <p className="text-muted-foreground line-clamp-2 text-sm">{row.excerpt}</p>
                      ) : null}
                    </MobileListCard>
                  ))
                )}
              </div>
              <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.title ? <TableHead>{t('posts.colTitle')}</TableHead> : null}
                    {columns.status ? <TableHead>{t('posts.colStatus')}</TableHead> : null}
                    {columns.date ? <TableHead>{t('posts.colDate')}</TableHead> : null}
                    {columns.excerpt ? <TableHead>{t('posts.colExcerpt')}</TableHead> : null}
                    {columns.seo ? <TableHead>{t('posts.colSeo')}</TableHead> : null}
                    <TableHead className="w-28">{t('posts.colActions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={visibleColumnCount}
                        className="p-8 text-center text-sm text-muted-foreground"
                      >
                        <p className="mb-3">{t('posts.emptyHint')}</p>
                        <Button asChild size="sm">
                          <Link to="/magazine/new">{t('posts.add')}</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((row) => (
                      <TableRow key={row.id}>
                        {columns.title ? (
                          <TableCell className="max-w-xs font-medium">{row.title}</TableCell>
                        ) : null}
                        {columns.status ? (
                          <TableCell>{translatePostStatus(t, row.status)}</TableCell>
                        ) : null}
                        {columns.date ? (
                          <TableCell className="text-muted-foreground">
                            {formatDisplayDate(row.date, locale)}
                          </TableCell>
                        ) : null}
                        {columns.excerpt ? (
                          <TableCell
                            className={cn(
                              'max-w-sm whitespace-normal text-muted-foreground',
                              !row.excerpt?.trim() && 'text-muted-foreground/60',
                            )}
                          >
                            {row.excerpt?.trim() || t('common.emptyValue')}
                          </TableCell>
                        ) : null}
                        {columns.seo ? (
                          <TableCell className="text-sm text-muted-foreground">
                            {row.seo_score != null ? (
                              <span className="text-foreground font-medium">{formatNumber(row.seo_score, locale)}</span>
                            ) : (
                              '—'
                            )}
                            {row.focus_keyword?.trim() ? (
                              <span className="mt-0.5 block text-xs">{row.focus_keyword}</span>
                            ) : null}
                          </TableCell>
                        ) : null}
                        <TableCell>
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/magazine/posts/${row.id}`}>{t('common.edit')}</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              </div>
              <PostsPagination
                page={page}
                perPage={perPage}
                found={found}
                onPageChange={setPage}
                onPerPageChange={handlePerPageChange}
              />
            </>
          )}
        </CardContent>
      </Card>
    </PageShell>
  )
}
