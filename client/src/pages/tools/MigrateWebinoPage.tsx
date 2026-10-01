import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toastApiError } from '@/lib/apiError'
import {
  fetchMigrateSettings,
  MIGRATE_ENTITIES,
  pauseMigration,
  resetMigration,
  saveMigrateSettings,
  startMigration,
  testMigrateConnection,
  tickMigration,
  type MigrateJob,
  type MigrateSettings,
} from '@/lib/migrate-api'

const STATUS_KEYS: Record<string, string> = {
  idle: 'migrate.status.idle',
  running: 'migrate.status.running',
  paused: 'migrate.status.paused',
  failed: 'migrate.status.failed',
  completed: 'migrate.status.completed',
}

export default function MigrateWebinoPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const query = useQuery({
    queryKey: ['migrate-webino'],
    queryFn: fetchMigrateSettings,
    refetchOnWindowFocus: false,
  })
  const [form, setForm] = useState<MigrateSettings | null>(null)
  const [token, setToken] = useState('')
  const [clearToken, setClearToken] = useState(false)
  const [job, setJob] = useState<MigrateJob | null>(null)
  const [endpointsOpen, setEndpointsOpen] = useState(false)

  useEffect(() => {
    if (query.data?.settings) setForm(query.data.settings)
    if (query.data?.job) setJob(query.data.job)
  }, [query.data])

  useEffect(() => {
    if (job?.status !== 'running') return
    let stop = false
    let timer = 0
    const loop = async () => {
      try {
        const next = await tickMigration()
        if (stop) return
        setJob(next.job)
        if (next.job.status === 'running') {
          const pauseMs = next.job.pause_until ? Math.max(0, next.job.pause_until * 1000 - Date.now()) : 0
          const delay = next.job.lock_skipped ? 2000 : Math.max(300, pauseMs || next.job.delay_ms || form?.delay_ms || 400)
          timer = window.setTimeout(() => void loop(), Math.min(delay, 30_000))
        }
      } catch {
        if (!stop) timer = window.setTimeout(() => void loop(), 4000)
      }
    }
    timer = window.setTimeout(() => void loop(), 250)
    return () => {
      stop = true
      window.clearTimeout(timer)
    }
  }, [job?.status, job?.id, form?.delay_ms])

  const save = useMutation({
    mutationFn: () => {
      if (!form) throw new Error('missing form')
      return saveMigrateSettings({
        site_url: form.site_url,
        token,
        clear_token: clearToken,
        batch_size: form.batch_size,
        delay_ms: form.delay_ms,
        timeout: form.timeout,
        dry_run: form.dry_run,
        entities: form.entities,
        endpoints: form.endpoints,
      })
    },
    onSuccess: (data) => {
      setToken('')
      setClearToken(false)
      setForm(data.settings)
      setJob(data.job)
      void qc.invalidateQueries({ queryKey: ['migrate-webino'] })
      toast.success(t('migrate.saved'))
    },
    onError: (error) => toastApiError(t, error),
  })

  const test = useMutation({
    mutationFn: testMigrateConnection,
    onSuccess: (data) => toast.success(data.message || t('migrate.testOk')),
    onError: (error) => toastApiError(t, error),
  })

  const start = useMutation({
    mutationFn: (resume: boolean) => startMigration(resume),
    onSuccess: (data) => setJob(data.job),
    onError: (error) => toastApiError(t, error),
  })

  const pause = useMutation({
    mutationFn: pauseMigration,
    onSuccess: (data) => setJob(data.job),
    onError: (error) => toastApiError(t, error),
  })

  const reset = useMutation({
    mutationFn: resetMigration,
    onSuccess: (data) => setJob(data.job),
    onError: (error) => toastApiError(t, error),
  })

  const status = job?.status || 'idle'
  const estimates = query.data?.estimates ?? {}

  return (
    <PageShell title={t('migrate.title')} description={t('migrate.description')}>
      <Card>
        <CardHeader>
          <CardTitle>{t('migrate.connection')}</CardTitle>
          <CardDescription>
            {t('migrate.schema', { schema: form?.schema || 'webino.wordpress.import.v1' })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="block space-y-1.5 text-sm">
            <span>{t('migrate.siteUrl')}</span>
            <Input
              dir="ltr"
              type="url"
              value={form?.site_url ?? ''}
              placeholder="https://parisma.webinaagency.ir"
              onChange={(event) => setForm((prev) => (prev ? { ...prev, site_url: event.target.value } : prev))}
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span>{t('migrate.token')}</span>
            <Input
              dir="ltr"
              type="password"
              autoComplete="new-password"
              value={token}
              placeholder={form?.token_set ? t('migrate.tokenSaved', { hint: form.token_hint }) : ''}
              onChange={(event) => setToken(event.target.value)}
            />
          </label>
          {form?.token_set ? (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={clearToken} onChange={(event) => setClearToken(event.target.checked)} />
              {t('migrate.clearToken')}
            </label>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="space-y-1.5 text-sm">
              <span>{t('migrate.batchSize')}</span>
              <Input
                type="number"
                min={1}
                max={100}
                value={form?.batch_size ?? 20}
                onChange={(event) =>
                  setForm((prev) => (prev ? { ...prev, batch_size: Number(event.target.value) } : prev))
                }
              />
            </label>
            <label className="space-y-1.5 text-sm">
              <span>{t('migrate.delay')}</span>
              <Input
                type="number"
                min={0}
                max={10000}
                value={form?.delay_ms ?? 400}
                onChange={(event) =>
                  setForm((prev) => (prev ? { ...prev, delay_ms: Number(event.target.value) } : prev))
                }
              />
            </label>
            <label className="space-y-1.5 text-sm">
              <span>{t('migrate.timeout')}</span>
              <Input
                type="number"
                min={5}
                max={120}
                value={form?.timeout ?? 45}
                onChange={(event) =>
                  setForm((prev) => (prev ? { ...prev, timeout: Number(event.target.value) } : prev))
                }
              />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean(form?.dry_run)}
              onChange={(event) => setForm((prev) => (prev ? { ...prev, dry_run: event.target.checked } : prev))}
            />
            {t('migrate.dryRun')}
          </label>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">{t('migrate.entities')}</legend>
            <ul className="grid gap-2 sm:grid-cols-2">
              {MIGRATE_ENTITIES.map((key) => (
                <li key={key}>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={Boolean(form?.entities?.[key])}
                      onChange={(event) =>
                        setForm((prev) =>
                          prev
                            ? { ...prev, entities: { ...prev.entities, [key]: event.target.checked } }
                            : prev,
                        )
                      }
                    />
                    <span>{t(`migrate.entity.${key}`)}</span>
                    <span className="text-muted-foreground text-xs">{estimates[key] ?? 0}</span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
          <div>
            <button type="button" className="text-sm underline" onClick={() => setEndpointsOpen((open) => !open)}>
              {t('migrate.endpoints')}
            </button>
            {endpointsOpen && form ? (
              <div className="mt-3 space-y-2">
                {Object.keys(form.endpoints).map((key) => (
                  <label key={key} className="grid gap-1 text-xs sm:grid-cols-[8rem_1fr] sm:items-center">
                    <span className="font-mono">{key}</span>
                    <Input
                      dir="ltr"
                      value={form.endpoints[key] ?? ''}
                      onChange={(event) =>
                        setForm((prev) =>
                          prev ? { ...prev, endpoints: { ...prev.endpoints, [key]: event.target.value } } : prev,
                        )
                      }
                    />
                  </label>
                ))}
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" disabled={!form || save.isPending} onClick={() => save.mutate()}>
              {t('migrate.save')}
            </Button>
            <Button type="button" variant="secondary" disabled={test.isPending} onClick={() => test.mutate()}>
              {t('migrate.test')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('migrate.progress')}</CardTitle>
          <CardDescription>
            {t(STATUS_KEYS[status] || 'migrate.status.idle')}
            {job?.dry_run ? ` — ${t('migrate.dryRunBadge')}` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {job?.last_error ? <p className="text-destructive text-sm">{job.last_error}</p> : null}
          <div className="space-y-3">
            {job?.progress && Object.keys(job.progress).length ? (
              Object.entries(job.progress).map(([key, row]) => {
                const total = job.totals?.[key] ?? 0
                const pct = total > 0 ? Math.min(100, Math.floor((row.exported / total) * 100)) : row.done ? 100 : 0
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{t(`migrate.entity.${key}`, { defaultValue: key })}</span>
                      <span>
                        {row.exported}
                        {total ? ` / ${total}` : ''}
                      </span>
                    </div>
                    <div className="bg-muted h-2 overflow-hidden rounded-full" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                      <div className="bg-primary h-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-muted-foreground text-sm">{t('migrate.notStarted')}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={start.isPending}
              onClick={() => {
                if (window.confirm(t('migrate.confirmStart'))) start.mutate(false)
              }}
            >
              {t('migrate.start')}
            </Button>
            <Button type="button" variant="secondary" disabled={start.isPending} onClick={() => start.mutate(true)}>
              {t('migrate.resume')}
            </Button>
            <Button type="button" variant="outline" disabled={pause.isPending} onClick={() => pause.mutate()}>
              {t('migrate.pause')}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={reset.isPending}
              onClick={() => {
                if (window.confirm(t('migrate.confirmReset'))) reset.mutate()
              }}
            >
              {t('migrate.reset')}
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">{t('migrate.passwordNote')}</p>
          <ol className="bg-foreground text-background max-h-72 space-y-1 overflow-auto rounded-lg p-3 font-mono text-xs">
            {(job?.log ?? []).map((row, index) => (
              <li key={`${row.ts}-${index}`} className={row.level === 'error' ? 'text-red-300' : row.level === 'warn' ? 'text-amber-200' : ''}>
                <time className="opacity-70">{row.ts}</time> {row.message}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </PageShell>
  )
}
