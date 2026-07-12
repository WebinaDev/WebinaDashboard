import { useTranslation } from 'react-i18next'

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
import type { AttributeFormState, AttributeType } from '@/types/attributes'

const TYPES: AttributeType[] = ['select', 'text', 'color', 'image', 'button']

type AttributeFormFieldsProps = {
  form: AttributeFormState
  onChange: (patch: Partial<AttributeFormState>) => void
  slugAuto: boolean
  onSlugAutoChange: (v: boolean) => void
  typeLocked?: boolean
}

export function AttributeFormFields({ form, onChange, slugAuto, onSlugAutoChange, typeLocked }: AttributeFormFieldsProps) {
  const { t } = useTranslation()

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
        <Label>{t('attributes.field.type')}</Label>
        <Select
          value={form.type}
          disabled={typeLocked}
          onValueChange={(v) => onChange({ type: v as AttributeType })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {t(`attributes.type.${type}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {typeLocked ? <p className="text-muted-foreground text-xs">{t('attributes.typeLockedHint')}</p> : null}
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
      <label className="flex items-center gap-2 sm:col-span-2">
        <Checkbox checked={form.has_archives} onCheckedChange={(v) => onChange({ has_archives: v === true })} />
        <span className="text-sm">{t('attributes.field.hasArchives')}</span>
      </label>
    </div>
  )
}
