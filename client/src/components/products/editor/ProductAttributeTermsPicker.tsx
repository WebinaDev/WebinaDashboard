import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { AttributeTermColorField } from '@/components/attributes/AttributeTermColorField'
import { AttributeTermImageField } from '@/components/attributes/AttributeTermImageField'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { LazyImage } from '@/components/ui/lazy-image'
import { apiFetch } from '@/lib/api'
import { slugifyFromName } from '@/lib/categoryTree'
import { isLightHex } from '@/lib/swatchColor'
import { cn } from '@/lib/utils'
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
  const qc = useQueryClient()
  const [termName, setTermName] = useState('')
  const [termColor, setTermColor] = useState('#000000')
  const [termImage, setTermImage] = useState({ id: 0, url: '' })
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')

  const q = useQuery({
    queryKey: ['attributes', attributeId, 'terms'],
    queryFn: () => apiFetch<{ items: AttributeTerm[] }>(`shop/global-attributes/${attributeId}/terms`),
    enabled: attributeId > 0,
  })

  const createTerm = useMutation({
    mutationFn: async () => {
      const name = termName.trim()
      if (!name) throw new Error('Name required')
      const payload: Record<string, unknown> = {
        name,
        slug: slugifyFromName(name),
      }
      if (attributeType === 'color') {
        payload.color = termColor
      }
      if (attributeType === 'image') {
        payload.image_id = termImage.id
      }
      return apiFetch<{ id: number; item: AttributeTerm | null }>(`shop/global-attributes/${attributeId}/terms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    },
    onSuccess: (res) => {
      toast.success(t('common.saved'))
      setTermName('')
      setTermColor('#000000')
      setTermImage({ id: 0, url: '' })
      setShowAdd(false)
      void qc.invalidateQueries({ queryKey: ['attributes', attributeId, 'terms'] })
      void qc.invalidateQueries({ queryKey: ['attributes'] })
      const item = res.item
      if (item?.name) {
        const already =
          selected.includes(item.name) ||
          selected.includes(item.slug) ||
          selected.includes(String(item.id))
        if (!already) {
          onChange([...selected, item.name])
        }
      }
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const terms = q.data?.items ?? []
  const selectedSet = useMemo(() => new Set(selected.map(String)), [selected])

  function isSelected(term: AttributeTerm): boolean {
    return (
      selectedSet.has(term.name) ||
      selectedSet.has(term.slug) ||
      selectedSet.has(String(term.id))
    )
  }

  const filtered = useMemo(() => {
    const qstr = search.trim().toLowerCase()
    if (!qstr) return terms
    return terms.filter((term) => term.name.toLowerCase().includes(qstr) || term.slug.toLowerCase().includes(qstr))
  }, [terms, search])

  function toggle(term: AttributeTerm) {
    if (isSelected(term)) {
      onChange(
        selected.filter(
          (n) => n !== term.name && n !== term.slug && String(n) !== String(term.id),
        ),
      )
    } else {
      onChange([...selected, term.name])
    }
  }

  return (
    <div className="space-y-3">
      {q.isLoading ? (
        <p className="text-muted-foreground text-xs">{t('common.loading')}</p>
      ) : (
        <>
          {terms.length > 4 ? (
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('products.editor.searchTerms')}
              className="h-8"
            />
          ) : null}
          {filtered.length === 0 ? (
            <p className="text-muted-foreground text-xs">
              {terms.length === 0 ? t('attributes.terms.empty') : t('common.noResults')}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {filtered.map((term) => {
                const active = isSelected(term)
                if (attributeType === 'color') {
                  return (
                    <button
                      key={term.id}
                      type="button"
                      title={term.name}
                      className={cn(
                        'flex flex-col items-center gap-1 rounded-lg p-1',
                        active ? 'ring-2 ring-primary/40' : '',
                      )}
                      onClick={() => toggle(term)}
                    >
                      <span
                        className={cn(
                          'size-8 rounded-full border-2',
                          active ? 'border-primary' : 'border-transparent',
                          isLightHex(term.color) ? 'shadow-[0_0_0_1px_rgba(15,23,42,0.25)]' : '',
                        )}
                        style={{ backgroundColor: term.color || '#e5e7eb' }}
                      />
                      <span className="max-w-16 truncate text-[10px]">{term.name}</span>
                    </button>
                  )
                }
                if (attributeType === 'image') {
                  return (
                    <button
                      key={term.id}
                      type="button"
                      title={term.name}
                      className={cn(
                        'flex flex-col items-center gap-1 rounded-lg p-1',
                        active ? 'ring-2 ring-primary/40' : '',
                      )}
                      onClick={() => toggle(term)}
                    >
                      {term.image_url ? (
                        <LazyImage
                          src={term.image_url}
                          alt={term.name}
                          className={cn('size-10 rounded-md object-cover', active ? 'ring-2 ring-primary' : 'ring-1 ring-border')}
                        />
                      ) : (
                        <span className="bg-muted size-10 rounded-md" />
                      )}
                      <span className="max-w-16 truncate text-[10px]">{term.name}</span>
                    </button>
                  )
                }
                if (attributeType === 'button') {
                  return (
                    <button
                      key={term.id}
                      type="button"
                      className={cn(
                        'rounded-md border px-2.5 py-1 text-xs font-medium',
                        active ? 'border-primary bg-primary/10' : 'border-border',
                      )}
                      onClick={() => toggle(term)}
                    >
                      {term.name}
                    </button>
                  )
                }
                return (
                  <label
                    key={term.id}
                    className="flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-xs"
                  >
                    <Checkbox checked={active} onCheckedChange={() => toggle(term)} />
                    {term.name}
                  </label>
                )
              })}
            </div>
          )}
        </>
      )}

      {showAdd ? (
        <div className="space-y-2 rounded-md border border-dashed border-border p-2">
          <Input
            value={termName}
            onChange={(e) => setTermName(e.target.value)}
            placeholder={t('attributes.terms.name')}
          />
          {attributeType === 'color' ? (
            <AttributeTermColorField value={termColor} onChange={setTermColor} />
          ) : null}
          {attributeType === 'image' ? (
            <AttributeTermImageField
              imageId={termImage.id}
              imageUrl={termImage.url}
              onChange={(item) => setTermImage({ id: item.id, url: item.url })}
              onRemove={() => setTermImage({ id: 0, url: '' })}
            />
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={!termName.trim() || createTerm.isPending || (attributeType === 'image' && termImage.id < 1)}
              onClick={() => createTerm.mutate()}
            >
              {t('attributes.terms.add')}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setShowAdd(false)}>
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={() => setShowAdd(true)}>
          {t('attributes.terms.add')}
        </Button>
      )}
    </div>
  )
}
