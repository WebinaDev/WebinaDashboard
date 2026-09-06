import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { SmsServiceBanner } from '@/components/marketing/SmsServiceBanner'
import { QueryErrorState } from '@/components/QueryErrorState'
import { ScrollTable } from '@/components/ScrollTable'
import { FormSettingsSkeleton } from '@/components/skeletons'
import { Badge } from '@/components/ui/badge'
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
import { toastApiError } from '@/lib/apiError'
import {
  fetchNewsletterSubscribers,
  fetchShopSmsSettings,
  fetchSmsAccount,
  fetchSmsPatterns,
  saveShopSmsSettings,
  saveSmsTemplates,
  syncSmsPattern,
  unsubscribeNewsletterSubscriber,
  type ShopSmsPayload,
  type ShopSmsSettings,
  type SmsEventCatalogItem,
  type SmsPatternRegistryRow,
  type SmsTemplateRow,
} from '@/lib/modirpayamak-api'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getSsrPage } from '@/lib/ssrPage'
import { cn } from '@/lib/utils'

const ORDER_CUSTOMER = 'order_customer'
const ORDER_ADMIN = 'order_admin'

function eventLabel(
  t: (key: string, opts?: Record<string, string>) => string,
  key: string,
  catalog: SmsEventCatalogItem[]
): string {
  const i18nKey = `settings.shopSms.events.${key}`
  const translated = t(i18nKey)
  if (translated !== i18nKey) return translated
  return catalog.find((c) => c.key === key)?.label || key
}

function patternStatusFor(
  registry: SmsPatternRegistryRow[],
  scope: string,
  eventKey: string
): { status: string; code: string } {
  const row = registry.find((r) => r.scope === scope && r.event_key === eventKey)
  return { status: row?.sync_status ?? 'none', code: row?.ippanel_code ?? '' }
}

function PatternBadge({ status }: { status: string }) {
  const { t } = useTranslation()
  if (status === 'synced') return <Badge variant="default">{t('settings.shopSms.patternStatus.synced')}</Badge>
  if (status === 'pending') return <Badge variant="secondary">{t('settings.shopSms.patternStatus.pending')}</Badge>
  if (status === 'failed') return <Badge variant="destructive">{t('settings.shopSms.patternStatus.failed')}</Badge>
  return <Badge variant="outline">{t('settings.shopSms.patternStatus.none')}</Badge>
}

