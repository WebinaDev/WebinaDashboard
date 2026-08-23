import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { KeyValueList, StatusBadge } from '@/components/data/DumpUi'
import { PageShell } from '@/components/PageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'
import { formatDisplayDateTime } from '@/lib/date'

type KeysResponse = { public_key?: string; has_private_key?: boolean; message?: string }
type AuthStatus = {
  connected?: boolean
  access_expires_at?: number | null
  refresh_expires_at?: number | null
  has_refresh?: boolean
}
type SettingsResponse = { settings: Record<string, unknown>; auth?: AuthStatus }

const WEBHOOK_EVENT_KEYS = [
  'variant_status',
  'order_shipping_status',
  'package_status',
  'commission',
  'product_upsert',
  'brand_request',
  'warranty_request',
  'color_request',
  'size_request',
  'order_finalized',
  'order_item_cancelled',
  'order_returned',
] as const

const FALLBACK_LABELS: Record<(typeof WEBHOOK_EVENT_KEYS)[number], string> = {
  variant_status: 'تغییر وضعیت تنوع کالایی',
  order_shipping_status: 'تغییر وضعیت ارسال سفارش',
  package_status: 'تغییر وضعیت محموله ها',
  commission: 'تغییر در کمیسیون ها',
  product_upsert: 'ساخت و ویرایش محصول',
  brand_request: 'درخواست برند',
  warranty_request: 'درخواست گارانتی',
  color_request: 'درخواست رنگ',
  size_request: 'درخواست سایز',
  order_finalized: 'نهایی شدن سفارش',
  order_item_cancelled: 'لغو آیتم سفارش',
  order_returned: 'مرجوعی سفارش',
}

function asBoolMap(raw: unknown): Record<string, boolean> {
  const out: Record<string, boolean> = {}
  for (const key of WEBHOOK_EVENT_KEYS) out[key] = true
  if (!raw || typeof raw !== 'object') return out
  for (const key of WEBHOOK_EVENT_KEYS) {
    if (Object.prototype.hasOwnProperty.call(raw, key)) {
      out[key] = Boolean((raw as Record<string, unknown>)[key])
    }
  }
  return out
}

