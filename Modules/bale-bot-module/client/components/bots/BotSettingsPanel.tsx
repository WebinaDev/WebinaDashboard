import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ApiError, toastApiError } from '@/lib/apiError'

import { IrtIcon } from '@/components/currency/IrtIcon'
import { FormSettingsSkeleton } from '@/components/skeletons'
import { apiFetch } from '@/lib/api'
import { translateEnum } from '@/lib/enumLabels'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { BotProvider } from '@/types/bots'

type BotSettings = Record<string, unknown>
type ParityMap = Record<string, unknown>

const MENU_TOGGLE_KEYS = [
  'menu_show_store',
  'menu_show_search',
  'menu_show_wishlist',
  'menu_show_cart',
  'menu_show_checkout',
  'menu_show_orders',
  'menu_show_addresses',
  'menu_show_support',
  'menu_show_sale',
] as const

const SITE_WIDGET_FLAGS = ['otp_enabled', 'popup_enabled', 'float_enabled', 'filebot_enabled'] as const

const MODULE_FLAG_KEYS = [
  'admin_ops',
  'c2c',
  'faq',
  'tickets',
  'club',
  'channel_publisher',
  'site_widgets',
  'notify_cascade',
  'outbound_queue',
] as const

function setStr(d: BotSettings, k: string, v: string): BotSettings {
  return { ...d, [k]: v }
}

function setFlag(d: BotSettings, k: string, on: boolean): BotSettings {
  return { ...d, [k]: on ? '1' : '0' }
}

function setNestedStr(d: BotSettings, parent: string, key: string, v: string): BotSettings {
  const cur = (d[parent] as Record<string, string>) || {}
  return { ...d, [parent]: { ...cur, [key]: v } }
}

function setNestedFlag(d: BotSettings, parent: string, key: string, on: boolean): BotSettings {
  const cur = (d[parent] as Record<string, string>) || {}
  return { ...d, [parent]: { ...cur, [key]: on ? '1' : '0' } }
}

function isOn(v: unknown): boolean {
  return v !== '0' && v !== 0 && v !== false && v !== null && v !== undefined && v !== ''
}

function menuChecked(v: unknown): boolean {
  return v === undefined || v === null || v === '' || isOn(v)
}

async function parityFetch(provider: BotProvider, resource: string): Promise<ParityMap | null> {
  const paths = [`bots/parity/${resource}`, `bots/${provider}/parity/${resource}`]
  for (const path of paths) {
    try {
      const data = await apiFetch<ParityMap | { settings?: ParityMap }>(path)
      if (data && typeof data === 'object' && 'settings' in data && data.settings && typeof data.settings === 'object') {
        return data.settings as ParityMap
      }
      return (data as ParityMap) ?? null
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) continue
      if (e instanceof ApiError && (e.status === 404 || e.code === 'not_found')) continue
    }
  }
  return null
}

async function paritySave(provider: BotProvider, resource: string, body: ParityMap): Promise<boolean> {
  const paths = [`bots/parity/${resource}`, `bots/${provider}/parity/${resource}`]
  for (const path of paths) {
    try {
      await apiFetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      return true
    } catch (e) {
      if (e instanceof ApiError && (e.status === 404 || e.code === 'not_found')) continue
      throw e
    }
  }
  return false
}

