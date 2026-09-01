import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { BotProviderSwitcher } from '@/components/bots/BotProviderSwitcher'
import { QueryErrorState } from '@/components/QueryErrorState'
import { ScrollTable } from '@/components/ScrollTable'
import { FormSettingsSkeleton } from '@/components/skeletons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'
import { cn } from '@/lib/utils'
import type { BotProvider } from '@/types/bots'

type EventCatalogItem = { key: string; label: string; kind?: string }
type Shortcode = { key: string; label: string; scope?: string }
type EventRoles = { customer?: boolean; admin?: boolean }

type ShopNotify = {
  enabled?: boolean
  admin_chat_ids?: string[]
  events?: Record<string, EventRoles>
  templates?: {
    order_customer?: Record<string, string>
    order_admin?: Record<string, string>
  }
  newsletter?: {
    enabled?: boolean
    message_template?: string
    notify_admin?: boolean
  }
}

type ShopNotifyPayload = {
  provider: BotProvider
  shop_notify: ShopNotify
  event_catalog: EventCatalogItem[]
  shortcodes: Shortcode[]
}

type Subscriber = {
  user_id: number
  chat_id: string
  display_name: string
  opt_in: boolean
}

function eventLabel(
  t: (key: string, opts?: Record<string, string>) => string,
  key: string,
  catalog: EventCatalogItem[]
): string {
  const i18nKey = `settings.shopSms.events.${key}`
  const translated = t(i18nKey)
  if (translated !== i18nKey) return translated
  return catalog.find((c) => c.key === key)?.label || key
}

function filterShortcodes(shortcodes: Shortcode[], eventKey: string, catalog: EventCatalogItem[]): Shortcode[] {
  const kind = catalog.find((c) => c.key === eventKey)?.kind
  const isStock = kind === 'extra' && (eventKey === 'stock-low' || eventKey === 'stock-out')
  return shortcodes.filter((s) => {
    const scope = (s.scope || 'order').toLowerCase()
    if (scope === 'otp') return false
    if (isStock) return scope === 'stock' || scope === 'all'
    if (scope === 'stock') return false
    return scope === 'order' || scope === 'all' || scope === 'site'
  })
}

