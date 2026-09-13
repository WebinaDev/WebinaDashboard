import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { PageShell } from '@/components/PageShell'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

import type { LocItem, TapinSettings, TapinShop, TapinTariffs, TariffRow } from '../types'

const emptySettings = (): TapinSettings => ({
  enabled: true,
  token: '',
  shop_id: '',
  shop_title: '',
  gateway: 'tapin',
  show_credit: true,
  use_pws_formula: true,
  content_type: 1,
  tipax_pickup_type: 10,
  tipax_delivery_type: 10,
  origin_province_code: 0,
  origin_city_code: 0,
  auto_register: false,
  auto_register_status: 'processing',
  register_type: 1,
  default_pay_type: 1,
  default_order_type: 0,
  has_insurance: false,
  employee_code: -1,
  methods: { pishtaz: true, vip: true, tipax: true, courier: true, tipax_api: true, alonomic: false },
  courier_base_price: 0,
  courier_per_kg: 0,
  free_shipping_min: 0,
  rate_extra_percent: 0,
  rate_extra_fixed: 0,
  box_id_map: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9 },
  default_box_id: 1,
  default_kiosk_id: 0,
  notify_customer_link: true,
})

function TariffEditor({
  title,
  rows,
  onChange,
}: {
  title: string
  rows: TariffRow[]
  onChange: (rows: TariffRow[]) => void
}) {
  const { t } = useTranslation()
  return (
    <div className="space-y-2 rounded-xl border border-border/80 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{title}</p>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() =>
            onChange([
              ...rows,
              { min_weight_g: 0, max_weight_g: 1000, price: 0, province_code: 0 },
            ])
          }
        >
          {t('tapin.addRow')}
        </Button>
      </div>
      {rows.map((row, i) => (
        <div key={i} className="grid gap-2 sm:grid-cols-4">
          <Input
            type="number"
            dir="ltr"
            value={row.min_weight_g}
            onChange={(e) => {
              const next = rows.slice()
              next[i] = { ...row, min_weight_g: Math.max(0, parseInt(e.target.value, 10) || 0) }
              onChange(next)
            }}
            placeholder={t('tapin.minWeight')}
          />
          <Input
            type="number"
            dir="ltr"
            value={row.max_weight_g}
            onChange={(e) => {
              const next = rows.slice()
              next[i] = { ...row, max_weight_g: Math.max(0, parseInt(e.target.value, 10) || 0) }
              onChange(next)
            }}
            placeholder={t('tapin.maxWeight')}
          />
          <Input
            type="number"
            dir="ltr"
            value={row.price}
            onChange={(e) => {
              const next = rows.slice()
              next[i] = { ...row, price: Math.max(0, parseFloat(e.target.value) || 0) }
              onChange(next)
            }}
            placeholder={t('tapin.price')}
          />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onChange(rows.filter((_, j) => j !== i))}
          >
            {t('common.delete')}
          </Button>
        </div>
      ))}
    </div>
  )
}

