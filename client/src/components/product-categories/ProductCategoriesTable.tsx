import { ChevronDown, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { ProductCategoryRowActions } from '@/components/product-categories/ProductCategoryRowActions'
import type { ProductCategoryColumnVisibility, ProductCategoryRow } from '@/components/product-categories/types'
import { MobileListCard } from '@/components/MobileListCard'
import { Button } from '@/components/ui/button'
import { LazyImage } from '@/components/ui/lazy-image'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { buildCategoryTree } from '@/lib/categoryTree'
import { formatNumber } from '@/lib/formatNumber'
import { cn } from '@/lib/utils'

type ProductCategoriesTableProps = {
  items: ProductCategoryRow[]
  columns: ProductCategoryColumnVisibility
  locale: string
  emptyMessage: string
  visibleColumnCount: number
  busyId: number | null
  onDelete: (id: number) => Promise<void>
}

export function ProductCategoriesTable({
  items,
  columns,
  locale,
  emptyMessage,
  visibleColumnCount,
  busyId,
  onDelete,
}: ProductCategoriesTableProps) {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState<Set<number>>(() => new Set())

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

  const childrenByParent = useMemo(() => {
    const map = new Map<number, number[]>()
    for (const item of items) {
      const list = map.get(item.parent) ?? []
      list.push(item.id)
      map.set(item.parent, list)
    }
    return map
  }, [items])

  const rowById = useMemo(() => new Map(items.map((item) => [item.id, item])), [items])

  const visibleTree = useMemo(() => {
    const hidden = new Set<number>()
    const markDescendants = (id: number) => {
      for (const childId of childrenByParent.get(id) ?? []) {
        hidden.add(childId)
        markDescendants(childId)
      }
    }
    for (const id of collapsed) {
      markDescendants(id)
    }
    return treeItems.filter(({ node }) => !hidden.has(node.id))
  }, [treeItems, collapsed, childrenByParent])

  function toggleCollapse(id: number) {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <>
      <div className="space-y-3 p-3 md:hidden">
        {visibleTree.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">{emptyMessage}</p>
        ) : (
          visibleTree.map(({ node, depth }) => {
            const row = rowById.get(node.id)
            if (!row) return null
            const hasChildren = (childrenByParent.get(row.id) ?? []).length > 0
            const isCollapsed = collapsed.has(row.id)

            return (
              <MobileListCard
                key={row.id}
                media={
                  <div
                    className="flex gap-3"
                    style={{ paddingInlineStart: depth > 0 ? `${depth * 0.75}rem` : undefined }}
                  >
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
                      <div className="flex items-center gap-1">
                        {hasChildren ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="size-6 shrink-0"
                            onClick={() => toggleCollapse(row.id)}
                            aria-label={isCollapsed ? t('common.expand') : t('common.collapse')}
                          >
                            {isCollapsed ? <ChevronRight className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                          </Button>
                        ) : null}
                        <Link to={`/shop/product-categories/${row.id}`} className="font-medium hover:underline">
                          {row.name}
                        </Link>
                        {depth > 0 ? (
                          <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px] font-normal">
                            {t('productCats.levelBadge', { level: depth + 1 })}
                          </span>
                        ) : null}
                      </div>
                      {row.slug ? <p className="text-muted-foreground text-xs">{row.slug}</p> : null}
                    </div>
                  </div>
                }
                actions={
                  <ProductCategoryRowActions row={row} busy={busyId === row.id} onDelete={() => onDelete(row.id)} />
                }
              >
                <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
                  <div>
                    <dt className="text-muted-foreground text-xs">{t('productCats.colParent')}</dt>
                    <dd>{row.parent_name || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs">{t('productCats.colCount')}</dt>
                    <dd>{formatNumber(row.count, locale)}</dd>
                  </div>
                  {row.views != null ? (
                    <div>
                      <dt className="text-muted-foreground text-xs">{t('productCats.colViews')}</dt>
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
              {columns.image ? <TableHead className="w-14">{t('productCats.colImage')}</TableHead> : null}
              {columns.name ? <TableHead>{t('productCats.colName')}</TableHead> : null}
              {columns.slug ? <TableHead>{t('productCats.colSlug')}</TableHead> : null}
              {columns.parent ? <TableHead>{t('productCats.colParent')}</TableHead> : null}
              {columns.count ? <TableHead>{t('productCats.colCount')}</TableHead> : null}
              {columns.views ? <TableHead>{t('productCats.colViews')}</TableHead> : null}
              <TableHead className="w-36 min-w-36">{t('productCats.colActions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleTree.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumnCount} className="text-muted-foreground py-8 text-center text-sm">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              visibleTree.map(({ node, depth }) => {
                const row = rowById.get(node.id)
                if (!row) return null
                const hasChildren = (childrenByParent.get(row.id) ?? []).length > 0
                const isCollapsed = collapsed.has(row.id)
                const guide = depth > 0 ? `${'│  '.repeat(Math.max(0, depth - 1))}└ ` : ''

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
                      <TableCell className="min-w-[12rem] font-medium">
                        <div
                          className="flex items-center gap-1"
                          style={{ paddingInlineStart: `${depth * 1.125}rem` }}
                        >
                          {hasChildren ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="size-6 shrink-0"
                              onClick={() => toggleCollapse(row.id)}
                              aria-label={isCollapsed ? t('common.expand') : t('common.collapse')}
                            >
                              {isCollapsed ? <ChevronRight className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                            </Button>
                          ) : (
                            <span className="inline-block size-6 shrink-0" aria-hidden />
                          )}
                          <span className={cn('text-muted-foreground me-1 font-mono text-xs', depth === 0 && 'hidden')}>
                            {guide}
                          </span>
                          <Link to={`/shop/product-categories/${row.id}`} className="hover:underline">
                            {row.name}
                          </Link>
                          {depth > 0 ? (
                            <span className="bg-muted text-muted-foreground ms-1 rounded px-1.5 py-0.5 text-[10px] font-normal">
                              {t('productCats.levelBadge', { level: depth + 1 })}
                            </span>
                          ) : null}
                        </div>
                      </TableCell>
                    ) : null}
                    {columns.slug ? <TableCell className="text-xs">{row.slug}</TableCell> : null}
                    {columns.parent ? <TableCell className="text-sm">{row.parent_name || '—'}</TableCell> : null}
                    {columns.count ? <TableCell>{formatNumber(row.count, locale)}</TableCell> : null}
                    {columns.views ? (
                      <TableCell>{row.views != null ? formatNumber(row.views, locale) : '—'}</TableCell>
                    ) : null}
                    <TableCell className="w-36 min-w-36">
                      <ProductCategoryRowActions row={row} busy={busyId === row.id} onDelete={() => onDelete(row.id)} />
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
