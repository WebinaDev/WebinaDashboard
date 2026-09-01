import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { SmsServiceBanner } from '@/components/marketing/SmsServiceBanner'
import { QueryErrorState } from '@/components/QueryErrorState'
import { FormSettingsSkeleton } from '@/components/skeletons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { toastApiError } from '@/lib/apiError'
import {
  fetchSiteSmsSettings,
  fetchSmsPatternRegistry,
  fetchSmsPatterns,
  saveSiteSmsSettings,
  saveSmsTemplates,
  sendSiteOtp,
  syncSmsPattern,
  type SiteSmsSettings,
  type SmsPatternRegistryRow,
} from '@/lib/modirpayamak-api'
import { getSsrPage } from '@/lib/ssrPage'

const SITE_SCOPE = 'site'
const OTP_EVENTS = ['otp_login', 'otp_register'] as const

type SiteSmsQueryData = { ok: boolean; unavailable?: boolean; settings: SiteSmsSettings }

type IppanelPattern = {
  title?: string
  pattern_code?: string
  pattern_message?: string
}

function extractPatterns(raw: unknown): IppanelPattern[] {
  if (Array.isArray(raw)) return raw as IppanelPattern[]
  if (!raw || typeof raw !== 'object') return []
  const obj = raw as Record<string, unknown>
  if (Array.isArray(obj.data)) return obj.data as IppanelPattern[]
  if (Array.isArray(obj.patterns)) return obj.patterns as IppanelPattern[]
  if (obj.data && typeof obj.data === 'object') {
    const nested = obj.data as Record<string, unknown>
    if (Array.isArray(nested.data)) return nested.data as IppanelPattern[]
    if (Array.isArray(nested.patterns)) return nested.patterns as IppanelPattern[]
    if (Array.isArray(nested.items)) return nested.items as IppanelPattern[]
  }
  if (Array.isArray(obj.items)) return obj.items as IppanelPattern[]
  return []
}

function registryCode(registry: SmsPatternRegistryRow[], eventKey: string): string {
  return (registry.find((r) => r.scope === SITE_SCOPE && r.event_key === eventKey)?.ippanel_code ?? '').trim()
}

function PatternBadge({ status }: { status?: string }) {
  const { t } = useTranslation()
  if (status === 'synced') return <Badge variant="default">{t('settings.shopSms.patternStatus.synced')}</Badge>
  if (status === 'pending') return <Badge variant="secondary">{t('settings.shopSms.patternStatus.pending')}</Badge>
  if (status === 'failed') return <Badge variant="destructive">{t('settings.shopSms.patternStatus.failed')}</Badge>
  return <Badge variant="outline">{t('settings.shopSms.patternStatus.none')}</Badge>
}

const defaultSettings = (): SiteSmsSettings => ({
  enabled: false,
  sender_line_service: '',
  sender_line_dedicated: '',
  otp_login_enabled: false,
  otp_register_enabled: false,
  otp_expiry_minutes: 5,
  otp_max_attempts: 3,
  otp_length: 5,
  otp_login_template: '',
  otp_register_template: '',
  use_pattern_for_otp: false,
})

