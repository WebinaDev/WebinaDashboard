import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { WcSettingsFormRenderer } from '@/components/settings/WcSettingsFormRenderer'
import type { EmailSettingsRow, WcSettingsField } from '@/components/settings/wc-settings-types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'
import { cn } from '@/lib/utils'

type EmailsResponse = {
  emails: EmailSettingsRow[]
  global: { fields: WcSettingsField[]; values: Record<string, unknown> } | null
}

export function WcEmailsPanel() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Record<string, unknown>>({})
  const [enabled, setEnabled] = useState(false)
  const [globalDraft, setGlobalDraft] = useState<Record<string, unknown>>({})

  const q = useQuery({
    queryKey: ['email-settings'],
    queryFn: () => apiFetch<EmailsResponse>('shop/email-settings'),
  })
  useQueryErrorToast(q)

  const emails = q.data?.emails ?? []
  const active = emails.find((e) => e.id === activeId) ?? emails[0]

  useEffect(() => {
    if (active) {
      setActiveId(active.id)
      setDraft({ ...active.settings })
      setEnabled(active.enabled)
    }
  }, [active?.id, q.data])

  useEffect(() => {
    if (q.data?.global?.values) setGlobalDraft({ ...q.data.global.values })
  }, [q.data?.global?.values])

  const saveEmail = useMutation({
    mutationFn: () =>
      apiFetch(`shop/email-settings/${active?.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, settings: draft }),
      }),
    onSuccess: () => {
      toast.success(t('common.saved'))
      void qc.invalidateQueries({ queryKey: ['email-settings'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const saveGlobal = useMutation({
    mutationFn: () =>
      apiFetch('shop/wc-settings/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(globalDraft),
      }),
    onSuccess: () => {
      toast.success(t('common.saved'))
      void qc.invalidateQueries({ queryKey: ['email-settings'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  if (!emails.length) return <p className="text-muted-foreground text-sm">{t('common.loading')}</p>

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex flex-wrap gap-1 lg:w-48 lg:flex-col">
          {emails.map((e) => (
            <button
              key={e.id}
              type="button"
              className={cn(
                'rounded-md px-3 py-2 text-start text-sm',
                e.id === active?.id ? 'bg-muted font-medium' : 'text-muted-foreground hover:bg-muted/60',
              )}
              onClick={() => setActiveId(e.id)}
            >
              {e.title}
            </button>
          ))}
        </div>
        {active ? (
          <Card className="min-w-0 flex-1 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">{active.title}</CardTitle>
              {active.description ? <p className="text-muted-foreground text-sm">{active.description}</p> : null}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Checkbox id="email-enabled" checked={enabled} onCheckedChange={(v) => setEnabled(v === true)} />
                <Label htmlFor="email-enabled" className="cursor-pointer font-normal">
                  {t('settings.shop.emailEnabled')}
                </Label>
              </div>
              <WcSettingsFormRenderer fields={active.fields} values={draft} onChange={(id, v) => setDraft((d) => ({ ...d, [id]: v }))} />
              <Button type="button" disabled={saveEmail.isPending} onClick={() => void saveEmail.mutateAsync()}>
                {t('common.save')}
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
      {q.data?.global ? (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">{t('settings.shop.emailGlobal')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <WcSettingsFormRenderer
              fields={q.data.global.fields}
              values={globalDraft}
              onChange={(id, v) => setGlobalDraft((d) => ({ ...d, [id]: v }))}
            />
            <Button type="button" disabled={saveGlobal.isPending} onClick={() => void saveGlobal.mutateAsync()}>
              {t('common.save')}
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
