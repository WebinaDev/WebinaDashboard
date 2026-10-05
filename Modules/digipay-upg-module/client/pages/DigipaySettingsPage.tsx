import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { toast } from 'sonner'

import {
  GatewayField,
  GatewayFieldsGrid,
  GatewaySettingsLayout,
} from '@/components/payments/GatewaySettingsLayout'
import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type DigipaySettings = {
  environment: 'staging' | 'live'
  client_id: string
  client_secret?: string
  has_client_secret?: boolean
  username: string
  password: string
  digipay_version: string
  seller_id: string
  supplier_id: string
  category_id: string
  product_type: number
  title_ipg?: string
  description_ipg?: string
  title_wallet?: string
  description_wallet?: string
  title_cpg?: string
  description_cpg?: string
  title_bpg?: string
  description_bpg?: string
  order_button_text?: string
  success_message?: string
  failed_message?: string
  cancelled_message?: string
  icon_url?: string
  default_icon_url?: string
  resolved_icon_url?: string
  official_plugin_active?: boolean
  callback_url?: string
}

type DigipayLog = {
  time: string
  order_id: number
  endpoint: string
  success: boolean
  message: string
  http_code?: number | null
}

export default function DigipaySettingsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const location = useLocation()
  const isTransactions = location.pathname.endsWith('/transactions')

  const settingsQ = useQuery({
    queryKey: ['digipay', 'settings'],
    queryFn: async () => apiFetch<{ settings: DigipaySettings }>('digipay/settings'),
  })

  const logsQ = useQuery({
    queryKey: ['digipay', 'logs'],
    queryFn: async () => apiFetch<{ items: DigipayLog[] }>('digipay/transactions'),
    enabled: isTransactions,
  })

  const [draft, setDraft] = useState<DigipaySettings | null>(null)

  const settings = useMemo(() => {
    const incoming = settingsQ.data?.settings
    if (!incoming) return draft
    if (!draft) {
      setDraft(incoming)
      return incoming
    }
    return draft
  }, [settingsQ.data?.settings, draft])

  const save = useMutation({
    mutationFn: async () =>
      apiFetch<{ settings: DigipaySettings }>('digipay/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      }),
    onSuccess: async (res) => {
      toast.success(t('common.saved'))
      setDraft({ ...res.settings, client_secret: '', password: '' })
      await qc.invalidateQueries({ queryKey: ['digipay', 'settings'] })
      await qc.invalidateQueries({ queryKey: ['payment-gateways'] })
      await qc.invalidateQueries({ queryKey: ['payments-hub'] })
    },
    onError: (err: Error) => toastApiError(t, err),
  })

  const testConnection = useMutation({
    mutationFn: async () => apiFetch<{ ok: boolean }>('digipay/test-connection', { method: 'POST' }),
    onSuccess: () => toast.success(t('digipay.testSuccess')),
    onError: (err: Error) => toastApiError(t, err),
  })

  const subNav = (
    <div className="mb-2 flex flex-wrap gap-2">
      <Button asChild size="sm" variant={!isTransactions ? 'default' : 'outline'}>
        <Link to="/settings/shop/digipay">{t('digipay.nav.settings')}</Link>
      </Button>
      <Button asChild size="sm" variant={isTransactions ? 'default' : 'outline'}>
        <Link to="/settings/shop/digipay/transactions">{t('digipay.nav.transactions')}</Link>
      </Button>
    </div>
  )

  if (isTransactions) {
    return (
      <PageShell title={t('digipay.transactionsTitle')} description={t('digipay.transactionsSubtitle')}>
        <div className="mx-auto w-full max-w-6xl space-y-4">
          {subNav}
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b text-xs">
                  <th className="px-3 py-2 text-start">{t('digipay.col.time')}</th>
                  <th className="px-3 py-2 text-start">{t('digipay.col.order')}</th>
                  <th className="px-3 py-2 text-start">{t('digipay.col.endpoint')}</th>
                  <th className="px-3 py-2 text-start">{t('digipay.col.status')}</th>
                  <th className="px-3 py-2 text-start">{t('digipay.col.message')}</th>
                </tr>
              </thead>
              <tbody>
                {(logsQ.data?.items ?? []).map((log, idx) => (
                  <tr key={`${log.time}-${idx}`} className="border-t">
                    <td className="px-3 py-2">{log.time}</td>
                    <td className="px-3 py-2">#{log.order_id}</td>
                    <td className="px-3 py-2">{log.endpoint}</td>
                    <td className="px-3 py-2">{log.success ? t('digipay.status.ok') : t('digipay.status.failed')}</td>
                    <td className="px-3 py-2">{log.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!logsQ.isLoading && !(logsQ.data?.items?.length ?? 0) ? (
              <p className="text-muted-foreground p-4 text-sm">{t('common.empty')}</p>
            ) : null}
          </div>
        </div>
      </PageShell>
    )
  }

  if (!settings) {
    return (
      <PageShell title={t('digipay.settingsTitle')}>
        {subNav}
        {t('common.loading')}
      </PageShell>
    )
  }

  return (
    <GatewaySettingsLayout
      title={t('digipay.settingsTitle')}
      description={t('digipay.settingsSubtitle')}
      notice={
        settings.official_plugin_active ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
            {t('digipay.officialNotice')}
          </p>
        ) : null
      }
      meta={[
        {
          label: t('gateway.meta.callback'),
          value: String(settings.callback_url ?? ''),
          copyable: true,
        },
        {
          label: t('digipay.environment'),
          value: settings.environment === 'live' ? t('digipay.env.live') : t('digipay.env.staging'),
        },
      ]}
      sections={[
        {
          id: 'connection',
          title: t('gateway.section.connection'),
          description: t('digipay.section.connectionHint'),
          children: (
            <GatewayFieldsGrid>
              <div className="space-y-2">
                <Label>{t('digipay.environment')}</Label>
                <Select
                  value={settings.environment ?? 'staging'}
                  onValueChange={(v) =>
                    setDraft((prev) => ({ ...(prev as DigipaySettings), environment: v as 'staging' | 'live' }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staging">{t('digipay.env.staging')}</SelectItem>
                    <SelectItem value="live">{t('digipay.env.live')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <GatewayField
                label={t('digipay.field.version')}
                value={settings.digipay_version ?? ''}
                onChange={(v) => setDraft((p) => ({ ...(p as DigipaySettings), digipay_version: v }))}
              />
              <GatewayField
                label={t('gateway.field.clientId')}
                value={settings.client_id ?? ''}
                onChange={(v) => setDraft((p) => ({ ...(p as DigipaySettings), client_id: v }))}
              />
              <GatewayField
                label={t('gateway.field.clientSecret')}
                type="password"
                value={settings.client_secret ?? ''}
                placeholder={settings.has_client_secret ? '••••••••' : ''}
                onChange={(v) => setDraft((p) => ({ ...(p as DigipaySettings), client_secret: v }))}
              />
              <GatewayField
                label={t('gateway.field.username')}
                value={settings.username ?? ''}
                onChange={(v) => setDraft((p) => ({ ...(p as DigipaySettings), username: v }))}
              />
              <GatewayField
                label={t('gateway.field.password')}
                type="password"
                value={settings.password ?? ''}
                onChange={(v) => setDraft((p) => ({ ...(p as DigipaySettings), password: v }))}
              />
            </GatewayFieldsGrid>
          ),
        },
        {
          id: 'merchant',
          title: t('digipay.section.merchant'),
          description: t('digipay.section.merchantHint'),
          children: (
            <GatewayFieldsGrid>
              <GatewayField
                label={t('digipay.field.sellerId')}
                value={settings.seller_id ?? ''}
                onChange={(v) => setDraft((p) => ({ ...(p as DigipaySettings), seller_id: v }))}
              />
              <GatewayField
                label={t('digipay.field.supplierId')}
                value={settings.supplier_id ?? ''}
                onChange={(v) => setDraft((p) => ({ ...(p as DigipaySettings), supplier_id: v }))}
              />
              <GatewayField
                label={t('digipay.field.categoryId')}
                value={settings.category_id ?? ''}
                onChange={(v) => setDraft((p) => ({ ...(p as DigipaySettings), category_id: v }))}
              />
              <GatewayField
                label={t('digipay.field.productType')}
                type="number"
                value={String(settings.product_type ?? 1)}
                onChange={(v) =>
                  setDraft((p) => ({ ...(p as DigipaySettings), product_type: parseInt(v || '1', 10) }))
                }
              />
            </GatewayFieldsGrid>
          ),
        },
        {
          id: 'checkout',
          title: t('gateway.section.checkout'),
          description: t('digipay.section.checkoutHint'),
          children: (
            <GatewayFieldsGrid>
              <GatewayField
                label={t('digipay.field.titleIpg')}
                value={settings.title_ipg ?? ''}
                onChange={(v) => setDraft((p) => ({ ...(p as DigipaySettings), title_ipg: v }))}
              />
              <GatewayField
                label={t('digipay.field.titleWallet')}
                value={settings.title_wallet ?? ''}
                onChange={(v) => setDraft((p) => ({ ...(p as DigipaySettings), title_wallet: v }))}
              />
              <GatewayField
                label={t('digipay.field.titleCpg')}
                value={settings.title_cpg ?? ''}
                onChange={(v) => setDraft((p) => ({ ...(p as DigipaySettings), title_cpg: v }))}
              />
              <GatewayField
                label={t('digipay.field.titleBpg')}
                value={settings.title_bpg ?? ''}
                onChange={(v) => setDraft((p) => ({ ...(p as DigipaySettings), title_bpg: v }))}
              />
              <GatewayField
                label={t('digipay.field.descIpg')}
                value={settings.description_ipg ?? ''}
                onChange={(v) => setDraft((p) => ({ ...(p as DigipaySettings), description_ipg: v }))}
              />
              <GatewayField
                label={t('digipay.field.descWallet')}
                value={settings.description_wallet ?? ''}
                onChange={(v) => setDraft((p) => ({ ...(p as DigipaySettings), description_wallet: v }))}
              />
              <GatewayField
                label={t('digipay.field.descCpg')}
                value={settings.description_cpg ?? ''}
                onChange={(v) => setDraft((p) => ({ ...(p as DigipaySettings), description_cpg: v }))}
              />
              <GatewayField
                label={t('digipay.field.descBpg')}
                value={settings.description_bpg ?? ''}
                onChange={(v) => setDraft((p) => ({ ...(p as DigipaySettings), description_bpg: v }))}
              />
              <GatewayField
                label={t('gateway.field.orderButtonText')}
                value={settings.order_button_text ?? ''}
                onChange={(v) => setDraft((p) => ({ ...(p as DigipaySettings), order_button_text: v }))}
              />
              <GatewayField
                label={t('gateway.field.successMessage')}
                value={settings.success_message ?? ''}
                onChange={(v) => setDraft((p) => ({ ...(p as DigipaySettings), success_message: v }))}
              />
              <GatewayField
                label={t('gateway.field.failedMessage')}
                value={settings.failed_message ?? ''}
                onChange={(v) => setDraft((p) => ({ ...(p as DigipaySettings), failed_message: v }))}
              />
              <GatewayField
                label={t('gateway.field.cancelledMessage')}
                value={settings.cancelled_message ?? ''}
                onChange={(v) => setDraft((p) => ({ ...(p as DigipaySettings), cancelled_message: v }))}
              />
              <div className="space-y-2 md:col-span-2">
                <Label>{t('gateway.field.iconUrl')}</Label>
                <div className="flex items-start gap-3">
                  <img
                    src={settings.icon_url?.trim() || settings.resolved_icon_url || settings.default_icon_url || ''}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded border object-contain"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <GatewayField
                      label=""
                      value={settings.icon_url ?? ''}
                      onChange={(v) => setDraft((p) => ({ ...(p as DigipaySettings), icon_url: v }))}
                      hint={t('gateway.field.iconUrlHint')}
                    />
                  </div>
                </div>
              </div>
            </GatewayFieldsGrid>
          ),
        },
      ]}
      actions={
        <>
          <Button onClick={() => void save.mutate()} disabled={save.isPending}>
            {t('common.save')}
          </Button>
          <Button variant="outline" onClick={() => void testConnection.mutate()} disabled={testConnection.isPending}>
            {t('digipay.testConnection')}
          </Button>
        </>
      }
    >
      {subNav}
    </GatewaySettingsLayout>
  )
}
