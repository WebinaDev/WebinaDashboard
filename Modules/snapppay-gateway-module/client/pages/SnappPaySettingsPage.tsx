import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { toast } from 'sonner'

import {
  GatewayFieldsGrid,
  GatewayField,
  GatewaySettingsLayout,
  GatewaySwitchGrid,
  GatewaySwitchRow,
  GatewayTextArea,
} from '@/components/payments/GatewaySettingsLayout'
import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type SnappSettings = {
  enabled: boolean
  title: string
  description: string
  base_url: string
  client_id: string
  client_secret?: string
  client_username: string
  client_password?: string
  has_client_secret?: boolean
  has_client_password?: boolean
  mobile_enabled: boolean
  postal_enabled: boolean
  default_gateway: boolean
  has_comission: boolean
  has_pdp: boolean
  dark_pdp: boolean
  direct_payment: boolean
  success_message: string
  failed_message: string
  cancelled_message: string
  official_plugin_active?: boolean
  gateway_source?: string
  server_ip?: string
  callback_url?: string
}

export default function SnappPaySettingsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const path = useLocation().pathname
  const isLogs = path.endsWith('/logs')

  const settingsQ = useQuery({
    queryKey: ['snapppay', 'settings'],
    queryFn: async () => apiFetch<{ settings: SnappSettings }>('snapppay/settings'),
  })
  const statusQ = useQuery({
    queryKey: ['snapppay', 'status'],
    queryFn: async () => apiFetch<Record<string, unknown>>('snapppay/status'),
    enabled: !isLogs,
  })
  const logsQ = useQuery({
    queryKey: ['snapppay', 'logs'],
    queryFn: async () => apiFetch<{ logs: Array<Record<string, unknown>> }>('snapppay/logs'),
    enabled: isLogs,
  })

  const [form, setForm] = useState<SnappSettings | null>(null)
  useEffect(() => {
    if (settingsQ.data?.settings) setForm(settingsQ.data.settings)
  }, [settingsQ.data])

  const saveM = useMutation({
    mutationFn: async () => {
      if (!form) return
      return apiFetch<{ settings: SnappSettings }>('snapppay/settings', {
        method: 'POST',
        body: JSON.stringify({ settings: form }),
      })
    },
    onSuccess: (data) => {
      if (data?.settings) setForm(data.settings)
      void qc.invalidateQueries({ queryKey: ['snapppay'] })
      toast.success(t('snapppay.saved'))
    },
    onError: (e) => toastApiError(t, e as Error),
  })

  const testM = useMutation({
    mutationFn: async () => apiFetch<Record<string, unknown>>('snapppay/test-connection', { method: 'POST' }),
    onSuccess: () => toast.success(t('snapppay.testOk')),
    onError: (e) => toastApiError(t, e as Error),
  })

  if (isLogs) {
    return (
      <PageShell title={t('snapppay.logsTitle')} description={t('snapppay.logsSubtitle')}>
        <div className="mx-auto w-full max-w-6xl space-y-2">
          {(logsQ.data?.logs ?? []).map((row, i) => (
            <pre key={i} className="bg-muted/40 overflow-x-auto rounded-lg border p-3 text-xs">
              {JSON.stringify(row, null, 2)}
            </pre>
          ))}
          {!logsQ.isLoading && (logsQ.data?.logs?.length ?? 0) === 0 ? (
            <p className="text-muted-foreground text-sm">{t('snapppay.noLogs')}</p>
          ) : null}
        </div>
      </PageShell>
    )
  }

  if (!form) {
    return <PageShell title={t('snapppay.title')}>{t('common.loading')}</PageShell>
  }

  const source = String(statusQ.data?.gateway_source ?? form.gateway_source ?? 'webino')
  const sourceLabel =
    source === 'official'
      ? t('gateway.meta.sourceOfficial')
      : source === 'webino'
        ? t('gateway.meta.sourceWebino')
        : source

  return (
    <GatewaySettingsLayout
      title={t('snapppay.title')}
      description={t('snapppay.description')}
      notice={
        form.official_plugin_active ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
            {t('snapppay.officialNotice')}
          </p>
        ) : null
      }
      meta={[
        { label: t('gateway.meta.source'), value: sourceLabel },
        { label: t('gateway.meta.serverIp'), value: String(statusQ.data?.server_ip ?? form.server_ip ?? '—') },
        { label: t('gateway.meta.callback'), value: String(form.callback_url ?? ''), copyable: true },
      ]}
      sections={[
        {
          id: 'connection',
          title: t('gateway.section.connection'),
          description: t('gateway.section.connectionHint'),
          children: (
            <div className="space-y-4">
              <GatewaySwitchRow
                label={t('snapppay.enabled')}
                description={t('snapppay.enabledHint')}
                checked={form.enabled}
                onChange={(v) => setForm({ ...form, enabled: v })}
              />
              <GatewayFieldsGrid>
                <GatewayField label={t('gateway.field.title')} value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
                <GatewayField
                  label={t('gateway.field.description')}
                  value={form.description}
                  onChange={(v) => setForm({ ...form, description: v })}
                />
                <GatewayField
                  label={t('gateway.field.orderButtonText')}
                  value={form.order_button_text ?? ''}
                  onChange={(v) => setForm({ ...form, order_button_text: v })}
                />
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">{t('gateway.field.iconUrl')}</label>
                  <div className="flex items-start gap-3">
                    <img
                      src={String(form.icon_url || form.resolved_icon_url || form.default_icon_url || '')}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded border object-contain"
                    />
                    <div className="min-w-0 flex-1">
                      <GatewayField
                        label=""
                        value={form.icon_url ?? ''}
                        onChange={(v) => setForm({ ...form, icon_url: v })}
                        hint={t('gateway.field.iconUrlHint')}
                      />
                    </div>
                  </div>
                </div>
                <GatewayField
                  label={t('gateway.field.baseUrl')}
                  value={form.base_url}
                  onChange={(v) => setForm({ ...form, base_url: v })}
                  hint={t('snapppay.baseUrlHint')}
                />
                <GatewayField
                  label={t('gateway.field.clientId')}
                  value={form.client_id}
                  onChange={(v) => setForm({ ...form, client_id: v })}
                />
                <GatewayField
                  label={form.has_client_secret ? t('gateway.field.clientSecretKeep') : t('gateway.field.clientSecret')}
                  value={form.client_secret ?? ''}
                  type="password"
                  onChange={(v) => setForm({ ...form, client_secret: v })}
                />
                <GatewayField
                  label={t('gateway.field.username')}
                  value={form.client_username}
                  onChange={(v) => setForm({ ...form, client_username: v })}
                />
                <GatewayField
                  label={form.has_client_password ? t('gateway.field.passwordKeep') : t('gateway.field.password')}
                  value={form.client_password ?? ''}
                  type="password"
                  onChange={(v) => setForm({ ...form, client_password: v })}
                />
              </GatewayFieldsGrid>
            </div>
          ),
        },
        {
          id: 'checkout',
          title: t('gateway.section.checkout'),
          description: t('gateway.section.checkoutHint'),
          children: (
            <GatewaySwitchGrid>
              <GatewaySwitchRow
                label={t('gateway.flag.requireMobile')}
                description={t('gateway.flag.requireMobileHint')}
                checked={form.mobile_enabled}
                onChange={(v) => setForm({ ...form, mobile_enabled: v })}
              />
              <GatewaySwitchRow
                label={t('gateway.flag.requirePostcode')}
                description={t('gateway.flag.requirePostcodeHint')}
                checked={form.postal_enabled}
                onChange={(v) => setForm({ ...form, postal_enabled: v })}
              />
              <GatewaySwitchRow
                label={t('gateway.flag.defaultEligible')}
                description={t('gateway.flag.defaultEligibleHint')}
                checked={form.default_gateway}
                onChange={(v) => setForm({ ...form, default_gateway: v })}
              />
              <GatewaySwitchRow
                label={t('gateway.flag.directRedirect')}
                description={t('gateway.flag.directRedirectHint')}
                checked={form.direct_payment}
                onChange={(v) => setForm({ ...form, direct_payment: v })}
              />
              <GatewaySwitchRow
                label={t('snapppay.flag.commission')}
                description={t('snapppay.flag.commissionHint')}
                checked={form.has_comission}
                onChange={(v) => setForm({ ...form, has_comission: v })}
              />
            </GatewaySwitchGrid>
          ),
        },
        {
          id: 'display',
          title: t('gateway.section.display'),
          description: t('gateway.section.displayHint'),
          children: (
            <GatewaySwitchGrid>
              <GatewaySwitchRow
                label={t('snapppay.flag.pdp')}
                description={t('snapppay.flag.pdpHint')}
                checked={form.has_pdp}
                onChange={(v) => setForm({ ...form, has_pdp: v })}
              />
              <GatewaySwitchRow
                label={t('snapppay.flag.darkPdp')}
                description={t('snapppay.flag.darkPdpHint')}
                checked={form.dark_pdp}
                onChange={(v) => setForm({ ...form, dark_pdp: v })}
              />
            </GatewaySwitchGrid>
          ),
        },
        {
          id: 'messages',
          title: t('gateway.section.messages'),
          description: t('gateway.section.messagesHint'),
          children: (
            <div className="grid gap-4">
              <GatewayTextArea
                label={t('gateway.field.successMessage')}
                value={form.success_message}
                onChange={(v) => setForm({ ...form, success_message: v })}
                hint={t('gateway.field.messageVars')}
              />
              <GatewayTextArea
                label={t('gateway.field.failedMessage')}
                value={form.failed_message}
                onChange={(v) => setForm({ ...form, failed_message: v })}
              />
              <GatewayTextArea
                label={t('gateway.field.cancelledMessage')}
                value={form.cancelled_message}
                onChange={(v) => setForm({ ...form, cancelled_message: v })}
              />
            </div>
          ),
        },
      ]}
      actions={
        <>
          <Button type="button" onClick={() => saveM.mutate()} disabled={saveM.isPending}>
            {t('common.save')}
          </Button>
          <Button type="button" variant="outline" onClick={() => testM.mutate()} disabled={testM.isPending}>
            {t('snapppay.test')}
          </Button>
        </>
      }
    />
  )
}