export function SiteSmsSettingsPanel() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const initial = useMemo(() => getSsrPage()?.siteSms as SiteSmsQueryData | undefined, [])
  const q = useQuery({
    queryKey: ['site-sms-settings'],
    queryFn: fetchSiteSmsSettings,
    retry: false,
    initialData: initial,
    staleTime: initial ? 90_000 : undefined,
    refetchOnMount: initial ? false : true,
  })
  useQueryErrorToast(q)
  const patternsQ = useQuery({
    queryKey: ['sms-patterns-site'],
    queryFn: () => fetchSmsPatterns(1, 100),
  })
  const registryQ = useQuery({
    queryKey: ['sms-pattern-registry-site'],
    queryFn: fetchSmsPatternRegistry,
  })
  useQueryErrorToast(patternsQ)
  useQueryErrorToast(registryQ)

  const [draft, setDraft] = useState<SiteSmsSettings | null>(null)
  const [bindLogin, setBindLogin] = useState('')
  const [bindRegister, setBindRegister] = useState('')
  const [testPhone, setTestPhone] = useState('')
  const [registry, setRegistry] = useState<SmsPatternRegistryRow[]>([])

  const unavailable = q.data?.unavailable === true
  const patterns = useMemo(() => extractPatterns(patternsQ.data?.data ?? patternsQ.data), [patternsQ.data])

  useEffect(() => {
    if (q.data?.settings) {
      setDraft({ ...defaultSettings(), ...q.data.settings })
    }
  }, [q.data])

  useEffect(() => {
    const rows = (registryQ.data?.registry ?? []) as SmsPatternRegistryRow[]
    setRegistry(rows)
    setBindLogin(registryCode(rows, 'otp_login'))
    setBindRegister(registryCode(rows, 'otp_register'))
  }, [registryQ.data])

  const save = useMutation({
    mutationFn: () => saveSiteSmsSettings(draft ?? {}),
    onSuccess: async () => {
      toast.success(t('common.saved'))
      await qc.invalidateQueries({ queryKey: ['site-sms-settings'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const bindPattern = useMutation({
    mutationFn: async (opts: { event_key: 'otp_login' | 'otp_register'; code: string; body: string }) => {
      const code = opts.code.trim()
      if (!code) throw new Error(t('marketing.sms.patternCodeRequired'))
      await saveSmsTemplates([
        {
          scope: SITE_SCOPE,
          event_key: opts.event_key,
          body: opts.body || `{code}`,
          enabled: true,
          pattern_code: code,
        },
      ])
      return syncSmsPattern({
        scope: SITE_SCOPE,
        event_key: opts.event_key,
        pattern_code: code,
        bind_only: true,
      })
    },
    onSuccess: async (_data, vars) => {
      toast.success(t('settings.shopSms.patternSynced'))
      setRegistry((prev) => {
        const rest = prev.filter((r) => !(r.scope === SITE_SCOPE && r.event_key === vars.event_key))
        return [
          ...rest,
          { scope: SITE_SCOPE, event_key: vars.event_key, ippanel_code: vars.code.trim(), sync_status: 'synced' },
        ]
      })
      await qc.invalidateQueries({ queryKey: ['sms-pattern-registry-site'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const testOtp = useMutation({
    mutationFn: (purpose: 'login' | 'register') =>
      sendSiteOtp({
        phone: testPhone.trim(),
        purpose,
      }),
    onSuccess: () => toast.success(t('settings.siteSms.testSent')),
    onError: (e: Error) => toastApiError(t, e),
  })

  if (!draft && q.isLoading) return <FormSettingsSkeleton cards={2} fieldsPerCard={4} />
  if (q.isError && !draft) {
    return <QueryErrorState onRetry={() => void q.refetch()} />
  }
  if (!draft) return null

  const patternOptions = (
    <>
      {patterns.map((p) => {
        const code = (p.pattern_code ?? '').trim()
        if (!code) return null
        return (
          <SelectItem key={code} value={code}>
            {p.title ? `${p.title} (${code})` : code}
          </SelectItem>
        )
      })}
    </>
  )

  const renderOtpBlock = (eventKey: (typeof OTP_EVENTS)[number]) => {
    const isLogin = eventKey === 'otp_login'
    const enabledKey = isLogin ? 'otp_login_enabled' : 'otp_register_enabled'
    const templateKey = isLogin ? 'otp_login_template' : 'otp_register_template'
    const bindValue = isLogin ? bindLogin : bindRegister
    const setBind = isLogin ? setBindLogin : setBindRegister
    const row = registry.find((r) => r.scope === SITE_SCOPE && r.event_key === eventKey)

    return (
      <div className="bg-background/50 space-y-3 rounded-xl border p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Label>{t(isLogin ? 'settings.siteSms.otpLogin' : 'settings.siteSms.otpRegister')}</Label>
            <PatternBadge status={row?.sync_status} />
          </div>
          <Switch
            checked={!!draft[enabledKey]}
            onCheckedChange={(v) => setDraft({ ...draft, [enabledKey]: v })}
          />
        </div>
        <div className="space-y-2">
          <Label>{t(isLogin ? 'settings.siteSms.otpLoginTemplate' : 'settings.siteSms.otpRegisterTemplate')}</Label>
          <Textarea
            rows={2}
            value={(draft[templateKey] as string) ?? ''}
            onChange={(e) => setDraft({ ...draft, [templateKey]: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>{t('settings.siteSms.patternCode')}</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              className="font-mono"
              dir="ltr"
              value={bindValue}
              onChange={(e) => setBind(e.target.value)}
              placeholder={t('marketing.sms.patternCode')}
            />
            <Select value={bindValue || undefined} onValueChange={setBind}>
              <SelectTrigger className="sm:w-56">
                <SelectValue placeholder={t('marketing.sms.pickPattern')} />
              </SelectTrigger>
              <SelectContent>{patternOptions}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={unavailable || bindPattern.isPending || !bindValue.trim()}
            onClick={() =>
              bindPattern.mutate({
                event_key: eventKey,
                code: bindValue,
                body: String(draft[templateKey] ?? ''),
              })
            }
          >
            {t('settings.shopSms.bindPattern')}
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/marketing/sms/patterns">{t('marketing.sms.patterns')}</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      {unavailable ? (
        <SmsServiceBanner message={t('settings.siteSms.unavailable')} onRetry={() => void q.refetch()} />
      ) : null}
      <Card variant="hero">
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle>{t('settings.siteSms.title')}</CardTitle>
            <CardDescription className="mt-1">{t('settings.site.sections.sms')}</CardDescription>
          </div>
          <Switch
            checked={!!draft.enabled}
            onCheckedChange={(v) => setDraft({ ...draft, enabled: v })}
            disabled={unavailable || save.isPending}
          />
        </CardHeader>
      </Card>
      <Card variant="glass">
        <CardContent className="space-y-4 pt-6">
          <fieldset disabled={unavailable || save.isPending} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('settings.siteSms.serviceLine')}</Label>
                <Input value={draft.sender_line_service ?? ''} readOnly className="bg-muted" dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>{t('settings.siteSms.dedicatedLine')}</Label>
                <Input value={draft.sender_line_dedicated ?? ''} readOnly className="bg-muted" dir="ltr" />
              </div>
            </div>
            <p className="text-muted-foreground text-xs">{t('settings.siteSms.linesFromCrm')}</p>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>{t('settings.siteSms.otpLength')}</Label>
                <Input
                  type="number"
                  min={4}
                  max={8}
                  value={draft.otp_length ?? 5}
                  onChange={(e) => setDraft({ ...draft, otp_length: Number(e.target.value) || 5 })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('settings.siteSms.otpExpiry')}</Label>
                <Input
                  type="number"
                  min={1}
                  max={15}
                  value={draft.otp_expiry_minutes ?? 5}
                  onChange={(e) => setDraft({ ...draft, otp_expiry_minutes: Number(e.target.value) || 5 })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('settings.siteSms.otpMaxAttempts')}</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={draft.otp_max_attempts ?? 3}
                  onChange={(e) => setDraft({ ...draft, otp_max_attempts: Number(e.target.value) || 3 })}
                />
              </div>
            </div>

            <p className="rounded-xl border border-dashed p-3 text-muted-foreground text-xs">
              {t('settings.siteSms.multiChannelOtpHint')}{' '}
              <Link className="text-primary underline" to="/notifications?tab=otp">
                {t('notifications.tabs.otp')}
              </Link>
            </p>

            <div className="flex items-center justify-between gap-3 rounded-xl border p-4">
              <div>
                <Label>{t('settings.siteSms.usePatternForOtp')}</Label>
                <p className="text-muted-foreground text-xs">{t('settings.siteSms.usePatternForOtpHint')}</p>
              </div>
              <Switch
                checked={!!draft.use_pattern_for_otp}
                onCheckedChange={(v) => setDraft({ ...draft, use_pattern_for_otp: v })}
              />
            </div>

            {renderOtpBlock('otp_login')}
            {renderOtpBlock('otp_register')}

            <p className="text-muted-foreground text-xs">{t('settings.siteSms.shortcodeHint', { code: '{code}' })}</p>

            <div className="space-y-3 rounded-xl border p-4">
              <Label>{t('settings.siteSms.testPhone')}</Label>
              <Input
                className="font-mono"
                dir="ltr"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="09xxxxxxxxx"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={unavailable || testOtp.isPending || !testPhone.trim()}
                  onClick={() => testOtp.mutate('login')}
                >
                  {t('settings.siteSms.testLogin')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={unavailable || testOtp.isPending || !testPhone.trim()}
                  onClick={() => testOtp.mutate('register')}
                >
                  {t('settings.siteSms.testRegister')}
                </Button>
              </div>
            </div>

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
