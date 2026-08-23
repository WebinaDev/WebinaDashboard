import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { JobsTable, KeyValueList, StatusBadge, type JobLike } from '@/components/data/DumpUi'
import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type WncSettingsResponse = {
  platform: string
  label: string
  live: boolean
  settings: {
    enabled?: boolean
    auto_sync?: boolean
    credentials?: Record<string, string | number | boolean>
  }
  pricing_tab?: string
}

type WncPlatformPanelProps = {
  platform: string
  titleKey?: string
  subtitleKey?: string
  feedPlatform?: boolean
  /** When true, render body only (no PageShell) for embedding in module settings pages. */
  embedded?: boolean
}

const BOOL_CRED_KEYS = new Set([
  'order_status_enabled',
  'orders_list_api_enabled',
  'product_page_webhook_enabled',
])

function credentialLabel(t: (key: string) => string, key: string) {
  const i18nKey = `wnc.cred.${key}`
  const translated = t(i18nKey)
  return translated !== i18nKey ? translated : key
}

function asBool(value: unknown): boolean {
  return value === true || value === 1 || value === '1' || value === 'true'
}

export function WncPlatformPanel({
  platform,
  titleKey,
  subtitleKey,
  feedPlatform = false,
  embedded = false,
}: WncPlatformPanelProps) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [draft, setDraft] = useState<WncSettingsResponse['settings']>({})

  const q = useQuery({
    queryKey: ['wnc', platform, 'settings'],
    queryFn: () => apiFetch<WncSettingsResponse>(`wnc/${platform}/settings`),
  })

  const mapsQ = useQuery({
    queryKey: ['wnc', platform, 'maps'],
    queryFn: () => apiFetch<{ maps: Array<Record<string, unknown>> }>(`wnc/${platform}/maps`),
    enabled: !feedPlatform,
  })

  const jobsQ = useQuery({
    queryKey: ['wnc', platform, 'jobs'],
    queryFn: () => apiFetch<{ jobs: Array<Record<string, unknown>> }>(`wnc/${platform}/jobs`),
    enabled: !feedPlatform,
  })

  const feedQ = useQuery({
    queryKey: ['wnc', platform, 'feed'],
    queryFn: () =>
      apiFetch<{
        url: string
        order_status_url?: string
        orders_list_url?: string
        note?: string
        enabled?: boolean
      }>(`wnc/${platform}/feed-url`),
    enabled: feedPlatform,
  })

  const torobPreviewQ = useQuery({
    queryKey: ['wnc', 'torob', 'preview'],
    queryFn: () => apiFetch<{ products: unknown[]; count: number }>('wnc/torob/preview'),
    enabled: feedPlatform && platform === 'torob' && Boolean(draft.enabled),
  })

  const torobQueueQ = useQuery({
    queryKey: ['wnc', 'torob', 'queue'],
    queryFn: () =>
      apiFetch<{ pending: number; last_run: string | null; next_hint: string | null; items: unknown[] }>(
        'wnc/torob/queue',
      ),
    enabled: feedPlatform && platform === 'torob',
    refetchInterval: 15000,
  })

  useEffect(() => {
    if (q.data?.settings) {
      setDraft(JSON.parse(JSON.stringify(q.data.settings)) as WncSettingsResponse['settings'])
    }
  }, [q.data])

  const save = useMutation({
    mutationFn: async () => {
      await apiFetch(`wnc/${platform}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: draft }),
      })
    },
    onSuccess: async () => {
      toast.success(t('common.saved'))
      await qc.invalidateQueries({ queryKey: ['wnc', platform] })
      await qc.invalidateQueries({ queryKey: ['wnc', 'torob'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const test = useMutation({
    mutationFn: () => apiFetch(`wnc/${platform}/test-connection`, { method: 'POST', body: '{}' }),
    onSuccess: () => toast.success(t('wnc.testOk')),
    onError: (e: Error) => toastApiError(t, e),
  })

  const pull = useMutation({
    mutationFn: () => apiFetch(`wnc/${platform}/pull-orders`, { method: 'POST', body: '{}' }),
    onSuccess: () => toast.success(t('wnc.pullQueued')),
    onError: (e: Error) => toastApiError(t, e),
  })

  const sync = useMutation({
    mutationFn: () => apiFetch(`wnc/${platform}/sync-now`, { method: 'POST', body: '{}' }),
    onSuccess: () => toast.success(t('wnc.syncQueued')),
    onError: (e: Error) => toastApiError(t, e),
  })

  const credentials = (draft.credentials ?? {}) as Record<string, string | number | boolean>
  const setCred = (key: string, value: string | boolean) => {
    setDraft((d) => ({
      ...d,
      credentials: { ...(d.credentials ?? {}), [key]: value },
    }))
  }

  const body: ReactNode = (
    <div className="space-y-4">
      <section className="wd-card-hero space-y-3 rounded-2xl border border-border/60 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span
            className={
              q.data?.live
                ? 'inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400'
                : 'bg-muted text-muted-foreground inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'
            }
          >
            {t('wnc.live')}: {q.data?.live ? t('common.yes') : t('common.no')}
          </span>
          {q.data?.pricing_tab ? (
            <Link className="text-primary text-sm font-medium underline-offset-4 hover:underline" to={q.data.pricing_tab}>
              {t('wnc.openPricingTab')}
            </Link>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id={`wnc-${platform}-en`}
            checked={Boolean(draft.enabled)}
            onCheckedChange={(v) => setDraft((d) => ({ ...d, enabled: v === true }))}
          />
          <Label htmlFor={`wnc-${platform}-en`}>{t('wnc.enabled')}</Label>
        </div>
        {feedPlatform && !draft.enabled ? (
          <p className="text-amber-700 dark:text-amber-400 text-xs">{t('wnc.feedDisabledHint')}</p>
        ) : null}
        {!feedPlatform ? (
          <div className="flex items-center gap-2">
            <Checkbox
              id={`wnc-${platform}-auto`}
              checked={Boolean(draft.auto_sync)}
              onCheckedChange={(v) => setDraft((d) => ({ ...d, auto_sync: v === true }))}
            />
            <Label htmlFor={`wnc-${platform}-auto`}>{t('wnc.autoSync')}</Label>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          {Object.keys(credentials).length === 0 ? (
            <p className="text-muted-foreground text-sm sm:col-span-2">{t('wnc.noCredentialsYet')}</p>
          ) : null}
          {Object.entries(credentials).map(([key, value]) =>
            BOOL_CRED_KEYS.has(key) ? (
              <div key={key} className="flex items-center gap-2 sm:col-span-2">
                <Checkbox
                  id={`wnc-${platform}-cred-${key}`}
                  checked={asBool(value)}
                  onCheckedChange={(v) => setCred(key, v === true)}
                />
                <Label htmlFor={`wnc-${platform}-cred-${key}`}>{credentialLabel(t, key)}</Label>
              </div>
            ) : (
              <div key={key} className="space-y-1">
                <Label className="text-xs">{credentialLabel(t, key)}</Label>
                <Input className="w-full" value={String(value ?? '')} onChange={(e) => setCred(key, e.target.value)} />
              </div>
            ),
          )}
          {Object.keys(credentials).length === 0 && !feedPlatform ? (
            <>
              <div className="space-y-1">
                <Label className="text-xs">{t('wnc.cred.base_url')}</Label>
                <Input className="w-full" value="" onChange={(e) => setCred('base_url', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t('wnc.cred.token')}</Label>
                <Input className="w-full" value="" onChange={(e) => setCred('token', e.target.value)} />
              </div>
            </>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => void save.mutateAsync()} disabled={save.isPending}>
            {t('common.save')}
          </Button>
          <Button type="button" variant="secondary" onClick={() => void test.mutateAsync()} disabled={test.isPending}>
            {t('wnc.testConnection')}
          </Button>
          {!feedPlatform ? (
            <>
              <Button type="button" variant="secondary" onClick={() => void sync.mutateAsync()} disabled={sync.isPending}>
                {t('wnc.syncNow')}
              </Button>
              <Button type="button" variant="secondary" onClick={() => void pull.mutateAsync()} disabled={pull.isPending}>
                {t('wnc.pullOrders')}
              </Button>
            </>
          ) : null}
        </div>
      </section>

      {feedPlatform && feedQ.data?.url ? (
        <section className="wd-card-glass space-y-2 rounded-2xl border border-border/60 p-4">
          <h3 className="text-sm font-medium">{t('wnc.feedUrl')}</h3>
          <code className="bg-muted block break-all rounded-xl p-2 text-xs">{feedQ.data.url}</code>
          {feedQ.data.order_status_url ? (
            <>
              <h3 className="pt-2 text-sm font-medium">{t('wnc.torobOrderStatusUrl')}</h3>
              <code className="bg-muted block break-all rounded-xl p-2 text-xs">{feedQ.data.order_status_url}</code>
            </>
          ) : null}
          {feedQ.data.orders_list_url ? (
            <>
              <h3 className="pt-2 text-sm font-medium">{t('wnc.torobOrdersListUrl')}</h3>
              <code className="bg-muted block break-all rounded-xl p-2 text-xs">{feedQ.data.orders_list_url}</code>
            </>
          ) : null}
          {feedQ.data.note ? <p className="text-muted-foreground text-xs">{feedQ.data.note}</p> : null}
        </section>
      ) : null}

      {feedPlatform && platform === 'torob' ? (
        <>
          <section className="wd-card-glass space-y-2 rounded-2xl border border-border/60 p-4">
            <h3 className="text-sm font-medium">{t('wnc.torobPreview')}</h3>
            {(torobPreviewQ.data?.products ?? []).length === 0 ? (
              <p className="text-muted-foreground text-sm">{t('common.empty')}</p>
            ) : (
              <ul className="max-h-60 space-y-2 overflow-auto">
                {(torobPreviewQ.data?.products as Array<Record<string, unknown>>).map((p, i) => (
                  <li key={String(p.product_id ?? p.id ?? i)} className="bg-muted/40 rounded-lg border p-2 text-xs">
                    <KeyValueList
                      rows={Object.entries(p)
                        .slice(0, 8)
                        .map(([k, v]) => ({ label: k, value: String(v ?? '—') }))}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="wd-card-glass space-y-2 rounded-2xl border border-border/60 p-4">
            <h3 className="text-sm font-medium">{t('wnc.torobQueue')}</h3>
            <p className="text-muted-foreground text-xs">
              {t('wnc.torobQueuePending')}: {torobQueueQ.data?.pending ?? 0}
              {torobQueueQ.data?.last_run ? ` · ${t('wnc.torobQueueLast')}: ${torobQueueQ.data.last_run}` : ''}
              {torobQueueQ.data?.next_hint ? ` · ${t('wnc.torobQueueNext')}: ${torobQueueQ.data.next_hint}` : ''}
            </p>
            <JobsTable
              jobs={(torobQueueQ.data?.items ?? []) as JobLike[]}
              emptyLabel={t('common.empty')}
              typeLabel={t('wnc.jobs')}
              statusLabel={t('digikala.endpointStatus', 'Status')}
              errorLabel={t('basalam.col.error', 'Error')}
            />
          </section>
        </>
      ) : null}

      {!feedPlatform ? (
        <>
          <section className="wd-card-glass space-y-2 rounded-2xl border border-border/60 p-4">
            <h3 className="text-sm font-medium">{t('wnc.maps')}</h3>
            {(mapsQ.data?.maps ?? []).length === 0 ? (
              <p className="text-muted-foreground text-sm">{t('common.empty')}</p>
            ) : (
              <ul className="max-h-48 space-y-2 overflow-auto">
                {(mapsQ.data?.maps as Array<Record<string, unknown>>).map((m, i) => (
                  <li key={String(m.id ?? i)} className="bg-muted/40 flex flex-wrap items-center gap-2 rounded-lg border p-2 text-xs">
                    <StatusBadge status={m.status ?? 'mapped'} tone="secondary" />
                    <span className="font-mono">{String(m.wc_id ?? m.product_id ?? '—')}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-mono">{String(m.ext_id ?? m.remote_id ?? m.platform_id ?? '—')}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="wd-card-glass space-y-2 rounded-2xl border border-border/60 p-4">
            <h3 className="text-sm font-medium">{t('wnc.jobs')}</h3>
            <JobsTable
              jobs={(jobsQ.data?.jobs ?? []) as JobLike[]}
              emptyLabel={t('common.empty')}
              typeLabel={t('wnc.jobs')}
              statusLabel={t('digikala.endpointStatus', 'Status')}
              errorLabel={t('basalam.col.error', 'Error')}
            />
          </section>
        </>
      ) : null}
    </div>
  )

  if (embedded) {
    return body
  }

  return (
    <PageShell
      eyebrow={t('settings.hub.shopTitle')}
      title={titleKey ? t(titleKey) : q.data?.label ?? platform}
      description={subtitleKey ? t(subtitleKey) : t('wnc.platformSubtitle', { platform })}
    >
      {body}
    </PageShell>
  )
}

export default WncPlatformPanel
