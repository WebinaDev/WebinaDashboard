import { useMutation, useQuery } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { PageShell } from '@/components/PageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'
import { isSafeContentUrl } from '@/lib/safeUrl'

type TariffRow = {
  min_weight_g: number
  max_weight_g: number
  price: number
  state: string
}

type DekapostSettings = {
  enabled: boolean
  use_city_table: boolean
  fallback_flat: number
  free_shipping_min: number
  rate_extra_percent: number
  rate_extra_fixed: number
  cod_extra: number
  tracking_url_template: string
  tariffs: TariffRow[]
}

type ZoneInstance = { key: string; label: string; method_id: string; instance_id: number }

type SettingsResponse = {
  settings: DekapostSettings
  tracking_url: string
  method_id: string
  zone_instances: ZoneInstance[]
}

type QuoteResponse = {
  weight_g: number
  tariff: number | null
  city_rate: number | null
  rate: { cost: number; free: boolean; source: string } | null
}

const DEFAULT_TEMPLATE = 'https://tracking.dekapost.ir/?code={code}'

const empty = (): DekapostSettings => ({
  enabled: false,
  use_city_table: true,
  fallback_flat: 0,
  free_shipping_min: 0,
  rate_extra_percent: 0,
  rate_extra_fixed: 0,
  cod_extra: 0,
  tracking_url_template: DEFAULT_TEMPLATE,
  tariffs: [],
})

