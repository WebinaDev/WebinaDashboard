import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { CheckboxListSkeleton } from '@/components/skeletons/CheckboxListSkeleton'
import { buildCategoryTree, type Category } from '@/lib/categoryTree'

type TaxItem = { id: number; name: string; slug?: string; parent?: number }

type ProductTaxonomyPanelProps = {
  titleKey: string
  emptyKey: string
  items: TaxItem[]
  loading: boolean
  selected: number[]
  onChange: (ids: number[]) => void
  /** Prefer tree layout when parent ids exist. */
  hierarchical?: boolean
  searchPlaceholderKey?: string
}

function toggleTax(ids: number[], tid: number, checked: boolean) {
  if (checked) return ids.includes(tid) ? ids : [...ids, tid]
  return ids.filter((x) => x !== tid)
}

export function ProductTaxonomyPanel({
  titleKey,
  emptyKey,
  items,
  loading,
  selected,
  onChange,
  hierarchical = false,
  searchPlaceholderKey = 'products.editor.taxonomySearch',
}: ProductTaxonomyPanelProps) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')

  const hasParent = hierarchical || items.some((i) => typeof i.parent === 'number' && (i.parent ?? 0) > 0)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((i) => i.name.toLowerCase().includes(q))
  }, [items, query])

  const treeRows = useMemo(() => {
    if (!hasParent) return null
    const asCategories: Category[] = items.map((i) => ({
      id: i.id,
      name: i.name,
      slug: i.slug ?? '',
      parent: i.parent ?? 0,
      description: '',
      count: 0,
      url: '',
    }))
    const tree = buildCategoryTree(asCategories)
    const q = query.trim().toLowerCase()
    if (!q) return tree

    const matchIds = new Set(items.filter((i) => i.name.toLowerCase().includes(q)).map((i) => i.id))
    const byId = new Map(asCategories.map((c) => [c.id, c]))
    const keep = new Set<number>()
    for (const id of matchIds) {
      let cur: number | undefined = id
      while (cur && cur > 0) {
        keep.add(cur)
        cur = byId.get(cur)?.parent
      }
    }
    return tree.filter(({ node }) => keep.has(node.id))
  }, [hasParent, items, query])

  return (
    <Card className="gap-2 py-3 shadow-sm">
      <CardHeader className="px-3 pb-0">
        <CardTitle className="text-sm font-semibold">{t(titleKey)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t(searchPlaceholderKey)}
          className="h-8 text-sm"
        />
        <div className="max-h-44 overflow-y-auto rounded-md border border-border p-1.5 text-sm">
          {loading ? (
            <CheckboxListSkeleton rows={5} />
          ) : items.length === 0 ? (
            <p className="text-muted-foreground px-1 py-1 text-xs">{t(emptyKey)}</p>
          ) : treeRows ? (
            treeRows.length === 0 ? (
              <p className="text-muted-foreground px-1 py-1 text-xs">{t('products.editor.taxonomyNoMatch')}</p>
            ) : (
              treeRows.map(({ node, depth }) => (
                <label key={node.id} className="flex cursor-pointer items-center gap-2 py-1 pe-1">
                  <Checkbox
                    checked={selected.includes(node.id)}
                    onCheckedChange={(v) => onChange(toggleTax(selected, node.id, v === true))}
                  />
                  <span
                    className="min-w-0 flex-1 truncate"
                    style={{ paddingInlineStart: `${depth * 0.875}rem` }}
                  >
                    {node.name}
                  </span>
                </label>
              ))
            )
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground px-1 py-1 text-xs">{t('products.editor.taxonomyNoMatch')}</p>
          ) : (
            filtered.map((c) => (
              <label key={c.id} className="flex cursor-pointer items-center gap-2 py-1 pe-1">
                <Checkbox
                  checked={selected.includes(c.id)}
                  onCheckedChange={(v) => onChange(toggleTax(selected, c.id, v === true))}
                />
                <span className="min-w-0 flex-1 truncate">{c.name}</span>
              </label>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
