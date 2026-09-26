import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
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
  samples: PreviewSample[]
}

type ApplyResult = {
  ok: number
  failed: number
  skipped: number
  total: number
}

type ApplySaleDiscountDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  productIds: number[]
  filters?: Record<string, string>
  scopeMode: 'selected' | 'filters'
  onApplied: () => void
}

export function ApplySaleDiscountDialog({
  open,
  onOpenChange,
  productIds,
  filters,
  scopeMode,
  onApplied,
}: ApplySaleDiscountDialogProps) {
  const { t, i18n } = useTranslation()
  const store = useStoreCurrency()
  const [percent, setPercent] = useState('10')
  const [duration, setDuration] = useState<DurationPreset>(7)
  const [customUntil, setCustomUntil] = useState('')
  const [preview, setPreview] = useState<PreviewResult | null>(null)

  const bodyBase = () => {
    const pct = Number(percent)
    const payload: Record<string, unknown> = { percent: pct }
    if (duration === 'custom') {
      payload.until = customUntil
    } else {
      payload.days = duration
    }
    if (scopeMode === 'selected') {
      payload.product_ids = productIds
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
      toast.success(t('salePrices.applyDone', { ok: res.ok, skipped: res.skipped }))
      setPreview(null)
      onOpenChange(false)
      onApplied()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const canPreview =
    Number(percent) > 0 &&
    Number(percent) < 100 &&
    (duration !== 'custom' || !!customUntil) &&
    (scopeMode === 'filters' || productIds.length > 0)

  const durationOptions: { value: DurationPreset; label: string }[] = [
    { value: 1, label: t('salePrices.duration.1d') },
    { value: 3, label: t('salePrices.duration.3d') },
    { value: 7, label: t('salePrices.duration.1w') },
    { value: 30, label: t('salePrices.duration.1m') },
    { value: 'custom', label: t('salePrices.duration.custom') },
  ]

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setPreview(null)
        onOpenChange(v)
      }}
    >
      <DialogContent className="sm:max-w-md" dir={i18n.dir()}>
        <DialogHeader>
          <DialogTitle>{t('salePrices.applyTitle')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-2">
            <Label htmlFor="sale-pct">{t('salePrices.percent')}</Label>
            <Input
              id="sale-pct"
              inputMode="decimal"
              placeholder={t('salePrices.percentPlaceholder')}
              value={percent}
              onChange={(e) => {
                setPercent(e.target.value)
                setPreview(null)
              }}
            />
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

          {preview ? (
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
          {!preview ? (
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
