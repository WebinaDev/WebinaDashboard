import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { SmsServiceBanner } from '@/components/marketing/SmsServiceBanner'
import { QueryErrorState } from '@/components/QueryErrorState'
import { FormSettingsSkeleton } from '@/components/skeletons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { toastApiError } from '@/lib/apiError'
import {
  fetchShopSmsSettings,
  fetchSmsAccount,
  saveShopSmsSettings,
  syncSmsPattern,
  type ShopSmsSettings,
  type SmsTemplateRow,
} from '@/lib/modirpayamak-api'

const ORDER_CUSTOMER = 'order_customer'
const ORDER_ADMIN = 'order_admin'

export function ShopSmsNotificationsPanel() {
  const { t } = useTranslation()
  const q = useQuery({ queryKey: ['shop-sms-settings'], queryFn: fetchShopSmsSettings })
  useQueryErrorToast(q)
  const accountQ = useQuery({ queryKey: ['modirpayamak-account'], queryFn: () => fetchSmsAccount() })

  const [settings, setSettings] = useState<ShopSmsSettings | null>(null)
  const [templates, setTemplates] = useState<SmsTemplateRow[]>([])
  const [adminPhonesText, setAdminPhonesText] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<string>('pending_on_create')

  useEffect(() => {
    if (!q.data) return
    if (q.data.settings) setSettings({ ...q.data.settings })
    if (q.data.templates) setTemplates([...q.data.templates])
    const phones = q.data.settings?.admin_phones
    if (Array.isArray(phones)) setAdminPhonesText(phones.join('\n'))
    if (q.data.event_keys?.[0]) setSelectedEvent(q.data.event_keys[0])
  }, [q.data])

  const eventKeys = q.data?.event_keys ?? []
  const shortcodes = q.data?.shortcodes ?? []

  const customerTpl = useMemo(
    () => templates.find((x) => x.scope === ORDER_CUSTOMER && x.event_key === selectedEvent),
    [templates, selectedEvent]
  )
  const adminTpl = useMemo(
    () => templates.find((x) => x.scope === ORDER_ADMIN && x.event_key === selectedEvent),
    [templates, selectedEvent]
  )

  const updateTemplate = (scope: string, patch: Partial<SmsTemplateRow>) => {
    setTemplates((prev) => {
      const idx = prev.findIndex((x) => x.scope === scope && x.event_key === selectedEvent)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], ...patch }
        return next
      }
      return [...prev, { scope, event_key: selectedEvent, body: '', enabled: true, ...patch }]
    })
  }

  const save = useMutation({
    mutationFn: async () => {
      const phones = adminPhonesText
        .split(/[\n,;]+/)
        .map((p) => p.trim())
        .filter(Boolean)
      const nextSettings: ShopSmsSettings = { ...(settings ?? {}), admin_phones: phones }
      await saveShopSmsSettings({ settings: nextSettings, templates })
    },
    onSuccess: () => toast.success(t('common.saved')),
    onError: (e: Error) => toastApiError(t, e),
  })

  const syncPattern = useMutation({
    mutationFn: (scope: string) => syncSmsPattern({ scope, event_key: selectedEvent }),
    onSuccess: () => toast.success(t('settings.shopSms.patternSynced')),
    onError: (e: Error) => toastApiError(t, e),
  })

  if (!settings && q.isLoading) return <FormSettingsSkeleton cards={3} fieldsPerCard={4} />
  if (q.isError && !settings) return <QueryErrorState onRetry={() => void q.refetch()} />
  if (!settings) return null

  const crmUnavailable = q.data?.unavailable === true

  const events = settings.events ?? {}

  return (
    <div className="space-y-4 max-w-4xl">
      {crmUnavailable ? (
        <SmsServiceBanner message={t('marketing.sms.serviceUnavailable')} onRetry={() => void q.refetch()} />
      ) : null}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>{t('settings.shopSms.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Switch checked={!!settings.enabled} onCheckedChange={(v) => setSettings({ ...settings, enabled: v })} />
              <Label>{t('settings.shopSms.enabled')}</Label>
            </div>
            {accountQ.data?.account ? (
              <span className="text-muted-foreground text-sm">
                {t('settings.shopSms.balance', { amount: accountQ.data.account.balance })}
              </span>
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>{t('settings.siteSms.serviceLine')}</Label>
              <Input
                className="mt-1"
                value={settings.sender_line_service ?? ''}
                onChange={(e) => setSettings({ ...settings, sender_line_service: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('settings.siteSms.dedicatedLine')}</Label>
              <Input
                className="mt-1"
                value={settings.sender_line_dedicated ?? ''}
                onChange={(e) => setSettings({ ...settings, sender_line_dedicated: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>{t('settings.shopSms.adminPhones')}</Label>
            <Textarea
              className="mt-1 font-mono text-sm"
              rows={3}
              value={adminPhonesText}
              onChange={(e) => setAdminPhonesText(e.target.value)}
              placeholder={t('settings.shopSms.phonePlaceholder')}
            />
          </div>
          <Button variant="outline" asChild>
            <Link to="/marketing/sms">{t('settings.smsModirpayamakPanel')}</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>{t('settings.shopSms.eventToggles')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {eventKeys.map((key) => (
              <Button
                key={key}
                type="button"
                size="sm"
                variant={selectedEvent === key ? 'default' : 'outline'}
                onClick={() => setSelectedEvent(key)}
              >
                {t(`settings.shopSms.events.${key}`)}
              </Button>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-md border p-3">
              <span>{t('settings.shopSms.notifyCustomer')}</span>
              <Switch
                checked={!!events[selectedEvent]?.customer}
                onCheckedChange={(v) =>
                  setSettings({
                    ...settings,
                    events: {
                      ...events,
                      [selectedEvent]: { ...(events[selectedEvent] ?? { admin: false, customer: false }), customer: v },
                    },
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <span>{t('settings.shopSms.notifyAdmin')}</span>
              <Switch
                checked={!!events[selectedEvent]?.admin}
                onCheckedChange={(v) =>
                  setSettings({
                    ...settings,
                    events: {
                      ...events,
                      [selectedEvent]: { ...(events[selectedEvent] ?? { admin: false, customer: false }), admin: v },
                    },
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>{t('settings.shopSms.templates')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-xs">
            {shortcodes.map((s) => `{${s.key}}`).join(' ')}
          </p>
          <div>
            <Label>{t('settings.shopSms.customerMessage')}</Label>
            <Textarea
              className="mt-1"
              rows={3}
              value={customerTpl?.body ?? ''}
              onChange={(e) => updateTemplate(ORDER_CUSTOMER, { body: e.target.value })}
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="mt-2"
              disabled={syncPattern.isPending}
              onClick={() => syncPattern.mutate(ORDER_CUSTOMER)}
            >
              {t('settings.shopSms.syncPattern')}
            </Button>
          </div>
          <div>
            <Label>{t('settings.shopSms.adminMessage')}</Label>
            <Textarea
              className="mt-1"
              rows={3}
              value={adminTpl?.body ?? ''}
              onChange={(e) => updateTemplate(ORDER_ADMIN, { body: e.target.value })}
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="mt-2"
              disabled={syncPattern.isPending}
              onClick={() => syncPattern.mutate(ORDER_ADMIN)}
            >
              {t('settings.shopSms.syncPattern')}
            </Button>
          </div>
          <Button type="button" disabled={save.isPending} onClick={() => save.mutate()}>
            {t('common.save')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
