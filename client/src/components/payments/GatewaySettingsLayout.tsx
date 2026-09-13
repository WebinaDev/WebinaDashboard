import { Copy } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

export type GatewayMetaChip = {
  label: string
  value: string
  copyable?: boolean
}

export type GatewaySection = {
  id: string
  title: string
  description?: string
  children: ReactNode
}

type GatewaySettingsLayoutProps = {
  title: string
  description?: string
  notice?: ReactNode
  meta?: GatewayMetaChip[]
  sections: GatewaySection[]
  actions?: ReactNode
  children?: ReactNode
}

export function GatewaySettingsLayout({
  title,
  description,
  notice,
  meta,
  sections,
  actions,
  children,
}: GatewaySettingsLayoutProps) {
  const { t } = useTranslation()

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      toast.success(t('common.copied', { defaultValue: 'Copied' }))
    } catch {
      toast.error(t('common.copyFailed', { defaultValue: 'Copy failed' }))
    }
  }

  return (
    <PageShell title={title} description={description}>
      <div className="mx-auto w-full max-w-6xl space-y-6">
        {notice}

        {children}

        {meta && meta.length > 0 ? (
          <div className="bg-muted/30 grid gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3">
            {meta.map((chip) => (
              <div key={chip.label} className="min-w-0 space-y-1">
                <p className="text-muted-foreground text-xs font-medium">{chip.label}</p>
                <div className="flex items-start gap-2">
                  <code className="bg-background block min-w-0 flex-1 truncate rounded-md border px-2 py-1.5 text-xs">
                    {chip.value || '—'}
                  </code>
                  {chip.copyable && chip.value ? (
                    <Button type="button" size="icon" variant="outline" className="size-8 shrink-0" onClick={() => void copy(chip.value)}>
                      <Copy className="size-3.5" />
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {sections.length > 1 ? (
          <nav className="flex flex-wrap gap-2" aria-label={title}>
            {sections.map((s) => (
              <Button key={s.id} asChild size="sm" variant="outline">
                <a href={`#${s.id}`}>{s.title}</a>
              </Button>
            ))}
          </nav>
        ) : null}

        <div className="space-y-5">
          {sections.map((s) => (
            <Card key={s.id} id={s.id} className="scroll-mt-24">
              <CardHeader>
                <CardTitle className="text-base">{s.title}</CardTitle>
                {s.description ? <CardDescription>{s.description}</CardDescription> : null}
              </CardHeader>
              <CardContent>{s.children}</CardContent>
            </Card>
          ))}
        </div>

        {actions ? (
          <div className="bg-background/95 sticky bottom-3 z-10 flex flex-wrap gap-2 rounded-xl border p-3 shadow-sm backdrop-blur">
            {actions}
          </div>
        ) : null}
      </div>
    </PageShell>
  )
}

export function GatewayField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  hint,
  className,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  hint?: string
  className?: string
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label>{label}</Label>
      <Input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
    </div>
  )
}

export function GatewayTextArea({
  label,
  value,
  onChange,
  hint,
  className,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  hint?: string
  className?: string
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label>{label}</Label>
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} />
      {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
    </div>
  )
}

export function GatewaySwitchRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border/70 px-3 py-3">
      <div className="min-w-0 space-y-0.5">
        <p className="text-sm font-medium leading-snug">{label}</p>
        {description ? <p className="text-muted-foreground text-xs leading-relaxed">{description}</p> : null}
      </div>
      <Switch checked={checked} onCheckedChange={(v) => onChange(Boolean(v))} className="mt-0.5 shrink-0" />
    </div>
  )
}

export function GatewayFieldsGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>
}

export function GatewaySwitchGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 md:grid-cols-2">{children}</div>
}
