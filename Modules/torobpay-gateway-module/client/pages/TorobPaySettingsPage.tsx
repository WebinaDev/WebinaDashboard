import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { toast } from 'sonner'

import {
  GatewayField,
  GatewayFieldsGrid,
  GatewaySettingsLayout,
  GatewaySwitchGrid,
  GatewaySwitchRow,
  GatewayTextArea,
} from '@/components/payments/GatewaySettingsLayout'
import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type TorobSettings = Record<string, unknown> & {
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
  direct_payment: boolean
  disable_payment_retry: boolean
  utm_torob_enabled: boolean
  utm_exclude_others: boolean
  dns_smart_resolve_enabled: boolean
  dns_ip_override: string
  success_message: string
  failed_message: string
  widget_enabled: boolean
  badge_enabled: boolean
  marquee_enabled: boolean
  topbar_enabled: boolean
  slider_enabled: boolean
  official_plugin_active?: boolean
  gateway_source?: string
  callback_url?: string
}

export default function TorobPaySettingsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const path = useLocation().pathname
  const isDisplay = path.endsWith('/display')
  const isOrders = path.endsWith('/orders')
  const isCampaign = path.endsWith('/campaign')
  const isLogs = path.endsWith('/logs')

  const settingsQ = useQuery({
    queryKey: ['torobpay', 'settings'],
    queryFn: async () => apiFetch<{ settings: TorobSettings }>('torobpay/settings'),
  })
  const [form, setForm] = useState<TorobSettings | null>(null)
  useEffect(() => {
    if (settingsQ.data?.settings) setForm(settingsQ.data.settings)
  }, [settingsQ.data])

  const ordersQ = useQuery({
    queryKey: ['torobpay', 'orders'],
    queryFn: async () => apiFetch<{ items: Array<Record<string, unknown>> }>('torobpay/orders'),
    enabled: isOrders,
  })
  const logsQ = useQuery({
    queryKey: ['torobpay', 'logs'],
    queryFn: async () => apiFetch<{ logs: Array<Record<string, unknown>> }>('torobpay/logs'),
    enabled: isLogs,
  })
  const campaignQ = useQuery({
    queryKey: ['torobpay', 'campaign'],
    queryFn: async () => apiFetch<{ items: unknown; error?: string }>('torobpay/campaign'),
    enabled: isCampaign,
  })

  const saveM = useMutation({
    mutationFn: async () => {
      if (!form) return
      return apiFetch<{ settings: TorobSettings }>('torobpay/settings', {
        method: 'POST',
        body: JSON.stringify({ settings: form }),
      })
    },
    onSuccess: (data) => {
      if (data?.settings) setForm(data.settings)
      void qc.invalidateQueries({ queryKey: ['torobpay'] })
      toast.success(t('torobpay.saved'))
    },
    onError: (e) => toastApiError(t, e as Error),
  })
  const testM = useMutation({
    mutationFn: async () => apiFetch('torobpay/test-connection', { method: 'POST' }),
    onSuccess: () => toast.success(t('torobpay.testOk')),
    onError: (e) => toastApiError(t, e as Error),
  })
  const fetchCredM = useMutation({
    mutationFn: async () => apiFetch<{ settings: TorobSettings }>('torobpay/fetch-credentials', { method: 'POST' }),
    onSuccess: (data) => {
      if (data?.settings) setForm(data.settings)
      toast.success(t('torobpay.credsOk'))
    },
    onError: (e) => toastApiError(t, e as Error),
  })
  const probeM = useMutation({
    mutationFn: async (id: number) => apiFetch(`torobpay/orders/${id}/probe`, { method: 'POST' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['torobpay', 'orders'] })
      toast.success(t('torobpay.probed'))
    },
    onError: (e) => toastApiError(t, e as Error),
  })
  const refundM = useMutation({
    mutationFn: async (id: number) => apiFetch(`torobpay/orders/${id}/refund`, { method: 'POST', body: '{}' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['torobpay', 'orders'] })
      toast.success(t('torobpay.refunded'))
    },
    onError: (e) => toastApiError(t, e as Error),
  })

  const subNav = (
    <div className="mb-4 flex flex-wrap gap-2">
      <Button asChild size="sm" variant={!isDisplay && !isOrders && !isCampaign && !isLogs ? 'default' : 'outline'}>
        <Link to="/settings/shop/torobpay">{t('torobpay.nav.settings')}</Link>
      </Button>
      <Button asChild size="sm" variant={isDisplay ? 'default' : 'outline'}>
        <Link to="/settings/shop/torobpay/display">{t('torobpay.nav.display')}</Link>
      </Button>
      <Button asChild size="sm" variant={isOrders ? 'default' : 'outline'}>
        <Link to="/settings/shop/torobpay/orders">{t('torobpay.nav.orders')}</Link>
      </Button>
      <Button asChild size="sm" variant={isCampaign ? 'default' : 'outline'}>
        <Link to="/settings/shop/torobpay/campaign">{t('torobpay.nav.campaign')}</Link>
      </Button>
      <Button asChild size="sm" variant={isLogs ? 'default' : 'outline'}>
        <Link to="/settings/shop/torobpay/logs">{t('torobpay.nav.logs')}</Link>
      </Button>
    </div>
  )

  if (isLogs) {
    return (
      <PageShell title={t('torobpay.logsTitle')} description={t('torobpay.logsSubtitle')}>
        {subNav}
        <div className="mx-auto w-full max-w-6xl space-y-2">
          {(logsQ.data?.logs ?? []).map((row, i) => (
            <pre key={i} className="bg-muted/40 overflow-x-auto rounded-lg border p-3 text-xs">
              {JSON.stringify(row, null, 2)}
            </pre>
          ))}
        </div>
      </PageShell>
    )
  }

  if (isOrders) {
    return (
      <PageShell title={t('torobpay.ordersTitle')} description={t('torobpay.ordersSubtitle')}>
        {subNav}
        <div className="mx-auto w-full max-w-6xl space-y-2">
          {(ordersQ.data?.items ?? []).map((o) => (
            <div key={String(o.id)} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-4 text-sm">
              <div>
                <div className="font-medium">
                  #{String(o.number)} — {String(o.status)}
                </div>
                <div className="text-muted-foreground text-xs">
                  {t('torobpay.remoteStatus')}: {String(o.torob_status || '—')} · {String(o.billing_phone || '')}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => probeM.mutate(Number(o.id))}>
                  {t('torobpay.probe')}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => refundM.mutate(Number(o.id))}>
                  {t('torobpay.refund')}
                </Button>
              </div>
            </div>
          ))}
          {!ordersQ.isLoading && !(ordersQ.data?.items?.length ?? 0) ? (
            <p className="text-muted-foreground text-sm">{t('common.empty')}</p>
          ) : null}
        </div>
      </PageShell>
    )
  }

  if (isCampaign) {
    return (
      <PageShell title={t('torobpay.campaignTitle')} description={t('torobpay.campaignHint')}>
        {subNav}
        <div className="mx-auto w-full max-w-6xl">
          {campaignQ.data?.error ? <p className="text-destructive mb-3 text-sm">{campaignQ.data.error}</p> : null}
          <pre className="bg-muted/40 overflow-x-auto rounded-xl border p-4 text-xs">
            {JSON.stringify(campaignQ.data?.items ?? {}, null, 2)}
          </pre>
        </div>
      </PageShell>
    )
  }

  if (!form) {
    return (
      <PageShell title={t('torobpay.title')}>
        {subNav}
        {t('common.loading')}
      </PageShell>
    )
  }

  if (isDisplay) {
    return (
      <GatewaySettingsLayout
        title={t('torobpay.displayTitle')}
        description={t('torobpay.displaySubtitle')}
        sections={[
          {
            id: 'display',
            title: t('gateway.section.display'),
            description: t('gateway.section.displayHint'),
            children: (
              <GatewaySwitchGrid>
                <GatewaySwitchRow
                  label={t('torobpay.flag.widget')}
                  description={t('torobpay.flag.widgetHint')}
                  checked={form.widget_enabled}
                  onChange={(v) => setForm({ ...form, widget_enabled: v })}
                />
                <GatewaySwitchRow
                  label={t('torobpay.flag.badge')}
                  description={t('torobpay.flag.badgeHint')}
                  checked={form.badge_enabled}
                  onChange={(v) => setForm({ ...form, badge_enabled: v })}
                />
                <GatewaySwitchRow
                  label={t('torobpay.flag.marquee')}
                  description={t('torobpay.flag.marqueeHint')}
                  checked={form.marquee_enabled}
                  onChange={(v) => setForm({ ...form, marquee_enabled: v })}
                />
                <GatewaySwitchRow
                  label={t('torobpay.flag.topbar')}
                  description={t('torobpay.flag.topbarHint')}
                  checked={form.topbar_enabled}
                  onChange={(v) => setForm({ ...form, topbar_enabled: v })}
                />
                <GatewaySwitchRow
                  label={t('torobpay.flag.slider')}
                  description={t('torobpay.flag.sliderHint')}
                  checked={form.slider_enabled}
                  onChange={(v) => setForm({ ...form, slider_enabled: v })}
                />
              </GatewaySwitchGrid>
            ),
          },
        ]}
        actions={
          <Button onClick={() => saveM.mutate()} disabled={saveM.isPending}>
            {t('common.save')}
          </Button>
        }
      >
        {subNav}
      </GatewaySettingsLayout>
    )
  }

  const source = String(form.gateway_source ?? 'webino')
  const sourceLabel =
    source === 'official'
      ? t('gateway.meta.sourceOfficial')
      : source === 'webino'
        ? t('gateway.meta.sourceWebino')
        : source

  return (
    <GatewaySettingsLayout
      title={t('torobpay.title')}
      description={t('torobpay.description')}
      notice={
        form.official_plugin_active ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
            {t('torobpay.officialNotice')}
          </p>
        ) : null
      }
      meta={[
        { label: t('gateway.meta.source'), value: sourceLabel },
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
                label={t('torobpay.enabled')}
                description={t('torobpay.enabledHint')}
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
                  value={String(form.order_button_text ?? '')}
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
                    <div className="min-w-0 flex-1 space-y-1">
                      <GatewayField
                        label=""
                        value={String(form.icon_url ?? '')}
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
                  hint={t('torobpay.baseUrlHint')}
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
                label={t('torobpay.flag.disableRetry')}
                description={t('torobpay.flag.disableRetryHint')}
                checked={form.disable_payment_retry}
                onChange={(v) => setForm({ ...form, disable_payment_retry: v })}
              />
              <GatewaySwitchRow
                label={t('torobpay.flag.utmAuto')}
                description={t('torobpay.flag.utmAutoHint')}
                checked={form.utm_torob_enabled}
                onChange={(v) => setForm({ ...form, utm_torob_enabled: v })}
              />
              <GatewaySwitchRow
                label={t('torobpay.flag.utmExclusive')}
                description={t('torobpay.flag.utmExclusiveHint')}
                checked={form.utm_exclude_others}
                onChange={(v) => setForm({ ...form, utm_exclude_others: v })}
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
                value={form.success_message || ''}
                onChange={(v) => setForm({ ...form, success_message: v })}
                hint={t('gateway.field.messageVars')}
              />
              <GatewayTextArea
                label={t('gateway.field.failedMessage')}
                value={form.failed_message || ''}
                onChange={(v) => setForm({ ...form, failed_message: v })}
              />
              <GatewayTextArea
                label={t('gateway.field.cancelledMessage')}
                value={String(form.cancelled_message ?? '')}
                onChange={(v) => setForm({ ...form, cancelled_message: v })}
              />
            </div>
          ),
        },
        {
          id: 'advanced',
          title: t('gateway.section.advanced'),
          description: t('gateway.section.advancedHint'),
          children: (
            <div className="space-y-4">
              <GatewaySwitchRow
                label={t('torobpay.flag.smartDns')}
                description={t('torobpay.flag.smartDnsHint')}
                checked={form.dns_smart_resolve_enabled}
                onChange={(v) => setForm({ ...form, dns_smart_resolve_enabled: v })}
              />
              <GatewayField
                label={t('torobpay.field.dnsOverride')}
                value={form.dns_ip_override || ''}
                onChange={(v) => setForm({ ...form, dns_ip_override: v })}
                hint={t('torobpay.field.dnsOverrideHint')}
              />
            </div>
          ),
        },
      ]}
      actions={
        <>
          <Button onClick={() => saveM.mutate()} disabled={saveM.isPending}>
            {t('common.save')}
          </Button>
          <Button variant="outline" onClick={() => testM.mutate()} disabled={testM.isPending}>
            {t('torobpay.test')}
          </Button>
          <Button variant="outline" onClick={() => fetchCredM.mutate()} disabled={fetchCredM.isPending}>
            {t('torobpay.fetchCreds')}
          </Button>
        </>
      }
    >
      {subNav}
    </GatewaySettingsLayout>
  )
}
