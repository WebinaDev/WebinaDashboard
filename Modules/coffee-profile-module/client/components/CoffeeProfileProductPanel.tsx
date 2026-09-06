import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Switch } from '@/components/ui/switch'
import { AiGenerateButton } from '@/components/AiGenerateButton'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'
import { formatNumber } from '@/lib/formatNumber'

import { CoffeeFlag } from './CoffeeFlag'
import type {
  CoffeeOrigin,
  CoffeePricePart,
  CoffeePricingBaseMix,
  CoffeePricingPayload,
  CoffeeProductPayload,
  CoffeeProfile,
} from '../types'

type Props = {
  productId?: number
  registerSave?: (fn: (() => Promise<void>) | null) => void
}

function emptyProfile(): CoffeeProfile {
  return {
    blend_robusta: 0,
    blend_arabica: 0,
    acidity: {},
    caffeine_mg: 0,
    bitterness: 0,
    sweetness: 0,
    body: 0,
    pack_weight_g: 1000,
    price_mode: 'none',
    price_bean_id: '',
    price_mix_id: '',
    price_shop_style: 'classic',
    price_parts: [],
    visible: {
      blend: true,
      acidity: true,
      caffeine: true,
      bitterness: true,
      sweetness: true,
      body: true,
      origin: true,
    },
    origin_ids: [],
  }
}

function mergeVisible(fromServer?: CoffeeProfile['visible']): CoffeeProfile['visible'] {
  const base = emptyProfile().visible
  const vis = { ...base, ...(fromServer ?? {}) }
  if (Object.values(vis).every((v) => !v)) {
    return base
  }
  return vis
}

