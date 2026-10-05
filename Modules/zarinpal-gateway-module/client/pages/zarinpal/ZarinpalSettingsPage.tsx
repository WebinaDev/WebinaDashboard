import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { toast } from 'sonner'

import {
  GatewayField,
  GatewayFieldsGrid,
  GatewaySettingsLayout,
  GatewaySwitchGrid,
  GatewaySwitchRow,
} from '@/components/payments/GatewaySettingsLayout'
import { KeyValueList, PhaseCoverageCards, StatusBadge } from '@/components/data/DumpUi'
import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type ZarinpalSettings = {
  merchant_id: string
  access_token?: string
  has_access_token?: boolean
  sandbox: boolean
  gateway_enabled: boolean
  title: string
  description: string
  instructions: string
  success_message: string
  failed_message: string
  order_button_text: string
  fee_label: string
  cancelled_message: string
  invalid_token_message: string
  payment_description: string
  icon_url: string
  default_icon_url?: string
  resolved_icon_url?: string
  fee_payer: 'merchant' | 'customer'
  callback_url: string
  redact_logs: boolean
  api_base?: string
  start_pay_base?: string
}

type ReconcileResult = {
  checked_at?: string
  authorities?: number
  matched?: number
  completed?: number
  skipped?: number
  errors?: string[]
}