export function BotSettingsPanel({ provider }: { provider: BotProvider }) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const base = `bots/${provider}`
  const [draft, setDraft] = useState<BotSettings>({})
  const [siteWidgets, setSiteWidgets] = useState<ParityMap>({})
  const [parityModules, setParityModules] = useState<ParityMap>({})
  const [adminOps, setAdminOps] = useState<ParityMap>({})
  const [parityLoaded, setParityLoaded] = useState(false)
  const [tplDraft, setTplDraft] = useState('')
  const [tplPreview, setTplPreview] = useState('')
  const [tplBusy, setTplBusy] = useState(false)

  const q = useQuery({
    queryKey: ['bots', provider, 'settings'],
    queryFn: () => apiFetch<BotSettings>(`${base}/settings`),
  })

  useEffect(() => {
    if (q.data) setDraft({ ...q.data })
  }, [q.data])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const [sw, mods, ops] = await Promise.all([
        parityFetch(provider, 'site-widgets'),
        parityFetch(provider, 'modules'),
        parityFetch(provider, 'admin-ops'),
      ])
      if (cancelled) return
      if (sw) setSiteWidgets(sw)
      if (mods) setParityModules(mods)
      if (ops) setAdminOps(ops)
      setParityLoaded(true)
    })()
    return () => {
      cancelled = true
    }
  }, [provider])

  const urls = useQuery({
    queryKey: ['bots', provider, 'urls'],
    queryFn: () => apiFetch<{ rest_webhook: string; health_url: string }>(`${base}/webhook-urls`),
  })

  const save = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const saved = await apiFetch<BotSettings>(`${base}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      await Promise.all([
        paritySave(provider, 'site-widgets', siteWidgets).catch(() => false),
        paritySave(provider, 'modules', parityModules).catch(() => false),
        paritySave(provider, 'admin-ops', adminOps).catch(() => false),
      ])
      return saved
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['bots', provider, 'settings'] })
      await qc.invalidateQueries({ queryKey: ['bots', provider, 'connection-status'] })
      toast.success(t('common.saved'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const previewTemplate = async () => {
    setTplBusy(true)
    try {
      const paths = [`bots/parity/templates`, `bots/${provider}/parity/templates`]
      let result: ParityMap | null = null
      for (const path of paths) {
        try {
          result = await apiFetch<ParityMap>(path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ template: tplDraft, preview: true }),
          })
          break
        } catch (e) {
          if (e instanceof ApiError && (e.status === 404 || e.code === 'not_found')) continue
          throw e
        }
      }
      if (!result) {
        toast.error(t('bots.settings.templatePreviewUnavailable', 'پیش‌نمایش قالب در دسترس نیست'))
        return
      }
      const text =
        (typeof result.preview === 'string' && result.preview) ||
        (typeof result.rendered === 'string' && result.rendered) ||
        (typeof result.text === 'string' && result.text) ||
        JSON.stringify(result, null, 2)
      setTplPreview(text)
    } catch (e) {
      toastApiError(t, e as Error)
    } finally {
      setTplBusy(false)
    }
  }

  const setHook = useMutation({
    mutationFn: () => apiFetch(`${base}/set-webhook`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }),
    onSuccess: async () => {
      toast.success(t('bots.webhookSet'))
      await qc.invalidateQueries({ queryKey: ['bots', provider, 'connection-status'] })
    },
    onError: (e: Error) => {
      toastApiError(t, e)
      toast.error(t('bots.webhookSetFailed'))
    },
  })

  const delHook = useMutation({
    mutationFn: () => apiFetch(`${base}/delete-webhook`, { method: 'POST', body: '{}' }),
    onSuccess: async () => {
      toast.success(t('bots.webhookDeleted'))
      await qc.invalidateQueries({ queryKey: ['bots', provider, 'connection-status'] })
    },
    onError: (e: Error) => {
      toastApiError(t, e)
      toast.error(t('bots.webhookDeleteFailed'))
    },
  })

  const health = useQuery({
    queryKey: ['bots', provider, 'connection-status'],
    queryFn: () =>
      apiFetch<{ ok?: boolean; bot?: { username?: string }; webhook?: { url?: string }; error?: string }>(
        `${base}/connection-status`
      ),
    retry: false,
  })

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {urls.data && (
        <section className="rounded-lg border border-border p-4 text-sm">
          <p className="font-medium">{t('bots.webhookUrls')}</p>
          <p className="mt-2 break-all text-xs text-muted-foreground">{urls.data.rest_webhook}</p>
          <p className="mt-1 break-all text-xs text-muted-foreground">{urls.data.health_url}</p>
          {health.data && (
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              <p>
                {health.data.ok
                  ? t('bots.healthOk', { user: health.data.bot?.username ?? '—' })
                  : t('bots.healthFail', { error: health.data.error ?? '—' })}
              </p>
              <p className="break-all">
                {t('bots.webhookCurrentUrl')}: {health.data.webhook?.url ? health.data.webhook.url : t('bots.webhookNotSet')}
              </p>
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="secondary" disabled={setHook.isPending} onClick={() => void setHook.mutateAsync()}>
              {t('bots.connectWebhook')}
            </Button>
            <Button type="button" size="sm" variant="outline" disabled={delHook.isPending} onClick={() => void delHook.mutateAsync()}>
              {t('bots.disconnectWebhook')}
            </Button>
          </div>
        </section>
      )}

      {q.isLoading ? <FormSettingsSkeleton cards={3} fieldsPerCard={5} /> : null}
      {q.isError && <p className="text-sm text-destructive">{(q.error as Error).message}</p>}

      {q.data && (
        <div className="space-y-4">
          <details className="rounded-lg border border-border p-4 text-start" open>
            <summary className="flex cursor-pointer list-none items-center justify-between text-start text-sm font-semibold [&::-webkit-details-marker]:hidden">{t('bots.settings.planTokens')}</summary>
            <div className="mt-4 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="plan_tier">{t('bots.settings.planTier')}</Label>
                <Select
                  value={String(draft.plan_tier ?? 'basic')}
                  onValueChange={(v) => setDraft((d) => setStr(d, 'plan_tier', v))}
                >
                  <SelectTrigger id="plan_tier" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">{translateEnum(t, "shopBot.tier", "basic")}</SelectItem>
                    <SelectItem value="advanced">{translateEnum(t, "shopBot.tier", "advanced")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bot_token">{t('bots.botToken')}</Label>
                <Input
                  id="bot_token"
                  type="password"
                  autoComplete="off"
                  className="mt-1 font-mono"
                  value={String(draft.bot_token ?? '')}
                  onChange={(e) => setDraft((d) => setStr(d, 'bot_token', e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="channel_id">{t('bots.channelId')}</Label>
                <Input id="channel_id" className="mt-1" value={String(draft.channel_id ?? '')} onChange={(e) => setDraft((d) => setStr(d, 'channel_id', e.target.value))} />
              </div>
              <div>
                <Label htmlFor="provider_token">
                  {provider === 'bale' ? t('bots.providerTokenBale') : t('bots.providerToken')}
                </Label>
                <Input
                  id="provider_token"
                  type="password"
                  autoComplete="off"
                  className="mt-1 font-mono"
                  value={String(draft.provider_token ?? '')}
                  onChange={(e) => setDraft((d) => setStr(d, 'provider_token', e.target.value))}
                />
                {provider === 'bale' ? (
                  <p className="mt-1 text-xs text-muted-foreground">{t('bots.providerTokenBaleHint')}</p>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="sandbox_mode"
                  checked={draft.sandbox_mode === '1'}
                  onCheckedChange={(v) => setDraft((d) => setFlag(d, 'sandbox_mode', v === true))}
                />
                <Label htmlFor="sandbox_mode" className="cursor-pointer font-normal">
                  {t('bots.settings.sandboxMode')}
                </Label>
              </div>
              <div>
                <Label htmlFor="bot_token_sandbox">{t('bots.settings.sandboxToken')}</Label>
                <Input
                  id="bot_token_sandbox"
                  type="password"
                  className="mt-1 font-mono"
                  value={String(draft.bot_token_sandbox ?? '')}
                  onChange={(e) => setDraft((d) => setStr(d, 'bot_token_sandbox', e.target.value))}
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="webhook_require_secret"
                  checked={draft.webhook_require_secret === '1'}
                  onCheckedChange={(v) => setDraft((d) => setFlag(d, 'webhook_require_secret', v === true))}
                />
                <Label htmlFor="webhook_require_secret" className="cursor-pointer font-normal">
                  {t('bots.settings.webhookRequireSecret')}
                </Label>
              </div>
              <div>
                <Label htmlFor="webhook_secret">{t('bots.settings.webhookSecret')}</Label>
                <Input
                  id="webhook_secret"
                  className="mt-1 font-mono"
                  value={String(draft.webhook_secret ?? '')}
                  onChange={(e) => setDraft((d) => setStr(d, 'webhook_secret', e.target.value))}
                />
              </div>
            </div>
          </details>

          <details className="rounded-lg border border-border p-4 text-start" open>
            <summary className="flex cursor-pointer list-none items-center justify-between text-start text-sm font-semibold [&::-webkit-details-marker]:hidden">{t('bots.settings.messages')}</summary>
            <div className="mt-4 space-y-3">
              <div>
                <Label htmlFor="welcome_text">{t('bots.welcomeText')}</Label>
                <Textarea id="welcome_text" className="mt-1 min-h-16" value={String(draft.welcome_text ?? '')} onChange={(e) => setDraft((d) => setStr(d, 'welcome_text', e.target.value))} />
              </div>
              <div>
                <Label htmlFor="error_text">{t('bots.settings.errorText')}</Label>
                <Textarea id="error_text" className="mt-1 min-h-16" value={String(draft.error_text ?? '')} onChange={(e) => setDraft((d) => setStr(d, 'error_text', e.target.value))} />
              </div>
              <div>
                <Label htmlFor="contact_button_text">{t('bots.settings.contactButton')}</Label>
                <Input id="contact_button_text" className="mt-1" value={String(draft.contact_button_text ?? '')} onChange={(e) => setDraft((d) => setStr(d, 'contact_button_text', e.target.value))} />
              </div>
              <div>
                <Label htmlFor="store_button_text">{t('bots.settings.storeButton')}</Label>
                <Input id="store_button_text" className="mt-1" value={String(draft.store_button_text ?? '')} onChange={(e) => setDraft((d) => setStr(d, 'store_button_text', e.target.value))} />
              </div>
              <div>
                <Label htmlFor="auth_success_text">{t('bots.settings.authSuccess')}</Label>
                <Textarea id="auth_success_text" className="mt-1 min-h-12" value={String(draft.auth_success_text ?? '')} onChange={(e) => setDraft((d) => setStr(d, 'auth_success_text', e.target.value))} />
              </div>
              <div>
                <Label htmlFor="support_contact_text">{t('bots.settings.supportContact')}</Label>
                <Textarea id="support_contact_text" className="mt-1 min-h-12" value={String(draft.support_contact_text ?? '')} onChange={(e) => setDraft((d) => setStr(d, 'support_contact_text', e.target.value))} />
              </div>
            </div>
          </details>

          <details className="rounded-lg border border-border p-4 text-start">
            <summary className="flex cursor-pointer list-none items-center justify-between text-start text-sm font-semibold [&::-webkit-details-marker]:hidden">{t('bots.settings.linksCommerce')}</summary>
            <div className="mt-4 space-y-3">
              <div>
                <Label htmlFor="manual_payment_link_template">{t('bots.settings.manualPaymentTpl')}</Label>
                <Textarea id="manual_payment_link_template" className="mt-1 min-h-12" value={String(draft.manual_payment_link_template ?? '')} onChange={(e) => setDraft((d) => setStr(d, 'manual_payment_link_template', e.target.value))} />
              </div>
              <div>
                <Label htmlFor="post_tracking_url_template">{t('bots.settings.postTrackingTpl')}</Label>
                <Input id="post_tracking_url_template" className="mt-1" value={String(draft.post_tracking_url_template ?? '')} onChange={(e) => setDraft((d) => setStr(d, 'post_tracking_url_template', e.target.value))} />
              </div>
              <div>
                <Label htmlFor="channel_contact_id">{t('bots.settings.channelContactId')}</Label>
                <Input id="channel_contact_id" className="mt-1" value={String(draft.channel_contact_id ?? '')} onChange={(e) => setDraft((d) => setStr(d, 'channel_contact_id', e.target.value))} />
              </div>
              <div>
                <Label htmlFor="channel_bale_link">{t('bots.settings.channelBaleLink')}</Label>
                <Input id="channel_bale_link" className="mt-1" value={String(draft.channel_bale_link ?? '')} onChange={(e) => setDraft((d) => setStr(d, 'channel_bale_link', e.target.value))} />
              </div>
              <div>
                <Label htmlFor="products_per_page">{t('bots.settings.productsPerPage')}</Label>
                <Input
                  id="products_per_page"
                  type="number"
                  min={1}
                  max={20}
                  className="mt-1 w-24"
                  value={String(draft.products_per_page ?? 5)}
                  onChange={(e) => setDraft((d) => setStr(d, 'products_per_page', e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store_currency_unit">{t('bots.settings.currencyUnit')}</Label>
                <Select
                  value={String(draft.store_currency_unit ?? '') || '_default'}
                  onValueChange={(v) => setDraft((d) => setStr(d, 'store_currency_unit', v === '_default' ? '' : v))}
                >
                  <SelectTrigger id="store_currency_unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_default">{t('bots.settings.currencyDefault')}</SelectItem>
                    <SelectItem value="toman">
                      <span className="inline-flex items-center gap-1.5">
                        <IrtIcon />
                        {translateEnum(t, 'shopBot.currency', 'toman')}
                      </span>
                    </SelectItem>
                    <SelectItem value="rial">{translateEnum(t, "shopBot.currency", "rial")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="invoice_amount_rial_multiplier">{t('bots.settings.invoiceRialMultiplier')}</Label>
                <Input
                  id="invoice_amount_rial_multiplier"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min={0.01}
                  max={1000}
                  className="mt-1 w-32"
                  value={String(draft.invoice_amount_rial_multiplier ?? 1)}
                  onChange={(e) => setDraft((d) => setStr(d, 'invoice_amount_rial_multiplier', e.target.value))}
                />
                <p className="mt-1 text-xs text-muted-foreground">{t('bots.settings.invoiceRialMultiplierHint')}</p>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="hide_out_of_stock_products"
                  checked={draft.hide_out_of_stock_products === '1'}
                  onCheckedChange={(v) => setDraft((d) => setFlag(d, 'hide_out_of_stock_products', v === true))}
                />
                <Label htmlFor="hide_out_of_stock_products" className="cursor-pointer font-normal">
                  {t('bots.settings.hideOutOfStock')}
                </Label>
              </div>
            </div>
          </details>

          <details className="rounded-lg border border-border p-4 text-start">
            <summary className="flex cursor-pointer list-none items-center justify-between text-start text-sm font-semibold [&::-webkit-details-marker]:hidden">{t('bots.settings.orderTemplates')}</summary>
            <div className="mt-4 space-y-3">
              <p className="text-sm text-muted-foreground">{t('settings.shopBots.legacyMovedHint')}</p>
              <Button asChild variant="outline" size="sm">
                <Link to={`/settings/shop/bots`}>{t('settings.shopBots.openShopNotify')}</Link>
              </Button>
            </div>
          </details>

          <details className="rounded-lg border border-border p-4 text-start">
            <summary className="flex cursor-pointer list-none items-center justify-between text-start text-sm font-semibold [&::-webkit-details-marker]:hidden">{t('bots.settings.notifyStatus')}</summary>
            <div className="mt-4 space-y-3">
              <p className="text-sm text-muted-foreground">{t('settings.shopBots.legacyMovedHint')}</p>
              <Button asChild variant="outline" size="sm">
                <Link to={`/settings/shop/bots`}>{t('settings.shopBots.openShopNotify')}</Link>
              </Button>
            </div>
          </details>

          <details className="rounded-lg border border-border p-4 text-start">
            <summary className="flex cursor-pointer list-none items-center justify-between text-start text-sm font-semibold [&::-webkit-details-marker]:hidden">{t('bots.settings.abandonCart')}</summary>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="abandon_cart_enabled"
                  checked={draft.abandon_cart_enabled === '1'}
                  onCheckedChange={(v) => setDraft((d) => setFlag(d, 'abandon_cart_enabled', v === true))}
                />
                <Label htmlFor="abandon_cart_enabled" className="cursor-pointer font-normal">
                  {t('bots.settings.abandonEnabled')}
                </Label>
              </div>
              <div>
                <Label htmlFor="abandon_cart_delay_hours">{t('bots.settings.abandonDelay')}</Label>
                <Input
                  id="abandon_cart_delay_hours"
                  type="number"
                  min={1}
                  max={720}
                  className="mt-1 w-28"
                  value={String(draft.abandon_cart_delay_hours ?? 24)}
                  onChange={(e) => setDraft((d) => setStr(d, 'abandon_cart_delay_hours', e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="abandon_cart_message">{t('bots.settings.abandonMessage')}</Label>
                <Textarea id="abandon_cart_message" className="mt-1 min-h-16" value={String(draft.abandon_cart_message ?? '')} onChange={(e) => setDraft((d) => setStr(d, 'abandon_cart_message', e.target.value))} />
              </div>
              <p className="pt-1 text-xs font-medium text-muted-foreground">{t('bots.settings.abandonStage2', 'مرحله ۲')}</p>
              <div>
                <Label htmlFor="abandon_cart_delay_hours_2">{t('bots.settings.abandonDelay2', 'تأخیر مرحله ۲ (ساعت)')}</Label>
                <Input
                  id="abandon_cart_delay_hours_2"
                  type="number"
                  min={1}
                  max={720}
                  className="mt-1 w-28"
                  value={String(draft.abandon_cart_delay_hours_2 ?? 48)}
                  onChange={(e) => setDraft((d) => setStr(d, 'abandon_cart_delay_hours_2', e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="abandon_cart_message_2">{t('bots.settings.abandonMessage2', 'پیام مرحله ۲')}</Label>
                <Textarea id="abandon_cart_message_2" className="mt-1 min-h-14" value={String(draft.abandon_cart_message_2 ?? '')} onChange={(e) => setDraft((d) => setStr(d, 'abandon_cart_message_2', e.target.value))} />
              </div>
              <div>
                <Label htmlFor="abandon_cart_coupon_2">{t('bots.settings.abandonCoupon2', 'مبلغ کوپن مرحله ۲')}</Label>
                <Input
                  id="abandon_cart_coupon_2"
                  type="number"
                  min={0}
                  className="mt-1 w-28"
                  value={String(draft.abandon_cart_coupon_2 ?? 0)}
                  onChange={(e) => setDraft((d) => setStr(d, 'abandon_cart_coupon_2', e.target.value))}
                />
              </div>
              <p className="pt-1 text-xs font-medium text-muted-foreground">{t('bots.settings.abandonStage3', 'مرحله ۳')}</p>
              <div>
                <Label htmlFor="abandon_cart_delay_hours_3">{t('bots.settings.abandonDelay3', 'تأخیر مرحله ۳ (ساعت)')}</Label>
                <Input
                  id="abandon_cart_delay_hours_3"
                  type="number"
                  min={1}
                  max={720}
                  className="mt-1 w-28"
                  value={String(draft.abandon_cart_delay_hours_3 ?? 72)}
                  onChange={(e) => setDraft((d) => setStr(d, 'abandon_cart_delay_hours_3', e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="abandon_cart_message_3">{t('bots.settings.abandonMessage3', 'پیام مرحله ۳')}</Label>
                <Textarea id="abandon_cart_message_3" className="mt-1 min-h-14" value={String(draft.abandon_cart_message_3 ?? '')} onChange={(e) => setDraft((d) => setStr(d, 'abandon_cart_message_3', e.target.value))} />
              </div>
              <div>
                <Label htmlFor="abandon_cart_coupon_3">{t('bots.settings.abandonCoupon3', 'مبلغ کوپن مرحله ۳')}</Label>
                <Input
                  id="abandon_cart_coupon_3"
                  type="number"
                  min={0}
                  className="mt-1 w-28"
                  value={String(draft.abandon_cart_coupon_3 ?? 0)}
                  onChange={(e) => setDraft((d) => setStr(d, 'abandon_cart_coupon_3', e.target.value))}
                />
              </div>
            </div>
          </details>

          <details className="rounded-lg border border-border p-4 text-start">
            <summary className="flex cursor-pointer list-none items-center justify-between text-start text-sm font-semibold [&::-webkit-details-marker]:hidden">{t('bots.settings.forceJoin')}</summary>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="force_join_enabled"
                  checked={draft.force_join_enabled === '1'}
                  onCheckedChange={(v) => setDraft((d) => setFlag(d, 'force_join_enabled', v === true))}
                />
                <Label htmlFor="force_join_enabled" className="cursor-pointer font-normal">
                  {t('bots.settings.forceJoinEnabled')}
                </Label>
              </div>
              <div>
                <Label htmlFor="force_join_channel_id">{t('bots.settings.forceJoinChannelId')}</Label>
                <Input id="force_join_channel_id" className="mt-1" value={String(draft.force_join_channel_id ?? '')} onChange={(e) => setDraft((d) => setStr(d, 'force_join_channel_id', e.target.value))} />
              </div>
              <div>
                <Label htmlFor="force_join_channel_link">{t('bots.settings.forceJoinChannelLink')}</Label>
                <Input id="force_join_channel_link" className="mt-1" value={String(draft.force_join_channel_link ?? '')} onChange={(e) => setDraft((d) => setStr(d, 'force_join_channel_link', e.target.value))} />
              </div>
              <div>
                <Label htmlFor="force_join_message">{t('bots.settings.forceJoinMessage')}</Label>
                <Textarea id="force_join_message" className="mt-1 min-h-20" value={String(draft.force_join_message ?? '')} onChange={(e) => setDraft((d) => setStr(d, 'force_join_message', e.target.value))} />
              </div>
              <div>
                <Label htmlFor="force_join_check_button_text">{t('bots.settings.forceJoinCheckBtn')}</Label>
                <Input id="force_join_check_button_text" className="mt-1" value={String(draft.force_join_check_button_text ?? '')} onChange={(e) => setDraft((d) => setStr(d, 'force_join_check_button_text', e.target.value))} />
              </div>
            </div>
          </details>

          <details className="rounded-lg border border-border p-4 text-start">
            <summary className="flex cursor-pointer list-none items-center justify-between text-start text-sm font-semibold [&::-webkit-details-marker]:hidden">{t('bots.settings.channelRules')}</summary>
            <div className="mt-4 space-y-3">
              <div>
                <Label htmlFor="channel_rule_category_ids">{t('bots.settings.ruleCategories')}</Label>
                <Input id="channel_rule_category_ids" className="mt-1" value={String(draft.channel_rule_category_ids ?? '')} onChange={(e) => setDraft((d) => setStr(d, 'channel_rule_category_ids', e.target.value))} />
              </div>
              <div>
                <Label htmlFor="channel_rule_tag_ids">{t('bots.settings.ruleTags')}</Label>
                <Input id="channel_rule_tag_ids" className="mt-1" value={String(draft.channel_rule_tag_ids ?? '')} onChange={(e) => setDraft((d) => setStr(d, 'channel_rule_tag_ids', e.target.value))} />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="channel_rule_sale_only"
                  checked={draft.channel_rule_sale_only === '1'}
                  onCheckedChange={(v) => setDraft((d) => setFlag(d, 'channel_rule_sale_only', v === true))}
                />
                <Label htmlFor="channel_rule_sale_only" className="cursor-pointer font-normal">
                  {t('bots.settings.ruleSaleOnly')}
                </Label>
              </div>
              <div>
                <Label htmlFor="channel_rule_min_price">{t('bots.settings.ruleMinPrice')}</Label>
                <Input id="channel_rule_min_price" className="mt-1" value={String(draft.channel_rule_min_price ?? '')} onChange={(e) => setDraft((d) => setStr(d, 'channel_rule_min_price', e.target.value))} />
              </div>
              <div className="flex gap-3">
                <div>
                  <Label htmlFor="channel_rule_hour_start">{t('bots.settings.ruleHourStart')}</Label>
                  <Input id="channel_rule_hour_start" className="mt-1 w-20" value={String(draft.channel_rule_hour_start ?? '')} onChange={(e) => setDraft((d) => setStr(d, 'channel_rule_hour_start', e.target.value))} />
                </div>
                <div>
                  <Label htmlFor="channel_rule_hour_end">{t('bots.settings.ruleHourEnd')}</Label>
                  <Input id="channel_rule_hour_end" className="mt-1 w-20" value={String(draft.channel_rule_hour_end ?? '')} onChange={(e) => setDraft((d) => setStr(d, 'channel_rule_hour_end', e.target.value))} />
                </div>
              </div>
            </div>
          </details>

          <details className="rounded-lg border border-border p-4 text-start">
            <summary className="flex cursor-pointer list-none items-center justify-between text-start text-sm font-semibold [&::-webkit-details-marker]:hidden">{t('bots.settings.loyalty')}</summary>
            <div className="mt-4 space-y-3">
              {(() => {
                const loyalty = (draft.loyalty as Record<string, unknown>) || {}
                const setLoyalty = (key: string, value: string | boolean) => {
                  setDraft((d) => {
                    const cur = { ...((d.loyalty as Record<string, unknown>) || {}) }
                    cur[key] = typeof value === 'boolean' ? (value ? '1' : '0') : value
                    return { ...d, loyalty: cur }
                  })
                }
                return (
                  <>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="loyalty_enabled"
                        checked={loyalty.enabled === '1'}
                        onCheckedChange={(v) => setLoyalty('enabled', v === true)}
                      />
                      <Label htmlFor="loyalty_enabled" className="cursor-pointer font-normal">
                        {t('bots.settings.loyaltyEnabled')}
                      </Label>
                    </div>
                    <div>
                      <Label htmlFor="points_per_order">{t('bots.settings.pointsPerOrder')}</Label>
                      <Input
                        id="points_per_order"
                        type="number"
                        min={0}
                        className="mt-1 w-28"
                        value={String(loyalty.points_per_order ?? 10)}
                        onChange={(e) => setLoyalty('points_per_order', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="min_order_amount">{t('bots.settings.minOrderAmount')}</Label>
                      <Input
                        id="min_order_amount"
                        type="number"
                        min={0}
                        className="mt-1 w-36"
                        value={String(loyalty.min_order_amount ?? 0)}
                        onChange={(e) => setLoyalty('min_order_amount', e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="referral_enabled"
                        checked={loyalty.referral_enabled === '1'}
                        onCheckedChange={(v) => setLoyalty('referral_enabled', v === true)}
                      />
                      <Label htmlFor="referral_enabled" className="cursor-pointer font-normal">
                        {t('bots.settings.referralEnabled')}
                      </Label>
                    </div>
                    <div>
                      <Label htmlFor="referral_points">{t('bots.settings.referralPoints')}</Label>
                      <Input
                        id="referral_points"
                        type="number"
                        min={0}
                        className="mt-1 w-28"
                        value={String(loyalty.referral_points ?? 50)}
                        onChange={(e) => setLoyalty('referral_points', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="webapp_base_url">{t('bots.settings.webappUrl')}</Label>
                      <Input
                        id="webapp_base_url"
                        className="mt-1"
                        value={String(loyalty.webapp_base_url ?? '')}
                        onChange={(e) => setLoyalty('webapp_base_url', e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="checkout_national_id"
                        checked={
                          ((loyalty.checkout_fields as Record<string, Record<string, string>>)?.national_id?.enabled ??
                            '0') === '1'
                        }
                        onCheckedChange={(v) => {
                          setDraft((d) => {
                            const cur = { ...((d.loyalty as Record<string, unknown>) || {}) }
                            const fields = {
                              ...((cur.checkout_fields as Record<string, Record<string, string>>) || {}),
                            }
                            fields.national_id = {
                              ...(fields.national_id || {}),
                              enabled: v === true ? '1' : '0',
                            }
                            cur.checkout_fields = fields
                            return { ...d, loyalty: cur }
                          })
                        }}
                      />
                      <Label htmlFor="checkout_national_id" className="cursor-pointer font-normal">
                        {t('bots.settings.checkoutNationalId')}
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="checkout_company"
                        checked={
                          ((loyalty.checkout_fields as Record<string, Record<string, string>>)?.company?.enabled ??
                            '0') === '1'
                        }
                        onCheckedChange={(v) => {
                          setDraft((d) => {
                            const cur = { ...((d.loyalty as Record<string, unknown>) || {}) }
                            const fields = {
                              ...((cur.checkout_fields as Record<string, Record<string, string>>) || {}),
                            }
                            fields.company = {
                              ...(fields.company || {}),
                              enabled: v === true ? '1' : '0',
                            }
                            cur.checkout_fields = fields
                            return { ...d, loyalty: cur }
                          })
                        }}
                      />
                      <Label htmlFor="checkout_company" className="cursor-pointer font-normal">
                        {t('bots.settings.checkoutCompany', 'دریافت نام شرکت در چک‌اوت')}
                      </Label>
                    </div>
                    <div>
                      <Label htmlFor="first_order_bonus">{t('bots.settings.firstOrderBonus', 'پاداش اولین سفارش')}</Label>
                      <Input
                        id="first_order_bonus"
                        type="number"
                        min={0}
                        className="mt-1 w-28"
                        value={String(loyalty.first_order_bonus ?? 0)}
                        onChange={(e) => setLoyalty('first_order_bonus', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="redeem_points_cost">{t('bots.settings.redeemPointsCost', 'امتیاز لازم برای تبدیل')}</Label>
                      <Input
                        id="redeem_points_cost"
                        type="number"
                        min={0}
                        className="mt-1 w-28"
                        value={String(loyalty.redeem_points ?? loyalty.redeem_points_cost ?? 100)}
                        onChange={(e) => setLoyalty('redeem_points', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="redeem_coupon_amount">{t('bots.settings.redeemCouponAmount', 'مبلغ کوپن تبدیل امتیاز')}</Label>
                      <Input
                        id="redeem_coupon_amount"
                        type="number"
                        min={0}
                        className="mt-1 w-28"
                        value={String(loyalty.redeem_coupon_amount ?? 10)}
                        onChange={(e) => setLoyalty('redeem_coupon_amount', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="welcome_coupon_amount">{t('bots.settings.welcomeCouponAmount', 'مبلغ کوپن خوش‌آمد')}</Label>
                      <Input
                        id="welcome_coupon_amount"
                        type="number"
                        min={0}
                        className="mt-1 w-28"
                        value={String(loyalty.welcome_coupon_amount ?? 0)}
                        onChange={(e) => setLoyalty('welcome_coupon_amount', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="inactive_nudge_days">{t('bots.settings.inactiveNudgeDays', 'یادآوری کاربر غیرفعال (روز)')}</Label>
                      <Input
                        id="inactive_nudge_days"
                        type="number"
                        min={0}
                        className="mt-1 w-28"
                        value={String(loyalty.inactive_nudge_days ?? 30)}
                        onChange={(e) => setLoyalty('inactive_nudge_days', e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="sale_auto_notify"
                        checked={draft.sale_auto_notify === '1'}
                        onCheckedChange={(v) => setDraft((d) => setFlag(d, 'sale_auto_notify', v === true))}
                      />
                      <Label htmlFor="sale_auto_notify" className="cursor-pointer font-normal">
                        {t('bots.settings.saleAutoNotify', 'اعلان خودکار شروع حراج')}
                      </Label>
                    </div>
                  </>
                )
              })()}
            </div>
          </details>

          <details className="rounded-lg border border-border p-4 text-start">
            <summary className="flex cursor-pointer list-none items-center justify-between text-start text-sm font-semibold [&::-webkit-details-marker]:hidden">
              {t('bots.settings.menuToggles', 'نمایش دکمه‌های منو')}
            </summary>
            <div className="mt-4 flex flex-wrap gap-3">
              {MENU_TOGGLE_KEYS.map((key) => (
                <div key={key} className="flex items-center gap-2">
                  <Checkbox
                    id={key}
                    checked={menuChecked(draft[key])}
                    onCheckedChange={(v) => setDraft((d) => setFlag(d, key, v === true))}
                  />
                  <Label htmlFor={key} className="cursor-pointer font-normal">
                    {t(`bots.settings.${key}`, key.replace('menu_show_', ''))}
                  </Label>
                </div>
              ))}
            </div>
          </details>

          <details className="rounded-lg border border-border p-4 text-start">
            <summary className="flex cursor-pointer list-none items-center justify-between text-start text-sm font-semibold [&::-webkit-details-marker]:hidden">
              {t('bots.settings.parityModules', 'ماژول‌های پاریتی')}
            </summary>
            <div className="mt-4 space-y-4">
              {!parityLoaded ? (
                <p className="text-xs text-muted-foreground">{t('common.loading', 'در حال بارگذاری…')}</p>
              ) : null}
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">{t('bots.settings.siteWidgets', 'ویجت‌های سایت')}</p>
                <div className="flex flex-wrap gap-3">
                  {SITE_WIDGET_FLAGS.map((key) => (
                    <div key={key} className="flex items-center gap-2">
                      <Checkbox
                        id={`sw-${key}`}
                        checked={isOn(siteWidgets[key])}
                        onCheckedChange={(v) =>
                          setSiteWidgets((s) => ({ ...s, [key]: v === true ? '1' : '0' }))
                        }
                      />
                      <Label htmlFor={`sw-${key}`} className="cursor-pointer font-normal">
                        {t(`bots.settings.widget.${key}`, key.replace('_enabled', ''))}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">{t('bots.settings.moduleFlags', 'فعال‌سازی ماژول‌ها')}</p>
                <div className="flex flex-wrap gap-3">
                  {MODULE_FLAG_KEYS.map((key) => (
                    <div key={key} className="flex items-center gap-2">
                      <Checkbox
                        id={`mod-${key}`}
                        checked={isOn(parityModules[key])}
                        onCheckedChange={(v) =>
                          setParityModules((m) => ({ ...m, [key]: v === true ? '1' : '0' }))
                        }
                      />
                      <Label htmlFor={`mod-${key}`} className="cursor-pointer font-normal">
                        {t(`bots.settings.module.${key}`, key)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="stock_threshold">{t('bots.settings.stockThreshold', 'آستانه موجودی کم')}</Label>
                  <Input
                    id="stock_threshold"
                    type="number"
                    min={0}
                    className="mt-1 w-28"
                    value={String(adminOps.stock_threshold ?? '')}
                    onChange={(e) => setAdminOps((o) => ({ ...o, stock_threshold: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="route_high_aov">{t('bots.settings.routeHighAov', 'مسیریابی سفارش با مبلغ بالا')}</Label>
                  <Input
                    id="route_high_aov"
                    type="number"
                    min={0}
                    className="mt-1 w-36"
                    value={String(adminOps.route_high_aov ?? '')}
                    onChange={(e) => setAdminOps((o) => ({ ...o, route_high_aov: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </details>

          <details className="rounded-lg border border-border p-4 text-start">
            <summary className="flex cursor-pointer list-none items-center justify-between text-start text-sm font-semibold [&::-webkit-details-marker]:hidden">
              {t('bots.settings.templatePreview', 'پیش‌نمایش قالب')}
            </summary>
            <div className="mt-4 space-y-3">
              <Textarea
                id="parity_template"
                className="min-h-20 font-mono text-xs"
                value={tplDraft}
                onChange={(e) => setTplDraft(e.target.value)}
                placeholder="{order_number} {customer} {total}"
              />
              <Button type="button" size="sm" variant="secondary" disabled={tplBusy || !tplDraft.trim()} onClick={() => void previewTemplate()}>
                {t('bots.settings.preview', 'پیش‌نمایش')}
              </Button>
              {tplPreview ? (
                <pre className="max-h-40 overflow-auto rounded bg-muted/20 p-2 text-xs whitespace-pre-wrap">{tplPreview}</pre>
              ) : null}
            </div>
          </details>

          <details className="rounded-lg border border-border p-4 text-start">
            <summary className="flex cursor-pointer list-none items-center justify-between text-start text-sm font-semibold [&::-webkit-details-marker]:hidden">{t('bots.settings.adminExtras')}</summary>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="order_question_button_enabled"
                  checked={draft.order_question_button_enabled === '1'}
                  onCheckedChange={(v) => setDraft((d) => setFlag(d, 'order_question_button_enabled', v === true))}
                />
                <Label htmlFor="order_question_button_enabled" className="cursor-pointer font-normal">
                  {t('bots.settings.orderQuestionBtn')}
                </Label>
              </div>
              <div>
                <Label htmlFor="order_question_button_text">{t('bots.settings.orderQuestionText')}</Label>
                <Input id="order_question_button_text" className="mt-1" value={String(draft.order_question_button_text ?? '')} onChange={(e) => setDraft((d) => setStr(d, 'order_question_button_text', e.target.value))} />
              </div>
              <div>
                <Label htmlFor="support_notify_chat_id">{t('bots.settings.supportNotifyChat')}</Label>
                <Input id="support_notify_chat_id" className="mt-1 font-mono text-sm" value={String(draft.support_notify_chat_id ?? '')} onChange={(e) => setDraft((d) => setStr(d, 'support_notify_chat_id', e.target.value))} />
              </div>
              <div>
                <Label htmlFor="bot_admin_chat_ids">{t('bots.settings.botAdminChats')}</Label>
                <Textarea id="bot_admin_chat_ids" className="mt-1 min-h-16 font-mono text-xs" value={String(draft.bot_admin_chat_ids ?? '')} onChange={(e) => setDraft((d) => setStr(d, 'bot_admin_chat_ids', e.target.value))} />
              </div>
            </div>
          </details>

          <Button type="button" disabled={save.isPending} onClick={() => void save.mutateAsync(draft as Record<string, unknown>)}>
            {t('common.save')}
          </Button>
        </div>
      )}
    </div>
  )
}
