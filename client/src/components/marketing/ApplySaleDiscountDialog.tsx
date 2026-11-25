import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { MoneyDisplay } from '@/components/currency/MoneyDisplay'
import { useStoreCurrency } from '@/hooks/useStoreCurrency'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/formatNumber'

type DurationPreset = 1 | 3 | 7 | 30 | 'custom'

export type SaleScope = 'selected' | 'filters' | 'all'

type PreviewSample = {
  id: number
  name: string
  image?: string
  regular_price: string
  sale_price: string
}

type PreviewResult = {
  count: number
  percent: number
  round_step?: number
  samples: PreviewSample[]
}

type JobError = { id: number; name?: string; message: string }

type JobRow = {
  run_id: string
  action: string
  scope: string
  status: string
  total: number
  processed: number
  ok: number
  failed: number
  skipped: number
  progress_pct: number
  percent: number
  errors?: JobError[]
}

type ApplyResult = {
  ok?: number
  failed?: number
  skipped?: number
  total?: number
  run_id?: string
  async?: boolean
  status?: string
}

type JobState = {
  active: boolean
  job: JobRow | null
  last: JobRow | null
  history: JobRow[]
}

type ApplySaleDiscountDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  productIds: number[]
  filters?: Record<string, string>
  scopeMode: SaleScope
  /** Total products the current filters match (used for the "all" confirmation copy). */
  catalogTotal?: number
  onApplied: () => void
}

