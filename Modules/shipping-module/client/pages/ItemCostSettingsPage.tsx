import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Truck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { PageShell } from '@/components/PageShell'
import { ProductMultiSelect } from '@/components/coupons/ProductMultiSelect'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormattedNumberInput, parseFormattedNumberInput } from '@/components/ui/formatted-number-input'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'
import { cn } from '@/lib/utils'

type QtyMode = 'inherit' | 'per_qty' | 'once'
type RuleQtyModes = {
  products: Record<string, QtyMode>
  sets: Record<string, QtyMode>
  categories: Record<string, QtyMode>
  brands: Record<string, QtyMode>
}
type SetCost = { id: string; name: string; product_ids: number[]; cost: string }
type GatewayRule = { gateway: string; type: 'override' | 'add'; amount: string; enabled: boolean }
type Settings = {
  enabled: boolean
  mode: 'each' | 'once' | 'max'
  multiply_by_qty: boolean
  default_cost_once: boolean
  virtual_skip: boolean
  category_children: boolean
  skip_with_free_coupon: boolean
  skip_free_methods: boolean
  skip_local_pickup: boolean
  default_cost: string
  min_free_amount: string
  product_costs: Record<string, string>
  set_costs: SetCost[]
  category_costs: Record<string, string>
  brand_costs: Record<string, string>
  rule_qty_modes: RuleQtyModes
  gateway_costs: GatewayRule[]
}
type GatewayItem = { id: string; title: string; enabled: boolean; preset?: boolean }
type TermItem = { id: number; name: string }
type ProductOption = { id: number; name: string }

const emptySet = (): SetCost => ({ id: `set_${Date.now()}_${Math.floor(Math.random() * 1e4)}`, name: '', product_ids: [], cost: '' })

const emptySettings = (): Settings => ({
  enabled: false,
  mode: 'max',
  multiply_by_qty: true,
  default_cost_once: false,
  virtual_skip: true,
  category_children: true,
  skip_with_free_coupon: false,
  skip_free_methods: true,
  skip_local_pickup: true,
  default_cost: '',
  min_free_amount: '',
  product_costs: {},
  set_costs: [],
  category_costs: {},
  brand_costs: {},
  rule_qty_modes: { products: {}, sets: {}, categories: {}, brands: {} },
  gateway_costs: [],
})

function qtyModesFromRaw(raw: unknown): RuleQtyModes {
  const out: RuleQtyModes = { products: {}, sets: {}, categories: {}, brands: {} }
  if (!raw || typeof raw !== 'object') return out
  const src = raw as Record<string, unknown>
  for (const bucket of ['products', 'sets', 'categories', 'brands'] as const) {
    const sub = src[bucket]
    if (sub && typeof sub === 'object' && !Array.isArray(sub)) {
      for (const [k, v] of Object.entries(sub as Record<string, unknown>)) {
        if (v === 'per_qty' || v === 'once') {
          out[bucket][k] = v
        }
      }
    }
  }
  return out
}

function numToStr(v: unknown): string {
  if (v === null || v === undefined || v === '') return ''
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? String(n) : n === 0 ? '0' : ''
}

function mapToStr(map: unknown): Record<string, string> {
  const out: Record<string, string> = {}
  if (map && typeof map === 'object') {
    for (const [k, v] of Object.entries(map as Record<string, unknown>)) {
      const n = Number(v)
      if (/^\d+$/.test(k) && Number.isFinite(n)) out[k] = String(n)
    }
  }
  return out
}

function strToNum(v: string): number {
  const n = Number(parseFormattedNumberInput(v || '') || '0')
  return Number.isFinite(n) && n >= 0 ? n : 0
}

