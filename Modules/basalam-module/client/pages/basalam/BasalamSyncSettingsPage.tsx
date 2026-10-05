import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronDown } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { BasalamNav } from '../../components/BasalamNav'
import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type ProductSample = {
  items?: Array<{ id: number; weight?: string | number; stock_quantity?: number | null }>
}

type CommissionStatus = {
  row_count?: number
  unmatched?: number
  imported_at?: string
  commission_enabled?: boolean
  price_change_value?: string | number
}

export default function BasalamSyncSettingsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [draft, setDraft] = useState<Record<string, unknown>>({})
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const dirtyRef = useRef(false)

  const settingsQ = useQuery({
    queryKey: ['basalam', 'settings'],
    queryFn: () =>
      apiFetch<{ settings: Record<string, unknown>; connected?: boolean }>('basalam/settings'),
  })

  const commissionQ = useQuery({
    queryKey: ['basalam', 'commission'],
    queryFn: () => apiFetch<CommissionStatus>('basalam/commission'),
  })

  useEffect(() => {
    if (settingsQ.data?.settings && !dirtyRef.current) {
      setDraft(settingsQ.data.settings)
    }
  }, [settingsQ.data])

  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch('basalam/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    onSuccess: async () => {
      dirtyRef.current = false
      toast.success(t('basalam.settingsSaved'))
      await qc.invalidateQueries({ queryKey: ['basalam', 'settings'] })
      await qc.invalidateQueries({ queryKey: ['basalam', 'commission'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const persistPartial = useCallback(
    async (patch: Record<string, unknown>) => {
      try {
        await apiFetch('basalam/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        })
        dirtyRef.current = false
        await qc.invalidateQueries({ queryKey: ['basalam', 'settings'] })
      } catch (e) {
        toastApiError(t, e as Error)
      }
    },
    [qc, t],
  )

  const seedTariff = useMutation({
    mutationFn: async () =>
      apiFetch<CommissionStatus & { matched?: number; unmatched?: number }>('basalam/commission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed', enable_commission: true }),
      }),
    onSuccess: async (data) => {
      toast.success(
        t('basalam.commission.seedOk', {
          matched: data.matched ?? data.row_count ?? 0,
          unmatched: data.unmatched ?? 0,
        }),
      )
      dirtyRef.current = false
      await qc.invalidateQueries({ queryKey: ['basalam'] })
      setDraft((p) => ({ ...p, price_change_value: 'commission' }))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const applyPrices = useMutation({
    mutationFn: () => apiFetch('basalam/sync/products/update-all', { method: 'POST' }),
    onSuccess: () => toast.success(t('basalam.commission.applyQueued')),
    onError: (e: Error) => toastApiError(t, e),
  })

  const fillFromCatalog = useMutation({
    mutationFn: async () => {
      const data = await apiFetch<ProductSample>('shop/products?per_page=20&status=publish')
      const items = data.items ?? []
      let weightSum = 0
      let weightN = 0
      let stockSum = 0
      let stockN = 0
      for (const p of items) {
        const w = Number(p.weight)
        if (Number.isFinite(w) && w > 0) {
          weightSum += w
          weightN += 1
        }
        if (typeof p.stock_quantity === 'number' && p.stock_quantity >= 0) {
          stockSum += p.stock_quantity
          stockN += 1
        }
      }
      const next = { ...draft }
      if (weightN > 0 && (!next.default_weight || Number(next.default_weight) === 0)) {
        next.default_weight = Math.round(weightSum / weightN)
      }
      if (weightN > 0 && (!next.default_package_weight || Number(next.default_package_weight) === 0)) {
        next.default_package_weight = Math.max(50, Math.round(weightSum / weightN / 10))
      }
      if (stockN > 0 && (!next.default_stock_quantity || Number(next.default_stock_quantity) === 0)) {
        next.default_stock_quantity = Math.max(1, Math.round(stockSum / stockN))
      }
      if (!next.default_preparation || Number(next.default_preparation) === 0) {
        next.default_preparation = 3
      }
      dirtyRef.current = true
      setDraft(next)
      return next
    },
    onSuccess: () => toast.success(t('basalam.defaultsFilled')),
    onError: (e: Error) => toastApiError(t, e),
  })

  const s = draft
  const setField = (key: string, value: unknown) => {
    dirtyRef.current = true
    setDraft((prev) => ({ ...prev, [key]: value }))
  }
  const isOn = (value: unknown) =>
    value === true || value === 'yes' || value === 1 || value === '1' || value === 'true' || value === 'all'
  const commissionOn = String(s.price_change_value ?? '') === 'commission'
  const manualPct =
    !commissionOn &&
    s.price_change_value !== undefined &&
    s.price_change_value !== null &&
    s.price_change_value !== '' &&
    s.price_change_value !== '0' &&
    s.price_change_value !== 0
      ? String(s.price_change_value)
      : ''

  const setToggle = (key: string) => {
    const yesNoKeys = new Set([
      'add_attr_to_desc_product',
      'add_short_desc_to_desc_product',
      'add_full_desc_to_desc_product',
      'cap_preparation_to_category_max',
    ])
    let next: unknown
    if (yesNoKeys.has(key)) {
      next = isOn(s[key]) ? 'no' : 'yes'
    } else if (key === 'round_price') {
      next = s[key] && s[key] !== 'none' ? 'none' : 'up'
    } else if (key === 'all_products_wholesale') {
      next = s[key] && s[key] !== 'none' ? 'none' : 'all'
    } else {
      next = !isOn(s[key])
    }
    dirtyRef.current = true
    setDraft((prev) => ({ ...prev, [key]: next }))
    void persistPartial({ [key]: next })
  }

  const setSelectiveField = (key: string, value: unknown) => {
    dirtyRef.current = true
    setDraft((prev) => ({ ...prev, [key]: value }))
    void persistPartial({ [key]: value })
  }

  const toggleActive = (key: string) => {
    if (key === 'round_price') return Boolean(s[key] && s[key] !== 'none')
    if (key === 'all_products_wholesale') return Boolean(s[key] && s[key] !== 'none')
    if (key === 'add_full_desc_to_desc_product') {
      return s[key] === undefined || s[key] === null || s[key] === '' || isOn(s[key])
    }
    if (key === 'chat_notify_admins') {
      return s[key] === undefined || s[key] === null || s[key] === '' || isOn(s[key])
    }
    return isOn(s[key])
  }

  const c = commissionQ.data
  const importedAt = c?.imported_at
    ? new Date(c.imported_at).toLocaleString()
    : t('basalam.commission.neverImported')

  const toggles: Array<{ key: string; label: string }> = [
    { key: 'sync_status_product', label: t('basalam.syncProducts') },
    { key: 'sync_status_order', label: t('basalam.syncOrders') },
    { key: 'auto_confirm_order', label: t('basalam.autoConfirm') },
    { key: 'round_price', label: t('basalam.roundPrice') },
    { key: 'add_full_desc_to_desc_product', label: t('basalam.addFullDesc') },
    { key: 'add_attr_to_desc_product', label: t('basalam.addAttrToDesc') },
    { key: 'add_short_desc_to_desc_product', label: t('basalam.addShortDesc') },
    { key: 'all_products_wholesale', label: t('basalam.allWholesale') },
    { key: 'cap_preparation_to_category_max', label: t('basalam.capPrep') },
    { key: 'chat_notify_admins', label: t('basalam.chatNotify') },
  ]

  const syncFieldKeys = [
    'sync_product_field_name',
    'sync_product_field_photos',
    'sync_product_field_price',
    'sync_product_field_stock',
    'sync_product_field_weight',
    'sync_product_field_description',
    'sync_product_field_attr',
    'sync_product_field_video',
    'sync_product_field_variant_price',
    'sync_product_field_variant_stock',
  ]

  const syncFieldLabel = (key: string) =>
    t(`basalam.syncField.${key.replace('sync_product_field_', '')}`, {
      defaultValue: key.replace('sync_product_field_', ''),
    })

  return (
    <PageShell title={t('basalam.settingsTitle')} description={t('basalam.settingsSubtitle')}>
      <BasalamNav />
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{t('basalam.commission.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">{t('basalam.commission.hint')}</p>
          <p className="text-sm">
            {t('basalam.commission.status', {
              count: c?.row_count ?? 0,
              unmatched: c?.unmatched ?? 0,
              at: importedAt,
            })}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={commissionOn ? 'default' : 'outline'}
              onClick={() => {
                const next = commissionOn ? '0' : 'commission'
                setField('price_change_value', next)
                void persistPartial({ price_change_value: next })
              }}
            >
              {t('basalam.commission.enable')}
            </Button>
            <Button
              variant="secondary"
              disabled={seedTariff.isPending}
              onClick={() => seedTariff.mutate()}
            >
              {t('basalam.commission.seedTariff')}
            </Button>
            <Button
              variant="outline"
              disabled={applyPrices.isPending || !(c?.row_count || commissionOn || manualPct)}
              onClick={() => applyPrices.mutate()}
            >
              {t('basalam.commission.applyUpdate')}
            </Button>
            <Button onClick={() => save.mutate(draft)} disabled={save.isPending}>
              {t('basalam.saveSettings')}
            </Button>
          </div>
          <label className="block max-w-md space-y-1 text-sm">
            <span>{t('basalam.commission.manualPercent')}</span>
            <Input
              type="number"
              min={-35}
              max={35}
              step={0.5}
              value={manualPct}
              placeholder="0"
              onChange={(e) => {
                const raw = e.target.value.trim()
                const next = raw === '' ? '0' : raw
                setField('price_change_value', next)
              }}
              onBlur={() => {
                if (commissionOn) return
                const n = Number(s.price_change_value)
                const clamped = Number.isFinite(n) ? Math.max(-35, Math.min(35, n)) : 0
                const next = String(clamped)
                setField('price_change_value', next)
                void persistPartial({ price_change_value: next })
              }}
            />
            <span className="text-muted-foreground text-xs">{t('basalam.commission.manualPercentHint')}</span>
          </label>
          <label className="block max-w-md space-y-1 text-sm">
            <span>{t('basalam.field.productPriceField')}</span>
            <Input
              value={String(s.product_price_field ?? 'original_price')}
              onChange={(e) => setField('product_price_field', e.target.value)}
              placeholder="original_price | sale_price | sale_strikethrough_price"
            />
          </label>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{t('basalam.syncToggles')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {toggles.map((item) => (
              <Button
                key={item.key}
                variant={toggleActive(item.key) ? 'default' : 'outline'}
                onClick={() => setToggle(item.key)}
              >
                {item.label}
              </Button>
            ))}
          </div>
          <Button onClick={() => save.mutate(draft)} disabled={save.isPending}>
            {t('basalam.saveSettings')}
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{t('basalam.selectiveSync')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            variant={s.sync_product_fields === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectiveField('sync_product_fields', 'all')}
          >
            {t('basalam.syncAllFields')}
          </Button>
          <Button
            variant={s.sync_product_fields === 'custom' ? 'default' : 'outline'}
            onClick={() => setSelectiveField('sync_product_fields', 'custom')}
          >
            {t('basalam.syncCustomFields')}
          </Button>
          {s.sync_product_fields === 'custom'
            ? syncFieldKeys.map((key) => (
                <Button
                  key={key}
                  size="sm"
                  variant={s[key] ? 'default' : 'outline'}
                  onClick={() => setSelectiveField(key, !s[key])}
                >
                  {syncFieldLabel(key)}
                </Button>
              ))
            : null}
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{t('basalam.defaultProductValues')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <p className="text-muted-foreground text-xs md:col-span-2">{t('basalam.packagingWeightHint')}</p>
          {(
            [
              ['default_weight', 'basalam.field.defaultWeight'],
              ['default_package_weight', 'basalam.field.defaultPackageWeight'],
              ['default_preparation', 'basalam.field.defaultPreparation'],
              ['default_stock_quantity', 'basalam.field.defaultStock'],
              ['discount_duration', 'basalam.field.discountDays'],
              ['discount_reduction_percent', 'basalam.field.discountPercent'],
              ['safe_stock', 'basalam.field.safeStock'],
              ['product_prefix_title', 'basalam.field.productPrefix'],
              ['product_suffix_title', 'basalam.field.productSuffix'],
            ] as Array<[string, string]>
          ).map(([key, label]) => (
            <label key={key} className="space-y-1 text-sm">
              <span>{t(label)}</span>
              <Input
                value={String(s[key] ?? '')}
                onChange={(e) =>
                  setField(
                    key,
                    key.includes('title') || key.includes('prefix') || key.includes('suffix')
                      ? e.target.value
                      : Number(e.target.value) || e.target.value,
                  )
                }
              />
            </label>
          ))}
          <div className="flex flex-wrap gap-2 md:col-span-2">
            <Button variant="secondary" onClick={() => fillFromCatalog.mutate()} disabled={fillFromCatalog.isPending}>
              {t('basalam.fillFromCatalog')}
            </Button>
            <Button onClick={() => save.mutate(draft)} disabled={save.isPending}>
              {t('basalam.saveSettings')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <Card>
          <CardHeader className="pb-3">
            <CollapsibleTrigger asChild>
              <button type="button" className="flex w-full items-center justify-between text-start">
                <CardTitle className="text-base">{t('basalam.advanced')}</CardTitle>
                <ChevronDown className={`size-4 transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
              </button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="grid gap-3 border-t pt-4 md:grid-cols-2">
              <Button
                variant={s.developer_mode ? 'default' : 'outline'}
                onClick={() => setField('developer_mode', !s.developer_mode)}
              >
                {t('basalam.developerMode')}
              </Button>
              <Button
                variant={s.tasks_per_minute_auto ? 'default' : 'outline'}
                onClick={() => setField('tasks_per_minute_auto', !s.tasks_per_minute_auto)}
              >
                {t('basalam.tasksAuto')}
              </Button>
              {(
                [
                  ['tasks_per_minute', 'basalam.field.tasksPerMinute'],
                  ['video_meta_key', 'basalam.field.videoMeta'],
                  ['video_source', 'basalam.field.videoSource'],
                  ['video_inherit_mode', 'basalam.field.videoInherit'],
                  ['order_statues_type', 'basalam.field.orderStatusMode'],
                  ['order_shipping_method', 'basalam.field.shippingMethod'],
                  ['variable_product_stock_source', 'basalam.field.variableStockSource'],
                  ['customer_prefix_name', 'basalam.field.customerPrefix'],
                  ['customer_suffix_name', 'basalam.field.customerSuffix'],
                ] as Array<[string, string]>
              ).map(([key, label]) => (
                <label key={key} className="space-y-1 text-sm">
                  <span>{t(label)}</span>
                  <Input
                    value={String(s[key] ?? '')}
                    onChange={(e) => setField(key, e.target.value)}
                  />
                </label>
              ))}
              <div className="md:col-span-2">
                <Button onClick={() => save.mutate(draft)} disabled={save.isPending}>
                  {t('basalam.saveSettings')}
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </PageShell>
  )
}