export default function DigikalaConnectorPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const [encrypted, setEncrypted] = useState('')
  const [clientCode, setClientCode] = useState('')
  const [webhookEvents, setWebhookEvents] = useState<Record<string, boolean>>(() => asBoolMap(null))

  const keysQ = useQuery({
    queryKey: ['digikala', 'keys'],
    queryFn: () => apiFetch<KeysResponse>('digikala/keys'),
  })
  const authQ = useQuery({
    queryKey: ['digikala', 'auth'],
    queryFn: () => apiFetch<AuthStatus>('digikala/auth/status'),
  })
  const settingsQ = useQuery({
    queryKey: ['digikala', 'settings'],
    queryFn: () => apiFetch<SettingsResponse>('digikala/settings'),
  })

  useEffect(() => {
    const code = settingsQ.data?.settings?.client_code
    if (typeof code === 'string') setClientCode(code)
    setWebhookEvents(asBoolMap(settingsQ.data?.settings?.webhook_events))
  }, [settingsQ.data?.settings?.client_code, settingsQ.data?.settings?.webhook_events])

  const generate = useMutation({
    mutationFn: () => apiFetch<KeysResponse>('digikala/keys/generate', { method: 'POST' }, 120_000),
    onSuccess: async (data) => {
      toast.success(data.message ?? t('digikala.keysGenerated'))
      await qc.invalidateQueries({ queryKey: ['digikala'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const issue = useMutation({
    mutationFn: () =>
      apiFetch('digikala/token/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encrypted_code: encrypted }),
      }),
    onSuccess: async () => {
      toast.success(t('digikala.tokenIssued'))
      setEncrypted('')
      await qc.invalidateQueries({ queryKey: ['digikala'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const test = useMutation({
    mutationFn: () => apiFetch('digikala/test-connection', { method: 'POST' }),
    onSuccess: () => toast.success(t('digikala.connectionOk')),
    onError: (e: Error) => toastApiError(t, e),
  })

  const saveSettings = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch('digikala/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    onSuccess: async () => {
      toast.success(t('digikala.settingsSaved'))
      await qc.invalidateQueries({ queryKey: ['digikala', 'settings'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const publicKey = keysQ.data?.public_key ?? ''
  const webhookUrl =
    typeof settingsQ.data?.settings?.webhook_url === 'string'
      ? settingsQ.data.settings.webhook_url
      : ''
  const labelsRaw = settingsQ.data?.settings?.webhook_event_labels
  const eventLabels = useMemo(() => {
    const map: Record<string, string> = { ...FALLBACK_LABELS }
    if (labelsRaw && typeof labelsRaw === 'object') {
      for (const [k, v] of Object.entries(labelsRaw as Record<string, unknown>)) {
        if (typeof v === 'string' && v) map[k] = v
      }
    }
    return map
  }, [labelsRaw])

  const auth = authQ.data ?? settingsQ.data?.auth
  const connected = Boolean(auth?.connected)

  return (
    <PageShell title={t('digikala.title')} description={t('digikala.subtitle')}>
      <div className="mb-4 flex flex-wrap gap-2">
        <Button asChild variant="secondary">
          <Link to="/settings/shop/digikala/products">{t('digikala.nav.products')}</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/settings/shop/digikala/orders">{t('digikala.nav.orders')}</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/settings/shop/digikala/jobs">{t('digikala.nav.jobs')}</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/settings/shop/digikala/settings">{t('digikala.nav.settings')}</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/settings/shop/digikala/logs">{t('digikala.nav.logs')}</Link>
        </Button>
      </div>

      <Card className="mb-4 border-primary/20">
        <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground text-sm">{t('digikala.authStatus')}</span>
              <Badge
                variant={connected ? 'default' : 'destructive'}
                className={connected ? 'bg-emerald-600 hover:bg-emerald-600' : ''}
              >
                {connected ? t('digikala.connectedShort') : t('digikala.disconnectedShort')}
              </Badge>
              {auth?.has_refresh ? <StatusBadge status={t('digikala.hasRefresh')} tone="secondary" /> : null}
            </div>
            <KeyValueList
              rows={[
                {
                  label: t('digikala.accessExpires'),
                  value: auth?.access_expires_at
                    ? formatDisplayDateTime(auth.access_expires_at, i18n.language)
                    : '—',
                },
                {
                  label: t('digikala.refreshExpires'),
                  value: auth?.refresh_expires_at
                    ? formatDisplayDateTime(auth.refresh_expires_at, i18n.language)
                    : '—',
                },
              ]}
              className="max-w-md"
            />
          </div>
          <Button
            className={connected ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            variant={connected ? 'default' : 'destructive'}
            onClick={() => test.mutate()}
            disabled={test.isPending}
          >
            {t('digikala.testConnection')}
          </Button>
        </CardContent>
      </Card>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('digikala.clientCodeOptional')}</CardTitle>
            <CardDescription>{t('digikala.clientCodeHint')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Input
              value={clientCode}
              onChange={(e) => setClientCode(e.target.value)}
              placeholder={t('digikala.clientCodePlaceholder')}
              className="max-w-xs font-mono text-sm"
            />
            <Button
              variant="secondary"
              disabled={saveSettings.isPending}
              onClick={() => saveSettings.mutate({ client_code: clientCode.trim() })}
            >
              {t('digikala.saveClientCode')}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('digikala.webhookCardTitle')}</CardTitle>
            <CardDescription>{t('digikala.webhookCardHint')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <code className="bg-muted block overflow-x-auto rounded-md p-3 text-xs">
              {webhookUrl || t('digikala.webhookUrlPending')}
            </code>
            <Button
              type="button"
              variant="outline"
              disabled={!webhookUrl}
              onClick={() => {
                void navigator.clipboard.writeText(webhookUrl)
                toast.success(t('digikala.copied'))
              }}
            >
              {t('digikala.copyWebhook')}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{t('digikala.webhookEventsTitle')}</CardTitle>
          <CardDescription>{t('digikala.webhookEventsHint')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="divide-border divide-y">
            {WEBHOOK_EVENT_KEYS.map((key) => (
              <li key={key} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium">{eventLabels[key] ?? key}</p>
                  <p className="text-muted-foreground font-mono text-[11px]">{key}</p>
                </div>
                <Switch
                  checked={webhookEvents[key] !== false}
                  onCheckedChange={(checked) =>
                    setWebhookEvents((prev) => ({ ...prev, [key]: checked }))
                  }
                />
              </li>
            ))}
          </ul>
          <Button
            disabled={saveSettings.isPending}
            onClick={() => saveSettings.mutate({ webhook_events: webhookEvents })}
          >
            {t('digikala.saveWebhookEvents')}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('digikala.rsaTitle')}</CardTitle>
            <CardDescription>{t('digikala.rsaHint')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={() => generate.mutate()} disabled={generate.isPending}>
              {t('digikala.generateKeys')}
            </Button>
            <p className="text-muted-foreground text-xs">
              {keysQ.data?.has_private_key ? t('digikala.privateStored') : t('digikala.noPrivate')}
            </p>
            <Textarea readOnly rows={5} value={publicKey} className="font-mono text-xs" />
            <Button
              type="button"
              variant="outline"
              disabled={!publicKey}
              onClick={() => {
                void navigator.clipboard.writeText(publicKey)
                toast.success(t('digikala.copied'))
              }}
            >
              {t('digikala.copyPublic')}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('digikala.tokenTitle')}</CardTitle>
            <CardDescription>{t('digikala.tokenHint')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              rows={4}
              value={encrypted}
              onChange={(e) => setEncrypted(e.target.value)}
              placeholder={t('digikala.encryptedPlaceholder')}
              className="font-mono text-xs"
            />
            <Button onClick={() => issue.mutate()} disabled={issue.isPending || !encrypted.trim()}>
              {t('digikala.issueToken')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
