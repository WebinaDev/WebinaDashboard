import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { FormSettingsSkeleton } from '@/components/skeletons'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'

type AnalyticsSettings = {
  tracking_enabled: boolean
  anonymize_ip: boolean
  exclude_roles: string[]
  exclude_ips: string
  exclude_urls: string
  online_timeout: number
  retention_days: number
  record_logged_in: boolean
  geoip_path: string
  bypass_adblocker: boolean
}

type SettingsResponse = {
  settings: AnalyticsSettings
  editable_roles: string[]
  source?: 'native' | 'wp-statistics'
  wp_statistics?: boolean
}

export function AnalyticsSettingsPanel() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [draft, setDraft] = useState<AnalyticsSettings | null>(null)

  const q = useQuery({
    queryKey: ['analytics', 'settings'],
    queryFn: () => apiFetch<SettingsResponse>('analytics/settings'),
  })
  useQueryErrorToast(q)

  useEffect(() => {
    if (q.data?.settings) setDraft({ ...q.data.settings })
  }, [q.data])

  const save = useMutation({
    mutationFn: (body: AnalyticsSettings) =>
      apiFetch<SettingsResponse>('analytics/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: body }),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['analytics', 'settings'] })
      toast.success(t('common.saved'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const purge = useMutation({
    mutationFn: () => apiFetch<{ ok: boolean; days_rebuilt: number }>('analytics/purge-cache', { method: 'POST', body: '{}' }),
    onSuccess: (data) => {
      toast.success(t('analytics.settings.purgeDone', { count: data.days_rebuilt }))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  if (!draft) {
    return <FormSettingsSkeleton cards={2} fieldsPerCard={6} />
  }

  const roles = q.data?.editable_roles ?? []
  const fromWpStatistics = q.data?.source === 'wp-statistics' || q.data?.wp_statistics === true

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {fromWpStatistics ? (
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
          <p className="font-medium">{t('analytics.source.wpStatisticsBannerTitle')}</p>
          <p className="text-muted-foreground mt-1 text-xs">{t('analytics.source.wpStatisticsBannerBody')}</p>
        </div>
      ) : null}

      <section className={`space-y-4 rounded-lg border border-border p-4 ${fromWpStatistics ? 'opacity-60' : ''}`}>
        <h2 className="text-sm font-semibold">{t('analytics.settings.tracking')}</h2>
        {fromWpStatistics ? (
          <p className="text-muted-foreground text-xs">{t('analytics.source.nativeTrackerDisabled')}</p>
        ) : (
          <p className="text-muted-foreground text-xs">{t('analytics.settings.nativeHint')}</p>
        )}
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={draft.tracking_enabled}
            disabled={fromWpStatistics}
            onCheckedChange={(v) => setDraft({ ...draft, tracking_enabled: v === true })}
          />
          {t('analytics.settings.trackingEnabled')}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={draft.anonymize_ip}
            disabled={fromWpStatistics}
            onCheckedChange={(v) => setDraft({ ...draft, anonymize_ip: v === true })}
          />
          {t('analytics.settings.anonymizeIp')}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={draft.record_logged_in}
            disabled={fromWpStatistics}
            onCheckedChange={(v) => setDraft({ ...draft, record_logged_in: v === true })}
          />
          {t('analytics.settings.recordLoggedIn')}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={draft.bypass_adblocker}
            disabled={fromWpStatistics}
            onCheckedChange={(v) => setDraft({ ...draft, bypass_adblocker: v === true })}
          />
          {t('analytics.settings.bypassAdblocker')}
        </label>
      </section>

      <section className={`space-y-3 rounded-lg border border-border p-4 ${fromWpStatistics ? 'opacity-60' : ''}`}>
        <h2 className="text-sm font-semibold">{t('analytics.settings.exclusions')}</h2>
        <div>
          <Label>{t('analytics.settings.excludeRoles')}</Label>
          <div className="mt-2 flex flex-wrap gap-3">
            {roles.map((role) => (
              <label key={role} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={draft.exclude_roles.includes(role)}
                  disabled={fromWpStatistics}
                  onCheckedChange={(v) => {
                    const next =
                      v === true ? [...draft.exclude_roles, role] : draft.exclude_roles.filter((r) => r !== role)
                    setDraft({ ...draft, exclude_roles: next })
                  }}
                />
                {role}
              </label>
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="exclude-ips">{t('analytics.settings.excludeIps')}</Label>
          <Textarea
            id="exclude-ips"
            className="mt-1"
            value={draft.exclude_ips}
            disabled={fromWpStatistics}
            onChange={(e) => setDraft({ ...draft, exclude_ips: e.target.value })}
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor="exclude-urls">{t('analytics.settings.excludeUrls')}</Label>
          <Textarea
            id="exclude-urls"
            className="mt-1"
            value={draft.exclude_urls}
            disabled={fromWpStatistics}
            onChange={(e) => setDraft({ ...draft, exclude_urls: e.target.value })}
            rows={4}
          />
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-border p-4">
        <h2 className="text-sm font-semibold">{t('analytics.settings.optimization')}</h2>
        <div>
          <Label htmlFor="online-timeout">{t('analytics.settings.onlineTimeout')}</Label>
          <Input
            id="online-timeout"
            type="number"
            min={1}
            max={60}
            className="mt-1 max-w-[120px]"
            value={draft.online_timeout}
            disabled={fromWpStatistics}
            onChange={(e) => setDraft({ ...draft, online_timeout: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label htmlFor="retention">{t('analytics.settings.retentionDays')}</Label>
          <Input
            id="retention"
            type="number"
            min={7}
            max={730}
            className="mt-1 max-w-[120px]"
            value={draft.retention_days}
            disabled={fromWpStatistics}
            onChange={(e) => setDraft({ ...draft, retention_days: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label htmlFor="geoip">{t('analytics.settings.geoipPath')}</Label>
          <Input
            id="geoip"
            className="mt-1"
            value={draft.geoip_path}
            disabled={fromWpStatistics}
            onChange={(e) => setDraft({ ...draft, geoip_path: e.target.value })}
          />
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={fromWpStatistics || save.isPending}
          onClick={() => save.mutate(draft)}
        >
          {t('common.save')}
        </Button>
        <Button type="button" variant="outline" disabled={purge.isPending || fromWpStatistics} onClick={() => purge.mutate()}>
          {t('analytics.settings.purgeRebuild')}
        </Button>
      </div>
    </div>
  )
}
