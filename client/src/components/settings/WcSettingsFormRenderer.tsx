import type { WcSettingsField, WcSettingsResponse } from '@/components/settings/wc-settings-types'
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
import { Textarea } from '@/components/ui/textarea'

type WcSettingsFormRendererProps = {
  fields: WcSettingsField[]
  values: Record<string, unknown>
  onChange: (id: string, value: unknown) => void
  disabled?: boolean
}

export function WcSettingsFormRenderer({ fields, values, onChange, disabled }: WcSettingsFormRendererProps) {
  return (
    <div className="space-y-6">
      {fields.map((field, idx) => {
        if (field.type === 'title') {
          return (
            <div key={`title-${idx}`} className="border-t border-border pt-4 first:border-0 first:pt-0">
              {field.title ? <p className="text-sm font-semibold">{field.title}</p> : null}
              {field.desc ? <p className="text-muted-foreground mt-1 text-xs">{field.desc}</p> : null}
            </div>
          )
        }

        const id = field.id
        if (!id) return null
        const value = values[id]

        if (field.type === 'checkbox') {
          return (
            <div key={id} className="flex items-start gap-2">
              <Checkbox
                id={id}
                checked={value === true || value === 'yes'}
                disabled={disabled}
                onCheckedChange={(v) => onChange(id, v === true)}
              />
              <div className="grid gap-1">
                <Label htmlFor={id} className="cursor-pointer font-normal">
                  {field.title || id}
                </Label>
                {field.desc ? <p className="text-muted-foreground text-xs">{field.desc}</p> : null}
              </div>
            </div>
          )
        }

        if (field.type === 'textarea') {
          return (
            <div key={id} className="space-y-2">
              <Label htmlFor={id}>{field.title || id}</Label>
              <Textarea
                id={id}
                value={String(value ?? '')}
                disabled={disabled}
                onChange={(e) => onChange(id, e.target.value)}
              />
              {field.desc ? <p className="text-muted-foreground text-xs">{field.desc}</p> : null}
            </div>
          )
        }

        if (field.type === 'select' || field.type === 'single_select_country') {
          const opts = field.options ?? {}
          return (
            <div key={id} className="space-y-2">
              <Label htmlFor={id}>{field.title || id}</Label>
              <Select value={String(value ?? '')} disabled={disabled} onValueChange={(v) => onChange(id, v)}>
                <SelectTrigger id={id} className="max-w-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(opts).map(([k, label]) => (
                    <SelectItem key={k} value={k}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.desc ? <p className="text-muted-foreground text-xs">{field.desc}</p> : null}
            </div>
          )
        }

        return (
          <div key={id} className="space-y-2">
            <Label htmlFor={id}>{field.title || id}</Label>
            <Input
              id={id}
              value={String(value ?? '')}
              disabled={disabled}
              onChange={(e) => onChange(id, e.target.value)}
              className="max-w-md"
            />
            {field.desc ? <p className="text-muted-foreground text-xs">{field.desc}</p> : null}
          </div>
        )
      })}
    </div>
  )
}

export function wcValuesToPayload(values: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(values)) {
    out[k] = typeof v === 'boolean' ? v : v
  }
  return out
}

export type { WcSettingsResponse }
