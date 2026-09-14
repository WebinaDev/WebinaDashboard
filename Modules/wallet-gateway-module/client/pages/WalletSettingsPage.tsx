import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  GatewayField,
  GatewayFieldsGrid,
  GatewaySettingsLayout,
  GatewaySwitchRow,
} from '@/components/payments/GatewaySettingsLayout'
import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type WalletSettings = {
  enabled: boolean
  title: string
  description?: string
  order_button_text?: string
  login_prompt?: string
  balance_label?: string
  icon_url?: string
  default_icon_url?: string
  resolved_icon_url?: string
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

  if (!draft) {
    return <PageShell title={t('wallet.title')}>{t('common.loading')}</PageShell>
  }

  return (
    <GatewaySettingsLayout
      title={t('wallet.title')}
      description={t('wallet.subtitle')}
      sections={[
        {
          id: 'wallet',
          title: t('gateway.section.checkout'),
          description: t('wallet.sectionHint'),
          children: (
            <div className="space-y-4">
              <GatewaySwitchRow
                label={t('wallet.enabled')}
                description={t('wallet.enabledHint')}
                checked={draft.enabled}
                onChange={(v) => setDraft({ ...draft, enabled: v })}
              />
              <GatewayFieldsGrid>
                <GatewayField
                  label={t('wallet.checkoutTitle')}
                  value={draft.title}
                  onChange={(v) => setDraft({ ...draft, title: v })}
                />
                <GatewayField
                  label={t('gateway.field.orderButtonText')}
                  value={draft.order_button_text ?? ''}
                  onChange={(v) => setDraft({ ...draft, order_button_text: v })}
                />
                <GatewayField
                  label={t('gateway.field.description')}
                  value={draft.description ?? ''}
                  onChange={(v) => setDraft({ ...draft, description: v })}
                />
                <GatewayField
                  label={t('wallet.loginPrompt')}
                  value={draft.login_prompt ?? ''}
                  onChange={(v) => setDraft({ ...draft, login_prompt: v })}
                />
                <GatewayField
                  label={t('wallet.balanceLabel')}
                  value={draft.balance_label ?? ''}
                  onChange={(v) => setDraft({ ...draft, balance_label: v })}
                  hint="{balance}"
                />
                <GatewayField
                  label={t('wallet.minTopup')}
                  type="number"
                  value={String(draft.min_topup)}
                  onChange={(v) => setDraft({ ...draft, min_topup: Number(v) || 1 })}
                  hint={t('wallet.minTopupHint')}
                />
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">{t('gateway.field.iconUrl')}</label>
                  <div className="flex items-start gap-3">
                    <img
                      src={draft.icon_url?.trim() || draft.resolved_icon_url || draft.default_icon_url || ''}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded border object-contain"
                    />
                    <div className="min-w-0 flex-1">
                      <GatewayField
                        label=""
                        value={draft.icon_url ?? ''}
                        onChange={(v) => setDraft({ ...draft, icon_url: v })}
                        hint={t('gateway.field.iconUrlHint')}
                      />
                    </div>
                  </div>
                </div>
              </GatewayFieldsGrid>
            </div>
          ),
        },
      ]}
      actions={
        <Button type="button" disabled={save.isPending} onClick={() => void save.mutateAsync()}>
          {t('common.save')}
        </Button>
      }
    />
  )
}
