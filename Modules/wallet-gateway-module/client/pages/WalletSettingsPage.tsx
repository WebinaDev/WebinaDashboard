import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type WalletSettings = {
  enabled: boolean
  title: string
  min_topup: number
}

export default function WalletSettingsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [draft, setDraft] = useState<WalletSettings | null>(null)

  const q = useQuery({
    queryKey: ['wallet', 'settings'],
    queryFn: () => apiFetch<{ settings: WalletSettings }>('wallet/settings'),
  })

  useEffect(() => {
    if (q.data?.settings) setDraft(q.data.settings)
  }, [q.data])

  const save = useMutation({
    mutationFn: async () =>
      apiFetch<{ settings: WalletSettings }>('wallet/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      }),
    onSuccess: async (data) => {
      toast.success(t('common.saved'))
      if (data.settings) setDraft(data.settings)
      await qc.invalidateQueries({ queryKey: ['wallet', 'settings'] })
      await qc.invalidateQueries({ queryKey: ['payment-gateways'] })
      await qc.invalidateQueries({ queryKey: ['payments-hub'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  return (
    <PageShell title={t('wallet.title')} subtitle={t('wallet.subtitle')}>
      {!draft ? (
        <p className="text-muted-foreground text-sm">{t('common.loading')}</p>
      ) : (
        <div className="grid max-w-xl gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="wallet-enabled"
              checked={draft.enabled}
              onCheckedChange={(v) => setDraft({ ...draft, enabled: v === true })}
            />
            <Label htmlFor="wallet-enabled">{t('wallet.enabled')}</Label>
          </div>
          <div className="space-y-2">
            <Label>{t('wallet.checkoutTitle')}</Label>
            <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>{t('wallet.minTopup')}</Label>
            <Input
              type="number"
              min={1}
              value={draft.min_topup}
              onChange={(e) => setDraft({ ...draft, min_topup: Number(e.target.value) || 1 })}
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
