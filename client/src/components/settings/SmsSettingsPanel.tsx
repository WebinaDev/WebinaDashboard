import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { QueryErrorState } from '@/components/QueryErrorState'
import { FormSettingsSkeleton } from '@/components/skeletons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatNumber } from '@/lib/formatNumber'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { fetchSmsAccount } from '@/lib/modirpayamak-api'

export type SmsSettings = {
  provider: string
  api_key: string
  sender_line: string
  custom_endpoint: string
}

type SmsSettingsPanelProps = {
  initial?: SmsSettings
  onSaved?: () => void
}

export function SmsSettingsPanel({ initial, onSaved }: SmsSettingsPanelProps) {
  const { t, i18n } = useTranslation()
  const q = useQuery({
    queryKey: ['shop-settings', 'sms'],
    queryFn: () => apiFetch<SmsSettings>('shop/settings/sms'),
    enabled: !initial,
  })
  useQueryErrorToast(q)
  const [draft, setDraft] = useState<SmsSettings | null>(initial ?? null)
  const accountQ = useQuery({
    queryKey: ['modirpayamak-account'],
    queryFn: () => fetchSmsAccount(),
    enabled: draft?.provider === 'modirpayamak',
  })

  useEffect(() => {
    if (initial) setDraft(initial)
    else if (q.data) setDraft({ ...q.data })
  }, [initial, q.data])

  const save = useMutation({
    mutationFn: () =>
      apiFetch('shop/settings/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      }),
    onSuccess: () => {
      toast.success(t('common.saved'))
      onSaved?.()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  if (!draft && q.isLoading) return <FormSettingsSkeleton cards={1} fieldsPerCard={5} />
  if (q.isError && !draft) return <QueryErrorState onRetry={() => void q.refetch()} />
  if (!draft) return null

  return (
    <Card className="max-w-2xl shadow-sm">
      <CardHeader>
        <CardTitle>{t('settings.smsTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>{t('settings.smsProvider')}</Label>
          <Select value={draft.provider} onValueChange={(v) => setDraft({ ...draft, provider: v })}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kavenegar">{t('settings.smsKavenegar')}</SelectItem>
              <SelectItem value="melipayamak">{t('settings.smsMelipayamak')}</SelectItem>
              <SelectItem value="modirpayamak">{t('settings.smsModirpayamak')}</SelectItem>
              <SelectItem value="custom">{t('settings.smsCustom')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {draft.provider === 'modirpayamak' ? (
          <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">{t('settings.smsModirpayamakHint')}</p>
            <div>
              <Label>{t('settings.smsSenderLine')}</Label>
              <Input
                className="mt-1"
                value={draft.sender_line}
                onChange={(e) => setDraft({ ...draft, sender_line: e.target.value })}
                placeholder={t('settings.smsSenderLinePlaceholder')}
              />
            </div>
            {accountQ.data?.account ? (
              <p className="text-sm font-medium">
                {t('settings.smsModirpayamakBalance')}: {formatNumber(accountQ.data.account.balance, i18n.language)}{' '}
                {t('marketing.sms.toman')}
              </p>
            ) : null}
            <Button variant="outline" asChild>
              <Link to="/marketing/sms">{t('settings.smsModirpayamakPanel')}</Link>
            </Button>
          </div>
        ) : (
          <>
            <div>
              <Label>{t('settings.smsApiKey')}</Label>
              <Input
                className="mt-1 font-mono"
                type="password"
                value={draft.api_key}
                onChange={(e) => setDraft({ ...draft, api_key: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('settings.smsSenderLine')}</Label>
              <Input className="mt-1" value={draft.sender_line} onChange={(e) => setDraft({ ...draft, sender_line: e.target.value })} />
            </div>
          </>
        )}
        {draft.provider === 'custom' ? (
          <div>
            <Label>{t('settings.smsCustomEndpoint')}</Label>
            <Input className="mt-1 font-mono" value={draft.custom_endpoint} onChange={(e) => setDraft({ ...draft, custom_endpoint: e.target.value })} />
          </div>
        ) : null}
        <Button type="button" disabled={save.isPending} onClick={() => void save.mutateAsync()}>
          {t('common.save')}
        </Button>
      </CardContent>
    </Card>
  )
}
