import { useTranslation } from 'react-i18next'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type AttributeTermColorFieldProps = {
  value: string
  onChange: (color: string) => void
}

export function AttributeTermColorField({ value, onChange }: AttributeTermColorFieldProps) {
  const { t } = useTranslation()
  const hex = value && value.startsWith('#') ? value : '#000000'

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-2">
        <Label>{t('attributes.terms.color')}</Label>
        <input
          type="color"
          value={hex}
          onChange={(e) => onChange(e.target.value)}
          className="border-input bg-background h-10 w-14 cursor-pointer rounded-md border p-1"
        />
      </div>
      <div className="min-w-[8rem] flex-1 space-y-2">
        <Label>Hex</Label>
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={t('attributes.terms.colorPlaceholder')} />
      </div>
    </div>
  )
}