export function ApplySaleDiscountDialog({
  open,
  onOpenChange,
  productIds,
  filters,
  scopeMode,
  catalogTotal,
  onApplied,
}: ApplySaleDiscountDialogProps) {
  const { t, i18n } = useTranslation()
  const store = useStoreCurrency()
  const [percent, setPercent] = useState('10')
  const [duration, setDuration] = useState<DurationPreset>(7)
  const [customUntil, setCustomUntil] = useState('')
  const [preview, setPreview] = useState<PreviewResult | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)

  const bodyBase = () => {
    const pct = Number(percent)
    const payload: Record<string, unknown> = { percent: pct, scope: scopeMode }
    if (duration === 'custom') {
      payload.until = customUntil
    } else {
      payload.days = duration
    }
    if (scopeMode === 'selected') {
      payload.product_ids = productIds
    } else if (scopeMode === 'all') {
      payload.all_products = true
    } else {
      payload.filters = filters ?? {}
    }
    return payload
  }

  const previewMut = useMutation({
    mutationFn: () =>
      apiFetch<PreviewResult>('shop/products/bulk-sale', {
        method: 'POST',
        body: JSON.stringify({ ...bodyBase(), action: 'preview' }),
      }),
    onSuccess: (res) => setPreview(res),
    onError: (e: Error) => toastApiError(t, e),
  })

  const applyMut = useMutation({
    mutationFn: () =>
      apiFetch<ApplyResult>('shop/products/bulk-sale', {
        method: 'POST',
        body: JSON.stringify({ ...bodyBase(), action: 'apply' }),
      }),
    onSuccess: (res) => {
      setPreview(null)
      if (res?.run_id) {
        setJobId(res.run_id)
        toast.success(t('salePrices.jobQueued', { count: formatNumber(res.total ?? 0, i18n.language) }))
      } else {
        toast.success(t('salePrices.applyDone', { ok: res.ok ?? 0, skipped: res.skipped ?? 0 }))
        onOpenChange(false)
      }
      onApplied()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  // Poll progress while a background job is running, so the merchant sees it finish instead of
  // assuming nothing happened.
  const jobQ = useQuery({
    queryKey: ['sale-prices', 'job', jobId],
    queryFn: () => apiFetch<JobState>('shop/products/bulk-sale/job'),
    enabled: open && !!jobId,
    refetchInterval: (query) => (query.state.data?.active ? 1500 : false),
  })

  const lastRow = jobQ.data?.last && jobQ.data.last.run_id ? jobQ.data.last : null
  const job = lastRow ?? jobQ.data?.job ?? null
  const jobFinished =
    !!jobId && !!job && !jobQ.data?.active && job.status !== 'queued' && job.status !== 'running'

  // Refresh the list exactly once per finished run (onApplied is an inline callback).
  const notified = useRef<string | null>(null)
  useEffect(() => {
    if (!jobFinished || !job) return
    if (notified.current === job.run_id) return
    notified.current = job.run_id
    onApplied()
  }, [jobFinished, job, onApplied])

  if (!open) {
    return null
  }

  const canPreview =
    Number(percent) > 0 &&
    Number(percent) < 100 &&
    (duration !== 'custom' || !!customUntil) &&
    (scopeMode !== 'selected' || productIds.length > 0)

  const durationOptions: { value: DurationPreset; label: string }[] = [
    { value: 1, label: t('salePrices.duration.1d') },
    { value: 3, label: t('salePrices.duration.3d') },
    { value: 7, label: t('salePrices.duration.1w') },
    { value: 30, label: t('salePrices.duration.1m') },
    { value: 'custom', label: t('salePrices.duration.custom') },
  ]

  const scopeLabel =
    scopeMode === 'all'
      ? t('salePrices.scopeAll', { count: formatNumber(catalogTotal ?? 0, i18n.language) })
      : scopeMode === 'filters'
        ? t('salePrices.scopeFilters')
        : t('salePrices.scopeSelected', { count: formatNumber(productIds.length, i18n.language) })

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setPreview(null)
          setJobId(null)
        }
        onOpenChange(v)
      }}
    >
      <DialogContent className="sm:max-w-md" dir={i18n.dir()}>
        <DialogHeader>
          <DialogTitle>{t('salePrices.applyTitle')}</DialogTitle>
          <DialogDescription>{scopeLabel}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {scopeMode === 'all' ? (
            <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm">
              {t('salePrices.allProductsWarning')}
            </p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="sale-pct">{t('salePrices.percent')}</Label>
            <Input
              id="sale-pct"
              inputMode="decimal"
              placeholder={t('salePrices.percentPlaceholder')}
              value={percent}
              disabled={!!jobId}
              onChange={(e) => {
                setPercent(e.target.value)
                setPreview(null)
              }}
            />
            <p className="text-muted-foreground text-xs">{t('salePrices.roundHint')}</p>
          </div>

          <div className="space-y-2">
            <Label>{t('salePrices.durationLabel')}</Label>
            <div className="flex flex-wrap gap-2">
              {durationOptions.map((opt) => (
                <Button
                  key={String(opt.value)}
                  type="button"
                  size="sm"
                  variant={duration === opt.value ? 'default' : 'outline'}
                  className={cn(duration === opt.value && 'shadow-sm')}
                  disabled={!!jobId}
                  onClick={() => {
                    setDuration(opt.value)
                    setPreview(null)
                  }}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
            {duration === 'custom' ? (
              <DatePicker value={customUntil} onChange={(v) => setCustomUntil(v)} />
            ) : null}
          </div>

          {job ? (
            <div className="border-border/70 space-y-2 rounded-xl border p-3" data-testid="sale-job-progress">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>{t('salePrices.jobProgressTitle')}</span>
                <span>{job.progress_pct}%</span>
              </div>
              <div className="bg-muted h-2 overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full transition-all"
                  style={{ width: `${Math.max(2, job.progress_pct)}%` }}
                />
              </div>
              <p className="text-muted-foreground text-xs">
                {t('salePrices.jobProgressDetail', {
                  done: formatNumber(job.processed, i18n.language),
                  total: formatNumber(job.total, i18n.language),
                  ok: formatNumber(job.ok, i18n.language),
                  failed: formatNumber(job.failed, i18n.language),
                })}
              </p>
              {job.errors?.length ? (
                <ul className="max-h-32 space-y-1 overflow-auto text-xs">
                  {job.errors.map((err) => (
                    <li key={err.id} className="text-destructive">
                      {err.name || `#${err.id}`}: {err.message}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          {preview && !job ? (
            <div className="border-border/70 space-y-2 rounded-xl border p-3">
              <p className="text-sm font-medium">
                {t('salePrices.previewCount', { count: formatNumber(preview.count, i18n.language) })}
              </p>
              <ul className="space-y-2">
                {preview.samples.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="min-w-0 flex-1 truncate">{s.name}</span>
                    <span className="text-muted-foreground flex shrink-0 items-center gap-1.5">
                      <span className="line-through">
                        <MoneyDisplay
                          amount={Number(s.regular_price)}
                          currency={store.currency}
                          currencySymbol={store.currencySymbol}
                          locale={i18n.language}
                        />
                      </span>
                      <span className="text-foreground font-medium">
                        <MoneyDisplay
                          amount={Number(s.sale_price)}
                          currency={store.currency}
                          currencySymbol={store.currencySymbol}
                          locale={i18n.language}
                        />
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <DialogFooter className="gap-2 sm:justify-start">
          {job ? (
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={() => {
                setJobId(null)
                onOpenChange(false)
              }}
            >
              {t('common.close')}
            </Button>
          ) : !preview ? (
            <Button
              type="button"
              className="w-full sm:w-auto"
              disabled={!canPreview || previewMut.isPending}
              onClick={() => previewMut.mutate()}
            >
              {t('salePrices.previewCta')}
            </Button>
          ) : (
            <Button
              type="button"
              className="w-full sm:w-auto"
              disabled={applyMut.isPending}
              onClick={() => applyMut.mutate()}
            >
              {t('salePrices.confirmApply')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
