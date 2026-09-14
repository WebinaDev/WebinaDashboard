import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  GatewayField,
  GatewayFieldsGrid,
  GatewaySettingsLayout,
  GatewaySwitchRow,
  GatewayTextArea,
} from '@/components/payments/GatewaySettingsLayout'
import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type BalePaySettings = {
  enabled: boolean
  title: string
  description: string
  instructions: string
  order_button_text?: string
  success_message?: string
  failed_message?: string
  icon_url?: string
  default_icon_url?: string
  resolved_icon_url?: string
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

  if (!draft) {
    return <PageShell title={t('balePay.title')}>{t('common.loading')}</PageShell>
  }

  return (
    <GatewaySettingsLayout
      title={t('balePay.title')}
      description={t('balePay.subtitle')}
      notice={
        warnings.length ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
            {warnings.map((w) => (
              <p key={w}>{w}</p>
            ))}
          </div>
        ) : null
      }
      meta={
        status?.bot_username
          ? [{ label: t('balePay.botUsername'), value: `@${status.bot_username}` }]
          : undefined
      }
      sections={[
        {
          id: 'checkout',
          title: t('gateway.section.checkout'),
          children: (
            <div className="space-y-4">
              <GatewaySwitchRow
                label={t('balePay.enabled')}
                description={t('balePay.enabledHint')}
                checked={draft.enabled}
                onChange={(v) => setDraft({ ...draft, enabled: v })}
              />
              <GatewayFieldsGrid>
                <GatewayField
                  label={t('balePay.checkoutTitle')}
                  value={draft.title}
                  onChange={(v) => setDraft({ ...draft, title: v })}
                />
                <GatewayField
                  label={t('gateway.field.orderButtonText')}
                  value={draft.order_button_text ?? ''}
                  onChange={(v) => setDraft({ ...draft, order_button_text: v })}
                />
                <GatewayTextArea
                  className="md:col-span-2"
                  label={t('balePay.description')}
                  value={draft.description}
                  onChange={(v) => setDraft({ ...draft, description: v })}
                />
                <GatewayTextArea
                  className="md:col-span-2"
                  label={t('balePay.instructions')}
                  value={draft.instructions}
                  onChange={(v) => setDraft({ ...draft, instructions: v })}
                />
                <GatewayTextArea
                  className="md:col-span-2"
                  label={t('gateway.field.successMessage')}
                  value={draft.success_message ?? ''}
                  onChange={(v) => setDraft({ ...draft, success_message: v })}
                />
                <GatewayTextArea
                  className="md:col-span-2"
                  label={t('gateway.field.failedMessage')}
                  value={draft.failed_message ?? ''}
                  onChange={(v) => setDraft({ ...draft, failed_message: v })}
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
