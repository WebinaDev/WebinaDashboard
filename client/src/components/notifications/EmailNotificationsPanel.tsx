import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  useNotifySettingsQuery,
  type NotifySettings,
} from '@/components/notifications/SiteNotificationsPanel'
import { QueryErrorState } from '@/components/QueryErrorState'
import { FormSettingsSkeleton } from '@/components/skeletons'
import { WcEmailsPanel } from '@/components/settings/WcEmailsPanel'
import { ScrollTable } from '@/components/ScrollTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type EmailEventRow = {
  customer?: boolean
  admin?: boolean
  subject_customer?: string
  body_customer?: string
  subject_admin?: string
  body_admin?: string
}

type SmtpState = {
  enabled: boolean
  host: string
  port: number
  encryption: string
  username: string
  password: string
  from_name: string
  from_email: string
  has_password?: boolean
}

export function EmailNotificationsPanel() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const q = useNotifySettingsQuery()
  useQueryErrorToast(q)

  const [enabled, setEnabled] = useState(false)
  const [events, setEvents] = useState<Record<string, EmailEventRow>>({})
  const [smtp, setSmtp] = useState<SmtpState>({
    enabled: false,
    host: '',
    port: 587,
    encryption: 'tls',
    username: '',
    password: '',
    from_name: '',
    from_email: '',
  })
  const [testTo, setTestTo] = useState('')
  const [openKey, setOpenKey] = useState<string | null>(null)

  useEffect(() => {
    if (!q.data) return
    setEnabled(!!q.data.email?.enabled)
    setEvents({ ...((q.data.email?.events as Record<string, EmailEventRow>) ?? {}) })
    const s = (q.data.email?.smtp ?? {}) as Record<string, unknown>
    setSmtp({
      enabled: !!s.enabled,
      host: String(s.host ?? ''),
      port: Number(s.port ?? 587) || 587,
      encryption: String(s.encryption ?? 'tls'),
      username: String(s.username ?? ''),
      password: '',
      from_name: String(s.from_name ?? ''),
      from_email: String(s.from_email ?? ''),
      has_password: !!s.has_password,
    })
  }, [q.data])

  const catalog = useMemo(() => q.data?.event_catalog ?? [], [q.data])
  const variables = useMemo(() => q.data?.variables ?? [], [q.data])

  const save = useMutation({
    mutationFn: () =>
      apiFetch<NotifySettings>('notifications/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: {
            enabled,
            events,
            smtp: {
              enabled: smtp.enabled,
              host: smtp.host,
              port: smtp.port,
              encryption: smtp.encryption,
              username: smtp.username,
              password: smtp.password,
              from_name: smtp.from_name,
              from_email: smtp.from_email,
            },
          },
        }),
      }),
    onSuccess: (data) => {
      toast.success(t('common.saved'))
      void qc.setQueryData(['notifications', 'settings'], data)
      setSmtp((prev) => ({ ...prev, password: '', has_password: !!data.email?.smtp?.has_password }))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const test = useMutation({
    mutationFn: () =>
      apiFetch<{ ok: boolean }>('notifications/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testTo }),
      }),
    onSuccess: () => toast.success(t('notifications.email.testSent')),
    onError: (e: Error) => toastApiError(t, e),
  })

  if (q.isPending && !q.data) return <FormSettingsSkeleton />
  if (q.isError) return <QueryErrorState onRetry={() => void q.refetch()} />

  const patchEvent = (key: string, patch: Partial<EmailEventRow>) => {
    setEvents((prev) => ({ ...prev, [key]: { ...(prev[key] ?? {}), ...patch } }))
  }

  return (
    <Tabs defaultValue="templates" className="max-w-5xl space-y-4">
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
        <TabsTrigger value="templates">{t('notifications.email.tabTemplates')}</TabsTrigger>
        <TabsTrigger value="smtp">{t('notifications.email.tabSmtp')}</TabsTrigger>
        <TabsTrigger value="woocommerce">{t('notifications.email.tabWc')}</TabsTrigger>
      </TabsList>

      <TabsContent value="templates" className="space-y-4">
        <Card variant="hero">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
            <div>
              <CardTitle>{t('notifications.email.title')}</CardTitle>
              <CardDescription className="mt-1">{t('notifications.email.hint')}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={enabled} onCheckedChange={setEnabled} />
              <Label className="text-xs">{t('notifications.enabled')}</Label>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
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
                                  <Label>{t('notifications.email.subjectCustomer')}</Label>
                                  <Input
                                    value={row.subject_customer ?? ''}
                                    onChange={(e) =>
                                      patchEvent(ev.key, { subject_customer: e.target.value })
                                    }
                                  />
                                  <Label>{t('notifications.email.bodyCustomer')}</Label>
                                  <Textarea
                                    rows={4}
                                    value={row.body_customer ?? ''}
                                    onChange={(e) =>
                                      patchEvent(ev.key, { body_customer: e.target.value })
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>{t('notifications.email.subjectAdmin')}</Label>
                                  <Input
                                    value={row.subject_admin ?? ''}
                                    onChange={(e) =>
                                      patchEvent(ev.key, { subject_admin: e.target.value })
                                    }
                                  />
                                  <Label>{t('notifications.email.bodyAdmin')}</Label>
                                  <Textarea
                                    rows={4}
                                    value={row.body_admin ?? ''}
                                    onChange={(e) =>
                                      patchEvent(ev.key, { body_admin: e.target.value })
                                    }
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
      </TabsContent>

      <TabsContent value="smtp" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('notifications.email.smtpTitle')}</CardTitle>
            <CardDescription>{t('notifications.email.smtpHint')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="flex items-center gap-2 md:col-span-2">
              <Switch
                checked={smtp.enabled}
                onCheckedChange={(v) => setSmtp((s) => ({ ...s, enabled: v }))}
              />
              <Label>{t('notifications.email.smtpEnabled')}</Label>
            </div>
            <div className="space-y-1">
              <Label>{t('notifications.email.host')}</Label>
              <Input value={smtp.host} onChange={(e) => setSmtp((s) => ({ ...s, host: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>{t('notifications.email.port')}</Label>
              <Input
                type="number"
                value={smtp.port}
                onChange={(e) => setSmtp((s) => ({ ...s, port: Number(e.target.value) || 587 }))}
              />
            </div>
            <div className="space-y-1">
              <Label>{t('notifications.email.encryption')}</Label>
              <Select
                value={smtp.encryption}
                onValueChange={(v) => setSmtp((s) => ({ ...s, encryption: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">none</SelectItem>
                  <SelectItem value="tls">tls</SelectItem>
                  <SelectItem value="ssl">ssl</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>{t('notifications.email.username')}</Label>
              <Input
                value={smtp.username}
                onChange={(e) => setSmtp((s) => ({ ...s, username: e.target.value }))}
                autoComplete="off"
              />
            </div>
            <div className="space-y-1">
              <Label>
                {t('notifications.email.password')}
                {smtp.has_password ? (
                  <span className="text-muted-foreground ms-1 text-xs">
                    ({t('notifications.email.passwordSet')})
                  </span>
                ) : null}
              </Label>
              <Input
                type="password"
                value={smtp.password}
                placeholder={smtp.has_password ? '••••••••' : ''}
                onChange={(e) => setSmtp((s) => ({ ...s, password: e.target.value }))}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-1">
              <Label>{t('notifications.email.fromName')}</Label>
              <Input
                value={smtp.from_name}
                onChange={(e) => setSmtp((s) => ({ ...s, from_name: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>{t('notifications.email.fromEmail')}</Label>
              <Input
                type="email"
                value={smtp.from_email}
                onChange={(e) => setSmtp((s) => ({ ...s, from_email: e.target.value }))}
              />
            </div>
            <div className="flex flex-wrap items-end gap-2 md:col-span-2">
              <div className="min-w-[220px] flex-1 space-y-1">
                <Label>{t('notifications.email.testTo')}</Label>
                <Input
                  type="email"
                  value={testTo}
                  onChange={(e) => setTestTo(e.target.value)}
                  placeholder={t('notifications.email.testToPlaceholder')}
                />
              </div>
              <Button type="button" variant="outline" disabled={test.isPending} onClick={() => test.mutate()}>
                {t('notifications.email.sendTest')}
              </Button>
              <Button type="button" disabled={save.isPending} onClick={() => save.mutate()}>
                {t('common.save')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="woocommerce">
        <WcEmailsPanel />
      </TabsContent>
    </Tabs>
  )
}