function TermAddBox({
  id,
  items,
  loading,
  placeholder,
  onAdd,
}: {
  id: string
  items: TermItem[]
  loading: boolean
  placeholder: string
  onAdd: (item: TermItem) => void
}) {
  const [q, setQ] = useState('')
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return []
    return items.filter((i) => i.name.toLowerCase().includes(needle)).slice(0, 30)
  }, [items, q])
  return (
    <div className="relative">
      <Input
        id={id}
        value={q}
        placeholder={placeholder}
        onChange={(e) => setQ(e.target.value)}
        autoComplete="off"
        aria-label={placeholder}
      />
      {q.trim() ? (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border bg-popover shadow-md">
          {loading ? (
            <p className="text-muted-foreground px-3 py-2 text-xs">…</p>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground px-3 py-2 text-xs">—</p>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                className="hover:bg-muted block w-full px-3 py-2 text-start text-sm"
                onClick={() => {
                  onAdd(item)
                  setQ('')
                }}
              >
                {item.name}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  )
}

function ProductAddBox({ onAdd }: { onAdd: (p: ProductOption) => void }) {
  const { t } = useTranslation()
  const [q, setQ] = useState('')
  const search = q.trim()
  const query = useQuery({
    queryKey: ['item-cost-products', search],
    queryFn: () =>
      apiFetch<{ items: ProductOption[] }>(`shop/products?page=1&per_page=20&search=${encodeURIComponent(search)}`),
    enabled: search.length >= 1,
    staleTime: 30_000,
  })
  const results = query.data?.items ?? []
  return (
    <div className="relative">
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t('shipping.itemCost.productSearchPlaceholder')}
        autoComplete="off"
        aria-label={t('shipping.itemCost.productSearchPlaceholder')}
      />
      {search ? (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border bg-popover shadow-md">
          {query.isLoading ? (
            <p className="text-muted-foreground px-3 py-2 text-xs">…</p>
          ) : results.length === 0 ? (
            <p className="text-muted-foreground px-3 py-2 text-xs">—</p>
          ) : (
            results.map((p) => (
              <button
                key={p.id}
                type="button"
                className="hover:bg-muted block w-full px-3 py-2 text-start text-sm"
                onClick={() => {
                  onAdd(p)
                  setQ('')
                }}
              >
                {p.name}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  )
}

function QtyModeSelect({
  value,
  onChange,
}: {
  value: QtyMode
  onChange: (v: QtyMode) => void
}) {
  const { t } = useTranslation()
  return (
    <Select value={value} onValueChange={(v) => onChange(v as QtyMode)}>
      <SelectTrigger className="h-9 w-36 text-xs" aria-label={t('shipping.itemCost.qtyModeLabel')}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="inherit">{t('shipping.itemCost.qtyModeInherit')}</SelectItem>
        <SelectItem value="per_qty">{t('shipping.itemCost.qtyModePerQty')}</SelectItem>
        <SelectItem value="once">{t('shipping.itemCost.qtyModeOnce')}</SelectItem>
      </SelectContent>
    </Select>
  )
}

function CostRow({
  id,
  label,
  value,
  showQtyMode,
  qtyMode,
  onQtyModeChange,
  onChange,
  onRemove,
}: {
  id: string
  label: string
  value: string
  showQtyMode?: boolean
  qtyMode?: QtyMode
  onQtyModeChange?: (v: QtyMode) => void
  onChange: (v: string) => void
  onRemove: () => void
}) {
  const { t } = useTranslation()
  return (
    <li className="flex flex-wrap items-center gap-2 rounded-xl border p-2">
      <span className="min-w-0 flex-1 truncate text-sm font-medium" title={label}>
        {label}
      </span>
      {showQtyMode && onQtyModeChange ? <QtyModeSelect value={qtyMode ?? 'inherit'} onChange={onQtyModeChange} /> : null}
      <FormattedNumberInput
        id={id}
        inputMode="numeric"
        value={value}
        onChange={onChange}
        placeholder="150,000"
        className="w-36 text-sm"
        aria-label={t('shipping.itemCost.costField')}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-destructive size-9"
        onClick={onRemove}
        aria-label={t('common.delete')}
      >
        <Trash2 className="size-4" />
      </Button>
    </li>
  )
}

export default function ItemCostSettingsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [draft, setDraft] = useState<Settings | null>(null)
  const [names, setNames] = useState<{ products: Record<string, string>; categories: Record<string, string>; brands: Record<string, string> }>({
    products: {},
    categories: {},
    brands: {},
  })

  const q = useQuery({
    queryKey: ['shipping-item-cost'],
    queryFn: () => apiFetch<{ settings: Record<string, unknown> }>('shipping/item-cost/settings'),
  })
  useQueryErrorToast(q)

  const gatewaysQ = useQuery({
    queryKey: ['gateway-discounts', 'gateways'],
    queryFn: () => apiFetch<{ items: GatewayItem[] }>('marketing/gateway-discounts/gateways'),
    staleTime: 60_000,
  })

  const catsQ = useQuery({
    queryKey: ['product-categories'],
    queryFn: () => apiFetch<{ items: TermItem[] }>('shop/product-categories'),
    staleTime: 60_000,
  })
  const brandsQ = useQuery({
    queryKey: ['brands'],
    queryFn: () => apiFetch<{ items: TermItem[] }>('shop/brands'),
    staleTime: 60_000,
  })

  useEffect(() => {
    if (!q.data?.settings) return
    const s = q.data.settings
    const str = (v: unknown) => (v === null || v === undefined ? '' : String(v))
    const gatewayCosts: GatewayRule[] = Array.isArray(s.gateway_costs)
      ? (s.gateway_costs as Record<string, unknown>[]).map((g) => ({
          gateway: String(g.gateway ?? ''),
          type: g.type === 'add' ? 'add' : 'override',
          amount: numToStr(g.amount),
          enabled: true,
        }))
      : []
    const sets: SetCost[] = Array.isArray(s.set_costs)
      ? (s.set_costs as Record<string, unknown>[]).map((set, i) => ({
          id: String(set.id ?? `set_${i}`),
          name: String(set.name ?? ''),
          product_ids: Array.isArray(set.product_ids) ? (set.product_ids as unknown[]).map((x) => Number(x) || 0).filter((x) => x > 0) : [],
          cost: numToStr(set.cost),
        }))
      : []
    setDraft({
      ...emptySettings(),
      enabled: !!s.enabled,
      mode: s.mode === 'each' || s.mode === 'once' || s.mode === 'max' ? s.mode : 'max',
      multiply_by_qty: s.multiply_by_qty !== false,
      default_cost_once: !!s.default_cost_once,
      virtual_skip: s.virtual_skip !== false,
      category_children: s.category_children !== false,
      skip_with_free_coupon: !!s.skip_with_free_coupon,
      skip_free_methods: s.skip_free_methods !== false,
      skip_local_pickup: s.skip_local_pickup !== false,
      default_cost: str(s.default_cost),
      min_free_amount: str(s.min_free_amount),
      product_costs: mapToStr(s.product_costs),
      set_costs: sets,
      category_costs: mapToStr(s.category_costs),
      brand_costs: mapToStr(s.brand_costs),
      rule_qty_modes: qtyModesFromRaw(s.rule_qty_modes),
      gateway_costs: gatewayCosts,
    })
  }, [q.data])

  // Resolve names for saved ids (products, sets' products, category & brand ids).
  useEffect(() => {
    if (!draft) return
    const productIds = Array.from(
      new Set([
        ...Object.keys(draft.product_costs).map(Number),
        ...draft.set_costs.flatMap((s) => s.product_ids),
      ]),
    ).filter((n) => n > 0)
    const categoryIds = Object.keys(draft.category_costs).map(Number).filter((n) => n > 0)
    const brandIds = Object.keys(draft.brand_costs).map(Number).filter((n) => n > 0)
    if (productIds.length === 0 && categoryIds.length === 0 && brandIds.length === 0) return
    let cancelled = false
    const params = new URLSearchParams()
    if (productIds.length) params.set('products', productIds.join(','))
    if (categoryIds.length) params.set('categories', categoryIds.join(','))
    if (brandIds.length) params.set('brands', brandIds.join(','))
    void apiFetch<{ products: Record<string, string>; categories: Record<string, string>; brands: Record<string, string> }>(
      `shipping/item-cost/names?${params.toString()}`,
    )
      .then((res) => {
        if (cancelled) return
        setNames((prev) => ({
          products: { ...prev.products, ...(res.products ?? {}) },
          categories: { ...prev.categories, ...(res.categories ?? {}) },
          brands: { ...prev.brands, ...(res.brands ?? {}) },
        }))
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
    // Only re-resolve when the id sets actually change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    draft ? Object.keys(draft.product_costs).sort().join(',') : '',
    draft ? draft.set_costs.flatMap((s) => s.product_ids).sort().join(',') : '',
    draft ? Object.keys(draft.category_costs).sort().join(',') : '',
    draft ? Object.keys(draft.brand_costs).sort().join(',') : '',
  ])

  const save = useMutation({
    mutationFn: () => {
      if (!draft) throw new Error('no draft')
      const num = (v: string) => (v.trim() === '' ? '' : strToNum(v))
      const numMap = (m: Record<string, string>) => {
        const out: Record<string, number> = {}
        for (const [k, v] of Object.entries(m)) {
          if (/^\d+$/.test(k)) out[k] = strToNum(v)
        }
        return out
      }
      const cleanQtyBucket = (src: Record<string, QtyMode>, validKeys: Set<string>) => {
        const out: Record<string, QtyMode> = {}
        for (const [k, v] of Object.entries(src)) {
          if (validKeys.has(k) && (v === 'per_qty' || v === 'once')) out[k] = v
        }
        return out
      }
      const settings = {
        enabled: draft.enabled,
        mode: draft.mode,
        multiply_by_qty: draft.multiply_by_qty,
        default_cost_once: draft.default_cost_once,
        virtual_skip: draft.virtual_skip,
        category_children: draft.category_children,
        skip_with_free_coupon: draft.skip_with_free_coupon,
        skip_free_methods: draft.skip_free_methods,
        skip_local_pickup: draft.skip_local_pickup,
        default_cost: num(draft.default_cost),
        min_free_amount: num(draft.min_free_amount),
        product_costs: numMap(draft.product_costs),
        set_costs: draft.set_costs.map((s) => ({
          id: s.id,
          name: s.name.trim(),
          product_ids: s.product_ids,
          cost: strToNum(s.cost),
        })),
        category_costs: numMap(draft.category_costs),
        brand_costs: numMap(draft.brand_costs),
        rule_qty_modes: {
          products: cleanQtyBucket(draft.rule_qty_modes.products, new Set(Object.keys(draft.product_costs))),
          sets: cleanQtyBucket(draft.rule_qty_modes.sets, new Set(draft.set_costs.map((s) => s.id))),
          categories: cleanQtyBucket(draft.rule_qty_modes.categories, new Set(Object.keys(draft.category_costs))),
          brands: cleanQtyBucket(draft.rule_qty_modes.brands, new Set(Object.keys(draft.brand_costs))),
        },
        gateway_costs: draft.gateway_costs
          .filter((g) => g.enabled && g.gateway.trim() !== '')
          .map((g) => ({ gateway: g.gateway, type: g.type, amount: strToNum(g.amount) })),
      }
      return apiFetch('shipping/item-cost/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })
    },
    onSuccess: () => {
      toast.success(t('common.saved'))
      void qc.invalidateQueries({ queryKey: ['shipping-item-cost'] })
      void qc.invalidateQueries({ queryKey: ['shipping-hub-status'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  if (!draft) {
    return (
      <PageShell title={t('shipping.itemCost.title')}>
        <p className="text-muted-foreground text-sm">{t('common.loading')}</p>
      </PageShell>
    )
  }

  const catalogCats = catsQ.data?.items ?? []
  const catalogBrands = brandsQ.data?.items ?? []
  const gateways = gatewaysQ.data?.items ?? []

  const gatewayRows: GatewayItem[] = [...gateways]
  for (const rule of draft.gateway_costs) {
    if (!gatewayRows.some((g) => g.id === rule.gateway)) {
      gatewayRows.push({ id: rule.gateway, title: rule.gateway, enabled: false, preset: true })
    }
  }

  const patch = (p: Partial<Settings>) => setDraft((d) => (d ? { ...d, ...p } : d))
  const patchMap = (key: 'product_costs' | 'category_costs' | 'brand_costs', map: Record<string, string>) =>
    setDraft((d) => (d ? { ...d, [key]: map } : d))
  const patchQtyMode = (bucket: keyof RuleQtyModes, id: string, val: QtyMode) =>
    setDraft((d) => {
      if (!d) return d
      const nextBucket = { ...d.rule_qty_modes[bucket] }
      if (val === 'inherit') {
        delete nextBucket[id]
      } else {
        nextBucket[id] = val
      }
      return { ...d, rule_qty_modes: { ...d.rule_qty_modes, [bucket]: nextBucket } }
    })
  const removeCostRule = (mapKey: 'product_costs' | 'category_costs' | 'brand_costs', bucket: keyof RuleQtyModes, id: string) =>
    setDraft((d) => {
      if (!d) return d
      const nextMap = Object.fromEntries(Object.entries(d[mapKey]).filter(([k]) => k !== id))
      const nextBucket = { ...d.rule_qty_modes[bucket] }
      delete nextBucket[id]
      return {
        ...d,
        [mapKey]: nextMap,
        rule_qty_modes: { ...d.rule_qty_modes, [bucket]: nextBucket },
      }
    })
  const isEachMode = draft.mode === 'each'

  const nameOf = (kind: 'products' | 'categories' | 'brands', id: string) =>
    names[kind][id] ?? catalogCats.find((c) => String(c.id) === id)?.name ?? catalogBrands.find((c) => String(c.id) === id)?.name ?? `#${id}`

  const activeRulesCount =
    Object.keys(draft.product_costs).length +
    Object.keys(draft.category_costs).length +
    Object.keys(draft.brand_costs).length +
    draft.set_costs.length +
    draft.gateway_costs.filter((g) => g.enabled).length

  return (
    <PageShell title={t('shipping.itemCost.title')} description={t('shipping.itemCost.description')}>
      {/* Master switch */}
      <Card className={cn('border-2', draft.enabled ? 'border-primary/50' : 'border-border')}>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 text-primary grid size-11 shrink-0 place-items-center rounded-2xl">
              <Truck className="size-5" aria-hidden />
            </div>
            <div className="max-w-xl">
              <p className="font-semibold">{t('shipping.itemCost.enable')}</p>
              <p className="text-muted-foreground text-sm leading-relaxed">{t('shipping.itemCost.enableHint')}</p>
            </div>
          </div>
          <Switch checked={draft.enabled} onCheckedChange={(v) => patch({ enabled: v })} aria-label={t('shipping.itemCost.enable')} />
        </CardContent>
      </Card>

      {/* Calculation mode */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('shipping.itemCost.modeTitle')}</CardTitle>
          <CardDescription>{t('shipping.itemCost.modeHint')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="ic-mode">{t('shipping.itemCost.modeLabel')}</Label>
            <Select value={draft.mode} onValueChange={(v) => patch({ mode: v as Settings['mode'] })}>
              <SelectTrigger id="ic-mode" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="each">{t('shipping.itemCost.modeEach')}</SelectItem>
                <SelectItem value="once">{t('shipping.itemCost.modeOnce')}</SelectItem>
                <SelectItem value="max">{t('shipping.itemCost.modeMax')}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {draft.mode === 'each' ? t('shipping.itemCost.modeEachDesc') : draft.mode === 'once' ? t('shipping.itemCost.modeOnceDesc') : t('shipping.itemCost.modeMaxDesc')}
            </p>
          </div>

          {isEachMode ? (
            <>
              <div className="flex items-center justify-between gap-4 rounded-xl border p-3">
                <div>
                  <Label htmlFor="ic-mul-qty" className="text-sm">{t('shipping.itemCost.multiplyQty')}</Label>
                  <p className="text-muted-foreground text-xs">{t('shipping.itemCost.multiplyQtyHint')}</p>
                </div>
                <Switch id="ic-mul-qty" checked={draft.multiply_by_qty} onCheckedChange={(v) => patch({ multiply_by_qty: v })} />
              </div>
              <div className="flex items-center justify-between gap-4 rounded-xl border p-3">
                <div>
                  <Label htmlFor="ic-default-once" className="text-sm">{t('shipping.itemCost.defaultCostOnce')}</Label>
                  <p className="text-muted-foreground text-xs leading-relaxed">{t('shipping.itemCost.defaultCostOnceHint')}</p>
                </div>
                <Switch id="ic-default-once" checked={draft.default_cost_once} onCheckedChange={(v) => patch({ default_cost_once: v })} />
              </div>
            </>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="ic-default">{t('shipping.itemCost.defaultCost')}</Label>
              <FormattedNumberInput id="ic-default" inputMode="numeric" value={draft.default_cost} onChange={(v) => patch({ default_cost: v })} placeholder="150,000" />
              <p className="text-muted-foreground text-[11px] leading-relaxed">{t('shipping.itemCost.defaultCostHint')}</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ic-min-free">{t('shipping.itemCost.minFree')}</Label>
              <FormattedNumberInput id="ic-min-free" inputMode="numeric" value={draft.min_free_amount} onChange={(v) => patch({ min_free_amount: v })} placeholder="5,000,000" />
              <p className="text-muted-foreground text-[11px] leading-relaxed">{t('shipping.itemCost.minFreeHint')}</p>
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-4 rounded-xl border p-3">
              <div>
                <Label htmlFor="ic-virtual" className="text-sm">{t('shipping.itemCost.virtualSkip')}</Label>
                <p className="text-muted-foreground text-xs">{t('shipping.itemCost.virtualSkipHint')}</p>
              </div>
              <Switch id="ic-virtual" checked={draft.virtual_skip} onCheckedChange={(v) => patch({ virtual_skip: v })} />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl border p-3">
              <div>
                <Label htmlFor="ic-cat-children" className="text-sm">{t('shipping.itemCost.categoryChildren')}</Label>
                <p className="text-muted-foreground text-xs">{t('shipping.itemCost.categoryChildrenHint')}</p>
              </div>
              <Switch id="ic-cat-children" checked={draft.category_children} onCheckedChange={(v) => patch({ category_children: v })} />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl border p-3">
              <div>
                <Label htmlFor="ic-skip-coupon" className="text-sm">{t('shipping.itemCost.skipFreeCoupon')}</Label>
                <p className="text-muted-foreground text-xs">{t('shipping.itemCost.skipFreeCouponHint')}</p>
              </div>
              <Switch id="ic-skip-coupon" checked={draft.skip_with_free_coupon} onCheckedChange={(v) => patch({ skip_with_free_coupon: v })} />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl border p-3">
              <div>
                <Label htmlFor="ic-skip-free-methods" className="text-sm">{t('shipping.itemCost.skipFreeMethods')}</Label>
                <p className="text-muted-foreground text-xs">{t('shipping.itemCost.skipFreeMethodsHint')}</p>
              </div>
              <Switch id="ic-skip-free-methods" checked={draft.skip_free_methods} onCheckedChange={(v) => patch({ skip_free_methods: v })} />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl border p-3">
              <div>
                <Label htmlFor="ic-skip-pickup" className="text-sm">{t('shipping.itemCost.skipLocalPickup')}</Label>
                <p className="text-muted-foreground text-xs">{t('shipping.itemCost.skipLocalPickupHint')}</p>
              </div>
              <Switch id="ic-skip-pickup" checked={draft.skip_local_pickup} onCheckedChange={(v) => patch({ skip_local_pickup: v })} />
            </div>
          </div>

          <p className="text-muted-foreground bg-muted/50 rounded-xl border p-3 text-[11px] leading-relaxed">{t('shipping.itemCost.priorityHint')}</p>
        </CardContent>
      </Card>

      {/* Products */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('shipping.itemCost.productTitle')}</CardTitle>
          <CardDescription>{t('shipping.itemCost.productHint')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <ProductAddBox
            onAdd={(p) => {
              setNames((prev) => ({ ...prev, products: { ...prev.products, [String(p.id)]: p.name } }))
              setDraft((d) => (d ? { ...d, product_costs: { ...d.product_costs, [String(p.id)]: d.product_costs[String(p.id)] ?? '' } } : d))
            }}
          />
          {Object.keys(draft.product_costs).length === 0 ? (
            <p className="text-muted-foreground text-xs">{t('shipping.itemCost.emptyList')}</p>
          ) : (
            <ul className="grid gap-2">
              {Object.entries(draft.product_costs).map(([id, cost]) => (
                <CostRow
                  key={id}
                  id={`ic-product-cost-${id}`}
                  label={nameOf('products', id)}
                  value={cost}
                  showQtyMode={isEachMode}
                  qtyMode={draft.rule_qty_modes.products[id] ?? 'inherit'}
                  onQtyModeChange={(v) => patchQtyMode('products', id, v)}
                  onChange={(v) => patchMap('product_costs', { ...draft.product_costs, [id]: v })}
                  onRemove={() => removeCostRule('product_costs', 'products', id)}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Sets */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">{t('shipping.itemCost.setsTitle')}</CardTitle>
              <CardDescription>{t('shipping.itemCost.setsHint')}</CardDescription>
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={() => setDraft((d) => (d ? { ...d, set_costs: [...d.set_costs, emptySet()] } : d))}>
              <Plus className="size-4" />
              {t('shipping.itemCost.addSet')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          {draft.set_costs.length === 0 ? (
            <p className="text-muted-foreground text-xs">{t('shipping.itemCost.emptySets')}</p>
          ) : (
            draft.set_costs.map((set) => (
              <div key={set.id} className="grid gap-3 rounded-xl border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    value={set.name}
                    onChange={(e) => setDraft((d) => (d ? { ...d, set_costs: d.set_costs.map((s) => (s.id === set.id ? { ...s, name: e.target.value } : s)) } : d))}
                    placeholder={t('shipping.itemCost.setNamePlaceholder')}
                    className="min-w-40 flex-1"
                    aria-label={t('shipping.itemCost.setName')}
                  />
                  {isEachMode ? (
                    <QtyModeSelect
                      value={draft.rule_qty_modes.sets[set.id] ?? 'inherit'}
                      onChange={(v) => patchQtyMode('sets', set.id, v)}
                    />
                  ) : null}
                  <FormattedNumberInput
                    inputMode="numeric"
                    value={set.cost}
                    onChange={(v) => setDraft((d) => (d ? { ...d, set_costs: d.set_costs.map((s) => (s.id === set.id ? { ...s, cost: v } : s)) } : d))}
                    placeholder="100,000"
                    className="w-36"
                    aria-label={t('shipping.itemCost.setCost')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive size-9"
                    onClick={() =>
                      setDraft((d) => {
                        if (!d) return d
                        const nextSets = { ...d.rule_qty_modes.sets }
                        delete nextSets[set.id]
                        return {
                          ...d,
                          set_costs: d.set_costs.filter((s) => s.id !== set.id),
                          rule_qty_modes: { ...d.rule_qty_modes, sets: nextSets },
                        }
                      })
                    }
                    aria-label={t('common.delete')}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <ProductMultiSelect
                  id={`ic-set-products-${set.id}`}
                  label={t('shipping.itemCost.setProducts')}
                  value={set.product_ids}
                  onChange={(ids) => setDraft((d) => (d ? { ...d, set_costs: d.set_costs.map((s) => (s.id === set.id ? { ...s, product_ids: ids } : s)) } : d))}
                />
                {set.product_ids.length === 0 ? <p className="text-amber-600 dark:text-amber-400 text-[11px]">{t('shipping.itemCost.setNoProducts')}</p> : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('shipping.itemCost.categoryTitle')}</CardTitle>
          <CardDescription>{t('shipping.itemCost.categoryHint')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <TermAddBox
            id="ic-cat-add"
            items={catalogCats}
            loading={catsQ.isLoading}
            placeholder={t('shipping.itemCost.categorySearchPlaceholder')}
            onAdd={(term) => {
              setNames((prev) => ({ ...prev, categories: { ...prev.categories, [String(term.id)]: term.name } }))
              setDraft((d) => (d ? { ...d, category_costs: { ...d.category_costs, [String(term.id)]: d.category_costs[String(term.id)] ?? '' } } : d))
            }}
          />
          {Object.keys(draft.category_costs).length === 0 ? (
            <p className="text-muted-foreground text-xs">{t('shipping.itemCost.emptyList')}</p>
          ) : (
            <ul className="grid gap-2">
              {Object.entries(draft.category_costs).map(([id, cost]) => (
                <CostRow
                  key={id}
                  id={`ic-cat-cost-${id}`}
                  label={nameOf('categories', id)}
                  value={cost}
                  showQtyMode={isEachMode}
                  qtyMode={draft.rule_qty_modes.categories[id] ?? 'inherit'}
                  onQtyModeChange={(v) => patchQtyMode('categories', id, v)}
                  onChange={(v) => patchMap('category_costs', { ...draft.category_costs, [id]: v })}
                  onRemove={() => removeCostRule('category_costs', 'categories', id)}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Brands */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('shipping.itemCost.brandTitle')}</CardTitle>
          <CardDescription>{t('shipping.itemCost.brandHint')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <TermAddBox
            id="ic-brand-add"
            items={catalogBrands}
            loading={brandsQ.isLoading}
            placeholder={t('shipping.itemCost.brandSearchPlaceholder')}
            onAdd={(term) => {
              setNames((prev) => ({ ...prev, brands: { ...prev.brands, [String(term.id)]: term.name } }))
              setDraft((d) => (d ? { ...d, brand_costs: { ...d.brand_costs, [String(term.id)]: d.brand_costs[String(term.id)] ?? '' } } : d))
            }}
          />
          {Object.keys(draft.brand_costs).length === 0 ? (
            <p className="text-muted-foreground text-xs">{t('shipping.itemCost.emptyList')}</p>
          ) : (
            <ul className="grid gap-2">
              {Object.entries(draft.brand_costs).map(([id, cost]) => (
                <CostRow
                  key={id}
                  id={`ic-brand-cost-${id}`}
                  label={nameOf('brands', id)}
                  value={cost}
                  showQtyMode={isEachMode}
                  qtyMode={draft.rule_qty_modes.brands[id] ?? 'inherit'}
                  onQtyModeChange={(v) => patchQtyMode('brands', id, v)}
                  onChange={(v) => patchMap('brand_costs', { ...draft.brand_costs, [id]: v })}
                  onRemove={() => removeCostRule('brand_costs', 'brands', id)}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Gateways */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('shipping.itemCost.gatewayTitle')}</CardTitle>
          <CardDescription>{t('shipping.itemCost.gatewayHint')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          {gatewaysQ.isLoading ? (
            <p className="text-muted-foreground text-xs">{t('common.loading')}</p>
          ) : gatewayRows.length === 0 ? (
            <p className="text-muted-foreground text-xs">{t('shipping.itemCost.gatewayEmpty')}</p>
          ) : (
            gatewayRows.map((gw) => {
              const rule = draft.gateway_costs.find((g) => g.gateway === gw.id)
              const enabled = !!rule?.enabled
              const setRule = (patchRule: Partial<GatewayRule>) => {
                setDraft((d) => {
                  if (!d) return d
                  const rest = d.gateway_costs.filter((g) => g.gateway !== gw.id)
                  const base: GatewayRule = rule ?? { gateway: gw.id, type: 'override', amount: '', enabled: true }
                  const next = { ...base, ...patchRule }
                  if (!next.enabled) return { ...d, gateway_costs: rest }
                  return { ...d, gateway_costs: [...rest, next] }
                })
              }
              return (
                <div key={gw.id} className="flex flex-wrap items-center gap-2 rounded-xl border p-2">
                  <Switch checked={enabled} onCheckedChange={(v) => setRule({ enabled: v })} aria-label={String(gw.title)} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {gw.title}
                      {!gw.enabled ? <span className="text-muted-foreground ms-1 text-[10px]">({t('shipping.itemCost.gatewayDisabledSuffix')})</span> : null}
                    </span>
                  </span>
                  {enabled ? (
                    <>
                      <Select value={rule?.type ?? 'override'} onValueChange={(v) => setRule({ type: v as GatewayRule['type'] })}>
                        <SelectTrigger className="h-9 w-40 text-xs" aria-label={t('shipping.itemCost.gatewayType')}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="override">{t('shipping.itemCost.gatewayOverride')}</SelectItem>
                          <SelectItem value="add">{t('shipping.itemCost.gatewayAdd')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormattedNumberInput
                        inputMode="numeric"
                        value={rule?.amount ?? ''}
                        onChange={(v) => setRule({ amount: v })}
                        placeholder="100,000"
                        className="h-9 w-36 text-sm"
                        aria-label={t('shipping.itemCost.costField')}
                      />
                    </>
                  ) : null}
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs">{t('shipping.itemCost.rulesCount', { count: activeRulesCount })}</p>
        <Button type="button" disabled={save.isPending} onClick={() => save.mutate()}>
          {save.isPending ? t('common.saving') : t('common.save')}
        </Button>
      </div>
    </PageShell>
  )
}
