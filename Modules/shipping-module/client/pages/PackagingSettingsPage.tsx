import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

import type { PackagingBox, PackagingSettings } from '../types'

function boxesList(settings: PackagingSettings): PackagingBox[] {
  return Object.values(settings.boxes).sort((a, b) => a.size - b.size)
}

export default function PackagingSettingsPage() {
  const { t } = useTranslation()
  const [draft, setDraft] = useState<PackagingSettings | null>(null)

  const q = useQuery({
    queryKey: ['shipping-packaging-settings'],
    queryFn: () => apiFetch<{ settings: PackagingSettings }>('shipping/packaging/settings'),
  })
  useQueryErrorToast(q)

  useEffect(() => {
    if (q.data?.settings) setDraft(q.data.settings)
  }, [q.data])

  const save = useMutation({
    mutationFn: (settings: PackagingSettings) =>
      apiFetch<{ settings: PackagingSettings }>('shipping/packaging/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      }),
    onSuccess: (data) => {
      toast.success(t('common.saved'))
      if (data.settings) setDraft(data.settings)
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const rows = useMemo(() => (draft ? boxesList(draft) : []), [draft])

  if (!draft) {
    return (
      <PageShell title={t('shipping.packagingTitle')}>
        <p className="text-muted-foreground text-sm">{t('common.loading')}</p>
      </PageShell>
    )
  }

  return (
    <PageShell title={t('shipping.packagingTitle')} description={t('shipping.packagingHint')}>
      <div className="mb-4 flex justify-end">
        <Button type="button" disabled={save.isPending} onClick={() => save.mutate(draft)}>
          {t('common.save')}
        </Button>
      </div>

      <Card className="mb-4 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('shipping.checkoutToggleTitle')}</CardTitle>
          <CardDescription>{t('shipping.checkoutToggleHint')}</CardDescription>
        </CardHeader>
        <CardContent>
          <label className="flex items-center gap-3 text-sm">
            <Switch
              checked={draft.add_packaging_cost_to_checkout}
              onCheckedChange={(v) =>
                setDraft((d) => (d ? { ...d, add_packaging_cost_to_checkout: v } : d))
              }
            />
            <span>{t('shipping.addPackagingToCheckout')}</span>
          </label>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('shipping.boxesTitle')}</CardTitle>
          <CardDescription>{t('shipping.boxesHint')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="hidden grid-cols-[4rem_1fr_7rem_7rem_5rem] gap-3 text-muted-foreground text-xs sm:grid">
            <span>{t('shipping.boxSize')}</span>
            <span>{t('shipping.boxDims')}</span>
            <span>{t('shipping.boxPrice')}</span>
            <span>{t('shipping.boxTare')}</span>
            <span>{t('shipping.boxEnabled')}</span>
          </div>
          {rows.map((box) => (
            <div
              key={box.size}
              className="grid items-center gap-3 rounded-lg border border-border p-3 sm:grid-cols-[4rem_1fr_7rem_7rem_5rem]"
            >
              <div className="text-sm font-semibold">
                {t('shipping.sizeN', { n: box.size })}
              </div>
              <div className="text-muted-foreground text-sm" dir="ltr">
                {box.length} × {box.width} × {box.height} cm
              </div>
              <div className="space-y-1">
                <Label className="sm:sr-only">{t('shipping.boxPrice')}</Label>
                <Input
                  type="number"
                  min={0}
                  step="1"
                  dir="ltr"
                  value={Number.isFinite(box.price) ? String(box.price) : '0'}
                  onChange={(e) => {
                    const price = Math.max(0, parseFloat(e.target.value) || 0)
                    setDraft((d) => {
                      if (!d) return d
                      const key = String(box.size)
                      return {
                        ...d,
                        boxes: {
                          ...d.boxes,
                          [key]: { ...d.boxes[key], price },
                        },
                      }
                    })
                  }}
                />
              </div>
              <div className="space-y-1">
                <Label className="sm:sr-only">{t('shipping.boxTare')}</Label>
                <Input
                  type="number"
                  min={0}
                  step="1"
                  dir="ltr"
                  value={Number.isFinite(box.tare_weight_g) ? String(box.tare_weight_g) : '0'}
                  onChange={(e) => {
                    const tare_weight_g = Math.max(0, parseInt(e.target.value, 10) || 0)
                    setDraft((d) => {
                      if (!d) return d
                      const key = String(box.size)
                      return {
                        ...d,
                        boxes: {
                          ...d.boxes,
                          [key]: { ...d.boxes[key], tare_weight_g },
                        },
                      }
                    })
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={box.enabled}
                  onCheckedChange={(enabled) => {
                    setDraft((d) => {
                      if (!d) return d
                      const key = String(box.size)
                      return {
                        ...d,
                        boxes: {
                          ...d.boxes,
                          [key]: { ...d.boxes[key], enabled },
                        },
                      }
                    })
                  }}
                />
                <span className="text-xs sm:sr-only">{t('shipping.boxEnabled')}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </PageShell>
  )
}
