import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { PageShell } from '@/components/PageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { translateEnum } from '@/lib/enumLabels'
import { apiFetch } from '@/lib/api'

type BpcFailure = {
  id?: number
  parent?: number
  entity?: string
  reason?: string
  message?: string
  at?: number
}

type BpcHistoryRow = {
  run_id?: string
  job_type?: string
  status?: string
  reason?: string
  started_at?: number
  finished_at?: number
  total?: number
  pages?: number
  current_page?: number
  processed?: number
  updated?: number
  skipped?: number
  errors?: number
  type?: string
  value?: number
  cats?: string
  log_url?: string
  failures?: BpcFailure[]
  failure_count?: number
}

type BpcActive = {
  run_id?: string
  status?: string
  progress_pct?: number
  total?: number
  pages?: number
  current_page?: number
  processed?: number
  updated?: number
  skipped?: number
  errors?: number
  type?: string
  value?: number
  started_at?: number
}

type BpcState = {
  params?: Record<string, unknown>
  state?: Record<string, unknown>
  locked?: boolean
  active?: BpcActive | null
  last?: { run?: string; url?: string; status?: string; reason?: string }
  history?: BpcHistoryRow[]
  failures?: BpcFailure[]
}

function statusTone(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'completed') return 'default'
  if (status === 'running' || status === 'queued') return 'secondary'
  if (status === 'canceled' || status === 'stalled' || status === 'failed') return 'destructive'
  return 'outline'
}

function formatWhen(ts?: number, locale = 'fa-IR'): string {
  if (!ts || ts < 1) return '—'
  try {
    return new Date(ts * 1000).toLocaleString(locale)
  } catch {
    return String(ts)
  }
}

const FAILURE_REASON_KEYS: Record<string, string> = {
  wfcp_price_locked: 'wfcp.bpcReason.priceLocked',
  product_not_found: 'wfcp.bpcReason.notFound',
  variation_not_found: 'wfcp.bpcReason.notFound',
  exception: 'wfcp.bpcReason.exception',
  empty_price: 'wfcp.bpcReason.emptyPrice',
  unsupported_type: 'wfcp.bpcReason.unsupportedType',
}

/** Translate a machine reason code; unknown codes are shown verbatim (detail, not a label). */
function failureLabel(t: (key: string, opts?: Record<string, unknown>) => string, reason?: string): string {
  const raw = String(reason || '')
  if (raw === '') return '—'
  if (raw.startsWith('unsupported_type:')) {
    return t('wfcp.bpcReason.unsupportedType', { type: raw.split(':').slice(1).join(':') , defaultValue: raw })
  }
  const key = FAILURE_REASON_KEYS[raw]
  return key ? t(key, { defaultValue: raw }) : raw
}

