import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronsUpDown } from 'lucide-react'
import { useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { ProductAttributeGroupsPanel } from '@/components/products/editor/ProductAttributeGroupsPanel'
import { ProductAttributeTermsPicker } from '@/components/products/editor/ProductAttributeTermsPicker'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { apiFetch } from '@/lib/api'
import { slugifyFromName } from '@/lib/categoryTree'
import type { AttributeType, GlobalAttribute } from '@/types/attributes'
import type { AttributeRow } from '@/types/product'

type ProductAttributesPanelProps = {
  attributes: AttributeRow[]
  onChange: Dispatch<SetStateAction<AttributeRow[]>>
  productType?: 'simple' | 'variable'
}

const CREATE_TYPES: AttributeType[] = ['select', 'text', 'color', 'image', 'button']

function parseOptions(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function joinOptions(values: string[]): string {
  return values.join(', ')
}

export function ProductAttributesPanel({
  attributes,
  onChange,
  productType = 'simple',
}: ProductAttributesPanelProps) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<AttributeType>('select')

  const globalQ = useQuery({
    queryKey: ['attributes'],
    queryFn: () => apiFetch<{ items: GlobalAttribute[] }>('shop/attributes'),
  })

  const globalItems = globalQ.data?.items ?? []

  const selectedIds = useMemo(
    () => new Set(attributes.map((r) => r.attribute_id).filter((id): id is number => Boolean(id))),
    [attributes],
  )

  const available = useMemo(
    () =>
      globalItems.filter((ga) => {
        if (selectedIds.has(ga.id)) return false
        const name = ga.slug ? `pa_${ga.slug}` : ga.label
        return !attributes.some((r) => r.name === name)
      }),
    [globalItems, selectedIds, attributes],
  )

  const createAttr = useMutation({
    mutationFn: async () => {
      const label = newName.trim()
      if (!label) throw new Error('Name required')
      return apiFetch<GlobalAttribute>('shop/global-attributes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: label,
          slug: slugifyFromName(label),
          type: newType,
          order_by: 'menu_order',
          has_archives: false,
        }),
      })
    },
    onSuccess: (ga) => {
      toast.success(t('common.saved'))
      setNewName('')
      setNewType('select')
      setCreateOpen(false)
      void qc.invalidateQueries({ queryKey: ['attributes'] })
      addAttribute(ga)
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  function rowKey(row: AttributeRow): string {
    if (row.attribute_id != null && row.attribute_id > 0) return `id:${row.attribute_id}`
    return `name:${row.name}`
  }

  function updateRow(match: AttributeRow, patch: Partial<AttributeRow>) {
    onChange((prev) =>
      prev.map((row) => (rowKey(row) === rowKey(match) ? { ...row, ...patch } : row)),
    )
  }

  function removeRow(match: AttributeRow) {
    onChange((prev) => prev.filter((row) => rowKey(row) !== rowKey(match)))
  }

  function addAttribute(ga: GlobalAttribute) {
    const name = ga.slug ? `pa_${ga.slug}` : ga.label
    onChange((prev) => {
      if (prev.some((r) => r.name === name || r.attribute_id === ga.id)) return prev
      return [
        ...prev,
        {
          name,
          options: '',
          variation: productType === 'variable',
          visible: true,
          attribute_id: ga.id,
          taxonomy: true,
        },
      ]
    })
    setPickerOpen(false)
  }

  function globalMeta(row: AttributeRow): GlobalAttribute | undefined {
    if (row.attribute_id) {
      const byId = globalItems.find((a) => a.id === row.attribute_id)
      if (byId) return byId
    }
    const slug = row.name.startsWith('pa_') ? row.name.slice(3) : ''
    if (slug) {
      return globalItems.find((a) => a.slug === slug || a.taxonomy === row.name)
    }
    return globalItems.find((a) => a.label === row.name)
  }

  return (
    <div className="space-y-3">
      <Card className="gap-4 py-4 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between px-4 pb-0">
        <CardTitle className="text-sm font-semibold">{t('products.editor.attributesPanel')}</CardTitle>
        <Button type="button" variant="link" size="sm" className="h-auto px-0" asChild>
          <Link to="/shop/attributes">{t('products.editor.manageAttributes')}</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 px-4">
        <div className="space-y-2">
          <Label>{t('products.editor.addGlobalAttribute')}</Label>
          <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" className="w-full justify-between font-normal">
                {t('products.editor.selectAttribute')}
                <ChevronsUpDown className="size-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command>
                <CommandInput placeholder={t('products.editor.searchAttributes')} />
                <CommandList>
                  <CommandEmpty>{t('common.noResults')}</CommandEmpty>
                  <CommandGroup>
                    {available.map((ga) => (
                      <CommandItem
                        key={ga.id}
                        value={`${ga.label} ${ga.slug}`}
                        onSelect={() => addAttribute(ga)}
                      >
                        {ga.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <Collapsible open={createOpen} onOpenChange={setCreateOpen}>
          <CollapsibleTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="h-8 px-0">
              {t('products.editor.createGlobalAttribute')}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pt-2">
            <div className="grid gap-2 sm:grid-cols-[1fr_8rem_auto]">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t('attributes.field.label')}
              />
              <Select value={newType} onValueChange={(v) => setNewType(v as AttributeType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CREATE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`attributes.type.${type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!newName.trim() || createAttr.isPending}
                onClick={() => createAttr.mutate()}
              >
                {t('products.addAttributeRow')}
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">{t('products.editor.globalOnlyHint')}</p>
          </CollapsibleContent>
        </Collapsible>

        {attributes.length === 0 ? (
          <p className="text-muted-foreground text-xs">{t('products.editor.noAttributesSelected')}</p>
        ) : null}

        {attributes.map((row) => {
          const meta = globalMeta(row)
          const isGlobal = Boolean(meta)
          const selectedTerms = parseOptions(row.options)

          return (
            <div
              key={rowKey(row)}
              className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-2"
            >
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">{t('products.attrNamePlaceholder')}</Label>
                <Input
                  value={meta ? meta.label : row.name}
                  readOnly
                  disabled
                  placeholder={t('products.attrNamePlaceholder')}
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">{t('products.attrOptionsPlaceholder')}</Label>
                {isGlobal && meta ? (
                  <ProductAttributeTermsPicker
                    attributeId={meta.id}
                    attributeType={meta.type}
                    selected={selectedTerms}
                    onChange={(names) =>
                      updateRow(row, {
                        options: joinOptions(names),
                        attribute_id: meta.id,
                        taxonomy: true,
                        name: meta.slug ? `pa_${meta.slug}` : row.name,
                      })
                    }
                  />
                ) : (
                  <p className="text-muted-foreground text-xs">{t('products.editor.legacyAttributeHint')}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-4 sm:col-span-2">
                <label className="flex items-center gap-2 text-xs">
                  <Checkbox checked={row.visible} onCheckedChange={(v) => updateRow(row, { visible: v === true })} />
                  {t('products.attrVisible')}
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <Checkbox
                    checked={row.variation}
                    onCheckedChange={(v) => updateRow(row, { variation: v === true })}
                  />
                  {t('products.attrVariation')}
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="ms-auto"
                  onClick={() => removeRow(row)}
                >
                  {t('common.delete')}
                </Button>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
      <ProductAttributeGroupsPanel
        attributes={attributes}
        globalItems={globalItems}
        productType={productType}
        onChange={onChange}
      />
    </div>
  )
}
