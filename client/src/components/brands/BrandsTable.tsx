import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { BrandRowActions } from '@/components/brands/BrandRowActions'
import type { BrandColumnVisibility, BrandRow } from '@/components/brands/types'
import { MobileListCard } from '@/components/MobileListCard'
import { LazyImage } from '@/components/ui/lazy-image'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { buildCategoryTree } from '@/lib/categoryTree'
import { formatNumber } from '@/lib/formatNumber'

type BrandsTableProps = {
  items: BrandRow[]
  columns: BrandColumnVisibility
  locale: string
  emptyMessage: string
  visibleColumnCount: number
  busyId: number | null
  onDelete: (id: number) => Promise<void>
}

export function BrandsTable({
  items,
  columns,
  locale,
  emptyMessage,
  visibleColumnCount,
  busyId,
  onDelete,
}: BrandsTableProps) {
  const { t } = useTranslation()

  const treeItems = useMemo(
    () =>
      buildCategoryTree(
        items.map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          parent: item.parent,
          description: item.description,
          count: item.count,
          url: item.url,
        })),
      ),
    [items],
  )

  const rowById = useMemo(() => new Map(items.map((item) => [item.id, item])), [items])

  return (
    <>
      <div className="space-y-3 p-3 md:hidden">
        {treeItems.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">{emptyMessage}</p>
        ) : (
          treeItems.map(({ node, depth }) => {
            const row = rowById.get(node.id)
            if (!row) return null
            return (
              <MobileListCard
                key={row.id}
                media={
                  <div className="flex gap-3" style={{ paddingInlineStart: depth > 0 ? `${depth * 0.75}rem` : undefined }}>
                    {row.thumbnail_url ? (
                      <LazyImage
                        src={row.thumbnail_url}
                        alt={row.name || t('a11y.thumbnail')}
                        className="size-12 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="bg-muted text-muted-foreground flex size-12 shrink-0 items-center justify-center rounded-lg text-xs">
                        —
                      </div>
                    )}
                    <div className="min-w-0 flex-1 space-y-1">
                      <Link to={`/shop/brands/${row.id}`} className="font-medium hover:underline">
                        {row.name}
                      </Link>
                      {row.slug ? <p className="text-muted-foreground text-xs">{row.slug}</p> : null}
                    </div>
                  </div>
                }
                actions={<BrandRowActions row={row} busy={busyId === row.id} onDelete={() => onDelete(row.id)} />}
              >
                <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
                  <div>
                    <dt className="text-muted-foreground text-xs">{t('brands.colParent')}</dt>
                    <dd>{row.parent_name || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs">{t('brands.colCount')}</dt>
                    <dd>{formatNumber(row.count, locale)}</dd>
                  </div>
                  {row.views != null ? (
                    <div>
                      <dt className="text-muted-foreground text-xs">{t('brands.colViews')}</dt>
                      <dd>{formatNumber(row.views, locale)}</dd>
                    </div>
                  ) : null}
                </dl>
              </MobileListCard>
            )
          })
        )}
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.image ? <TableHead className="w-14">{t('brands.colImage')}</TableHead> : null}
              {columns.name ? <TableHead>{t('brands.colName')}</TableHead> : null}
              {columns.slug ? <TableHead>{t('brands.colSlug')}</TableHead> : null}
              {columns.parent ? <TableHead>{t('brands.colParent')}</TableHead> : null}
              {columns.count ? <TableHead>{t('brands.colCount')}</TableHead> : null}
              {columns.views ? <TableHead>{t('brands.colViews')}</TableHead> : null}
              <TableHead className="w-36 min-w-36">{t('brands.colActions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {treeItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumnCount} className="text-muted-foreground py-8 text-center text-sm">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              treeItems.map(({ node, depth }) => {
                const row = rowById.get(node.id)
                if (!row) return null

                return (
                  <TableRow key={row.id}>
                    {columns.image ? (
                      <TableCell>
                        {row.thumbnail_url ? (
                          <LazyImage
                            src={row.thumbnail_url}
                            alt={row.name || t('a11y.thumbnail')}
                            className="size-10 rounded object-cover"
                          />
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                    ) : null}
                    {columns.name ? (
                      <TableCell className="min-w-[10rem] font-medium">
                        <Link
                          to={`/shop/brands/${row.id}`}
                          className="hover:underline"
                          style={{ paddingInlineStart: `${depth * 0.875}rem` }}
                        >
                          {row.name}
                        </Link>
                      </TableCell>
                    ) : null}
                    {columns.slug ? <TableCell className="text-xs">{row.slug}</TableCell> : null}
                    {columns.parent ? <TableCell className="text-sm">{row.parent_name || '—'}</TableCell> : null}
                    {columns.count ? <TableCell>{formatNumber(row.count, locale)}</TableCell> : null}
                    {columns.views ? (
                      <TableCell>{row.views != null ? formatNumber(row.views, locale) : '—'}</TableCell>
                    ) : null}
                    <TableCell className="w-36 min-w-36">
                      <BrandRowActions row={row} busy={busyId === row.id} onDelete={() => onDelete(row.id)} />
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
