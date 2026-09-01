import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { QueryErrorState } from '@/components/QueryErrorState'
import { FormSettingsSkeleton } from '@/components/skeletons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollTable } from '@/components/ScrollTable'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

export type NotifyEventCatalogItem = { key: string; label: string; group?: string }
export type NotifyVariable = { token: string; label: string }

export type SiteEventRow = {
  customer?: boolean
  admin?: boolean
  title_customer?: string
  body_customer?: string
  title_admin?: string
  body_admin?: string
}

export type OtpSettings = {
  login_enabled?: boolean
  register_enabled?: boolean
  length?: number
  expiry_minutes?: number
  max_attempts?: number
  site_notice?: boolean
  channels?: {
    sms?: boolean
    email?: boolean
    bale?: boolean
    telegram?: boolean
  }
  templates?: {
    login?: string
    register?: string
  }
}

export type NotifySettings = {
  site: { enabled?: boolean; events?: Record<string, SiteEventRow> }
  email: {
    enabled?: boolean
    smtp?: Record<string, unknown>
    events?: Record<string, Record<string, unknown>>
  }
  otp?: OtpSettings
  event_catalog?: NotifyEventCatalogItem[]
  variables?: NotifyVariable[]
}

export function useNotifySettingsQuery() {
  return useQuery({
    queryKey: ['notifications', 'settings'],
    queryFn: () => apiFetch<NotifySettings>('notifications/settings'),
  })
}

export function SiteNotificationsPanel() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const q = useNotifySettingsQuery()
  useQueryErrorToast(q)

  const [enabled, setEnabled] = useState(true)
  const [events, setEvents] = useState<Record<string, SiteEventRow>>({})
  const [openKey, setOpenKey] = useState<string | null>(null)

  useEffect(() => {
    if (!q.data) return
    setEnabled(!!q.data.site?.enabled)
    setEvents({ ...(q.data.site?.events ?? {}) })
  }, [q.data])

  const catalog = useMemo(() => q.data?.event_catalog ?? [], [q.data])
  const variables = useMemo(() => q.data?.variables ?? [], [q.data])

  const save = useMutation({
    mutationFn: () =>
      apiFetch<NotifySettings>('notifications/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site: { enabled, events } }),
      }),
    onSuccess: (data) => {
      toast.success(t('common.saved'))
      void qc.setQueryData(['notifications', 'settings'], data)
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  if (q.isPending && !q.data) return <FormSettingsSkeleton />
  if (q.isError) return <QueryErrorState onRetry={() => void q.refetch()} />

  const patchEvent = (key: string, patch: Partial<SiteEventRow>) => {
    setEvents((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? {}), ...patch },
    }))
  }

  return (
    <div className="max-w-5xl space-y-4">
      <Card variant="hero">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle>{t('notifications.site.title')}</CardTitle>
            <CardDescription className="mt-1">{t('notifications.site.hint')}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={enabled} onCheckedChange={setEnabled} />
            <Label className="text-xs">{t('notifications.enabled')}</Label>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-xs">{t('notifications.variablesHint')}</p>
          <div className="flex flex-wrap gap-2">
            {variables.map((v) => (
              <code key={v.token} className="bg-muted rounded px-1.5 py-0.5 text-[11px]">
                {v.token}
              </code>
            ))}
          </div>
          <Button type="button" disabled={save.isPending} onClick={() => save.mutate()}>
            {t('common.save')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('notifications.eventsMatrix')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollTable>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('notifications.event')}</TableHead>
                  <TableHead className="w-28 text-center">{t('notifications.customer')}</TableHead>
                  <TableHead className="w-28 text-center">{t('notifications.admin')}</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {catalog.map((ev) => {
                  const row = events[ev.key] ?? {}
                  const open = openKey === ev.key
                  return (
                    <Fragment key={ev.key}>
                      <TableRow>
                        <TableCell className="font-medium">{ev.label}</TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={!!row.customer}
                            onCheckedChange={(v) => patchEvent(ev.key, { customer: v })}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={!!row.admin}
                            onCheckedChange={(v) => patchEvent(ev.key, { admin: v })}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setOpenKey(open ? null : ev.key)}
                          >
                            {t('notifications.templates')}
                          </Button>
                        </TableCell>
                      </TableRow>
                      {open ? (
                        <TableRow>
                          <TableCell colSpan={4} className="bg-muted/20">
                            <div className="grid gap-3 py-2 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label>{t('notifications.titleCustomer')}</Label>
                                <Input
                                  value={row.title_customer ?? ''}
                                  onChange={(e) => patchEvent(ev.key, { title_customer: e.target.value })}
                                />
                                <Label>{t('notifications.bodyCustomer')}</Label>
                                <Textarea
                                  rows={3}
                                  value={row.body_customer ?? ''}
                                  onChange={(e) => patchEvent(ev.key, { body_customer: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>{t('notifications.titleAdmin')}</Label>
                                <Input
                                  value={row.title_admin ?? ''}
                                  onChange={(e) => patchEvent(ev.key, { title_admin: e.target.value })}
                                />
                                <Label>{t('notifications.bodyAdmin')}</Label>
                                <Textarea
                                  rows={3}
                                  value={row.body_admin ?? ''}
                                  onChange={(e) => patchEvent(ev.key, { body_admin: e.target.value })}
                                />
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </Fragment>
                  )
                })}
              </TableBody>
            </Table>
          </ScrollTable>
        </CardContent>
      </Card>
    </div>
  )
}