export function CoffeeProfileProductPanel({ productId, registerSave }: Props) {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const [draft, setDraft] = useState<CoffeeProfile>(emptyProfile)
  const draftRef = useRef(draft)
  draftRef.current = draft
  const hydratedFor = useRef<number | null>(null)
  const dirty = useRef(false)

  const q = useQuery({
    queryKey: ['coffee-profile', productId],
    enabled: Boolean(productId),
    queryFn: () => apiFetch<CoffeeProductPayload>(`shop/products/${productId}/coffee-profile`),
  })

  const pricingQ = useQuery({
    queryKey: ['coffee-pricing'],
    queryFn: () => apiFetch<CoffeePricingPayload>('shop/coffee-pricing'),
    staleTime: 60_000,
  })

  useEffect(() => {
    hydratedFor.current = null
    dirty.current = false
    setDraft(emptyProfile())
  }, [productId])

  useEffect(() => {
    if (!q.data?.profile || !productId) {
      return
    }
    if (hydratedFor.current === productId && dirty.current) {
      return
    }
    hydratedFor.current = productId
    dirty.current = false
    const next = hydratePriceParts(
      { ...emptyProfile(), ...q.data.profile, visible: mergeVisible(q.data.profile.visible) },
      pricingQ.data?.base_mixes ?? []
    )
    setDraft(next)
  }, [q.data, productId, pricingQ.data?.base_mixes])

  const settings = q.data?.settings
  const origins = q.data?.origins ?? []
  const min = settings?.scale_min ?? 0
  const max = settings?.scale_max ?? 10

  const persist = useCallback(
    async (opts?: { toast?: boolean }) => {
      if (!productId || hydratedFor.current !== productId) {
        return
      }
      const data = await apiFetch<CoffeeProductPayload>(`shop/products/${productId}/coffee-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draftRef.current),
      })
      dirty.current = false
      if (data.profile) {
        setDraft({ ...emptyProfile(), ...data.profile, visible: mergeVisible(data.profile.visible) })
      }
      qc.setQueryData(['coffee-profile', productId], data)
      if (opts?.toast !== false) {
        toast.success(t('common.saved'))
      }
    },
    [productId, qc, t]
  )

  useEffect(() => {
    if (!registerSave) {
      return
    }
    registerSave(() => persist({ toast: false }))
    return () => registerSave(null)
  }, [registerSave, persist])

  const save = useMutation({
    mutationFn: () => persist(),
    onError: (e: Error) => toastApiError(t, e),
  })

  const originMap = useMemo(() => new Map(origins.map((o) => [o.id, o])), [origins])

  const beanAfter = useMemo(() => {
    const m = new Map<string, number>()
    for (const b of pricingQ.data?.beans ?? []) {
      if (typeof b.after_roast === 'number') {
        m.set(b.id, b.after_roast)
      }
    }
    return m
  }, [pricingQ.data?.beans])

  const pricePreviewKg = useMemo(() => weightedParts(draft.price_parts, beanAfter), [draft.price_parts, beanAfter])

  const detectedPattern = useMemo(
    () => detectMixPattern(draft.price_parts, pricingQ.data?.base_mixes ?? []),
    [draft.price_parts, pricingQ.data?.base_mixes]
  )

  if (!productId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('coffeeProfile.productTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">{t('coffeeProfile.saveProductFirst')}</p>
        </CardContent>
      </Card>
    )
  }

  if (q.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('coffeeProfile.productTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive text-sm">{t('common.loadFailed')}</p>
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => void q.refetch()}>
            {t('license.retry')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (q.isPending || !settings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('coffeeProfile.productTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">{t('common.loading')}</p>
        </CardContent>
      </Card>
    )
  }

  function patchDraft(updater: (d: CoffeeProfile) => CoffeeProfile) {
    dirty.current = true
    setDraft(updater)
  }

  function setVisible(key: keyof CoffeeProfile['visible'], on: boolean) {
    patchDraft((d) => {
      const next = { ...d, visible: { ...d.visible, [key]: on } }
      if (key === 'blend' && on && d.blend_robusta + d.blend_arabica === 0) {
        next.blend_robusta = 70
        next.blend_arabica = 30
      }
      return next
    })
  }

  function setBlend(robusta: number) {
    const r = Math.max(0, Math.min(100, Math.round(robusta)))
    patchDraft((d) => ({
      ...d,
      blend_robusta: r,
      blend_arabica: 100 - r,
      visible: { ...d.visible, blend: true },
    }))
  }

  function setAcidity(id: string, value: number) {
    patchDraft((d) => ({
      ...d,
      acidity: { ...d.acidity, [id]: value },
      visible: { ...d.visible, acidity: true },
    }))
  }

  function setScale(key: 'bitterness' | 'sweetness' | 'body' | 'caffeine_mg', value: number) {
    patchDraft((d) => {
      const visKey = key === 'caffeine_mg' ? 'caffeine' : key
      return { ...d, [key]: value, visible: { ...d.visible, [visKey]: true } }
    })
  }

  function toggleOrigin(id: number, on: boolean) {
    patchDraft((d) => {
      const next = new Set(d.origin_ids)
      if (on) next.add(id)
      else next.delete(id)
      const ids = [...next]
      return {
        ...d,
        origin_ids: ids,
        visible: { ...d.visible, origin: ids.length > 0 ? true : d.visible.origin },
      }
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>{t('coffeeProfile.productTitle')}</CardTitle>
        <div className="flex items-center gap-2">
          <AiGenerateButton
            type="product"
            id={productId}
            onDone={() => {
              dirty.current = false
              void qc.invalidateQueries({ queryKey: ['coffee-profile', productId] })
            }}
          />
          <Button type="button" size="sm" disabled={save.isPending} onClick={() => void save.mutateAsync()}>
            {t('common.save')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <VisibilityRow
          id="blend"
          label={t('coffeeProfile.showBlend')}
          checked={draft.visible.blend}
          onCheckedChange={(v) => setVisible('blend', v)}
        >
          <div className="flex justify-between text-sm">
            <span>
              {settings.robusta_label} <strong>{draft.blend_robusta}٪</strong>
            </span>
            <span>
              {settings.arabica_label} <strong>{draft.blend_arabica}٪</strong>
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={draft.blend_robusta}
            onChange={(e) => setBlend(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </VisibilityRow>

        <VisibilityRow
          id="acidity"
          label={t('coffeeProfile.showAcidity')}
          checked={draft.visible.acidity}
          onCheckedChange={(v) => setVisible('acidity', v)}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {settings.acidity_levels.map((level) => (
              <div key={level.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <Label htmlFor={`acid-${level.id}`}>{level.label}</Label>
                  <span>{draft.acidity[level.id] ?? min}</span>
                </div>
                <input
                  id={`acid-${level.id}`}
                  type="range"
                  min={min}
                  max={max}
                  value={draft.acidity[level.id] ?? min}
                  onChange={(e) => setAcidity(level.id, Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            ))}
          </div>
        </VisibilityRow>

        <VisibilityRow
          id="caffeine"
          label={t('coffeeProfile.showCaffeine')}
          checked={draft.visible.caffeine}
          onCheckedChange={(v) => setVisible('caffeine', v)}
        >
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label htmlFor="coffee-caffeine">{t('coffeeProfile.caffeineMg')}</Label>
              <Input
                id="coffee-caffeine"
                type="number"
                min={0}
                max={5000}
                value={draft.caffeine_mg}
                onChange={(e) => setScale('caffeine_mg', Number(e.target.value) || 0)}
                className="w-32"
              />
            </div>
            <p className="text-muted-foreground pb-2 text-sm">
              {draft.caffeine_mg} {settings.caffeine_unit}
            </p>
          </div>
        </VisibilityRow>

        {(
          [
            ['bitterness', 'showBitterness'],
            ['sweetness', 'showSweetness'],
            ['body', 'showBody'],
          ] as const
        ).map(([key, visKey]) => (
          <VisibilityRow
            key={key}
            id={key}
            label={t(`coffeeProfile.${visKey}`)}
            checked={draft.visible[key]}
            onCheckedChange={(v) => setVisible(key, v)}
          >
            <div className="flex justify-between text-sm">
              <span>{t(`coffeeProfile.${key}`)}</span>
              <span>{draft[key]}</span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              value={draft[key]}
              onChange={(e) => setScale(key, Number(e.target.value))}
              className="w-full accent-primary"
            />
          </VisibilityRow>
        ))}

        <div className="space-y-2 rounded-lg border p-4">
          <Label htmlFor="coffee-pack">{t('coffeeProfile.packWeight')}</Label>
          <Input
            id="coffee-pack"
            type="number"
            min={1}
            value={draft.pack_weight_g}
            onChange={(e) => patchDraft((d) => ({ ...d, pack_weight_g: Number(e.target.value) || 1000 }))}
            className="w-40"
          />
          <p className="text-muted-foreground text-xs">{t('coffeeProfile.packWeightHint')}</p>
        </div>

        <div className="space-y-3 rounded-lg border p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <Label>{t('coffeeProfile.priceComposition')}</Label>
              <p className="text-muted-foreground mt-1 text-xs">{t('coffeeProfile.priceCompositionHint')}</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                patchDraft((d) => ({
                  ...d,
                  price_mode: 'custom',
                  price_parts: [
                    ...d.price_parts,
                    {
                      bean_id: pricingQ.data?.beans?.[0]?.id ?? '',
                      percent: d.price_parts.length === 0 ? 100 : 0,
                    },
                  ],
                }))
              }
            >
              {t('coffeeProfile.pricingAddPart')}
            </Button>
          </div>

          {draft.price_parts.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('coffeeProfile.priceCompositionEmpty')}</p>
          ) : null}

          {draft.price_parts.map((part, idx) => (
            <div key={`part-${idx}`} className="flex flex-wrap items-center gap-2">
              <Select
                value={part.bean_id || undefined}
                onValueChange={(v) =>
                  patchDraft((d) => ({
                    ...d,
                    price_mode: 'custom',
                    price_parts: d.price_parts.map((p, i) => (i === idx ? { ...p, bean_id: v } : p)),
                    price_bean_id: d.price_parts.length === 1 ? v : d.price_bean_id,
                  }))
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('coffeeProfile.pricePickBean')} />
                </SelectTrigger>
                <SelectContent>
                  {(pricingQ.data?.beans ?? []).map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                className="w-24"
                min={0}
                max={100}
                value={part.percent}
                onChange={(e) =>
                  patchDraft((d) => ({
                    ...d,
                    price_mode: 'custom',
                    price_parts: d.price_parts.map((p, i) =>
                      i === idx ? { ...p, percent: Number(e.target.value) || 0 } : p
                    ),
                  }))
                }
              />
              <span className="text-muted-foreground text-sm">%</span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() =>
                  patchDraft((d) => {
                    const price_parts = d.price_parts.filter((_, i) => i !== idx)
                    return {
                      ...d,
                      price_parts,
                      price_mode: price_parts.length ? 'custom' : 'none',
                    }
                  })
                }
              >
                {t('common.delete')}
              </Button>
            </div>
          ))}

          {detectedPattern ? (
            <p className="text-sm">
              {t('coffeeProfile.pricePatternDetected', { name: detectedPattern.name })}
            </p>
          ) : null}

          {draft.price_parts.length > 0 ? (
            <p className="text-muted-foreground text-sm">
              {t('coffeeProfile.pricePreviewKg')}:{' '}
              <span className="text-foreground font-medium">
                {formatNumber(Math.round(pricePreviewKg), i18n.language)}
              </span>
            </p>
          ) : null}
        </div>

        <VisibilityRow
          id="origin"
          label={t('coffeeProfile.showOrigin')}
          checked={draft.visible.origin}
          onCheckedChange={(v) => setVisible('origin', v)}
        >
          {origins.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('coffeeProfile.noOrigins')}</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {origins.map((o: CoffeeOrigin) => {
                const checked = draft.origin_ids.includes(o.id)
                return (
                  <label key={o.id} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                    <Checkbox checked={checked} onCheckedChange={(v) => toggleOrigin(o.id, v === true)} />
                    <CoffeeFlag origin={originMap.get(o.id) ?? o} useFlagcdn={settings.use_flagcdn} />
                    <span>{o.name}</span>
                  </label>
                )
              })}
            </div>
          )}
        </VisibilityRow>
      </CardContent>
    </Card>
  )
}

function hydratePriceParts(profile: CoffeeProfile, mixes: CoffeePricingBaseMix[]): CoffeeProfile {
  if (profile.price_parts?.length) {
    return { ...profile, price_mode: 'custom' }
  }
  if (profile.price_mode === 'single' && profile.price_bean_id) {
    return {
      ...profile,
      price_mode: 'custom',
      price_parts: [{ bean_id: profile.price_bean_id, percent: 100 }],
    }
  }
  if (profile.price_mode === 'base_mix' && profile.price_mix_id) {
    const mix = mixes.find((m) => m.id === profile.price_mix_id)
    if (mix?.parts?.length) {
      return {
        ...profile,
        price_mode: 'custom',
        price_parts: mix.parts.map((p) => ({ bean_id: p.bean_id, percent: p.percent })),
      }
    }
  }
  return profile
}

function weightedParts(parts: CoffeePricePart[], map: Map<string, number>) {
  let sum = 0
  let w = 0
  for (const p of parts) {
    const v = map.get(p.bean_id)
    if (v == null || p.percent <= 0) continue
    sum += v * (p.percent / 100)
    w += p.percent
  }
  if (w <= 0) return 0
  if (Math.abs(w - 100) > 0.5) sum *= 100 / w
  return sum
}

function detectMixPattern(
  parts: CoffeePricePart[],
  mixes: CoffeePricingBaseMix[]
): { id: string; name: string } | null {
  const map = new Map<string, number>()
  for (const p of parts) {
    if (!p.bean_id || p.percent <= 0) continue
    map.set(p.bean_id, (map.get(p.bean_id) ?? 0) + p.percent)
  }
  if (!map.size) return null
  let sum = 0
  for (const v of map.values()) sum += v
  if (sum > 0 && Math.abs(sum - 100) > 0.01) {
    for (const [k, v] of map) map.set(k, (v * 100) / sum)
  }
  for (const mix of mixes) {
    const want = new Map<string, number>()
    for (const p of mix.parts ?? []) {
      if (!p.bean_id || p.percent <= 0) continue
      want.set(p.bean_id, (want.get(p.bean_id) ?? 0) + p.percent)
    }
    if (want.size !== map.size) continue
    let ok = true
    for (const [bid, pct] of want) {
      const got = map.get(bid)
      if (got == null || Math.abs(got - pct) > 1) {
        ok = false
        break
      }
    }
    if (ok) return { id: mix.id, name: mix.name }
  }
  return null
}

function VisibilityRow({
  id,
  label,
  checked,
  onCheckedChange,
  children,
}: {
  id: string
  label: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
  children: ReactNode
}) {
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={`vis-${id}`}>{label}</Label>
        <Switch id={`vis-${id}`} checked={checked} onCheckedChange={onCheckedChange} />
      </div>
      {children}
    </div>
  )
}
