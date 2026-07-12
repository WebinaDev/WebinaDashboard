import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Columns3 } from 'lucide-react'
import { Fragment, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { PageRowActions, type PageListRow } from '@/components/cms/PageRowActions'
import { PagesQuickEditRow } from '@/components/cms/PagesQuickEditRow'
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { formatDisplayDate } from '@/lib/date'
import { translatePostStatus } from '@/lib/enumLabels'
import { formatNumber } from '@/lib/formatNumber'
import { cn } from '@/lib/utils'

type Row = PageListRow & {
  status: string
  date: string
  excerpt?: string
  parent: number
}

type ColumnId = 'title' | 'status' | 'date' | 'excerpt'

type ColumnVisibility = Record<ColumnId, boolean>

const COLUMNS_STORAGE_KEY = 'webino-pages-list-columns'

const DEFAULT_COLUMNS: ColumnVisibility = {
  title: true,
  status: true,
  date: true,
  excerpt: false,
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

export default function PagesListPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [columns, setColumns] = useState<ColumnVisibility>(loadColumnVisibility)
  const [quickEditId, setQuickEditId] = useState<number | null>(null)

  const q = useQuery({
    queryKey: ['pages', 'list', page, perPage],
    queryFn: () =>
      apiFetch<{ items: Row[]; page: number; found: number }>(
        `content/pages?page=${page}&per_page=${perPage}`,
      ),
  })
  useQueryErrorToast(q)

  const pageOptionsQ = useQuery({
    queryKey: ['pages', 'parent-options'],
    queryFn: () => apiFetch<{ items: { id: number; title: string }[] }>('content/pages?per_page=100'),
  })

  const items = q.data?.items ?? []
  const found = q.data?.found ?? 0
  const locale = i18n.language
  const pageOptions = pageOptionsQ.data?.items ?? items

  const visibleColumnCount = useMemo(() => {
    let count = Object.values(columns).filter(Boolean).length
    count += 1
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

  function invalidateList() {
    void qc.invalidateQueries({ queryKey: ['pages'] })
  }

  return (
    <PageShell title={t('pages.title')} description={t('pages.listDescription')}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {t('pages.totalCount', { count: formatNumber(found, locale) })}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                <Columns3 className="size-4" />
                {t('pages.toggleColumns')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>{t('pages.toggleColumns')}</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={columns.title}
                onCheckedChange={(v) => toggleColumn('title', v === true)}
              >
                {t('pages.colTitle')}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columns.status}
                onCheckedChange={(v) => toggleColumn('status', v === true)}
              >
                {t('pages.colStatus')}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columns.date}
                onCheckedChange={(v) => toggleColumn('date', v === true)}
              >
                {t('pages.colDate')}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columns.excerpt}
                onCheckedChange={(v) => toggleColumn('excerpt', v === true)}
              >
                {t('pages.colExcerpt')}
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button asChild size="sm">
            <Link to="/pages/new">{t('pages.add')}</Link>
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="overflow-x-auto p-0">
          {q.isLoading ? (
            <TableListSkeleton rows={8} columns={visibleColumnCount} />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.title ? <TableHead>{t('pages.colTitle')}</TableHead> : null}
                    {columns.status ? <TableHead>{t('pages.colStatus')}</TableHead> : null}
                    {columns.date ? <TableHead>{t('pages.colDate')}</TableHead> : null}
                    {columns.excerpt ? <TableHead>{t('pages.colExcerpt')}</TableHead> : null}
                    <TableHead className="w-40">{t('pages.colActions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={visibleColumnCount}
                        className="p-8 text-center text-sm text-muted-foreground"
                      >
                        <p className="mb-3">{t('pages.emptyHint')}</p>
                        <Button asChild size="sm">
                          <Link to="/pages/new">{t('pages.add')}</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((row) => (
                      <Fragment key={row.id}>
                        <TableRow>
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
                          <TableCell>
                            <PageRowActions
                              row={row}
                              quickEditOpen={quickEditId === row.id}
                              onQuickEditToggle={() =>
                                setQuickEditId((cur) => (cur === row.id ? null : row.id))
                              }
                              onTrashed={invalidateList}
                            />
                          </TableCell>
                        </TableRow>
                        {quickEditId === row.id ? (
                          <PagesQuickEditRow
                            pageId={row.id}
                            initialTitle={row.title}
                            initialStatus={row.status}
                            initialParent={row.parent}
                            pageOptions={pageOptions}
                            colSpan={visibleColumnCount}
                            onSaved={() => {
                              setQuickEditId(null)
                              invalidateList()
                            }}
                            onCancel={() => setQuickEditId(null)}
                          />
                        ) : null}
                      </Fragment>
                    ))
                  )}
                </TableBody>
              </Table>
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