export default function WfcpPriceChangerPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const [type, setType] = useState<'fixed' | 'percent'>('fixed')
  const [value, setValue] = useState('0')
  const [applySale, setApplySale] = useState(false)
  const [cats, setCats] = useState('')
  const [rules, setRules] = useState('')
  const [rulesCombine, setRulesCombine] = useState(false)
  const [rounding, setRounding] = useState(false)
  const [roundTh, setRoundTh] = useState('50000')
  const [roundVal, setRoundVal] = useState('1000')

  const st = useQuery({
    queryKey: ['wfcp', 'bpc', 'state'],
    queryFn: () => apiFetch<BpcState>('wfcp/bulk-price-change/state'),
    refetchInterval: (q) => (q.state.data?.locked || q.state.data?.active ? 2500 : 5000),
  })

  const locked = Boolean(st.data?.locked)
  const hasJob = Boolean(st.data?.params && (st.data.params as { run_id?: string }).run_id)
  const active = st.data?.active
  const history = st.data?.history ?? []
  const failures = st.data?.failures ?? []
  const progressPct = Math.min(100, Math.max(0, Number(active?.progress_pct ?? 0)))

  const cancel = useMutation({
    mutationFn: () =>
      apiFetch<{ success?: boolean; reason?: string }>('wfcp/bulk-price-change/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }),
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: ['wfcp', 'bpc', 'state'] })
      toast.success(
        res.reason ||
          t('wfcp.bpcCanceled', { defaultValue: 'کار تغییر قیمت لغو شد و در تاریخچه ثبت شد.' }),
      )
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const start = useMutation({
    mutationFn: () =>
      apiFetch<{ success?: boolean }>('wfcp/bulk-price-change/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          value: parseFloat(value) || 0,
          apply_sale: applySale,
          category_slugs: cats,
          range_rules: rules,
          rules_combine: rulesCombine,
          enable_rounding: rounding,
          rounding_threshold: parseFloat(roundTh) || 50000,
          rounding_value: parseInt(roundVal, 10) || 1000,
        }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['wfcp', 'bpc', 'state'] })
      toast.success(t('wfcp.bpcQueued'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  return (
    <PageShell title={t('wfcp.bpcTitle')} description={t('wfcp.bpcDescription')}>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded-lg border border-border p-4">
          <div className="space-y-2">
            <Label>{t('wfcp.bpcType')}</Label>
            <Select value={type} onValueChange={(v) => setType(v as 'fixed' | 'percent')} disabled={locked || hasJob}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">{translateEnum(t, 'wfcp.priceMode', 'fixed')}</SelectItem>
                <SelectItem value="percent">{translateEnum(t, 'wfcp.priceMode', 'percent')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('wfcp.bpcValue')}</Label>
            <Input value={value} onChange={(e) => setValue(e.target.value)} disabled={locked || hasJob} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="bpc-apply-sale"
              checked={applySale}
              disabled={locked || hasJob}
              onCheckedChange={(v) => setApplySale(v === true)}
            />
            <Label htmlFor="bpc-apply-sale" className="cursor-pointer font-normal">
              {t('wfcp.bpcApplySale')}
            </Label>
          </div>
          <div className="space-y-2">
            <Label>{t('wfcp.bpcCategories')}</Label>
            <Input value={cats} onChange={(e) => setCats(e.target.value)} disabled={locked || hasJob} />
            <p className="text-xs text-muted-foreground">{t('wfcp.bpcCategoriesHint')}</p>
          </div>
          <div className="space-y-2">
            <Label>{t('wfcp.bpcRangeRules')}</Label>
            <Textarea
              className="min-h-20"
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              disabled={locked || hasJob}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="bpc-rules-combine"
              checked={rulesCombine}
              disabled={locked || hasJob}
              onCheckedChange={(v) => setRulesCombine(v === true)}
            />
            <Label htmlFor="bpc-rules-combine" className="cursor-pointer font-normal">
              {t('wfcp.bpcRulesCombine')}
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="bpc-rounding"
              checked={rounding}
              disabled={locked || hasJob}
              onCheckedChange={(v) => setRounding(v === true)}
            />
            <Label htmlFor="bpc-rounding" className="cursor-pointer font-normal">
              {t('wfcp.bpcRounding')}
            </Label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>{t('wfcp.bpcRoundTh')}</Label>
              <Input value={roundTh} onChange={(e) => setRoundTh(e.target.value)} disabled={locked || hasJob} />
            </div>
            <div className="space-y-2">
              <Label>{t('wfcp.bpcRoundVal')}</Label>
              <Input value={roundVal} onChange={(e) => setRoundVal(e.target.value)} disabled={locked || hasJob} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" disabled={start.isPending || locked || hasJob} onClick={() => void start.mutateAsync()}>
              {t('wfcp.bpcStart')}
            </Button>
            {hasJob ? (
              <Button type="button" variant="outline" disabled={cancel.isPending} onClick={() => void cancel.mutateAsync()}>
                {t('wfcp.bpcCancel', { defaultValue: 'لغو کار' })}
              </Button>
            ) : null}
          </div>
        </div>

        <div className="space-y-4 rounded-lg border border-border p-4">
          <h3 className="text-sm font-medium">{t('wfcp.bpcStateTitle')}</h3>
          {active ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={statusTone(active.status || 'running')}>
                  {t(`wfcp.bpcStatus.${active.status || 'running'}`, {
                    defaultValue: active.status || 'running',
                  })}
                </Badge>
                <span className="text-muted-foreground font-mono text-xs" dir="ltr">
                  {active.run_id}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>
                    {t('wfcp.bpcProgress', {
                      defaultValue: 'پیشرفت صف',
                    })}
                  </span>
                  <span dir="ltr">
                    {active.processed ?? 0}/{active.total ?? 0} ({progressPct}%)
                  </span>
                </div>
                <div className="bg-muted h-2 overflow-hidden rounded-full">
                  <div className="bg-primary h-full transition-all" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                <dt className="text-muted-foreground">{t('wfcp.bpcPage', { defaultValue: 'صفحه' })}</dt>
                <dd dir="ltr">
                  {active.current_page ?? 0}/{active.pages ?? 0}
                </dd>
                <dt className="text-muted-foreground">{t('wfcp.bpcUpdated', { defaultValue: 'به‌روز شده' })}</dt>
                <dd dir="ltr">{active.updated ?? 0}</dd>
                <dt className="text-muted-foreground">{t('wfcp.bpcSkipped', { defaultValue: 'رد شده' })}</dt>
                <dd dir="ltr">{active.skipped ?? 0}</dd>
                <dt className="text-muted-foreground">{t('wfcp.bpcErrors', { defaultValue: 'خطا' })}</dt>
                <dd dir="ltr">{active.errors ?? 0}</dd>
                <dt className="text-muted-foreground">{t('wfcp.bpcStarted', { defaultValue: 'شروع' })}</dt>
                <dd>{formatWhen(active.started_at, i18n.language)}</dd>
              </dl>
              <p className="text-muted-foreground text-xs">
                {t('wfcp.bpcProgressHint', {
                  defaultValue:
                    'اگر صف وسط کار بایستد، در تاریخچه پایین با دلیل توقف ثبت می‌شود تا ببینید تا کجا رفته.',
                })}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              {t('wfcp.bpcIdle', { defaultValue: 'الان کار فعالی در صف نیست.' })}
            </p>
          )}
          {st.data?.last?.reason ? (
            <p className="border-border bg-muted/40 rounded-md border p-2 text-xs">
              <span className="font-medium">
                {t('wfcp.bpcLastReason', { defaultValue: 'آخرین نتیجه:' })}{' '}
              </span>
              {st.data.last.reason}
              {st.data.last.url ? (
                <>
                  {' '}
                  <a className="text-primary underline" href={st.data.last.url} target="_blank" rel="noopener noreferrer">
                    {t('wfcp.bpcLog', { defaultValue: 'لاگ CSV' })}
                  </a>
                </>
              ) : null}
            </p>
          ) : null}
        </div>
      </div>

      {failures.length > 0 ? (
        <div className="mt-8 space-y-3" data-testid="wfcp-bpc-failures">
          <div>
            <h3 className="text-base font-medium">
              {t('wfcp.bpcFailuresTitle', { defaultValue: 'محصولات ناموفق و دلیل آن‌ها' })}
            </h3>
            <p className="text-muted-foreground text-sm">
              {t('wfcp.bpcFailuresHint', {
                defaultValue:
                  'این محصولات به‌روزرسانی نشدند و دلیل هر کدام ثبت شده است. بعد از رفع مشکل، می‌توانید همان محصولات را انتخاب و دوباره اجرا کنید.',
              })}
            </p>
          </div>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[40rem] text-sm">
              <thead className="bg-muted/50 text-muted-foreground text-xs">
                <tr>
                  <th className="px-3 py-2 text-start font-medium">
                    {t('wfcp.bpcColProduct', { defaultValue: 'محصول' })}
                  </th>
                  <th className="px-3 py-2 text-start font-medium">
                    {t('wfcp.bpcColFailureReason', { defaultValue: 'دلیل ناموفق بودن' })}
                  </th>
                  <th className="px-3 py-2 text-start font-medium">
                    {t('wfcp.bpcColWhen', { defaultValue: 'زمان' })}
                  </th>
                </tr>
              </thead>
              <tbody>
                {failures.map((row, idx) => (
                  <tr key={`${row.id}-${idx}`} className="border-t border-border">
                    <td className="px-3 py-2 align-top">
                      <div className="font-mono text-xs" dir="ltr">
                        #{row.id ?? '—'}
                        {row.parent ? ` ← ${row.parent}` : ''}
                      </div>
                      <div className="text-muted-foreground text-start text-[11px]">
                        {t(`wfcp.bpcEntity.${row.entity || 'product'}`, { defaultValue: row.entity || 'product' })}
                      </div>
                    </td>
                    <td className="px-3 py-2 align-top text-xs">
                      <div>{failureLabel(t, row.reason)}</div>
                      {row.message ? (
                        <div className="text-muted-foreground mt-0.5 break-words" dir="ltr">
                          {row.message}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 align-top text-xs">{formatWhen(row.at, i18n.language)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <div className="mt-8 space-y-3">
        <div>
          <h3 className="text-base font-medium">{t('wfcp.bpcHistoryTitle', { defaultValue: 'تاریخچه درخواست‌ها' })}</h3>
          <p className="text-muted-foreground text-sm">
            {t('wfcp.bpcHistoryHint', {
              defaultValue: 'همه درخواست‌های تغییر قیمت گروهی، وضعیت، دلیل لغو/توقف و میزان پیشرفت صف.',
            })}
          </p>
        </div>
        {history.length === 0 ? (
          <p className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
            {t('wfcp.bpcHistoryEmpty', { defaultValue: 'هنوز درخواستی ثبت نشده است.' })}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[52rem] text-sm">
              <thead className="bg-muted/50 text-muted-foreground text-xs">
                <tr>
                  <th className="px-3 py-2 text-start font-medium">{t('wfcp.bpcColStatus', { defaultValue: 'وضعیت' })}</th>
                  <th className="px-3 py-2 text-start font-medium">{t('wfcp.bpcColProgress', { defaultValue: 'پیشرفت' })}</th>
                  <th className="px-3 py-2 text-start font-medium">{t('wfcp.bpcColReason', { defaultValue: 'دلیل / نتیجه' })}</th>
                  <th className="px-3 py-2 text-start font-medium">{t('wfcp.bpcColWhen', { defaultValue: 'زمان' })}</th>
                  <th className="px-3 py-2 text-start font-medium">{t('wfcp.bpcColLog', { defaultValue: 'لاگ' })}</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => {
                  const status = row.status || 'unknown'
                  return (
                    <tr key={row.run_id || `${row.finished_at}-${row.started_at}`} className="border-t border-border">
                      <td className="px-3 py-2 align-top">
                        <Badge variant={statusTone(status)}>
                          {t(`wfcp.bpcStatus.${status}`, { defaultValue: status })}
                        </Badge>
                        <div className="text-muted-foreground mt-1 font-mono text-[11px]" dir="ltr">
                          {(row.run_id || '').slice(0, 8)}
                          {row.type ? ` · ${row.type} ${row.value ?? ''}` : ''}
                        </div>
                      </td>
                      <td className="px-3 py-2 align-top text-xs" dir="ltr">
                        <div>
                          {row.processed ?? 0}/{row.total ?? 0}
                        </div>
                        <div className="text-muted-foreground">
                          page {row.current_page ?? 0}/{row.pages ?? 0} · ok {row.updated ?? 0} · skip{' '}
                          {row.skipped ?? 0} · err {row.errors ?? 0}
                        </div>
                        {row.failures?.length ? (
                          <details className="mt-1">
                            <summary className="text-destructive cursor-pointer text-[11px]">
                              {t('wfcp.bpcRowFailures', {
                                count: row.failures.length,
                                defaultValue: '{{count}} محصول ناموفق',
                              })}
                            </summary>
                            <ul className="mt-1 space-y-0.5">
                              {row.failures.slice(0, 25).map((f, i) => (
                                <li key={`${f.id}-${i}`} className="text-[11px]">
                                  <span className="font-mono">#{f.id}</span> — {failureLabel(t, f.reason)}
                                </li>
                              ))}
                            </ul>
                          </details>
                        ) : null}
                      </td>
                      <td className="px-3 py-2 align-top text-xs whitespace-pre-wrap">{row.reason || '—'}</td>
                      <td className="px-3 py-2 align-top text-xs">
                        <div>{formatWhen(row.started_at, i18n.language)}</div>
                        <div className="text-muted-foreground">{formatWhen(row.finished_at, i18n.language)}</div>
                      </td>
                      <td className="px-3 py-2 align-top text-xs">
                        {row.log_url ? (
                          <a className="text-primary underline" href={row.log_url} target="_blank" rel="noopener noreferrer">
                            CSV
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageShell>
  )
}
