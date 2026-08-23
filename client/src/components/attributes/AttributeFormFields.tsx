import { ChevronDown, Image as ImageIcon, Palette, Tag, Type } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LazyImage } from '@/components/ui/lazy-image'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { isLightHex } from '@/lib/swatchColor'
import { cn } from '@/lib/utils'
import type { AttributeFormState, AttributeTerm, AttributeType } from '@/types/attributes'

const TYPES: { type: AttributeType; icon: typeof Palette }[] = [
  { type: 'select', icon: ChevronDown },
  { type: 'color', icon: Palette },
  { type: 'image', icon: ImageIcon },
  { type: 'button', icon: Tag },
  { type: 'text', icon: Type },
]

const SAMPLE_COLORS = [
  { name: 'Red', color: '#e11d48' },
  { name: 'White', color: '#ffffff' },
  { name: 'Navy', color: '#1e3a5f' },
]

type AttributeFormFieldsProps = {
  form: AttributeFormState
  onChange: (patch: Partial<AttributeFormState>) => void
  slugAuto: boolean
  onSlugAutoChange: (v: boolean) => void
  previewTerms?: AttributeTerm[]
}

export function AttributeFormFields({
  form,
  onChange,
  slugAuto,
  onSlugAutoChange,
  previewTerms = [],
}: AttributeFormFieldsProps) {
  const { t } = useTranslation()
  const showLabelSwitch = form.type === 'color' || form.type === 'image'

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2">
        <Label>{t('attributes.field.label')}</Label>
        <Input
          value={form.label}
          onChange={(e) => {
            const label = e.target.value
            onChange(slugAuto ? { label, slug: label.trim().toLowerCase().replace(/\s+/g, '-') } : { label })
          }}
        />
      </div>
      <div className="space-y-2">
        <Label>{t('attributes.field.slug')}</Label>
        <Input
          value={form.slug}
          onChange={(e) => {
            onSlugAutoChange(false)
            onChange({ slug: e.target.value })
          }}
        />
      </div>
      <div className="space-y-2">
        <Label>{t('attributes.field.orderBy')}</Label>
        <Select value={form.order_by} onValueChange={(v) => onChange({ order_by: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="menu_order">{t('attributes.orderBy.menu_order')}</SelectItem>
            <SelectItem value="name">{t('attributes.orderBy.name')}</SelectItem>
            <SelectItem value="name_num">{t('attributes.orderBy.name_num')}</SelectItem>
            <SelectItem value="id">{t('attributes.orderBy.id')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 sm:col-span-2">
        <Label>{t('attributes.field.type')}</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {TYPES.map(({ type, icon: Icon }) => {
            const active = form.type === type
            return (
              <button
                key={type}
                type="button"
                onClick={() => onChange({ type })}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-center text-xs transition-colors',
                  active
                    ? 'border-primary bg-primary/5 text-foreground ring-2 ring-primary/20'
                    : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground',
                )}
              >
                <Icon className="size-5" />
                <span className="font-medium">{t(`attributes.type.${type}`)}</span>
                <span className="text-[10px] leading-tight opacity-80">{t(`attributes.typeHint.${type}`)}</span>
              </button>
            )
          })}
        </div>
      </div>

      {showLabelSwitch ? (
        <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-3 sm:col-span-2">
          <label className="flex items-center justify-between gap-3">
            <span className="text-sm">{t('attributes.showSwatchLabel')}</span>
            <Switch
              checked={form.show_swatch_label}
              onCheckedChange={(v) => onChange({ show_swatch_label: v })}
            />
          </label>
          <p className="text-muted-foreground text-xs">{t('attributes.showSwatchLabelHint')}</p>
          <SwatchPreview
            type={form.type}
            showLabel={form.show_swatch_label}
            terms={previewTerms}
          />
        </div>
      ) : null}

      <label className="flex items-center gap-2 sm:col-span-2">
        <Checkbox checked={form.has_archives} onCheckedChange={(v) => onChange({ has_archives: v === true })} />
        <span className="text-sm">{t('attributes.field.hasArchives')}</span>
      </label>
    </div>
  )
}

function SwatchPreview({
  type,
  showLabel,
  terms,
}: {
  type: AttributeType
  showLabel: boolean
  terms: AttributeTerm[]
}) {
  const { t } = useTranslation()
  const colorItems =
    type === 'color'
      ? (terms.filter((term) => term.color).slice(0, 6).length
          ? terms.filter((term) => term.color).slice(0, 6)
          : SAMPLE_COLORS.map((s, i) => ({ id: i, name: t(`attributes.preview.${s.name.toLowerCase()}`, { defaultValue: s.name }), color: s.color })))
      : []
  const imageItems = type === 'image' ? terms.filter((term) => term.image_url).slice(0, 6) : []

  if (type === 'image' && imageItems.length === 0) {
    return <p className="text-muted-foreground text-xs">{t('attributes.preview.addImages')}</p>
  }

  return (
    <div className="flex flex-wrap gap-3">
      {type === 'color'
        ? colorItems.map((item, i) => (
            <span key={'id' in item ? item.id : i} className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  'size-8 rounded-full border-2 border-transparent shadow-sm',
                  isLightHex(item.color) ? 'border-border' : 'border-transparent',
                )}
                style={{ backgroundColor: item.color }}
              />
              {showLabel ? <span className="max-w-16 truncate text-[10px]">{item.name}</span> : null}
            </span>
          ))
        : imageItems.map((term) => (
            <span key={term.id} className="flex flex-col items-center gap-1">
              <LazyImage src={term.image_url!} alt="" className="size-10 rounded-md border object-cover" />
              {showLabel ? <span className="max-w-16 truncate text-[10px]">{term.name}</span> : null}
            </span>
          ))}
    </div>
  )
}
