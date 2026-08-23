import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatNumber } from '@/lib/formatNumber'

export type ReportColumn<T> = {
  id: string
  header: string
  align?: 'start' | 'end'
  sortable?: boolean
  cell: (row: T) => ReactNode
  sortValue?: (row: T) => string | number
}

type ReportDataTableProps<T> = {
  rows: T[]
  columns: ReportColumn<T>[]
  total: number
  page: number
  perPage: number
  search: string
  orderby: string
  order: 'asc' | 'desc'
  locale: string
  onSearchChange: (v: string) => void
  onPageChange: (page: number) => void
  onSortChange: (orderby: string) => void
  emptyHint?: string
}

export function ReportDataTable<T>({
  rows,
  columns,
  total,
  page,
  perPage,
  search,
  orderby,
  order,
  locale,
  onSearchChange,
  onPageChange,
  onSortChange,
  emptyHint,
}: ReportDataTableProps<T>) {
  const { t } = useTranslation()
  const pages = Math.max(1, Math.ceil(total / perPage))

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('reports.searchPlaceholder')}
          className="max-w-xs"
        />
        <span className="text-muted-foreground text-xs">
          {formatNumber(total, locale)} {t('reports.rows')}
        </span>
      </div>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.id}
                  className={col.align === 'end' ? 'text-end' : undefined}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      className="hover:text-foreground inline-flex items-center gap-1"
                      onClick={() => onSortChange(col.id)}
                    >
                      {col.header}
                      {orderby === col.id ? (order === 'asc' ? ' ↑' : ' ↓') : null}
                    </button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-muted-foreground text-sm">
                  {emptyHint ?? t('reports.emptyHint')}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, idx) => (
                <TableRow key={idx}>
                  {columns.map((col) => (
                    <TableCell key={col.id} className={col.align === 'end' ? 'text-end' : undefined}>
                      {col.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          {t('reports.prevPage')}
        </Button>
        <span className="text-muted-foreground text-xs">
          {page} / {pages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          {t('reports.nextPage')}
        </Button>
      </div>
    </div>
  )
}