export default function TapinSettingsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [draft, setDraft] = useState<TapinSettings | null>(null)
  const [shops, setShops] = useState<TapinShop[]>([])
  const [tariffs, setTariffs] = useState<TapinTariffs | null>(null)
  const [credit, setCredit] = useState<number | null>(null)

  const q = useQuery({
    queryKey: ['tapin-settings'],
    queryFn: () =>
      apiFetch<{
        settings: TapinSettings
        connected: boolean
        credit: number | null
        locations: { count: number }
      }>('shipping/tapin/settings'),
  })
  useQueryErrorToast(q)

  const provincesQ = useQuery({
    queryKey: ['tapin-provinces'],
    queryFn: () => apiFetch<{ items: LocItem[] }>('shipping/tapin/provinces'),
  })

  const tariffsQ = useQuery({
    queryKey: ['tapin-tariffs'],
    queryFn: () => apiFetch<{ tariffs: TapinTariffs }>('shipping/tapin/tariffs'),
  })

  useEffect(() => {
    if (q.data?.settings) setDraft({ ...emptySettings(), ...q.data.settings, methods: { ...emptySettings().methods, ...q.data.settings.methods } })
    if (typeof q.data?.credit === 'number') setCredit(q.data.credit)
  }, [q.data])

  useEffect(() => {
    if (tariffsQ.data?.tariffs) setTariffs(tariffsQ.data.tariffs)
  }, [tariffsQ.data])

  const originCitiesQ = useQuery({
    queryKey: ['tapin-cities', draft?.origin_province_code],
    queryFn: () =>
      apiFetch<{ items: LocItem[] }>(
        `shipping/tapin/cities?province=${draft?.origin_province_code || 0}`,
      ),
    enabled: Boolean(draft?.origin_province_code),
  })

  const provinces = provincesQ.data?.items ?? []
  const cities = originCitiesQ.data?.items ?? []
  const locCount = q.data?.locations?.count ?? provinces.length

  const save = useMutation({
    mutationFn: (settings: TapinSettings) =>
      apiFetch<{ settings: TapinSettings }>('shipping/tapin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      }),
    onSuccess: (data) => {
      toast.success(t('common.saved'))
      if (data.settings) setDraft(data.settings)
      void qc.invalidateQueries({ queryKey: ['tapin-settings'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const test = useMutation({
    mutationFn: async () => {
      if (!draft) throw new Error('no draft')
      await apiFetch('shipping/tapin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: { token: draft.token } }),
      })
      return apiFetch<{ ok: boolean; message: string; shops: TapinShop[] }>('shipping/tapin/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: draft.token }),
      })
    },
    onSuccess: (data) => {
      if (data.ok) toast.success(data.message || t('tapin.connected'))
      else toast.error(data.message || t('tapin.connectFailed'))
      setShops(data.shops ?? [])
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const syncLoc = useMutation({
    mutationFn: () =>
      apiFetch<{ ok: boolean; message: string; count: number }>('shipping/tapin/locations/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      }),
    onSuccess: (data) => {
      if (data.ok) toast.success(data.message)
      else toast.error(data.message)
      void qc.invalidateQueries({ queryKey: ['tapin-provinces'] })
      void qc.invalidateQueries({ queryKey: ['tapin-settings'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const saveTariffs = useMutation({
    mutationFn: (next: TapinTariffs) =>
      apiFetch<{ tariffs: TapinTariffs }>('shipping/tapin/tariffs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tariffs: next }),
      }),
    onSuccess: (data) => {
      toast.success(t('common.saved'))
      setTariffs(data.tariffs)
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const syncBoxes = useMutation({
    mutationFn: () =>
      apiFetch<{ ok: boolean; message: string }>('shipping/tapin/packing-boxes/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      }),
    onSuccess: (data) => {
      if (data.ok) toast.success(data.message)
      else toast.error(data.message)
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const connectedHint = useMemo(() => {
    if (!draft?.shop_id) return t('tapin.needShop')
    if (!locCount) return t('tapin.needLocations')
    return t('tapin.readyHint')
  }, [draft?.shop_id, locCount, t])

  if (!draft) {
    return (
      <PageShell title={t('tapin.settingsTitle')}>
        <p className="text-muted-foreground text-sm">{t('common.loading')}</p>
      </PageShell>
    )
  }

  return (
    <PageShell title={t('tapin.settingsTitle')} description={t('tapin.settingsSubtitle')}>
      <div className="mb-4 flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link to="/settings/shop/transport/tapin/ops">{t('tapin.openOps')}</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/settings/shop/transport/tapin/finance">{t('tapin.openFinance')}</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/settings/shop/transport/tapin/catalog">{t('tapin.openCatalog')}</Link>
        </Button>
      </div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-muted-foreground max-w-xl text-sm">{connectedHint}</p>
          {credit != null && (
            <p className="text-sm font-medium">
              {t('tapin.credit')}: <span dir="ltr">{credit.toLocaleString()}</span>
            </p>
          )}
        </div>
        <Button type="button" disabled={save.isPending} onClick={() => save.mutate(draft)}>
          {t('common.save')}
        </Button>
      </div>

      <Tabs defaultValue="connect" className="gap-4">
        <TabsList variant="line" className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="connect">{t('tapin.tabConnect')}</TabsTrigger>
          <TabsTrigger value="origin">{t('tapin.tabOrigin')}</TabsTrigger>
          <TabsTrigger value="methods">{t('tapin.tabMethods')}</TabsTrigger>
          <TabsTrigger value="tariffs">{t('tapin.tabTariffs')}</TabsTrigger>
          <TabsTrigger value="ship">{t('tapin.tabShip')}</TabsTrigger>
          <TabsTrigger value="notify">{t('tapin.tabNotify')}</TabsTrigger>
        </TabsList>

        <TabsContent value="connect" className="space-y-4 outline-none">
          <Card className="overflow-hidden border-border/70 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('tapin.connectTitle')}</CardTitle>
              <CardDescription>{t('tapin.connectHint')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-3 text-sm">
                <Switch
                  checked={draft.enabled}
                  onCheckedChange={(v) => setDraft({ ...draft, enabled: v })}
                />
                <span>{t('tapin.enabled')}</span>
              </label>
              <div className="space-y-1.5">
                <Label>{t('tapin.gateway')}</Label>
                <Select
                  value={draft.gateway}
                  onValueChange={(v) =>
                    setDraft({ ...draft, gateway: v === 'posteketab' ? 'posteketab' : 'tapin' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tapin">tapin.ir</SelectItem>
                    <SelectItem value="posteketab">posteketab.com</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <label className="flex items-center gap-3 text-sm">
                <Switch
                  checked={draft.show_credit}
                  onCheckedChange={(v) => setDraft({ ...draft, show_credit: v })}
                />
                <span>{t('tapin.showCredit')}</span>
              </label>
              <div className="space-y-1.5">
                <Label>{t('tapin.token')}</Label>
                <Input
                  type="password"
                  dir="ltr"
                  value={draft.token}
                  onChange={(e) => setDraft({ ...draft, token: e.target.value })}
                  placeholder={t('tapin.tokenPlaceholder')}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" disabled={test.isPending} onClick={() => void test.mutate()}>
                  {t('tapin.testConnection')}
                </Button>
                <Button type="button" variant="outline" disabled={syncLoc.isPending} onClick={() => void syncLoc.mutate()}>
                  {t('tapin.syncLocations')}
                </Button>
              </div>
              {(shops.length > 0 || draft.shop_id) && (
                <div className="space-y-1.5">
                  <Label>{t('tapin.shop')}</Label>
                  <Select
                    value={draft.shop_id || undefined}
                    onValueChange={(id) => {
                      const shop = shops.find((s) => s.id === id)
                      setDraft({
                        ...draft,
                        shop_id: id,
                        shop_title: shop?.title || draft.shop_title,
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('tapin.pickShop')} />
                    </SelectTrigger>
                    <SelectContent>
                      {(shops.length ? shops : draft.shop_id ? [{ id: draft.shop_id, title: draft.shop_title || draft.shop_id }] : []).map(
                        (s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.title}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <p className="text-muted-foreground text-xs">
                {t('tapin.locationsCount', { count: locCount })}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="origin" className="space-y-4 outline-none">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('tapin.originTitle')}</CardTitle>
              <CardDescription>{t('tapin.originHint')}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>{t('tapin.province')}</Label>
                <Select
                  value={draft.origin_province_code ? String(draft.origin_province_code) : undefined}
                  onValueChange={(v) =>
                    setDraft({ ...draft, origin_province_code: parseInt(v, 10) || 0, origin_city_code: 0 })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('tapin.pickProvince')} />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((p) => (
                      <SelectItem key={p.code} value={String(p.code)}>
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t('tapin.city')}</Label>
                <Select
                  value={draft.origin_city_code ? String(draft.origin_city_code) : undefined}
                  onValueChange={(v) => setDraft({ ...draft, origin_city_code: parseInt(v, 10) || 0 })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('tapin.pickCity')} />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((c) => (
                      <SelectItem key={c.code} value={String(c.code)}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methods" className="space-y-4 outline-none">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('tapin.methodsTitle')}</CardTitle>
              <CardDescription>{t('tapin.methodsHint')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(
                [
                  ['pishtaz', 'tapin.methodPishtaz'],
                  ['vip', 'tapin.methodVip'],
                  ['tipax', 'tapin.methodTipax'],
                  ['tipax_api', 'tapin.methodTipaxApi'],
                  ['alonomic', 'tapin.methodAlonomic'],
                  ['courier', 'tapin.methodCourier'],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2.5 text-sm">
                  <span>{t(label)}</span>
                  <Switch
                    checked={Boolean(draft.methods[key])}
                    onCheckedChange={(v) =>
                      setDraft({ ...draft, methods: { ...draft.methods, [key]: v } })
                    }
                  />
                </label>
              ))}
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>{t('tapin.courierPrice')}</Label>
                  <Input
                    type="number"
                    dir="ltr"
                    value={draft.courier_base_price}
                    onChange={(e) =>
                      setDraft({ ...draft, courier_base_price: Math.max(0, parseFloat(e.target.value) || 0) })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('tapin.courierPerKg')}</Label>
                  <Input
                    type="number"
                    dir="ltr"
                    value={draft.courier_per_kg}
                    onChange={(e) =>
                      setDraft({ ...draft, courier_per_kg: Math.max(0, parseFloat(e.target.value) || 0) })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('tapin.freeMin')}</Label>
                  <Input
                    type="number"
                    dir="ltr"
                    value={draft.free_shipping_min}
                    onChange={(e) =>
                      setDraft({ ...draft, free_shipping_min: Math.max(0, parseFloat(e.target.value) || 0) })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('tapin.extraPercent')}</Label>
                  <Input
                    type="number"
                    dir="ltr"
                    value={draft.rate_extra_percent}
                    onChange={(e) =>
                      setDraft({ ...draft, rate_extra_percent: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('tapin.extraFixed')}</Label>
                  <Input
                    type="number"
                    dir="ltr"
                    value={draft.rate_extra_fixed}
                    onChange={(e) =>
                      setDraft({ ...draft, rate_extra_fixed: Math.max(0, parseFloat(e.target.value) || 0) })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('tapin.defaultBox')}</Label>
                  <Input
                    type="number"
                    dir="ltr"
                    value={draft.default_box_id}
                    onChange={(e) =>
                      setDraft({ ...draft, default_box_id: Math.max(1, parseInt(e.target.value, 10) || 1) })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('tapin.defaultKiosk')}</Label>
                  <Input
                    type="number"
                    dir="ltr"
                    value={draft.default_kiosk_id}
                    onChange={(e) =>
                      setDraft({ ...draft, default_kiosk_id: Math.max(0, parseInt(e.target.value, 10) || 0) })
                    }
                  />
                </div>
              </div>
              <label className="flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2.5 text-sm">
                <span>{t('tapin.usePwsFormula')}</span>
                <Switch
                  checked={draft.use_pws_formula}
                  onCheckedChange={(v) => setDraft({ ...draft, use_pws_formula: v })}
                />
              </label>
              <p className="text-muted-foreground text-xs">{t('tapin.zonesReminder')}</p>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="secondary" size="sm">
                  <Link to="/settings/shop/shipping">{t('shipping.openZones')}</Link>
                </Button>
                <Button type="button" size="sm" variant="outline" disabled={syncBoxes.isPending} onClick={() => void syncBoxes.mutate()}>
                  {t('tapin.syncPackingBoxes')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tariffs" className="space-y-4 outline-none">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <div>
                <CardTitle className="text-base">{t('tapin.tariffsTitle')}</CardTitle>
                <CardDescription>{t('tapin.tariffsHint')}</CardDescription>
              </div>
              <Button
                type="button"
                size="sm"
                disabled={!tariffs || saveTariffs.isPending}
                onClick={() => tariffs && saveTariffs.mutate(tariffs)}
              >
                {t('common.save')}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {tariffs ? (
                <>
                  <TariffEditor
                    title={t('tapin.methodPishtaz')}
                    rows={tariffs.pishtaz}
                    onChange={(rows) => setTariffs({ ...tariffs, pishtaz: rows })}
                  />
                  <TariffEditor
                    title={t('tapin.methodVip')}
                    rows={tariffs.vip}
                    onChange={(rows) => setTariffs({ ...tariffs, vip: rows })}
                  />
                  <TariffEditor
                    title={t('tapin.methodTipax')}
                    rows={tariffs.tipax}
                    onChange={(rows) => setTariffs({ ...tariffs, tipax: rows })}
                  />
                </>
              ) : (
                <p className="text-muted-foreground text-sm">{t('common.loading')}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ship" className="space-y-4 outline-none">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('tapin.shipTitle')}</CardTitle>
              <CardDescription>{t('tapin.shipHint')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2.5 text-sm">
                <span>{t('tapin.autoRegister')}</span>
                <Switch
                  checked={draft.auto_register}
                  onCheckedChange={(v) => setDraft({ ...draft, auto_register: v })}
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{t('tapin.payType')}</Label>
                  <Input
                    type="number"
                    dir="ltr"
                    value={draft.default_pay_type}
                    onChange={(e) => setDraft({ ...draft, default_pay_type: parseInt(e.target.value, 10) || 1 })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('tapin.employeeCode')}</Label>
                  <Input
                    type="number"
                    dir="ltr"
                    value={draft.employee_code}
                    onChange={(e) => setDraft({ ...draft, employee_code: parseInt(e.target.value, 10) || -1 })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('tapin.tipaxPickup')}</Label>
                  <Input
                    type="number"
                    dir="ltr"
                    value={draft.tipax_pickup_type}
                    onChange={(e) => setDraft({ ...draft, tipax_pickup_type: parseInt(e.target.value, 10) || 10 })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('tapin.tipaxDelivery')}</Label>
                  <Input
                    type="number"
                    dir="ltr"
                    value={draft.tipax_delivery_type}
                    onChange={(e) => setDraft({ ...draft, tipax_delivery_type: parseInt(e.target.value, 10) || 10 })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t('tapin.autoRegisterWhen')}</Label>
                <Select
                  value={draft.auto_register_status}
                  onValueChange={(v) => setDraft({ ...draft, auto_register_status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="processing">{t('tapin.statusProcessing')}</SelectItem>
                    <SelectItem value="packaged">{t('tapin.statusPackaged')}</SelectItem>
                    <SelectItem value="completed">{t('tapin.statusCompleted')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t('tapin.registerType')}</Label>
                <Select
                  value={String(draft.register_type)}
                  onValueChange={(v) => setDraft({ ...draft, register_type: parseInt(v, 10) || 0 })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">{t('tapin.registerType0')}</SelectItem>
                    <SelectItem value="1">{t('tapin.registerType1')}</SelectItem>
                    <SelectItem value="2">{t('tapin.registerType2')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <label className="flex items-center gap-3 text-sm">
                <Switch
                  checked={draft.has_insurance}
                  onCheckedChange={(v) => setDraft({ ...draft, has_insurance: v })}
                />
                <span>{t('tapin.insurance')}</span>
              </label>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notify" className="space-y-4 outline-none">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('tapin.notifyTitle')}</CardTitle>
              <CardDescription>{t('tapin.notifyHint')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-relaxed">{t('tapin.notifyBody')}</p>
              <Button asChild>
                <Link to="/settings/shop/sms">{t('tapin.openSms')}</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  )
}
