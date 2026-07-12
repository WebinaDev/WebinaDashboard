import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { Checkbox } from '@/components/ui/checkbox'
import { LazyImage } from '@/components/ui/lazy-image'
import { apiFetch } from '@/lib/api'
import type { AttributeTerm, AttributeType } from '@/types/attributes'

type ProductAttributeTermsPickerProps = {
  attributeId: number
  attributeType: AttributeType
  selected: string[]
  onChange: (names: string[]) => void
}

export function ProductAttributeTermsPicker({
  attributeId,
  attributeType,
  selected,
  onChange,
}: ProductAttributeTermsPickerProps) {
  const { t } = useTranslation()
  const q = useQuery({
    queryKey: ['attributes', attributeId, 'terms'],
    queryFn: () => apiFetch<{ items: AttributeTerm[] }>(`shop/global-attributes/${attributeId}/terms`),
    enabled: attributeId > 0,
  })

  const terms = q.data?.items ?? []
  if (q.isLoading) {
    return <p className="text-muted-foreground text-xs">{t('common.loading')}</p>
  }
  if (terms.length === 0) {
    return <p className="text-muted-foreground text-xs">{t('attributes.terms.empty')}</p>
  }

  function toggle(name: string) {
    if (selected.includes(name)) {
      onChange(selected.filter((n) => n !== name))
    } else {
      onChange([...selected, name])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {terms.map((term) => {
        const active = selected.includes(term.name)
        if (attributeType === 'color' && term.color) {
          return (
            <button
              key={term.id}
              type="button"
              title={term.name}
              className={`size-8 rounded-full border-2 ${active ? 'border-primary ring-2 ring-primary/30' : 'border-border'}`}
              style={{ backgroundColor: term.color }}
              onClick={() => toggle(term.name)}
            />
          )
        }
        if (attributeType === 'image' && term.image_url) {
          return (
            <button
              key={term.id}
              type="button"
              title={term.name}
              className={`overflow-hidden rounded-md border-2 ${active ? 'border-primary ring-2 ring-primary/30' : 'border-border'}`}
              onClick={() => toggle(term.name)}
            >
              <LazyImage src={term.image_url} alt={term.name} className="size-8 object-cover" />
            </button>
          )
        }
        return (
          <label key={term.id} className="flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-xs">
            <Checkbox checked={active} onCheckedChange={() => toggle(term.name)} />
            {term.name}
          </label>
        )
      })}
    </div>
  )
}
