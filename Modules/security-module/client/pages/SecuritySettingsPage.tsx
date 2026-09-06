import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { toastApiError } from '@/lib/apiError'
import {
  applySecurityProfile,
  fetchFeeds,
  fetchSecurityDiagnostics,
  fetchSecuritySettings,
  fetchSecuritySettingsSchema,
  fetchTwoFaStatus,
  runTwoFaAction,
  saveSecuritySettings,
  syncFeeds,
  type SecuritySettings,
} from '../lib/security-api'
import { SecurityShell } from './SecurityShell'

function SettingSwitch({
  id,
  label,
  hint,
  checked,
  onCheckedChange,
}: {
  id: string
  label: string
  hint?: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
}) {
  return (
    <div className="flex max-w-lg items-center justify-between gap-3">
      <div className="min-w-0">
        <Label htmlFor={id} className="cursor-pointer font-normal">
          {label}
        </Label>
        {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

function sectionBool(
  draft: SecuritySettings,
  section: string,
  key: string,
  val: boolean,
): SecuritySettings {
  return {
    ...draft,
    [section]: { ...(draft[section] ?? {}), [key]: val },
  }
}

function sectionStr(draft: SecuritySettings, section: string, key: string, val: string): SecuritySettings {
  return {
    ...draft,
    [section]: { ...(draft[section] ?? {}), [key]: val },
  }
}

export default function SecuritySettingsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [draft, setDraft] = useState<SecuritySettings | null>(null)
  const [profile, setProfile] = useState('recommended')

  const [totpCode, setTotpCode] = useState('')
  const [setupSecret, setSetupSecret] = useState<string | null>(null)

  const settingsQ = useQuery({
    queryKey: ['security', 'settings'],
    queryFn: fetchSecuritySettings,
  })
  useQueryErrorToast(settingsQ)

  const schemaQ = useQuery({
    queryKey: ['security', 'settings', 'schema'],
    queryFn: fetchSecuritySettingsSchema,
  })
  useQueryErrorToast(schemaQ)

  const diagQ = useQuery({
    queryKey: ['security', 'diagnostics'],
    queryFn: fetchSecurityDiagnostics,
  })
  useQueryErrorToast(diagQ)

  const feedsQ = useQuery({
    queryKey: ['security', 'feeds'],
    queryFn: fetchFeeds,
  })
  useQueryErrorToast(feedsQ)

  const twoFaQ = useQuery({
    queryKey: ['security', '2fa'],
    queryFn: fetchTwoFaStatus,
  })
  useQueryErrorToast(twoFaQ)

  useEffect(() => {
    if (settingsQ.data && !draft) {
      setDraft(settingsQ.data)
      const p = settingsQ.data.general?.profile
      if (typeof p === 'string') setProfile(p)
    }
  }, [settingsQ.data, draft])

  const save = useMutation({
    mutationFn: () => saveSecuritySettings(draft ?? {}),
    onSuccess: (data) => {
      setDraft(data)
      toast.success(t('security.settingsSaved'))
      void qc.invalidateQueries({ queryKey: ['security'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const applyProfile = useMutation({
    mutationFn: () => applySecurityProfile(profile),
    onSuccess: (data) => {
      setDraft(data)
      toast.success(t('security.profileApplied'))
      void qc.invalidateQueries({ queryKey: ['security'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const syncFeedsM = useMutation({
    mutationFn: syncFeeds,
    onSuccess: () => {
      toast.success(t('security.feedsSynced'))
      void qc.invalidateQueries({ queryKey: ['security', 'feeds'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const completeWizard = useMutation({
    mutationFn: () =>
      saveSecuritySettings({
        general: { wizard_completed: true },
      }),
    onSuccess: () => {
      toast.success(t('security.wizardCompleted'))
      void qc.invalidateQueries({ queryKey: ['security'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const twoFaSetup = useMutation({
    mutationFn: () => runTwoFaAction({ action: 'setup' }),
    onSuccess: (data) => {
      setSetupSecret(String(data.secret ?? data.otpauth ?? ''))
      toast.success(t('security.twoFaSetupReady'))
      void qc.invalidateQueries({ queryKey: ['security', '2fa'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const twoFaEnable = useMutation({
    mutationFn: () => runTwoFaAction({ action: 'enable', code: totpCode }),
    onSuccess: () => {
      toast.success(t('security.twoFaEnabled'))
      setTotpCode('')
      setSetupSecret(null)
      void qc.invalidateQueries({ queryKey: ['security', '2fa'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const twoFaDisable = useMutation({
    mutationFn: () => runTwoFaAction({ action: 'disable' }),
    onSuccess: () => {
      toast.success(t('security.twoFaDisabled'))
      void qc.invalidateQueries({ queryKey: ['security', '2fa'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const s = draft
  const showWizard = diagQ.data?.wizard === true

  if (settingsQ.isPending || !s) {
    return (
      <div className="space-y-4">
        <SecurityShell />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  const g = (s.general ?? {}) as Record<string, unknown>
  const priv = (s.privacy ?? {}) as Record<string, unknown>
  const waf = (s.waf ?? {}) as Record<string, unknown>
  const login = (s.login ?? {}) as Record<string, unknown>
  const headers = (s.headers ?? {}) as Record<string, unknown>
  const scan = (s.scan ?? {}) as Record<string, unknown>
  const heal = (s.heal ?? {}) as Record<string, unknown>
  const feeds = (s.feeds ?? {}) as Record<string, unknown>
  const notify = (s.notify ?? {}) as Record<string, unknown>

  return (
    <div className="space-y-4">
      <SecurityShell />

      {showWizard ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('security.wizardTitle')}</CardTitle>
            <CardDescription>{t('security.wizardSettingsHint')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled={completeWizard.isPending} onClick={() => void completeWizard.mutateAsync()}>
              {t('security.wizardComplete')}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t('security.settingsProfile')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label>{t('security.profileLabel')}</Label>
            <Select value={profile} onValueChange={setProfile}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(schemaQ.data?.profiles ?? ['beginner', 'recommended', 'store', 'paranoid']).map((p) => (
                  <SelectItem key={p} value={p}>
                    {t(`security.profile.${p}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" disabled={applyProfile.isPending} onClick={() => void applyProfile.mutateAsync()}>
            {t('security.applyProfile')}
          </Button>
          <Button disabled={save.isPending} onClick={() => void save.mutateAsync()}>
            {t('security.saveSettings')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('security.section.general')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <SettingSwitch
            id="general-enabled"
            label={t('security.general.enabled')}
            checked={Boolean(g.enabled)}
            onCheckedChange={(v) => setDraft(sectionBool(s, 'general', 'enabled', v))}
          />
          <SettingSwitch
            id="general-learning"
            label={t('security.general.learningMode')}
            checked={Boolean(g.learning_mode)}
            onCheckedChange={(v) => setDraft(sectionBool(s, 'general', 'learning_mode', v))}
          />
          <SettingSwitch
            id="general-self-guard"
            label={t('security.general.selfGuard')}
            checked={Boolean(g.self_guard)}
            onCheckedChange={(v) => setDraft(sectionBool(s, 'general', 'self_guard', v))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('security.section.privacy')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <SettingSwitch
            id="privacy-anonymize"
            label={t('security.privacy.anonymizeIp')}
            checked={Boolean(priv.anonymize_ip)}
            onCheckedChange={(v) => setDraft(sectionBool(s, 'privacy', 'anonymize_ip', v))}
          />
          <SettingSwitch
            id="privacy-body"
            label={t('security.privacy.storeBody')}
            checked={Boolean(priv.store_request_body)}
            onCheckedChange={(v) => setDraft(sectionBool(s, 'privacy', 'store_request_body', v))}
          />
          <div className="space-y-1">
            <Label htmlFor="retention-events">{t('security.privacy.retentionEvents')}</Label>
            <Input
              id="retention-events"
              type="number"
              className="max-w-[120px]"
              value={String(priv.retention_events_days ?? 30)}
              onChange={(e) =>
                setDraft(sectionStr(s, 'privacy', 'retention_events_days', e.target.value))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('security.section.waf')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <SettingSwitch
            id="waf-enabled"
            label={t('security.waf.enabled')}
            checked={Boolean(waf.enabled)}
            onCheckedChange={(v) => setDraft(sectionBool(s, 'waf', 'enabled', v))}
          />
          <div className="space-y-1">
            <Label>{t('security.waf.mode')}</Label>
            <Select
              value={String(waf.mode ?? 'learning')}
              onValueChange={(v) => setDraft(sectionStr(s, 'waf', 'mode', v))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['off', 'learning', 'enforce'].map((m) => (
                  <SelectItem key={m} value={m}>
                    {t(`security.wafMode.${m}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <SettingSwitch
            id="waf-fail-open"
            label={t('security.waf.failOpen')}
            checked={Boolean(waf.fail_open)}
            onCheckedChange={(v) => setDraft(sectionBool(s, 'waf', 'fail_open', v))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('security.section.login')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <SettingSwitch
            id="login-protect"
            label={t('security.login.protect')}
            checked={Boolean(login.protect)}
            onCheckedChange={(v) => setDraft(sectionBool(s, 'login', 'protect', v))}
          />
          <SettingSwitch
            id="login-xmlrpc"
            label={t('security.login.disableXmlrpc')}
            checked={Boolean(login.disable_xmlrpc)}
            onCheckedChange={(v) => setDraft(sectionBool(s, 'login', 'disable_xmlrpc', v))}
          />
          <SettingSwitch
            id="login-honeypot"
            label={t('security.login.honeypot')}
            checked={Boolean(login.honeypot)}
            onCheckedChange={(v) => setDraft(sectionBool(s, 'login', 'honeypot', v))}
          />
          <SettingSwitch
            id="login-2fa"
            label={t('security.login.twoFaOptional')}
            checked={Boolean(login['2fa_optional'])}
            onCheckedChange={(v) =>
              setDraft({
                ...s,
                login: { ...login, '2fa_optional': v },
              })
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('security.twoFaTitle')}</CardTitle>
          <CardDescription>{t('security.twoFaHint')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {t('security.twoFaEnabledUsers', { count: twoFaQ.data?.enabled_users ?? 0 })}
            {twoFaQ.data?.current_user?.enabled ? ` · ${t('security.twoFaYouEnabled')}` : ''}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={twoFaSetup.isPending}
              onClick={() => void twoFaSetup.mutateAsync()}
            >
              {t('security.twoFaSetup')}
            </Button>
            <Button
              disabled={twoFaEnable.isPending || !totpCode}
              onClick={() => void twoFaEnable.mutateAsync()}
            >
              {t('security.twoFaEnable')}
            </Button>
            <Button
              variant="ghost"
              disabled={twoFaDisable.isPending || !twoFaQ.data?.current_user?.enabled}
              onClick={() => void twoFaDisable.mutateAsync()}
            >
              {t('security.twoFaDisable')}
            </Button>
          </div>
          {setupSecret ? (
            <p className="break-all font-mono text-xs text-muted-foreground">{setupSecret}</p>
          ) : null}
          <div className="max-w-xs space-y-1">
            <Label htmlFor="totp-code">{t('security.twoFaCode')}</Label>
            <Input
              id="totp-code"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              placeholder="123456"
              inputMode="numeric"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('security.section.headers')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <SettingSwitch
            id="headers-enabled"
            label={t('security.headers.enabled')}
            checked={Boolean(headers.enabled)}
            onCheckedChange={(v) => setDraft(sectionBool(s, 'headers', 'enabled', v))}
          />
          <SettingSwitch
            id="headers-hsts"
            label={t('security.headers.hsts')}
            checked={Boolean(headers.hsts)}
            onCheckedChange={(v) => setDraft(sectionBool(s, 'headers', 'hsts', v))}
          />
          <div className="space-y-1">
            <Label>{t('security.headers.cspMode')}</Label>
            <Select
              value={String(headers.csp_mode ?? 'off')}
              onValueChange={(v) => setDraft(sectionStr(s, 'headers', 'csp_mode', v))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['off', 'report-only', 'enforce'].map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('security.section.scan')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label>{t('security.scan.defaultProfile')}</Label>
            <Select
              value={String(scan.default_profile ?? 'standard')}
              onValueChange={(v) => setDraft(sectionStr(s, 'scan', 'default_profile', v))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['quick', 'standard', 'deep'].map((p) => (
                  <SelectItem key={p} value={p}>
                    {t(`security.scanProfile.${p}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <SettingSwitch
            id="scan-db"
            label={t('security.scan.includeDb')}
            checked={Boolean(scan.include_db)}
            onCheckedChange={(v) => setDraft(sectionBool(s, 'scan', 'include_db', v))}
          />
          <SettingSwitch
            id="scan-vuln"
            label={t('security.scan.includeVuln')}
            checked={Boolean(scan.include_vuln)}
            onCheckedChange={(v) => setDraft(sectionBool(s, 'scan', 'include_vuln', v))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('security.section.heal')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <SettingSwitch
            id="heal-snapshot"
            label={t('security.heal.snapshotAlways')}
            checked={Boolean(heal.snapshot_always)}
            onCheckedChange={(v) => setDraft(sectionBool(s, 'heal', 'snapshot_always', v))}
          />
          <SettingSwitch
            id="heal-delete"
            label={t('security.heal.allowDelete')}
            checked={Boolean(heal.allow_delete)}
            onCheckedChange={(v) => setDraft(sectionBool(s, 'heal', 'allow_delete', v))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>{t('security.section.feeds')}</CardTitle>
          <Button
            variant="outline"
            size="sm"
            disabled={syncFeedsM.isPending}
            onClick={() => void syncFeedsM.mutateAsync()}
          >
            {t('security.syncFeeds')}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <SettingSwitch
            id="feeds-crm"
            label={t('security.feeds.crmMirror')}
            checked={Boolean(feeds.crm_mirror)}
            onCheckedChange={(v) => setDraft(sectionBool(s, 'feeds', 'crm_mirror', v))}
          />
          <SettingSwitch
            id="feeds-fallback"
            label={t('security.feeds.directFallback')}
            checked={Boolean(feeds.direct_fallback)}
            onCheckedChange={(v) => setDraft(sectionBool(s, 'feeds', 'direct_fallback', v))}
          />
          <p className="text-sm text-muted-foreground">
            {t('security.feedsStatus', { count: feedsQ.data?.feeds?.length ?? 0 })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('security.section.notify')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <SettingSwitch
            id="notify-email"
            label={t('security.notify.email')}
            checked={Boolean(notify.email)}
            onCheckedChange={(v) => setDraft(sectionBool(s, 'notify', 'email', v))}
          />
          <SettingSwitch
            id="notify-site"
            label={t('security.notify.site')}
            checked={Boolean(notify.site)}
            onCheckedChange={(v) => setDraft(sectionBool(s, 'notify', 'site', v))}
          />
          <SettingSwitch
            id="notify-sms"
            label={t('security.notify.sms')}
            checked={Boolean(notify.sms)}
            onCheckedChange={(v) => setDraft(sectionBool(s, 'notify', 'sms', v))}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button disabled={save.isPending} onClick={() => void save.mutateAsync()}>
          {t('security.saveSettings')}
        </Button>
      </div>
    </div>
  )
}
