import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { ProductAttributeTermsPicker } from '@/components/products/editor/ProductAttributeTermsPicker'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { apiFetch } from '@/lib/api'
import type { GlobalAttribute } from '@/types/attributes'
import type { AttributeRow } from '@/types/product'

type ProductAttributesPanelProps = {
  attributes: AttributeRow[]
  onChange: (rows: AttributeRow[]) => void
}

function emptyRow(): AttributeRow {
  return { name: '', options: '', variation: false, visible: true }
}

function parseOptions(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function joinOptions(values: string[]): string {
  return values.join(', ')
}

export function ProductAttributesPanel({ attributes, onChange }: ProductAttributesPanelProps) {
  const { t } = useTranslation()

  const globalQ = useQuery({
    queryKey: ['attributes'],
    queryFn: () => apiFetch<{ items: GlobalAttribute[] }>('shop/attributes'),
  })

  const globalItems = globalQ.data?.items ?? []

  function updateRow(idx: number, patch: Partial<AttributeRow>) {
    const next = [...attributes]
    next[idx] = { ...next[idx], ...patch }
    onChange(next)
  }

  function addFromGlobal(attrId: string) {
    const ga = globalItems.find((a) => String(a.id) === attrId)
    if (!ga) return
    const name = ga.slug ? `pa_${ga.slug}` : ga.label
    if (attributes.some((r) => r.name === name)) return
    onChange([
      ...attributes.filter((r) => r.name.trim() || r.options.trim()),
      {
        name,
        options: '',
        variation: false,
        visible: true,
        attribute_id: ga.id,
        taxonomy: true,
      },
    ])
  }

  function globalMeta(row: AttributeRow): GlobalAttribute | undefined {
    if (!row.attribute_id) return undefined
    return globalItems.find((a) => a.id === row.attribute_id)
  }

  return (
    <Card className="gap-4 py-4 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between px-4 pb-0">
        <CardTitle className="text-sm font-semibold">{t('products.editor.attributesPanel')}</CardTitle>
        <Button type="button" variant="link" size="sm" className="h-auto px-0" asChild>
          <Link to="/shop/attributes">{t('products.editor.manageAttributes')}</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 px-4">
        {globalItems.length > 0 ? (
          <div className="space-y-2">
            <Label>{t('products.editor.addGlobalAttribute')}</Label>
            <Select onValueChange={addFromGlobal}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('products.editor.selectAttribute')} />
              </SelectTrigger>
              <SelectContent>
                {globalItems.map((ga) => (
                  <SelectItem key={ga.id} value={String(ga.id)}>
                    {ga.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        {attributes.map((row, idx) => {
          const meta = globalMeta(row)
          const isGlobal = Boolean(row.taxonomy && row.attribute_id && meta)
          const selectedTerms = parseOptions(row.options)

          return (
            <div key={idx} className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">{t('products.attrNamePlaceholder')}</Label>
                <Input
                  value={isGlobal && meta ? meta.label : row.name}
                  onChange={(e) => updateRow(idx, { name: e.target.value })}
                  placeholder={t('products.attrNamePlaceholder')}
                  disabled={Boolean(row.taxonomy)}
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">{t('products.attrOptionsPlaceholder')}</Label>
                {isGlobal && meta ? (
                  <ProductAttributeTermsPicker
                    attributeId={meta.id}
                    attributeType={meta.type}
                    selected={selectedTerms}
                    onChange={(names) => updateRow(idx, { options: joinOptions(names) })}
                  />
                ) : (
                  <Input
                    value={row.options}
                    onChange={(e) => updateRow(idx, { options: e.target.value })}
                    placeholder={t('products.attrOptionsPlaceholder')}
                  />
                )}
              </div>
              <div className="flex flex-wrap gap-4 sm:col-span-2">
                <label className="flex items-center gap-2 text-xs">
                  <Checkbox checked={row.visible} onCheckedChange={(v) => updateRow(idx, { visible: v === true })} />
                  {t('products.attrVisible')}
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <Checkbox
                    checked={row.variation}
                    onCheckedChange={(v) => updateRow(idx, { variation: v === true })}
                  />
                  {t('products.attrVariation')}
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="ms-auto"
                  onClick={() => onChange(attributes.filter((_, i) => i !== idx))}
                >
                  {t('common.delete')}
                </Button>
              </div>
            </div>
          )
        })}

        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...attributes, emptyRow()])}>
          {t('products.addAttributeRow')}
        </Button>
      </CardContent>
    </Card>
  )
}