type StatusPayload = {
  jobs: Array<{ id: string; type: string; run_after: number }>
  last_reconcile?: ReconcileResult
  checked_at: string
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

function TextArea({
  label,
  value,
  onChange,
  hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  hint?: string
}) {
  return (
    <div className="space-y-2 md:col-span-2">
      <Label>{label}</Label>
      <textarea
        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
    </div>
  )
}

export default function ZarinpalSettingsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const location = useLocation()
  const path = location.pathname
  const isPayments = path.endsWith('/payments')
  const isOperations = path.endsWith('/operations')
  const isCoverage = path.endsWith('/coverage')
  const isConnection = !isPayments && !isOperations && !isCoverage

  const settingsQ = useQuery({
    queryKey: ['zarinpal', 'settings'],
    queryFn: async () => apiFetch<{ settings: ZarinpalSettings }>('zarinpal/settings'),
  })

  const statusQ = useQuery({
    queryKey: ['zarinpal', 'status'],
    queryFn: async () => apiFetch<StatusPayload>('zarinpal/status'),
    enabled: isOperations || isConnection,
  })

  const coverageQ = useQuery({
    queryKey: ['zarinpal', 'coverage'],
    queryFn: async () => apiFetch<Record<string, unknown>>('zarinpal/coverage/endpoints'),
    enabled: isConnection || isCoverage,
  })

  const [draft, setDraft] = useState<ZarinpalSettings | null>(null)
  const [lookupAuthority, setLookupAuthority] = useState('')
  const [lookupOrderId, setLookupOrderId] = useState('')
  const [lookupResult, setLookupResult] = useState<unknown>(null)

  const settings = useMemo(() => {
    const incoming = settingsQ.data?.settings
    if (!incoming) return draft
    if (!draft) {
      setDraft({ ...incoming, access_token: '' })
      return { ...incoming, access_token: '' }
    }
    return draft
  }, [settingsQ.data?.settings, draft])

  const save = useMutation({
    mutationFn: async () =>
      apiFetch<{ settings: ZarinpalSettings }>('zarinpal/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      }),
    onSuccess: async (res) => {
      toast.success(t('common.saved'))
      setDraft({ ...res.settings, access_token: '' })
      await qc.invalidateQueries({ queryKey: ['zarinpal', 'settings'] })
      await qc.invalidateQueries({ queryKey: ['payment-gateways'] })
    },
    onError: (err: Error) => toastApiError(t, err),
  })

  const testConnection = useMutation({
    mutationFn: async () => apiFetch<{ ok: boolean }>('zarinpal/test-connection', { method: 'POST' }),
    onSuccess: () => toast.success(t('zarinpal.testSuccess')),
    onError: (err: Error) => toastApiError(t, err),
  })

  const reconcile = useMutation({
    mutationFn: async () =>
      apiFetch<{ ok: boolean; result: ReconcileResult }>('zarinpal/reconcile', { method: 'POST' }),
    onSuccess: async (res) => {
      toast.success(
        t('zarinpal.reconcileDone', {
          completed: res.result?.completed ?? 0,
          matched: res.result?.matched ?? 0,
        }),
      )
      await qc.invalidateQueries({ queryKey: ['zarinpal', 'status'] })
    },
    onError: (err: Error) => toastApiError(t, err),
  })

  const lookup = useMutation({
    mutationFn: async () =>
      apiFetch<{ authority: string; order_id: number; lookup: unknown }>('zarinpal/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authority: lookupAuthority || undefined,
          order_id: lookupOrderId ? Number(lookupOrderId) : undefined,
        }),
      }),
    onSuccess: (res) => {
      setLookupResult(res.lookup)
      toast.success(t('zarinpal.lookupSuccess'))
    },
    onError: (err: Error) => toastApiError(t, err),
  })

  const title = isPayments
    ? t('zarinpal.paymentsTitle')
    : isOperations
      ? t('zarinpal.operationsTitle')
      : isCoverage
        ? t('zarinpal.coverageTitle')
        : t('zarinpal.title')

  const subtitle = isPayments
    ? t('zarinpal.paymentsSubtitle')
    : isOperations
      ? t('zarinpal.operationsSubtitle')
      : t('zarinpal.settingsSubtitle')

  if (settingsQ.isLoading || !settings) {
    return (
      <PageShell title={title} subtitle={subtitle}>
        <div>{t('common.loading')}</div>
      </PageShell>
    )
  }

  if (isConnection) {
    return (
      <GatewaySettingsLayout
        title={t('zarinpal.title')}
        description={t('zarinpal.settingsSubtitle')}
        meta={[
          { label: t('gateway.meta.callback'), value: settings.callback_url || '', copyable: true },
          { label: t('zarinpal.apiBase'), value: String(settings.api_base ?? '') },
        ]}
        sections={[
          {
            id: 'connection',
            title: t('gateway.section.connection'),
            children: (
              <div className="space-y-4">
                <GatewaySwitchGrid>
                  <GatewaySwitchRow
                    label={t('zarinpal.gatewayEnabled')}
                    checked={settings.gateway_enabled}
                    onChange={(v) => setDraft((p) => ({ ...(p as ZarinpalSettings), gateway_enabled: v }))}
                  />
                  <GatewaySwitchRow
                    label={t('zarinpal.sandbox')}
                    description={t('zarinpal.sandboxHint')}
                    checked={settings.sandbox}
                    onChange={(v) => setDraft((p) => ({ ...(p as ZarinpalSettings), sandbox: v }))}
                  />
                </GatewaySwitchGrid>
                <GatewayFieldsGrid>
                  <GatewayField
                    label={t('zarinpal.merchantId')}
                    value={settings.merchant_id}
                    onChange={(v) => setDraft((p) => ({ ...(p as ZarinpalSettings), merchant_id: v }))}
                  />
                  <GatewayField
                    label={t('zarinpal.accessToken')}
                    type="password"
                    value={settings.access_token ?? ''}
                    placeholder={settings.has_access_token ? '••••••••' : ''}
                    onChange={(v) => setDraft((p) => ({ ...(p as ZarinpalSettings), access_token: v }))}
                  />
                  <GatewayField
                    className="md:col-span-2"
                    label={t('zarinpal.callbackUrl')}
                    value={settings.callback_url}
                    onChange={(v) => setDraft((p) => ({ ...(p as ZarinpalSettings), callback_url: v }))}
                  />
                </GatewayFieldsGrid>
              </div>
            ),
          },
        ]}
        actions={
          <>
            <Button onClick={() => void save.mutate()} disabled={save.isPending}>
              {t('common.save')}
            </Button>
            <Button variant="outline" onClick={() => void testConnection.mutate()} disabled={testConnection.isPending}>
              {t('zarinpal.testConnection')}
            </Button>
          </>
        }
      />
    )
  }

  return (
    <PageShell title={title} subtitle={subtitle}>
      {null}

      {isPayments ? (
        <section className="space-y-4 rounded-lg border border-border p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label={t('zarinpal.fieldTitle')}
              value={settings.title}
              onChange={(v) => setDraft((p) => ({ ...(p as ZarinpalSettings), title: v }))}
            />
            <div className="space-y-2">
              <Label>{t('zarinpal.feePayer')}</Label>
              <Select
                value={settings.fee_payer}
                onValueChange={(v) =>
                  setDraft((p) => ({ ...(p as ZarinpalSettings), fee_payer: v as 'merchant' | 'customer' }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="merchant">{t('zarinpal.feePayerMerchant')}</SelectItem>
                  <SelectItem value="customer">{t('zarinpal.feePayerCustomer')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Field
              label={t('zarinpal.orderButtonText')}
              value={settings.order_button_text ?? ''}
              onChange={(v) => setDraft((p) => ({ ...(p as ZarinpalSettings), order_button_text: v }))}
            />
            <Field
              label={t('zarinpal.feeLabel')}
              value={settings.fee_label ?? ''}
              onChange={(v) => setDraft((p) => ({ ...(p as ZarinpalSettings), fee_label: v }))}
            />
            <div className="space-y-2 md:col-span-2">
              <Label>{t('zarinpal.iconUrl')}</Label>
              <div className="flex items-start gap-3">
                <img
                  src={settings.icon_url?.trim() || settings.resolved_icon_url || settings.default_icon_url || ''}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded border border-border object-contain bg-background"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <Input
                    type="url"
                    value={settings.icon_url ?? ''}
                    placeholder={t('zarinpal.iconUrlPlaceholder')}
                    onChange={(e) => setDraft((p) => ({ ...(p as ZarinpalSettings), icon_url: e.target.value }))}
                  />
                  <p className="text-muted-foreground text-xs">{t('zarinpal.iconUrlHint')}</p>
                </div>
              </div>
            </div>
            <TextArea
              label={t('zarinpal.fieldDescription')}
              value={settings.description}
              onChange={(v) => setDraft((p) => ({ ...(p as ZarinpalSettings), description: v }))}
            />
            <TextArea
              label={t('zarinpal.fieldInstructions')}
              value={settings.instructions}
              onChange={(v) => setDraft((p) => ({ ...(p as ZarinpalSettings), instructions: v }))}
            />
            <Field
              label={t('zarinpal.paymentDescription')}
              value={settings.payment_description ?? ''}
              onChange={(v) => setDraft((p) => ({ ...(p as ZarinpalSettings), payment_description: v }))}
              placeholder="{order_id}"
            />
            <p className="text-muted-foreground -mt-2 text-xs md:col-span-2">{t('zarinpal.paymentDescriptionHint')}</p>
            <TextArea
              label={t('zarinpal.successMessage')}
              value={settings.success_message}
              onChange={(v) => setDraft((p) => ({ ...(p as ZarinpalSettings), success_message: v }))}
              hint={t('zarinpal.successHint')}
            />
            <TextArea
              label={t('zarinpal.failedMessage')}
              value={settings.failed_message}
              onChange={(v) => setDraft((p) => ({ ...(p as ZarinpalSettings), failed_message: v }))}
              hint={t('zarinpal.failedHint')}
            />
            <TextArea
              label={t('zarinpal.cancelledMessage')}
              value={settings.cancelled_message ?? ''}
              onChange={(v) => setDraft((p) => ({ ...(p as ZarinpalSettings), cancelled_message: v }))}
              hint={t('zarinpal.cancelledHint')}
            />
            <TextArea
              label={t('zarinpal.invalidTokenMessage')}
              value={settings.invalid_token_message ?? ''}
              onChange={(v) => setDraft((p) => ({ ...(p as ZarinpalSettings), invalid_token_message: v }))}
              hint={t('zarinpal.invalidTokenHint')}
            />
          </div>
          <Button onClick={() => void save.mutate()} disabled={save.isPending}>
            {t('common.save')}
          </Button>
        </section>
      ) : null}

      {isOperations ? (
        <div className="grid gap-4">
          <section className="space-y-3 rounded-lg border border-border p-4">
            <h3 className="text-sm font-semibold">{t('zarinpal.reconcile')}</h3>
            <p className="text-muted-foreground text-sm">{t('zarinpal.reconcileHelp')}</p>
            <Button onClick={() => void reconcile.mutate()} disabled={reconcile.isPending}>
              {t('zarinpal.reconcile')}
            </Button>
            {statusQ.data?.last_reconcile ? (
              <KeyValueList
                emptyLabel={t('common.empty')}
                rows={[
                  { label: t('zarinpal.lastChecked'), value: String(statusQ.data.last_reconcile.checked_at ?? '—') },
                  { label: t('zarinpal.authorities'), value: String(statusQ.data.last_reconcile.authorities ?? 0) },
                  { label: t('zarinpal.matched'), value: String(statusQ.data.last_reconcile.matched ?? 0) },
                  { label: t('zarinpal.completed'), value: String(statusQ.data.last_reconcile.completed ?? 0) },
                  { label: t('zarinpal.skipped'), value: String(statusQ.data.last_reconcile.skipped ?? 0) },
                ]}
              />
            ) : null}
            <div>
              <h4 className="mb-2 text-xs font-medium uppercase text-muted-foreground">{t('zarinpal.queue')}</h4>
              {(statusQ.data?.jobs ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('common.empty')}</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {(statusQ.data?.jobs ?? []).map((job) => (
                    <li key={job.id}>
                      {job.type} — {new Date(job.run_after * 1000).toISOString()}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="space-y-3 rounded-lg border border-border p-4">
            <h3 className="text-sm font-semibold">{t('zarinpal.lookupTitle')}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t('zarinpal.authority')} value={lookupAuthority} onChange={setLookupAuthority} />
              <Field label={t('zarinpal.orderId')} value={lookupOrderId} onChange={setLookupOrderId} />
            </div>
            <Button onClick={() => void lookup.mutate()} disabled={lookup.isPending}>
              {t('zarinpal.lookup')}
            </Button>
            {lookupResult ? (
              <pre className="max-h-80 overflow-auto rounded-md border bg-muted/40 p-3 text-xs">
                {JSON.stringify(lookupResult, null, 2)}
              </pre>
            ) : null}
          </section>
        </div>
      ) : null}

      {isCoverage ? (
        <section className="rounded-lg border border-border p-4">
          <p className="mb-3 text-sm text-muted-foreground">{t('zarinpal.coverageMoved')}</p>
          {coverageQ.data ? (
            <PhaseCoverageCards data={coverageQ.data} emptyLabel={t('common.empty')} />
          ) : (
            <div>{t('common.loading')}</div>
          )}
        </section>
      ) : null}
    </PageShell>
  )
}