function num(value: string): number {
  const parsed = parseFloat(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

export default function DekapostSettingsPage() {
  const { t } = useTranslation()
  const [draft, setDraft] = useState<DekapostSettings | null>(null)
  const [sampleWeight, setSampleWeight] = useState('1000')

  const q = useQuery({
    queryKey: ['shipping-dekapost'],
    queryFn: () => apiFetch<SettingsResponse>('shipping/dekapost/settings'),
  })
  useQueryErrorToast(q)

  useEffect(() => {
    if (q.data?.settings) {
      setDraft({ ...empty(), ...q.data.settings, tariffs: q.data.settings.tariffs ?? [] })
    }
  }, [q.data])

  const save = useMutation({
    mutationFn: (settings: DekapostSettings) =>
      apiFetch<SettingsResponse>('shipping/dekapost/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      }),
    onSuccess: (data) => {
      if (data.settings) setDraft({ ...empty(), ...data.settings, tariffs: data.settings.tariffs ?? [] })
      toast.success(t('common.saved'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const quote = useMutation({
    mutationFn: (weight: number) =>
      apiFetch<QuoteResponse>('shipping/dekapost/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight_g: weight }),
      }),
    onError: (e: Error) => toastApiError(t, e),
  })

  if (!draft) {
    return (
      <PageShell title={t('shipping.dekapost.title')}>
        <p className="text-muted-foreground text-sm">{t('common.loading')}</p>
      </PageShell>
    )
  }

  const patch = (next: Partial<DekapostSettings>) => setDraft({ ...draft, ...next })
  const setTariff = (idx: number, next: Partial<TariffRow>) => {
    const rows = draft.tariffs.slice()
    rows[idx] = { ...rows[idx], ...next }
    patch({ tariffs: rows })
  }
  const addTariff = () => {
    const last = draft.tariffs[draft.tariffs.length - 1]
    const min = last ? (last.max_weight_g > 0 ? last.max_weight_g + 1 : last.min_weight_g + 1000) : 0
    patch({
      tariffs: [...draft.tariffs, { min_weight_g: min, max_weight_g: min + 999, price: 0, state: '' }],
    })
  }

  const templateOk =
    draft.tracking_url_template.trim() === '' ||
    (isSafeContentUrl(draft.tracking_url_template) && draft.tracking_url_template.includes('{code}'))

  const zoneInstances = q.data?.zone_instances ?? []

  return (
    <PageShell title={t('shipping.dekapost.title')} description={t('shipping.dekapost.hint')}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <a
          className="text-primary text-sm hover:underline"
          href="https://tracking.dekapost.ir/"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('shipping.dekapost.portalLink')}
        </a>
        <Button type="button" disabled={save.isPending || !templateOk} onClick={() => save.mutate(draft)}>
          {t('common.save')}
        </Button>
      </div>

      {!templateOk ? (
        <p className="text-destructive mb-4 text-sm">{t('shipping.dekapost.badTemplate')}</p>
      ) : null}

      <Card className="mb-4 border-primary/20 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base">{t('shipping.dekapost.enableTitle')}</CardTitle>
            <Badge variant={draft.enabled ? 'default' : 'secondary'}>
              {draft.enabled ? t('shipping.statusOn') : t('shipping.statusOff')}
            </Badge>
          </div>
          <CardDescription>{t('shipping.dekapost.enableHint')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>{t('shipping.dekapost.enable')}</span>
            <Switch checked={draft.enabled} onCheckedChange={(v) => patch({ enabled: v })} />
          </label>
          <p className="text-muted-foreground text-xs">
            {t('shipping.dekapost.zoneHint')}{' '}
            <Link className="text-primary hover:underline" to="/settings/shop/shipping">
              {t('shipping.openZones')}
            </Link>
          </p>
          {zoneInstances.length ? (
            <ul className="text-muted-foreground space-y-1 text-xs">
              {zoneInstances.map((z) => (
                <li key={`${z.key}-${z.instance_id}`} dir="auto">
                  • {z.label}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-xs">{t('shipping.dekapost.noZoneInstance')}</p>
          )}
        </CardContent>
      </Card>

      <Card className="mb-4 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('shipping.dekapost.pricingTitle')}</CardTitle>
          <CardDescription>{t('shipping.dekapost.pricingHint')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>{t('shipping.dekapost.useCityTable')}</span>
            <Switch checked={draft.use_city_table} onCheckedChange={(v) => patch({ use_city_table: v })} />
          </label>
          <p className="text-muted-foreground text-xs">{t('shipping.dekapost.useCityTableHint')}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t('shipping.dekapost.fallbackFlat')}</Label>
              <Input
                type="number"
                dir="ltr"
                value={draft.fallback_flat}
                onChange={(e) => patch({ fallback_flat: num(e.target.value) })}
              />
              <p className="text-muted-foreground text-xs">{t('shipping.dekapost.fallbackFlatHint')}</p>
            </div>
            <div className="space-y-1.5">
              <Label>{t('shipping.dekapost.freeMin')}</Label>
              <Input
                type="number"
                dir="ltr"
                value={draft.free_shipping_min}
                onChange={(e) => patch({ free_shipping_min: num(e.target.value) })}
              />
              <p className="text-muted-foreground text-xs">{t('shipping.dekapost.freeMinHint')}</p>
            </div>
            <div className="space-y-1.5">
              <Label>{t('shipping.dekapost.extraPercent')}</Label>
              <Input
                type="number"
                dir="ltr"
                value={draft.rate_extra_percent}
                onChange={(e) => patch({ rate_extra_percent: num(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('shipping.dekapost.extraFixed')}</Label>
              <Input
                type="number"
                dir="ltr"
                value={draft.rate_extra_fixed}
                onChange={(e) => patch({ rate_extra_fixed: num(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('shipping.dekapost.codExtra')}</Label>
              <Input
                type="number"
                dir="ltr"
                value={draft.cod_extra}
                onChange={(e) => patch({ cod_extra: num(e.target.value) })}
              />
              <p className="text-muted-foreground text-xs">{t('shipping.dekapost.codExtraHint')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4 shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
          <div>
            <CardTitle className="text-base">{t('shipping.dekapost.tariffsTitle')}</CardTitle>
            <CardDescription>{t('shipping.dekapost.tariffsHint')}</CardDescription>
          </div>
          <Button type="button" size="sm" variant="outline" onClick={addTariff}>
            <Plus className="size-3.5" aria-hidden />
            {t('shipping.dekapost.addTariff')}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {draft.tariffs.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('shipping.dekapost.noTariffs')}</p>
          ) : (
            draft.tariffs.map((row, idx) => (
              <div key={idx} className="grid gap-2 rounded-lg border border-border/70 p-3 sm:grid-cols-5">
                <div className="space-y-1">
                  <Label className="text-xs">{t('shipping.dekapost.minWeight')}</Label>
                  <Input
                    type="number"
                    dir="ltr"
                    value={row.min_weight_g}
                    onChange={(e) => setTariff(idx, { min_weight_g: num(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t('shipping.dekapost.maxWeight')}</Label>
                  <Input
                    type="number"
                    dir="ltr"
                    value={row.max_weight_g}
                    onChange={(e) => setTariff(idx, { max_weight_g: num(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t('shipping.dekapost.price')}</Label>
                  <Input
                    type="number"
                    dir="ltr"
                    value={row.price}
                    onChange={(e) => setTariff(idx, { price: num(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t('shipping.dekapost.state')}</Label>
                  <Input
                    dir="ltr"
                    placeholder={t('shipping.dekapost.statePlaceholder')}
                    value={row.state}
                    onChange={(e) => setTariff(idx, { state: e.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    aria-label={t('common.delete')}
                    onClick={() => patch({ tariffs: draft.tariffs.filter((_, i) => i !== idx) })}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="mb-4 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('shipping.dekapost.trackingTitle')}</CardTitle>
          <CardDescription>{t('shipping.dekapost.trackingHint')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>{t('shipping.dekapost.trackingTemplate')}</Label>
            <Input
              dir="ltr"
              value={draft.tracking_url_template}
              placeholder={DEFAULT_TEMPLATE}
              onChange={(e) => patch({ tracking_url_template: e.target.value })}
            />
            <p className="text-muted-foreground text-xs">{t('shipping.dekapost.trackingHintCode')}</p>
          </div>
          {draft.tracking_url_template.includes('{code}') ? (
            <a
              className="text-primary text-sm hover:underline"
              dir="ltr"
              href={draft.tracking_url_template.replace('{code}', '148188425731')}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('shipping.dekapost.trackingPreview')}
            </a>
          ) : null}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('shipping.dekapost.quoteTitle')}</CardTitle>
          <CardDescription>{t('shipping.dekapost.quoteHint')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-end gap-2">
            <div className="space-y-1.5">
              <Label>{t('shipping.dekapost.quoteWeight')}</Label>
              <Input
                type="number"
                dir="ltr"
                className="w-40"
                value={sampleWeight}
                onChange={(e) => setSampleWeight(e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={quote.isPending}
              onClick={() => quote.mutate(Math.max(1, parseInt(sampleWeight, 10) || 0))}
            >
              {t('shipping.dekapost.quoteRun')}
            </Button>
          </div>
          {quote.data ? (
            <div className="text-sm">
              {quote.data.rate ? (
                <p className="font-medium">
                  {t('shipping.dekapost.quoteResult', {
                    cost: String(quote.data.rate.cost),
                    source: t(`shipping.dekapost.source.${quote.data.rate.source}`),
                  })}
                </p>
              ) : (
                <p className="text-muted-foreground">{t('shipping.dekapost.quoteNone')}</p>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </PageShell>
  )
}
