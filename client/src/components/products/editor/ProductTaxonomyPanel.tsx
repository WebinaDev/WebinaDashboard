import { useTranslation } from 'react-i18next'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckboxListSkeleton } from '@/components/skeletons/CheckboxListSkeleton'
import { Checkbox } from '@/components/ui/checkbox'

type TaxItem = { id: number; name: string }

type ProductTaxonomyPanelProps = {
  titleKey: string
  emptyKey: string
  items: TaxItem[]
  loading: boolean
  selected: number[]
  onChange: (ids: number[]) => void
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
}: ProductTaxonomyPanelProps) {
  const { t } = useTranslation()

  return (
    <Card className="gap-4 py-4 shadow-sm">
      <CardHeader className="px-4 pb-0">
        <CardTitle className="text-sm font-semibold">{t(titleKey)}</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <div className="max-h-48 overflow-y-auto rounded-md border border-border p-2 text-sm">
          {loading ? (
            <CheckboxListSkeleton rows={5} />
          ) : items.length === 0 ? (
            <p className="text-muted-foreground">{t(emptyKey)}</p>
          ) : (
            items.map((c) => (
              <label key={c.id} className="flex cursor-pointer items-center gap-2 py-1">
                <Checkbox
                  checked={selected.includes(c.id)}
                  onCheckedChange={(v) => onChange(toggleTax(selected, c.id, v === true))}
                />
                <span>{c.name}</span>
              </label>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
