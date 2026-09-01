import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, ChevronUp, ChevronsUpDown, GripVertical } from 'lucide-react'
import { useMemo, useState, useEffect, useRef, type Dispatch, type SetStateAction } from 'react'
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
import type { AttributeTerm, AttributeType, GlobalAttribute } from '@/types/attributes'
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

type OrderConfigDefaultSelectProps = {
  attributeId: number
  selectedOptionNames: string[]
  value: string
  onChange: (slug: string) => void
}

function resolveDefaultTermSlug(value: string, terms: AttributeTerm[]): string {
  const trimmed = value.trim()
  if (!trimmed || terms.length === 0) {
    return ''
  }
  let decoded = trimmed
  try {
    decoded = decodeURIComponent(trimmed)
  } catch {
    decoded = trimmed
  }
  for (const term of terms) {
    const slug = term.slug ?? ''
    const name = term.name ?? ''
    const id = String(term.id ?? '')
    if (trimmed === slug || trimmed === name || trimmed === id) {
      return slug || id
    }
    if (decoded === slug || decoded === name) {
      return slug || id
    }
  }
  return trimmed
}

function OrderConfigDefaultSelect({
  attributeId,
  selectedOptionNames,
  value,
  onChange,
}: OrderConfigDefaultSelectProps) {
  const { t } = useTranslation()
  const q = useQuery({
    queryKey: ['attributes', attributeId, 'terms'],
    queryFn: () => apiFetch<{ items: AttributeTerm[] }>(`shop/global-attributes/${attributeId}/terms`),
    enabled: attributeId > 0,
  })
  const selected = useMemo(() => new Set(selectedOptionNames.map((s) => s.trim()).filter(Boolean)), [selectedOptionNames])
  const terms = useMemo(() => {
    const items = q.data?.items ?? []
    if (selected.size === 0) return items
    return items.filter(
      (term) =>
        selected.has(term.name) ||
        selected.has(term.slug) ||
        selected.has(String(term.id)),
    )
  }, [q.data?.items, selected])
  const matchedValue = useMemo(() => resolveDefaultTermSlug(value, terms), [value, terms])
  const selectValue = matchedValue || terms[0]?.slug || terms[0]?.id?.toString() || ''
  const seededRef = useRef(false)
  useEffect(() => {
    seededRef.current = false
  }, [attributeId])
  useEffect(() => {
    if (value.trim() !== '' || terms.length === 0) {
      return
    }
    if (seededRef.current) {
      return
    }
    seededRef.current = true
    const first = terms[0]?.slug || (terms[0]?.id != null ? String(terms[0].id) : '')
    if (first) {
      onChange(first)
    }
  }, [value, terms, onChange, attributeId])
  if (terms.length === 0) {
    return (
      <p className="text-muted-foreground text-xs">{t('products.editor.noAttributesSelected')}</p>
    )
  }
  return (
    <div className="space-y-1 sm:col-span-2 sm:ps-12">
      <Label className="text-xs">{t('products.attrOrderConfigDefault')}</Label>
      <Select
        value={selectValue || undefined}
        onValueChange={(next) => {
          const term = terms.find(
            (item) => item.slug === next || String(item.id) === next,
          )
          onChange(term?.slug || term?.id?.toString() || next)
        }}
      >
        <SelectTrigger className="max-w-md">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {terms.map((term) => (
            <SelectItem
              key={term.slug || String(term.id)}
              value={term.slug || String(term.id)}
            >
              {term.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function attributeRowKey(row: AttributeRow): string {
  if (row.attribute_id != null && row.attribute_id > 0) return `id:${row.attribute_id}`
  return `name:${row.name}`
}

type SortableAttributeRowProps = {
  id: string
  row: AttributeRow
  index: number
  total: number
  meta: GlobalAttribute | undefined
  onUpdate: (patch: Partial<AttributeRow>) => void
  onRemove: () => void
  onMove: (delta: number) => void
}

function SortableAttributeRow({
  id,
  row,
  index,
  total,
  meta,
  onUpdate,
  onRemove,
  onMove,
}: SortableAttributeRowProps) {
  const { t } = useTranslation()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const isGlobal = Boolean(meta)
  const selectedTerms = parseOptions(row.options)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-2"
    >
      <div className="flex items-start gap-2 sm:col-span-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 cursor-grab touch-none active:cursor-grabbing"
          aria-label={t('products.editor.dragToReorder')}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4 text-muted-foreground" />
        </Button>
        <div className="flex shrink-0 flex-col gap-0.5">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-7"
            disabled={index === 0}
            onClick={() => onMove(-1)}
            aria-label={t('products.editor.moveUp')}
          >
            <ChevronUp className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-7"
            disabled={index >= total - 1}
            onClick={() => onMove(1)}
            aria-label={t('products.editor.moveDown')}
          >
            <ChevronDown className="size-4" />
          </Button>
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <Label className="text-xs">{t('products.attrNamePlaceholder')}</Label>
          <Input
            value={meta ? meta.label : row.name}
            readOnly
            disabled
            placeholder={t('products.attrNamePlaceholder')}
          />
        </div>
      </div>
      <div className="space-y-1 sm:col-span-2 sm:ps-12">
        <Label className="text-xs">{t('products.attrOptionsPlaceholder')}</Label>
        {isGlobal && meta ? (
          <ProductAttributeTermsPicker
            attributeId={meta.id}
            attributeType={meta.type}
            selected={selectedTerms}
            onChange={(names) =>
              onUpdate({
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
      <div className="flex flex-wrap gap-4 sm:col-span-2 sm:ps-12">
        <label className="flex items-center gap-2 text-xs">
          <Checkbox checked={row.visible} onCheckedChange={(v) => onUpdate({ visible: v === true })} />
          {t('products.attrVisible')}
        </label>
        <label className="flex items-center gap-2 text-xs">
          <Checkbox
            checked={row.variation}
            disabled={Boolean(row.order_config)}
            onCheckedChange={(v) => {
              if (v === true) {
                onUpdate({ variation: true, order_config: false, order_config_default: '' })
              } else {
                onUpdate({ variation: false })
              }
            }}
          />
          {t('products.attrVariation')}
        </label>
        <label className="flex items-center gap-2 text-xs">
          <Checkbox
            checked={Boolean(row.order_config)}
            disabled={row.variation}
            onCheckedChange={(v) => {
              if (v === true) {
                onUpdate({ order_config: true, variation: false })
              } else {
                onUpdate({ order_config: false, order_config_default: '' })
              }
            }}
          />
          {t('products.attrOrderConfig')}
        </label>
        <Button type="button" variant="outline" size="sm" className="ms-auto" onClick={onRemove}>
          {t('common.delete')}
        </Button>
      </div>
      {row.order_config ? (
        <>
          <p className="text-muted-foreground text-xs sm:col-span-2 sm:ps-12">{t('products.attrOrderConfigHint')}</p>
          {isGlobal && meta ? (
            <OrderConfigDefaultSelect
              attributeId={meta.id}
              selectedOptionNames={selectedTerms}
              value={row.order_config_default ?? ''}
              onChange={(slug) => onUpdate({ order_config_default: slug })}
            />
          ) : null}
        </>
      ) : null}
    </div>
  )
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const sortableIds = useMemo(() => attributes.map((row) => attributeRowKey(row)), [attributes])

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

  function updateRow(match: AttributeRow, patch: Partial<AttributeRow>) {
    onChange((prev) =>
      prev.map((row) => (attributeRowKey(row) === attributeRowKey(match) ? { ...row, ...patch } : row)),
    )
  }

  function removeRow(match: AttributeRow) {
    onChange((prev) => prev.filter((row) => attributeRowKey(row) !== attributeRowKey(match)))
  }

  function moveRow(index: number, delta: number) {
    const target = index + delta
    if (target < 0 || target >= attributes.length) return
    onChange((prev) => arrayMove(prev, index, target))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    onChange((prev) => {
      const oldIndex = prev.findIndex((row) => attributeRowKey(row) === active.id)
      const newIndex = prev.findIndex((row) => attributeRowKey(row) === over.id)
      if (oldIndex < 0 || newIndex < 0) return prev
      return arrayMove(prev, oldIndex, newIndex)
    })
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
          {attributes.length > 0 ? (
            <p className="text-muted-foreground text-xs">{t('products.editor.attributesOrderHint')}</p>
          ) : null}

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

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {attributes.map((row, index) => (
                  <SortableAttributeRow
                    key={attributeRowKey(row)}
                    id={attributeRowKey(row)}
                    row={row}
                    index={index}
                    total={attributes.length}
                    meta={globalMeta(row)}
                    onUpdate={(patch) => updateRow(row, patch)}
                    onRemove={() => removeRow(row)}
                    onMove={(delta) => moveRow(index, delta)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
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