export function ShopSmsNotificationsPanel() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const initial = useMemo(() => getSsrPage()?.shopSms as ShopSmsPayload | undefined, [])
  const q = useQuery({
    queryKey: ['shop-sms-settings'],
    queryFn: fetchShopSmsSettings,
    initialData: initial,
    staleTime: 0,
    refetchOnMount: true,
  })
  useQueryErrorToast(q)
  const accountQ = useQuery({ queryKey: ['modirpayamak-account'], queryFn: () => fetchSmsAccount() })
  const patternsQ = useQuery({ queryKey: ['sms-patterns-shop'], queryFn: () => fetchSmsPatterns(1, 100) })
  const subsQ = useQuery({
    queryKey: ['sms-newsletter-subscribers'],
    queryFn: () => fetchNewsletterSubscribers(0, 1),
  })

  const [tab, setTab] = useState('admin')
  const [settings, setSettings] = useState<ShopSmsSettings | null>(null)
  const [templates, setTemplates] = useState<SmsTemplateRow[]>([])
  const [registry, setRegistry] = useState<SmsPatternRegistryRow[]>([])
  const [adminPhonesText, setAdminPhonesText] = useState('')
  const [botIdsText, setBotIdsText] = useState('')
  const [selectedEvent, setSelectedEvent] = useState('pending_on_create')

  useEffect(() => {
    if (!q.data) return
    if (q.data.settings) setSettings({ ...q.data.settings })
    if (q.data.templates) setTemplates([...q.data.templates])
    if (q.data.registry) setRegistry([...q.data.registry] as SmsPatternRegistryRow[])
    const phones = q.data.settings?.admin_phones
    if (Array.isArray(phones)) setAdminPhonesText(phones.join('\n'))
    const bots = q.data.settings?.bot_ids
    if (Array.isArray(bots)) setBotIdsText(bots.join(', '))
    const keys = q.data.event_catalog?.map((c) => c.key) ?? q.data.event_keys ?? []
    if (keys[0] && !keys.includes(selectedEvent)) setSelectedEvent(keys[0])
  }, [q.data]) // eslint-disable-line react-hooks/exhaustive-deps

  const catalog: SmsEventCatalogItem[] = useMemo(() => {
    if (q.data?.event_catalog?.length) return q.data.event_catalog
    return (q.data?.event_keys ?? []).map((key) => ({ key, label: key, kind: 'status' as const }))
  }, [q.data])

  const setEventToggle = (key: string, role: 'customer' | 'admin', value: boolean) => {
    if (!settings) return
    const events = settings.events ?? {}
    const next = {
      ...settings,
      events: {
        ...events,
        [key]: { ...(events[key] ?? { admin: false, customer: false }), [role]: value },
      },
    }
    setSettings(next)
  }

  const save = useMutation({
    mutationFn: async () => {
      const phones = adminPhonesText
        .split(/[\n,;]+/)
        .map((p) => p.trim())
        .filter(Boolean)
      const botIds = botIdsText
        .split(/[\s,;]+/)
        .map((p) => p.trim())
        .filter(Boolean)
        .slice(0, 5)
      const nextSettings: ShopSmsSettings = {
        ...(settings ?? {}),
        admin_phones: phones,
        bot_ids: botIds,
        event_catalog: catalog,
        require_pattern: true,
      }
      const syncedTemplates = (templates ?? []).map((tpl) => {
        const role = String(tpl.scope).includes('admin') ? 'admin' : 'customer'
        const on = !!nextSettings.events?.[tpl.event_key]?.[role]
        return { ...tpl, enabled: on }
      })
      await saveShopSmsSettings({ settings: nextSettings, templates: syncedTemplates })
    },
    onSuccess: async () => {
      toast.success(t('common.saved'))
      await qc.invalidateQueries({ queryKey: ['shop-sms-settings'] })
      await qc.invalidateQueries({ queryKey: ['sms-pattern-registry'] })
      await q.refetch()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const unsub = useMutation({
    mutationFn: (id: number) => unsubscribeNewsletterSubscriber(id),
    onSuccess: async () => {
      toast.success(t('common.deleted'))
      await qc.invalidateQueries({ queryKey: ['sms-newsletter-subscribers'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const bindNewsletter = useMutation({
    mutationFn: async () => {
      const code = (settings?.newsletter?.pattern_code ?? '').trim()
      if (!code) throw new Error(t('marketing.sms.patternCodeRequired'))
      const body = (settings?.newsletter?.message_template ?? '').trim() || 'New update: {site_name}'
      await saveSmsTemplates([
        {
          scope: 'newsletter',
          event_key: 'default',
          body,
          enabled: true,
          pattern_code: code,
        },
      ])
      return syncSmsPattern({
        scope: 'newsletter',
        event_key: 'default',
        pattern_code: code,
        bind_only: true,
      })
    },
    onSuccess: async () => {
      toast.success(t('settings.shopSms.patternSynced'))
      await qc.invalidateQueries({ queryKey: ['shop-sms-settings'] })
      await qc.invalidateQueries({ queryKey: ['sms-pattern-registry'] })
      await q.refetch()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const patternOptions = useMemo(() => {
    const raw = patternsQ.data?.data ?? patternsQ.data
    const list: Array<{ title?: string; pattern_code?: string }> = Array.isArray(raw)
      ? (raw as Array<{ title?: string; pattern_code?: string }>)
      : raw && typeof raw === 'object' && Array.isArray((raw as { data?: unknown }).data)
        ? ((raw as { data: Array<{ title?: string; pattern_code?: string }> }).data)
        : raw && typeof raw === 'object' && Array.isArray((raw as { patterns?: unknown }).patterns)
          ? ((raw as { patterns: Array<{ title?: string; pattern_code?: string }> }).patterns)
          : []
    return list.filter((p) => (p.pattern_code ?? '').trim())
  }, [patternsQ.data])

  if (!settings && q.isLoading) return <FormSettingsSkeleton cards={3} fieldsPerCard={4} />
  if (q.isError && !settings) return <QueryErrorState onRetry={() => void q.refetch()} />
  if (!settings) return null

  const crmUnavailable = q.data?.unavailable === true
  const events = settings.events ?? {}
  const newsletter = settings.newsletter ?? {}

  const renderEventTable = (role: 'customer' | 'admin') => (
    <ScrollTable>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('settings.shopSms.eventColumn')}</TableHead>
            <TableHead className="text-center">{t('settings.shopSms.enabled')}</TableHead>
            <TableHead>{t('settings.shopSms.patternColumn')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {catalog.map((row) => {
            const pat = patternStatusFor(
              registry,
              role === 'customer' ? ORDER_CUSTOMER : ORDER_ADMIN,
              row.key
            )
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
                <TableCell>
                  <div className="flex flex-wrap items-center gap-1 text-xs">
                    <PatternBadge status={pat.status} />
                    {pat.code ? (
                      <span className="font-mono" dir="ltr">
                        {pat.code}
                      </span>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </ScrollTable>
  )

  const renderRoleEditor = (role: 'customer' | 'admin') => {
    const scope = role === 'customer' ? ORDER_CUSTOMER : ORDER_ADMIN
    const pat = patternStatusFor(registry, scope, selectedEvent)

    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {t('settings.shopSms.roleEditor')} — {eventLabel(t, selectedEvent, catalog)}
          </CardTitle>
          <CardDescription>{t('settings.shopSms.patternsMatrixCtaHint')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <PatternBadge status={pat.status} />
            {pat.code ? (
              <span className="font-mono text-xs" dir="ltr">
                {pat.code}
              </span>
            ) : (
              <span className="text-muted-foreground text-xs">{t('settings.shopSms.patternStatus.none')}</span>
            )}
          </div>
          <Button asChild>
            <Link to="/marketing/sms/patterns">{t('settings.shopSms.openPatternsMatrix')}</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-5xl space-y-4">
      {crmUnavailable ? (
        <SmsServiceBanner message={t('marketing.sms.serviceUnavailable')} onRetry={() => void q.refetch()} />
      ) : null}

      <Card variant="hero">
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle>{t('settings.shopSms.title')}</CardTitle>
            <CardDescription className="mt-1">{t('settings.shopSms.patternOnlyHint')}</CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Switch checked={!!settings.enabled} onCheckedChange={(v) => setSettings({ ...settings, enabled: v })} />
            <Label className="text-xs">{t('settings.shopSms.enabled')}</Label>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {accountQ.data?.account ? (
            <p className="text-muted-foreground text-sm">
              {t('settings.shopSms.balance', { amount: accountQ.data.account.balance })}
            </p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="bg-background/50 space-y-2 rounded-xl border p-3">
              <Label>{t('settings.siteSms.serviceLine')}</Label>
              <Input value={settings.sender_line_service ?? ''} readOnly className="bg-muted" dir="ltr" />
            </div>
            <div className="bg-background/50 space-y-2 rounded-xl border p-3">
              <Label>{t('settings.siteSms.dedicatedLine')}</Label>
              <Input value={settings.sender_line_dedicated ?? ''} readOnly className="bg-muted" dir="ltr" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/marketing/sms/patterns">{t('settings.shopSms.openPatternsMatrix')}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/marketing/sms">{t('settings.smsModirpayamakPanel')}</Link>
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">{t('settings.shopSms.patternsMatrixCtaHint')}</p>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex h-auto flex-wrap gap-1">
          <TabsTrigger value="admin">{t('settings.shopSms.tabs.admin')}</TabsTrigger>
          <TabsTrigger value="customer">{t('settings.shopSms.tabs.customer')}</TabsTrigger>
          <TabsTrigger value="newsletter">{t('settings.shopSms.tabs.newsletter')}</TabsTrigger>
          <TabsTrigger value="subscribers">{t('settings.shopSms.tabs.subscribers')}</TabsTrigger>
        </TabsList>

        <TabsContent value="admin" className="mt-4 space-y-4">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label>{t('settings.shopSms.adminPhones')}</Label>
                <Textarea
                  className="font-mono text-sm"
                  rows={3}
                  value={adminPhonesText}
                  onChange={(e) => setAdminPhonesText(e.target.value)}
                  placeholder={t('settings.shopSms.phonePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('settings.shopSms.botIds')}</Label>
                <Input value={botIdsText} onChange={(e) => setBotIdsText(e.target.value)} dir="ltr" />
                <p className="text-muted-foreground text-xs">{t('settings.shopSms.botIdsHint')}</p>
                <Button variant="link" className="h-auto p-0 text-xs" asChild>
                  <Link to="/settings/shop/bots">{t('settings.shopBots.openShopNotify')}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.shopSms.eventToggles')}</CardTitle>
            </CardHeader>
            <CardContent>{renderEventTable('admin')}</CardContent>
          </Card>
          {renderRoleEditor('admin')}
        </TabsContent>

        <TabsContent value="customer" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.shopSms.eventToggles')}</CardTitle>
            </CardHeader>
            <CardContent>{renderEventTable('customer')}</CardContent>
          </Card>
          {renderRoleEditor('customer')}
        </TabsContent>

        <TabsContent value="newsletter" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.shopSms.tabs.newsletter')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <Label>{t('settings.shopSms.newsletterEnabled')}</Label>
                <Switch
                  checked={!!newsletter.enabled}
                  onCheckedChange={(v) =>
                    setSettings({
                      ...settings,
                      newsletter: { ...newsletter, enabled: v },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('settings.shopSms.newsletterTemplate')}</Label>
                <Textarea
                  rows={4}
                  value={newsletter.message_template ?? ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      newsletter: { ...newsletter, message_template: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('settings.shopSms.newsletterPattern')}</Label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    className="font-mono"
                    dir="ltr"
                    value={newsletter.pattern_code ?? ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        newsletter: { ...newsletter, pattern_code: e.target.value },
                      })
                    }
                  />
                  <Select
                    value={(newsletter.pattern_code ?? '').trim() || undefined}
                    onValueChange={(code) =>
                      setSettings({
                        ...settings,
                        newsletter: { ...newsletter, pattern_code: code },
                      })
                    }
                  >
                    <SelectTrigger className="sm:w-56">
                      <SelectValue placeholder={t('marketing.sms.pickPattern')} />
                    </SelectTrigger>
                    <SelectContent>
                      {patternOptions.map((p) => {
                        const code = (p.pattern_code ?? '').trim()
                        return (
                          <SelectItem key={code} value={code}>
                            {p.title ? `${p.title} (${code})` : code}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={bindNewsletter.isPending || !(newsletter.pattern_code ?? '').trim()}
                  onClick={() => bindNewsletter.mutate()}
                >
                  {t('settings.shopSms.bindPattern')}
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/marketing/sms/newsletter">{t('marketing.sms.newsletterTitle')}</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/marketing/sms/patterns">{t('marketing.sms.patterns')}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscribers" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.shopSms.tabs.subscribers')}</CardTitle>
            </CardHeader>
            <CardContent>
              {subsQ.isLoading ? (
                <FormSettingsSkeleton cards={1} fieldsPerCard={2} />
              ) : (subsQ.data?.subscribers?.length ?? 0) === 0 ? (
                <p className="text-muted-foreground text-sm">{t('settings.shopSms.subscribersEmpty')}</p>
              ) : (
                <ScrollTable>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('settings.shopSms.testPhone')}</TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(subsQ.data?.subscribers ?? []).map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-mono" dir="ltr">
                            {s.phone}
                          </TableCell>
                          <TableCell>{s.product_id}</TableCell>
                          <TableCell className="text-end">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={unsub.isPending}
                              onClick={() => unsub.mutate(s.id)}
                            >
                              {t('settings.shopSms.unsubscribe')}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollTable>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button type="button" disabled={save.isPending} onClick={() => save.mutate()}>
          {t('common.save')}
        </Button>
      </div>
    </div>
  )
}