export function ShopBotNotificationsPanel({ lockedProvider }: { lockedProvider?: BotProvider }) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [provider, setProvider] = useState<BotProvider>(lockedProvider ?? 'bale')

  useEffect(() => {
    if (lockedProvider) setProvider(lockedProvider)
  }, [lockedProvider])
  const [tab, setTab] = useState('admin')
  const [sn, setSn] = useState<ShopNotify | null>(null)
  const [adminChatsText, setAdminChatsText] = useState('')
  const [selectedEvent, setSelectedEvent] = useState('pending_on_create')
  const [testOrderId, setTestOrderId] = useState('')
  const [testChatId, setTestChatId] = useState('')
  const [campaignMessage, setCampaignMessage] = useState('')

  const q = useQuery({
    queryKey: ['shop-bot-notify', provider],
    queryFn: () => apiFetch<ShopNotifyPayload>(`bots/${provider}/shop-notify`),
    staleTime: 0,
    refetchOnMount: true,
  })
  useQueryErrorToast(q)

  const subsQ = useQuery({
    queryKey: ['shop-bot-newsletter-subs', provider],
    queryFn: () => apiFetch<{ subscribers: Subscriber[] }>(`bots/${provider}/newsletter/subscribers`),
  })
  useQueryErrorToast(subsQ)

  useEffect(() => {
    if (!q.data?.shop_notify) return
    setSn({ ...q.data.shop_notify })
    setAdminChatsText((q.data.shop_notify.admin_chat_ids ?? []).join('\n'))
    const keys = q.data.event_catalog?.map((c) => c.key) ?? []
    if (keys[0] && !keys.includes(selectedEvent)) setSelectedEvent(keys[0])
    const tpl = q.data.shop_notify.newsletter?.message_template ?? ''
    setCampaignMessage(tpl)
  }, [q.data]) // eslint-disable-line react-hooks/exhaustive-deps

  const catalog = useMemo(() => q.data?.event_catalog ?? [], [q.data])
  const shortcodes = useMemo(
    () => filterShortcodes(q.data?.shortcodes ?? [], selectedEvent, catalog),
    [q.data?.shortcodes, selectedEvent, catalog]
  )

  const customerBody = sn?.templates?.order_customer?.[selectedEvent] ?? ''
  const adminBody = sn?.templates?.order_admin?.[selectedEvent] ?? ''

  const setEventToggle = (key: string, role: 'customer' | 'admin', value: boolean) => {
    if (!sn) return
    const events = sn.events ?? {}
    setSn({
      ...sn,
      events: {
        ...events,
        [key]: { ...(events[key] ?? { admin: false, customer: false }), [role]: value },
      },
    })
  }

  const setTemplate = (scope: 'order_customer' | 'order_admin', body: string) => {
    if (!sn) return
    setSn({
      ...sn,
      templates: {
        ...(sn.templates ?? {}),
        [scope]: {
          ...(sn.templates?.[scope] ?? {}),
          [selectedEvent]: body,
        },
      },
    })
  }

  const insertShortcode = (scope: 'order_customer' | 'order_admin', key: string) => {
    const cur = scope === 'order_customer' ? customerBody : adminBody
    setTemplate(scope, `${cur}{${key}}`)
  }

  const save = useMutation({
    mutationFn: async () => {
      const chats = adminChatsText
        .split(/[\n,;]+/)
        .map((p) => p.trim())
        .filter(Boolean)
        .slice(0, 5)
      const next: ShopNotify = {
        ...(sn ?? {}),
        admin_chat_ids: chats,
      }
      return apiFetch<ShopNotifyPayload>(`bots/${provider}/shop-notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_notify: next }),
      })
    },
    onSuccess: async (data) => {
      toast.success(t('common.saved'))
      setSn(data.shop_notify)
      await qc.invalidateQueries({ queryKey: ['shop-bot-notify', provider] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const testNotify = useMutation({
    mutationFn: (role: 'customer' | 'admin') =>
      apiFetch<{ ok: boolean; sent?: number }>(`bots/${provider}/orders/test-notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_key: selectedEvent,
          role,
          order_id: parseInt(testOrderId, 10) || undefined,
          chat_id: testChatId.trim() || undefined,
        }),
      }),
    onSuccess: () => toast.success(t('settings.shopBots.testSent')),
    onError: (e: Error) => toastApiError(t, e),
  })

  const sendCampaign = useMutation({
    mutationFn: () =>
      apiFetch<{ ok: boolean; sent?: number }>(`bots/${provider}/newsletter/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: campaignMessage }),
      }),
    onSuccess: (res) => toast.success(t('settings.shopBots.newsletterSent', { count: res.sent ?? 0 })),
    onError: (e: Error) => toastApiError(t, e),
  })

  const setOptIn = useMutation({
    mutationFn: (opts: { user_id: number; opt_in: boolean }) =>
      apiFetch<{ subscribers: Subscriber[] }>(`bots/${provider}/newsletter/subscribers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opts),
      }),
    onSuccess: async () => {
      toast.success(t('common.saved'))
      await qc.invalidateQueries({ queryKey: ['shop-bot-newsletter-subs', provider] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  if (!sn && q.isLoading) return <FormSettingsSkeleton cards={3} fieldsPerCard={4} />
  if (q.isError && !sn) return <QueryErrorState onRetry={() => void q.refetch()} />
  if (!sn) return null

  const events = sn.events ?? {}
  const newsletter = sn.newsletter ?? {}

  const renderEventTable = (role: 'customer' | 'admin') => (
    <ScrollTable>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('settings.shopSms.eventColumn')}</TableHead>
            <TableHead className="text-center">{t('settings.shopSms.enabled')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {catalog.map((row) => {
            const selected = selectedEvent === row.key
            return (
              <TableRow
                key={row.key}
                className={cn('cursor-pointer', selected && 'bg-muted/50')}
                onClick={() => setSelectedEvent(row.key)}
              >
                <TableCell className="font-medium">{eventLabel(t, row.key, catalog)}</TableCell>
                <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                  <Switch
                    checked={!!events[row.key]?.[role]}
                    onCheckedChange={(v) => setEventToggle(row.key, role, v)}
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </ScrollTable>
  )

  const renderRoleEditor = (role: 'customer' | 'admin') => {
    const scope = role === 'customer' ? 'order_customer' : 'order_admin'
    const body = role === 'customer' ? customerBody : adminBody
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {t('settings.shopBots.roleEditor')} — {eventLabel(t, selectedEvent, catalog)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-2 block text-xs">{t('settings.shopSms.shortcodesForEditor')}</Label>
            <div className="flex flex-wrap gap-1">
              {shortcodes.map((s) => (
                <Button
                  key={s.key}
                  type="button"
                  size="sm"
                  variant="outline"
                  className="font-mono text-xs"
                  title={s.label}
                  onClick={() => insertShortcode(scope, s.key)}
                >
                  {`{${s.key}}`}
                </Button>
              ))}
            </div>
          </div>
          <div className="bg-muted/20 space-y-3 rounded-xl border p-4">
            <Label>
              {role === 'customer' ? t('settings.shopBots.customerMessage') : t('settings.shopBots.adminMessage')}
            </Label>
            <Textarea rows={4} value={body} onChange={(e) => setTemplate(scope, e.target.value)} />
            <div className="flex flex-wrap items-end gap-2 border-t pt-3">
              <div className="min-w-[120px] flex-1">
                <Label className="text-xs">{t('settings.shopBots.testOrderId')}</Label>
                <Input
                  className="mt-1"
                  value={testOrderId}
                  onChange={(e) => setTestOrderId(e.target.value)}
                  dir="ltr"
                />
              </div>
              {role === 'customer' ? (
                <div className="min-w-[140px] flex-1">
                  <Label className="text-xs">{t('settings.shopBots.testChatId')}</Label>
                  <Input
                    className="mt-1"
                    value={testChatId}
                    onChange={(e) => setTestChatId(e.target.value)}
                    dir="ltr"
                  />
                </div>
              ) : null}
              <Button type="button" size="sm" disabled={testNotify.isPending} onClick={() => testNotify.mutate(role)}>
                {t('settings.shopBots.testSend')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-5xl space-y-4">
      <Card variant="hero">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle>{t('settings.shopBots.title')}</CardTitle>
            <CardDescription className="mt-1">{t('settings.shopBots.hint')}</CardDescription>
          </div>
          <div className="flex flex-col items-end gap-3">
            {lockedProvider ? null : (
              <BotProviderSwitcher provider={provider} onChange={setProvider} />
            )}
            <div className="flex items-center gap-2">
              <Switch checked={!!sn.enabled} onCheckedChange={(v) => setSn({ ...sn, enabled: v })} />
              <Label className="text-xs">{t('settings.shopSms.enabled')}</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" asChild>
            <Link to={`/settings/site/bots?provider=${provider}`}>{t('settings.shopBots.connectionSettings')}</Link>
          </Button>
          <Button type="button" disabled={save.isPending} onClick={() => save.mutate()}>
            {t('common.save')}
          </Button>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex h-auto flex-wrap gap-1">
          <TabsTrigger value="admin">{t('settings.shopBots.tabs.admin')}</TabsTrigger>
          <TabsTrigger value="customer">{t('settings.shopBots.tabs.customer')}</TabsTrigger>
          <TabsTrigger value="newsletter">{t('settings.shopBots.tabs.newsletter')}</TabsTrigger>
          <TabsTrigger value="subscribers">{t('settings.shopBots.tabs.subscribers')}</TabsTrigger>
        </TabsList>

        <TabsContent value="admin" className="mt-4 space-y-4">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label>{t('settings.shopBots.adminChatIds')}</Label>
                <Textarea
                  rows={3}
                  value={adminChatsText}
                  onChange={(e) => setAdminChatsText(e.target.value)}
                  placeholder={t('settings.shopBots.adminChatIdsHint')}
                  dir="ltr"
                />
              </div>
              {renderEventTable('admin')}
            </CardContent>
          </Card>
          {renderRoleEditor('admin')}
        </TabsContent>

        <TabsContent value="customer" className="mt-4 space-y-4">
          <Card>
            <CardContent className="pt-6">{renderEventTable('customer')}</CardContent>
          </Card>
          {renderRoleEditor('customer')}
        </TabsContent>

        <TabsContent value="newsletter" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.shopBots.tabs.newsletter')}</CardTitle>
              <CardDescription>{t('settings.shopBots.newsletterHint')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={!!newsletter.enabled}
                  onCheckedChange={(v) =>
                    setSn({
                      ...sn,
                      newsletter: { ...newsletter, enabled: v },
                    })
                  }
                />
                <Label>{t('settings.shopSms.enabled')}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={!!newsletter.notify_admin}
                  onCheckedChange={(v) =>
                    setSn({
                      ...sn,
                      newsletter: { ...newsletter, notify_admin: v },
                    })
                  }
                />
                <Label>{t('settings.shopBots.newsletterNotifyAdmin')}</Label>
              </div>
              <div className="space-y-2">
                <Label>{t('settings.shopBots.newsletterTemplate')}</Label>
                <Textarea
                  rows={4}
                  value={newsletter.message_template ?? ''}
                  onChange={(e) =>
                    setSn({
                      ...sn,
                      newsletter: { ...newsletter, message_template: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2 border-t pt-4">
                <Label>{t('settings.shopBots.sendCampaignNow')}</Label>
                <Textarea
                  rows={3}
                  value={campaignMessage}
                  onChange={(e) => setCampaignMessage(e.target.value)}
                  placeholder={t('settings.shopBots.newsletterTemplate')}
                />
                <Button type="button" disabled={sendCampaign.isPending} onClick={() => sendCampaign.mutate()}>
                  {t('settings.shopBots.sendCampaign')}
                </Button>
              </div>
              <Button type="button" variant="secondary" disabled={save.isPending} onClick={() => save.mutate()}>
                {t('common.save')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscribers" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.shopBots.tabs.subscribers')}</CardTitle>
              <CardDescription>
                {t('settings.shopBots.subscriberCount', { count: subsQ.data?.subscribers?.length ?? 0 })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollTable>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('settings.shopBots.subscriberName')}</TableHead>
                      <TableHead>Chat ID</TableHead>
                      <TableHead>{t('settings.shopBots.optIn')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(subsQ.data?.subscribers ?? []).map((row) => (
                      <TableRow key={row.user_id}>
                        <TableCell>{row.display_name || row.user_id}</TableCell>
                        <TableCell className="font-mono text-xs" dir="ltr">
                          {row.chat_id}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={row.opt_in}
                            onCheckedChange={(v) => setOptIn.mutate({ user_id: row.user_id, opt_in: v })}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollTable>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
