import type { ReactNode } from 'react'

import type { WcSettingsField, WcSettingsResponse } from '@/components/settings/wc-settings-types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

/** Radix forbids SelectItem value=""; WC often uses "" as a placeholder option. */
const WC_EMPTY_SELECT_VALUE = '__wc_empty__'

function toSelectValue(raw: unknown): string {
  const s = String(raw ?? '')
  return s === '' ? WC_EMPTY_SELECT_VALUE : s
}

function fromSelectValue(v: string): string {
  return v === WC_EMPTY_SELECT_VALUE ? '' : v
}

type WcSettingsFormRendererProps = {
  fields: WcSettingsField[]
  values: Record<string, unknown>
  onChange: (id: string, value: unknown) => void
  disabled?: boolean
}

type FieldGroup = {
  key: string
  title?: string
  desc?: string
  fields: WcSettingsField[]
}

function groupFields(fields: WcSettingsField[]): FieldGroup[] {
  const groups: FieldGroup[] = []
  let current: FieldGroup = { key: 'general', fields: [] }

  for (const field of fields) {
    if (field.type === 'title') {
      if (current.fields.length > 0 || current.title) {
        groups.push(current)
      }
      current = {
        key: `title-${groups.length}-${field.title ?? ''}`,
        title: field.title,
        desc: field.desc,
        fields: [],
      }
      continue
    }
    current.fields.push(field)
  }
  if (current.fields.length > 0 || current.title) {
    groups.push(current)
  }
  return groups.length ? groups : [{ key: 'general', fields }]
}

function renderField(
  field: WcSettingsField,
  values: Record<string, unknown>,
  onChange: (id: string, value: unknown) => void,
  disabled?: boolean,
): ReactNode {
  const id = field.id
  if (!id) return null
  const value = values[id]

  if (field.type === 'checkbox') {
    return (
      <div key={id} className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/40 px-3 py-3">
        <Checkbox
          id={id}
          checked={value === true || value === 'yes'}
          disabled={disabled}
          onCheckedChange={(v) => onChange(id, v === true)}
          className="mt-0.5"
        />
        <div className="grid min-w-0 flex-1 gap-1">
          <Label htmlFor={id} className="cursor-pointer font-medium">
            {field.title || id}
          </Label>
          {field.desc ? <p className="text-muted-foreground text-xs leading-relaxed">{field.desc}</p> : null}
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
          className="w-full min-h-24"
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
        <Select value={toSelectValue(value)} disabled={disabled} onValueChange={(v) => onChange(id, fromSelectValue(v))}>
          <SelectTrigger id={id} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(opts).map(([k, label]) => {
              const itemValue = k === '' ? WC_EMPTY_SELECT_VALUE : k
              return (
                <SelectItem key={itemValue} value={itemValue}>
                  {label}
                </SelectItem>
              )
            })}
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
        className="w-full"
      />
      {field.desc ? <p className="text-muted-foreground text-xs">{field.desc}</p> : null}
    </div>
  )
}

export function WcSettingsFormRenderer({ fields, values, onChange, disabled }: WcSettingsFormRendererProps) {
  const groups = groupFields(fields)

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <Card key={group.key} variant="glass" className="overflow-hidden">
          {group.title || group.desc ? (
            <CardHeader className="border-b border-border/50 pb-3">
              {group.title ? <CardTitle className="text-base">{group.title}</CardTitle> : null}
              {group.desc ? <CardDescription>{group.desc}</CardDescription> : null}
            </CardHeader>
          ) : null}
          <CardContent className={`space-y-4 ${group.title || group.desc ? 'pt-5' : 'pt-6'}`}>
            {group.fields.map((field) => renderField(field, values, onChange, disabled))}
          </CardContent>
        </Card>
      ))}
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
