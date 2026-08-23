import { useTranslation } from 'react-i18next'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isLightHex } from '@/lib/swatchColor'
import { cn } from '@/lib/utils'

type AttributeTermColorFieldProps = {
  value: string
  onChange: (color: string) => void
}

export function AttributeTermColorField({ value, onChange }: AttributeTermColorFieldProps) {
  const { t } = useTranslation()
  const hex = value && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value) ? (value.length === 4 ? expandHex(value) : value) : '#000000'

  return (
    <div className="space-y-2">
      <Label>{t('attributes.terms.color')}</Label>
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative cursor-pointer">
          <span
            className={cn(
              'block size-16 rounded-full shadow-inner',
              isLightHex(hex) ? 'border border-border' : 'border border-transparent',
            )}
            style={{ backgroundColor: hex }}
          />
          <input
            type="color"
            value={hex}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label={t('attributes.terms.color')}
          />
        </label>
        <div className="min-w-[8rem] flex-1 space-y-1">
          <Label className="text-muted-foreground text-xs">Hex</Label>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t('attributes.terms.colorPlaceholder')}
            dir="ltr"
            className="font-mono"
          />
        </div>
      </div>
    </div>
  )
}

function expandHex(short: string): string {
  const h = short.slice(1)
  return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`
}
