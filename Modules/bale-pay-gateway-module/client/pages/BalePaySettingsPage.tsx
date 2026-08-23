import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type BalePaySettings = {
  enabled: boolean
  title: string
  description: string
  instructions: string
}

type BalePayStatus = {
  bot_active: boolean
  has_provider_token: boolean
  bot_username: string
}

export default function BalePaySettingsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [draft, setDraft] = useState<BalePaySettings | null>(null)

  const q = useQuery({
    queryKey: ['bale-pay', 'settings'],
    queryFn: () =>
      apiFetch<{ settings: BalePaySettings; status: BalePayStatus }>('bale-pay/settings'),
  })

  useEffect(() => {
    if (q.data?.settings) setDraft(q.data.settings)
  }, [q.data])

  const save = useMutation({
    mutationFn: async () =>
      apiFetch<{ settings: BalePaySettings }>('bale-pay/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      }),
    onSuccess: async (data) => {
      toast.success(t('common.saved'))
      if (data.settings) setDraft(data.settings)
      await qc.invalidateQueries({ queryKey: ['bale-pay', 'settings'] })
      await qc.invalidateQueries({ queryKey: ['payment-gateways'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const status = q.data?.status
  const warnings: string[] = []
  if (status && !status.bot_active) warnings.push(t('balePay.warnBot'))
  if (status && !status.has_provider_token) warnings.push(t('balePay.warnToken'))

  return (
    <PageShell title={t('balePay.title')} subtitle={t('balePay.subtitle')}>
      {!draft ? (
        <p className="text-muted-foreground text-sm">{t('common.loading')}</p>
      ) : (
        <div className="grid max-w-xl gap-4">
          {warnings.length > 0 ? (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
              {warnings.map((w) => (
                <p key={w}>{w}</p>
              ))}
            </div>
          ) : null}
          {status?.bot_username ? (
            <p className="text-muted-foreground text-sm">
              {t('balePay.botUsername')}: @{status.bot_username}
            </p>
          ) : null}
          <div className="flex items-center gap-2">
            <Checkbox
              id="bale-pay-enabled"
              checked={draft.enabled}
              onCheckedChange={(v) => setDraft({ ...draft, enabled: v === true })}
            />
            <Label htmlFor="bale-pay-enabled">{t('balePay.enabled')}</Label>
          </div>
          <div className="space-y-2">
            <Label>{t('balePay.checkoutTitle')}</Label>
            <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>{t('balePay.description')}</Label>
            <Textarea
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('balePay.instructions')}</Label>
            <Textarea
              value={draft.instructions}
              onChange={(e) => setDraft({ ...draft, instructions: e.target.value })}
              rows={3}
            />
          </div>
          <div>
            <Button type="button" disabled={save.isPending} onClick={() => void save.mutateAsync()}>
              {t('common.save')}
            </Button>
          </div>
        </div>
      )}
    </PageShell>
  )
}
