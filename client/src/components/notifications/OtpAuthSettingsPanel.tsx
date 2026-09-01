import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  useNotifySettingsQuery,
  type NotifySettings,
  type OtpSettings,
} from '@/components/notifications/SiteNotificationsPanel'
import { QueryErrorState } from '@/components/QueryErrorState'
import { FormSettingsSkeleton } from '@/components/skeletons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

const defaultOtp: OtpSettings = {
  login_enabled: false,
  register_enabled: false,
  length: 5,
  expiry_minutes: 5,
  max_attempts: 5,
  site_notice: true,
  channels: { sms: true, email: true, bale: true, telegram: true },
  templates: {
    login: 'Your login code: {code} — {site_name}',
    register: 'Your registration code: {code} — {site_name}',
  },
}

export function OtpAuthSettingsPanel() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const q = useNotifySettingsQuery()
  useQueryErrorToast(q)

  const [draft, setDraft] = useState<OtpSettings>(defaultOtp)

  useEffect(() => {
    if (!q.data?.otp) return
    const o = q.data.otp
    setDraft({
      login_enabled: !!o.login_enabled,
      register_enabled: !!o.register_enabled,
      length: Number(o.length ?? 5) || 5,
      expiry_minutes: Number(o.expiry_minutes ?? 5) || 5,
      max_attempts: Number(o.max_attempts ?? 5) || 5,
      site_notice: o.site_notice !== false,
      channels: {
        sms: o.channels?.sms !== false,
        email: o.channels?.email !== false,
        bale: o.channels?.bale !== false,
        telegram: o.channels?.telegram !== false,
      },
      templates: {
        login: String(o.templates?.login ?? defaultOtp.templates?.login),
        register: String(o.templates?.register ?? defaultOtp.templates?.register),
      },
    })
  }, [q.data])

  const save = useMutation({
    mutationFn: () =>
      apiFetch<NotifySettings>('notifications/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: draft }),
      }),
    onSuccess: (data) => {
      qc.setQueryData(['notifications', 'settings'], data)
      toast.success(t('common.saved'))
    },
    onError: (err) => toastApiError(t, err),
  })

  if (q.isLoading && !q.data) return <FormSettingsSkeleton />
  if (q.isError) return <QueryErrorState onRetry={() => void q.refetch()} />

  const setChannel = (key: keyof NonNullable<OtpSettings['channels']>, value: boolean) => {
    setDraft((d) => ({
      ...d,
      channels: { ...(d.channels ?? {}), [key]: value },
    }))
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('notifications.otp.title')}</CardTitle>
          <CardDescription>{t('notifications.otp.hint')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Label>{t('notifications.otp.loginEnabled')}</Label>
            <Switch
              checked={!!draft.login_enabled}
              onCheckedChange={(v) => setDraft({ ...draft, login_enabled: v })}
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <Label>{t('notifications.otp.registerEnabled')}</Label>
            <Switch
              checked={!!draft.register_enabled}
              onCheckedChange={(v) => setDraft({ ...draft, register_enabled: v })}
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <Label>{t('notifications.otp.siteNotice')}</Label>
            <Switch
              checked={draft.site_notice !== false}
              onCheckedChange={(v) => setDraft({ ...draft, site_notice: v })}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="otp-length">{t('notifications.otp.length')}</Label>
              <Input
                id="otp-length"
                type="number"
                min={4}
                max={8}
                value={draft.length ?? 5}
                onChange={(e) => setDraft({ ...draft, length: Number(e.target.value) || 5 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="otp-expiry">{t('notifications.otp.expiry')}</Label>
              <Input
                id="otp-expiry"
                type="number"
                min={1}
                max={30}
                value={draft.expiry_minutes ?? 5}
                onChange={(e) => setDraft({ ...draft, expiry_minutes: Number(e.target.value) || 5 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="otp-attempts">{t('notifications.otp.maxAttempts')}</Label>
              <Input
                id="otp-attempts"
                type="number"
                min={1}
                max={20}
                value={draft.max_attempts ?? 5}
                onChange={(e) => setDraft({ ...draft, max_attempts: Number(e.target.value) || 5 })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('notifications.otp.channels')}</CardTitle>
          <CardDescription>{t('notifications.otp.channelsHint')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(
            [
              ['sms', t('notifications.tabs.sms')],
              ['email', t('notifications.tabs.email')],
              ['bale', t('notifications.tabs.bale')],
              ['telegram', t('notifications.tabs.telegram')],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between gap-3">
              <Label>{label}</Label>
              <Switch
                checked={!!draft.channels?.[key]}
                onCheckedChange={(v) => setChannel(key, v)}
              />
            </div>
          ))}
          <p className="text-muted-foreground text-xs">
            {t('notifications.otp.smsPatternsHint')}{' '}
            <Link className="text-primary underline" to="/notifications?tab=sms">
              {t('notifications.tabs.sms')}
            </Link>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('notifications.otp.templates')}</CardTitle>
          <CardDescription>{t('notifications.otp.templatesHint')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp-tpl-login">{t('notifications.otp.templateLogin')}</Label>
            <Textarea
              id="otp-tpl-login"
              rows={2}
              value={draft.templates?.login ?? ''}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  templates: { ...(draft.templates ?? {}), login: e.target.value },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="otp-tpl-register">{t('notifications.otp.templateRegister')}</Label>
            <Textarea
              id="otp-tpl-register"
              rows={2}
              value={draft.templates?.register ?? ''}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  templates: { ...(draft.templates ?? {}), register: e.target.value },
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="button" disabled={save.isPending} onClick={() => save.mutate()}>
          {save.isPending ? t('common.saving') : t('common.save')}
        </Button>
      </div>
    </div>
  )
}
