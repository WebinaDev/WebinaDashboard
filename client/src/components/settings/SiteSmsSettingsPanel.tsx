import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
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
import { fetchSiteSmsSettings, saveSiteSmsSettings, type SiteSmsSettings } from '@/lib/modirpayamak-api'

const defaultSettings = (): SiteSmsSettings => ({
  enabled: false,
  sender_line_service: '',
  sender_line_dedicated: '',
  otp_login_enabled: false,
  otp_register_enabled: false,
  otp_login_template: '',
  otp_register_template: '',
})

export function SiteSmsSettingsPanel() {
  const { t } = useTranslation()
  const q = useQuery({
    queryKey: ['site-sms-settings'],
    queryFn: fetchSiteSmsSettings,
    retry: false,
  })
  useQueryErrorToast(q)
  const [draft, setDraft] = useState<SiteSmsSettings | null>(null)

  const unavailable = q.data?.unavailable === true

  useEffect(() => {
    if (q.data?.settings) {
      setDraft({ ...defaultSettings(), ...q.data.settings })
    }
  }, [q.data])

  const save = useMutation({
    mutationFn: () => saveSiteSmsSettings(draft ?? {}),
    onSuccess: () => toast.success(t('common.saved')),
    onError: (e: Error) => toastApiError(t, e),
  })

  if (!draft && q.isLoading) return <FormSettingsSkeleton cards={2} fieldsPerCard={4} />
  if (q.isError && !draft) {
    return <QueryErrorState onRetry={() => void q.refetch()} />
  }
  if (!draft) return null

  return (
    <div className="space-y-4 max-w-2xl">
      {unavailable ? (
        <SmsServiceBanner message={t('settings.siteSms.unavailable')} onRetry={() => void q.refetch()} />
      ) : null}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>{t('settings.siteSms.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <fieldset disabled={unavailable || save.isPending} className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>{t('settings.siteSms.enabled')}</Label>
              <Switch checked={!!draft.enabled} onCheckedChange={(v) => setDraft({ ...draft, enabled: v })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>{t('settings.siteSms.serviceLine')}</Label>
                <Input
                  className="mt-1"
                  value={draft.sender_line_service ?? ''}
                  onChange={(e) => setDraft({ ...draft, sender_line_service: e.target.value })}
                />
              </div>
              <div>
                <Label>{t('settings.siteSms.dedicatedLine')}</Label>
                <Input
                  className="mt-1"
                  value={draft.sender_line_dedicated ?? ''}
                  onChange={(e) => setDraft({ ...draft, sender_line_dedicated: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>{t('settings.siteSms.otpLogin')}</Label>
              <Switch
                checked={!!draft.otp_login_enabled}
                onCheckedChange={(v) => setDraft({ ...draft, otp_login_enabled: v })}
              />
            </div>
            <div>
              <Label>{t('settings.siteSms.otpLoginTemplate')}</Label>
              <Textarea
                className="mt-1"
                rows={2}
                value={draft.otp_login_template ?? ''}
                onChange={(e) => setDraft({ ...draft, otp_login_template: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>{t('settings.siteSms.otpRegister')}</Label>
              <Switch
                checked={!!draft.otp_register_enabled}
                onCheckedChange={(v) => setDraft({ ...draft, otp_register_enabled: v })}
              />
            </div>
            <div>
              <Label>{t('settings.siteSms.otpRegisterTemplate')}</Label>
              <Textarea
                className="mt-1"
                rows={2}
                value={draft.otp_register_template ?? ''}
                onChange={(e) => setDraft({ ...draft, otp_register_template: e.target.value })}
              />
            </div>
            <p className="text-muted-foreground text-xs">{t('settings.siteSms.shortcodeHint', { code: '{code}' })}</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" disabled={unavailable || save.isPending} onClick={() => save.mutate()}>
                {t('common.save')}
              </Button>
              <Button variant="outline" asChild>
                <Link to="/marketing/sms">{t('settings.smsModirpayamakPanel')}</Link>
              </Button>
            </div>
          </fieldset>
        </CardContent>
      </Card>
    </div>
  )
}
