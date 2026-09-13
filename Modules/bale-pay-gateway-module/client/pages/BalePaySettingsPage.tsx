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
