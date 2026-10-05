import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronDown } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { BasalamNav } from '../../components/BasalamNav'
import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type Vendor = {
  id?: number
  title?: string
  summary?: string
  status?: string | number
}

type ProductLite = { id: number; name?: string; basalam_product_id?: number | string | null }

function asList(raw: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(raw)) return raw as Array<Record<string, unknown>>
  if (raw && typeof raw === 'object') {
    const data = (raw as { data?: unknown }).data
    if (Array.isArray(data)) return data as Array<Record<string, unknown>>
  }
  return []
}

function itemTitle(item: Record<string, unknown>): string {
  return String(item.title ?? item.name ?? item.label ?? item.id ?? '—')
}

export default function BasalamBoothPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [profileTitle, setProfileTitle] = useState('')
  const [discountProductId, setDiscountProductId] = useState('')
  const [discountPercent, setDiscountPercent] = useState('10')
  const [chatEnabled, setChatEnabled] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [chatNotify, setChatNotify] = useState(true)

  const statusQ = useQuery({
    queryKey: ['basalam', 'status'],
    queryFn: () => apiFetch<{ connected?: boolean; vendor_id?: string | number | null }>('basalam/status'),
  })

  const vendorQ = useQuery({
    queryKey: ['basalam', 'vendor'],
    queryFn: () => apiFetch<{ vendor: Vendor | null }>('basalam/vendor'),
  })

  const shippingQ = useQuery({
    queryKey: ['basalam', 'shipping'],
    queryFn: () =>
      apiFetch<{
        profiles?: unknown
        shipping?: unknown
        carriers?: unknown
        vendor_carriers?: unknown
      }>('basalam/shipping'),
  })

  const webhooksQ = useQuery({
    queryKey: ['basalam', 'webhooks'],
    queryFn: () =>
      apiFetch<{ webhooks: Array<Record<string, unknown>>; webhook_url?: string }>('basalam/webhooks'),
  })

  const discountsQ = useQuery({
    queryKey: ['basalam', 'discounts'],
    queryFn: () => apiFetch<{ discounts?: unknown }>('basalam/discounts'),
  })

  const productsQ = useQuery({
    queryKey: ['basalam', 'products', 'connected-lite'],
    queryFn: () =>
      apiFetch<{ products: ProductLite[] }>('basalam/products?filter=connected&per_page=100'),
  })

  const settingsQ = useQuery({
    queryKey: ['basalam', 'settings'],
    queryFn: () => apiFetch<{ settings: Record<string, unknown> }>('basalam/settings'),
  })

  const chatQ = useQuery({
    queryKey: ['basalam', 'chat'],
    queryFn: () =>
      apiFetch<{ enabled?: boolean; token?: string | null; script_url?: string }>(
        'basalam/chat/token',
      ),
    enabled: chatEnabled,
  })

  useEffect(() => {
    const v = vendorQ.data?.vendor
    if (v) {
      setTitle(String(v.title ?? ''))
      setSummary(String(v.summary ?? ''))
    }
  }, [vendorQ.data])

  useEffect(() => {
    const s = settingsQ.data?.settings
    if (!s) return
    if (typeof s.chat_notify_admins === 'boolean') setChatNotify(s.chat_notify_admins)
    else if (s.chat_notify_admins === 0 || s.chat_notify_admins === '0' || s.chat_notify_admins === 'no') {
      setChatNotify(false)
    }
  }, [settingsQ.data])

  useEffect(() => {
    if (!chatEnabled) return
    const token = chatQ.data?.token
    const src = chatQ.data?.script_url
    if (!token || !src) return
    const existing = document.getElementById('basalam-chat-widget-script')
    if (existing) return
    const el = document.createElement('script')
    el.id = 'basalam-chat-widget-script'
    el.src = src
    el.setAttribute('token', token)
    el.async = true
    document.body.appendChild(el)
    void apiFetch('basalam/chat/notify', {
      method: 'POST',
      body: JSON.stringify({ event: 'widget_opened' }),
    }).catch(() => undefined)
    return () => {
      el.remove()
    }
  }, [chatEnabled, chatQ.data])

  const saveVendor = useMutation({
    mutationFn: () =>
      apiFetch('basalam/vendor', {
        method: 'POST',
        body: JSON.stringify({ title, summary }),
      }),
    onSuccess: async () => {
      toast.success(t('basalam.boothSaved'))
      await qc.invalidateQueries({ queryKey: ['basalam', 'vendor'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const createShippingProfile = useMutation({
    mutationFn: () =>
      apiFetch('basalam/shipping', {
        method: 'POST',
        body: JSON.stringify({ title: profileTitle.trim() }),
      }),
    onSuccess: async () => {
      toast.success(t('basalam.shippingSaved'))
      setProfileTitle('')
      await qc.invalidateQueries({ queryKey: ['basalam', 'shipping'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const deleteShippingProfile = useMutation({
    mutationFn: (id: number) =>
      apiFetch('basalam/shipping', {
        method: 'POST',
        body: JSON.stringify({ action: 'delete_profile', profile_id: id }),
      }),
    onSuccess: async () => {
      toast.success(t('basalam.shippingProfileDeleted'))
      await qc.invalidateQueries({ queryKey: ['basalam', 'shipping'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const setupWebhook = useMutation({
    mutationFn: () => apiFetch('basalam/webhook/setup', { method: 'POST' }),
    onSuccess: async () => {
      toast.success(t('basalam.ordersAutoOk'))
      await qc.invalidateQueries({ queryKey: ['basalam', 'webhooks'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const rotateWebhook = useMutation({
    mutationFn: () => apiFetch('basalam/webhooks/rotate', { method: 'POST' }),
    onSuccess: async () => {
      toast.success(t('basalam.ordersAutoReset'))
      await qc.invalidateQueries({ queryKey: ['basalam', 'webhooks'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const createDiscount = useMutation({
    mutationFn: () =>
      apiFetch('basalam/discounts', {
        method: 'POST',
        body: JSON.stringify({
          product_id: Number(discountProductId) || 0,
          discount: Number(discountPercent) || 0,
        }),
      }),
    onSuccess: async () => {
      toast.success(t('basalam.discountCreated'))
      setDiscountProductId('')
      await qc.invalidateQueries({ queryKey: ['basalam', 'discounts'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const saveNotify = useMutation({
    mutationFn: (enabled: boolean) =>
      apiFetch('basalam/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_notify_admins: enabled }),
      }),
    onSuccess: async (_, enabled) => {
      setChatNotify(enabled)
      toast.success(t('basalam.settingsSaved'))
      await qc.invalidateQueries({ queryKey: ['basalam', 'settings'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const connected = Boolean(statusQ.data?.connected)
  const boothName = vendorQ.data?.vendor?.title || title || t('basalam.boothUntitled')
  const vendorId = vendorQ.data?.vendor?.id || statusQ.data?.vendor_id

  const webhooks = Array.isArray(webhooksQ.data?.webhooks) ? webhooksQ.data.webhooks : []
  const ordersAuto = webhooks.length > 0 || Boolean(webhooksQ.data?.webhook_url)

  const profilesList = useMemo(
    () => asList(shippingQ.data?.profiles ?? shippingQ.data?.shipping),
    [shippingQ.data],
  )
  const carriersList = useMemo(() => asList(shippingQ.data?.carriers), [shippingQ.data])
  const vendorCarriersList = useMemo(
    () => asList(shippingQ.data?.vendor_carriers),
    [shippingQ.data],
  )
  const discountItems = useMemo(() => asList(discountsQ.data?.discounts), [discountsQ.data])
  const connectedProducts = (productsQ.data?.products ?? []).filter((p) => p.basalam_product_id)

  return (
    <PageShell title={t('basalam.boothTitle')} description={t('basalam.boothSubtitle')}>
      <BasalamNav />

      <Card className="mb-4 max-w-4xl overflow-hidden border-border/70 bg-gradient-to-l from-muted/40 to-background">
        <CardContent className="flex flex-wrap items-start justify-between gap-4 py-5">
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs font-medium tracking-wide">
              {t('basalam.boothIdentity')}
            </p>
            <h2 className="text-xl font-semibold tracking-tight">{boothName || '—'}</h2>
            <p className="text-sm">
              {connected ? (
                <span className="text-emerald-700 dark:text-emerald-400">{t('basalam.connected')}</span>
              ) : (
                <span>{t('basalam.notConnected')}</span>
              )}
              {vendorId ? (
                <span className="text-muted-foreground"> · {t('basalam.boothIdLabel', { id: String(vendorId) })}</span>
              ) : null}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={chatEnabled ? 'default' : 'secondary'}
              onClick={() => setChatEnabled((v) => !v)}
              disabled={!connected}
            >
              {chatEnabled ? t('basalam.chatHide') : t('basalam.chatWithBuyer')}
            </Button>
            <Button
              variant={chatNotify ? 'default' : 'outline'}
              onClick={() => saveNotify.mutate(!chatNotify)}
              disabled={saveNotify.isPending || !connected}
            >
              {t('basalam.chatNotify')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid max-w-4xl gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('basalam.boothProfile')}</CardTitle>
            <CardDescription>{t('basalam.boothProfileHint')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="space-y-1 text-sm">
              <span>{t('basalam.boothTitleField')}</span>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label className="space-y-1 text-sm">
              <span>{t('basalam.boothSummaryField')}</span>
              <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} />
            </label>
            <Button onClick={() => saveVendor.mutate()} disabled={saveVendor.isPending || !connected}>
              {t('basalam.saveBooth')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('basalam.ordersAutoTitle')}</CardTitle>
            <CardDescription>
              {ordersAuto ? t('basalam.ordersAutoOn') : t('basalam.ordersAutoOff')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button onClick={() => setupWebhook.mutate()} disabled={setupWebhook.isPending || !connected}>
              {ordersAuto ? t('basalam.ordersAutoResetBtn') : t('basalam.ordersAutoEnable')}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('basalam.shippingTitle')}</CardTitle>
            <CardDescription>{t('basalam.shippingHint')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <p className="text-sm font-medium">{t('basalam.shippingProfiles')}</p>
              <div className="flex flex-wrap gap-2">
                <Input
                  className="min-w-[12rem] flex-1"
                  value={profileTitle}
                  onChange={(e) => setProfileTitle(e.target.value)}
                  placeholder={t('basalam.shippingProfileTitle')}
                />
                <Button
                  onClick={() => createShippingProfile.mutate()}
                  disabled={createShippingProfile.isPending || !profileTitle.trim() || !connected}
                >
                  {t('basalam.createShippingProfile')}
                </Button>
              </div>
              <ul className="space-y-2 text-sm">
                {profilesList.map((p) => (
                  <li key={String(p.id)} className="flex items-center justify-between gap-2 border-b py-2">
                    <span>{itemTitle(p)}</span>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteShippingProfile.mutate(Number(p.id))}
                      disabled={deleteShippingProfile.isPending}
                    >
                      {t('basalam.delete')}
                    </Button>
                  </li>
                ))}
                {!profilesList.length ? (
                  <li className="text-muted-foreground text-sm">{t('basalam.noShippingProfiles')}</li>
                ) : null}
              </ul>
            </div>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium">{t('basalam.shippingCarriers')}</p>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  {(vendorCarriersList.length ? vendorCarriersList : carriersList).slice(0, 12).map((c, i) => (
                    <li key={String(c.id ?? i)}>{itemTitle(c)}</li>
                  ))}
                  {!vendorCarriersList.length && !carriersList.length ? (
                    <li>{t('basalam.noCarriers')}</li>
                  ) : null}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('basalam.discountsTitle')}</CardTitle>
            <CardDescription>{t('basalam.discountsHint')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-[1fr_8rem_auto]">
            <select
              className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
              value={discountProductId}
              onChange={(e) => setDiscountProductId(e.target.value)}
            >
              <option value="">{t('basalam.selectProduct')}</option>
              {connectedProducts.map((p) => (
                <option key={p.id} value={String(p.basalam_product_id)}>
                  {p.name || `#${p.id}`}
                </option>
              ))}
            </select>
            <Input
              type="number"
              min={1}
              max={99}
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              placeholder={t('basalam.discountPercent')}
            />
            <Button
              onClick={() => createDiscount.mutate()}
              disabled={createDiscount.isPending || !discountProductId || !connected}
            >
              {t('basalam.createDiscount')}
            </Button>
            {discountItems.length ? (
              <ul className="text-muted-foreground space-y-1 text-sm md:col-span-3">
                {discountItems.slice(0, 8).map((d, i) => (
                  <li key={String(d.id ?? i)}>
                    {String(d.title ?? d.product_id ?? d.id ?? '—')}
                    {d.discount != null ? ` — ${String(d.discount)}%` : ''}
                  </li>
                ))}
              </ul>
            ) : null}
          </CardContent>
        </Card>

        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen} className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CollapsibleTrigger asChild>
                <button type="button" className="flex w-full items-center justify-between text-start">
                  <CardTitle className="text-base">{t('basalam.advanced')}</CardTitle>
                  <ChevronDown className={`size-4 transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
                </button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="space-y-3 border-t pt-4">
                {webhooksQ.data?.webhook_url ? (
                  <code className="bg-muted block overflow-x-auto rounded-md p-2 text-xs">
                    {webhooksQ.data.webhook_url}
                  </code>
                ) : null}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => rotateWebhook.mutate()}
                  disabled={rotateWebhook.isPending || !connected}
                >
                  {t('basalam.rotateWebhook')}
                </Button>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>
    </PageShell>
  )
}
