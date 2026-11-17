import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { PageShell } from '@/components/PageShell'
import { ProductMultiSelect } from '@/components/coupons/ProductMultiSelect'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'
import { formatNumber } from '@/lib/formatNumber'
import type { AttributeTerm, GlobalAttribute } from '@/types/attributes'

import type {
  CoffeePricingBaseMix,
  CoffeePricingBean,
  CoffeePricingPayload,
  CoffeePricingSettings,
  CoffeeWeightPack,
  CoffeeWfcpPreviewConfig,
} from '../types'

const RATIOS = [90, 80, 70, 60, 50, 40, 30, 20, 10]

function emptySettings(): CoffeePricingSettings {
  return {
    roast_yield: 0.85,
    weight_attribute: '',
    weight_packs: [],
    beans: [],
    base_mixes: [],
    shop_styles: {
      classic: { robusta_mix_id: 'classic_robusta', arabica_mix_id: 'classic_arabica' },
      luxury: { robusta_mix_id: 'base_arabica', arabica_mix_id: 'luxury_arabica' },
    },
    economy_beans: { robusta_bean_id: 'vietnam', arabica_bean_id: 'rio' },
  }
}

function attrTaxonomy(attr: GlobalAttribute): string {
  if (attr.taxonomy) return attr.taxonomy
  return attr.slug ? `pa_${attr.slug}` : ''
}

function normalizeDigits(raw: string): string {
  return String(raw)
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/٫/g, '.')
    .replace(/٬/g, '')
}

function guessGrams(name: string, slug: string): number {
  const raw = normalizeDigits(`${name} ${slug}`.trim())
  if (raw.includes('نیم کیلو')) return 500
  const kg = raw.match(/(\d+(?:[.,]\d+)?)\s*(kg|kilo|کیلوگرم|کیلو)/iu)
  if (kg) {
    return Math.round(Number(String(kg[1]).replace(',', '.')) * 1000)
  }
  const n = raw.match(/(\d+)/u)
  return n ? Number(n[1]) : 0
}

function packsFromTerms(terms: AttributeTerm[], prev: CoffeeWeightPack[]): CoffeeWeightPack[] {
  return terms.map((term) => {
    const slug = term.slug || ''
    const name = term.name || slug
    const prevHit = prev.find((p) => {
      const t = normalizeDigits(p.term).toLowerCase()
      const l = normalizeDigits(p.label).toLowerCase()
      const ns = normalizeDigits(slug).toLowerCase()
      const nn = normalizeDigits(name).toLowerCase()
      return t === ns || t === nn || l === nn || l === ns
    })
    const grams = prevHit && prevHit.grams > 0 ? prevHit.grams : guessGrams(name, slug)
    return {
      term: slug || name,
      label: name,
      grams,
    }
  })
}

function computeWfcpRetail(purchase: number, wfcp?: CoffeeWfcpPreviewConfig): number {
  if (!Number.isFinite(purchase) || purchase <= 0) return 0
  if (!wfcp || !wfcp.enabled) return purchase
  let price = purchase
  if (
    wfcp.exchange_rate_enabled &&
    (!wfcp.purchase_currency || wfcp.purchase_currency === 'base') &&
    wfcp.exchange_rate > 0
  ) {
    price = price * wfcp.exchange_rate
  }
  if (wfcp.profit_percent > 0) {
    price = price + (price * wfcp.profit_percent) / 100
  }
  if (wfcp.round_enabled && wfcp.round_to > 0) {
    const to = Math.max(1, wfcp.round_to)
    price = Math.round(price / to) * to
  }
  return price
}

function makeNewBeanId(existing: CoffeePricingBean[]): string {
  const used = new Set(existing.map((b) => b.id))
  let idx = existing.length + 1
  while (used.has(`bean_${idx}`)) idx += 1
  return `bean_${idx}`
}

export default function CoffeePricingPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const [draft, setDraft] = useState<CoffeePricingSettings | null>(null)
  const syncedTermsKey = useRef('')

  const q = useQuery({
    queryKey: ['coffee-pricing'],
    queryFn: () => apiFetch<CoffeePricingPayload>('shop/coffee-pricing'),
    refetchInterval: (query) => (query.state.data?.recalc?.status === 'running' ? 2000 : false),
  })
  useQueryErrorToast(q)

  const attrsQ = useQuery({
    queryKey: ['shop-attributes'],
    queryFn: () => apiFetch<{ items: GlobalAttribute[] }>('shop/attributes'),
    staleTime: 60_000,
  })
  useQueryErrorToast(attrsQ)

  const attributes = attrsQ.data?.items ?? []

  const selectedAttr = useMemo(() => {
    const key = (draft?.weight_attribute ?? '').trim().toLowerCase()
    if (!key) return null
    return (
      attributes.find((a) => {
        const tax = attrTaxonomy(a).toLowerCase()
        const slug = (a.slug || '').toLowerCase()
        return tax === key || slug === key || `pa_${slug}` === key
      }) ?? null
    )
  }, [attributes, draft?.weight_attribute])

  const termsQ = useQuery({
    queryKey: ['shop-attribute-terms', selectedAttr?.id],
    enabled: Boolean(selectedAttr?.id),
    queryFn: () =>
      apiFetch<{ items: AttributeTerm[] }>(`shop/global-attributes/${selectedAttr!.id}/terms`),
    staleTime: 30_000,
  })
  useQueryErrorToast(termsQ)

  useEffect(() => {
    if (!q.data?.settings) return
    syncedTermsKey.current = ''
    setDraft({
      ...emptySettings(),
      ...q.data.settings,
      weight_packs: Array.isArray(q.data.settings.weight_packs) ? q.data.settings.weight_packs : [],
      beans: q.data.beans?.length ? q.data.beans.map(stripComputedBean) : q.data.settings.beans,
      base_mixes: q.data.base_mixes?.length
        ? q.data.base_mixes.map(stripComputedMix)
        : q.data.settings.base_mixes,
    })
  }, [q.data])

  useEffect(() => {
    if (!selectedAttr?.id || !termsQ.data?.items) return
    const key = `${selectedAttr.id}:${termsQ.data.items.map((x) => x.slug).join(',')}`
    if (syncedTermsKey.current === key) return
    syncedTermsKey.current = key
    setDraft((d) => {
      if (!d) return d
      const next = packsFromTerms(termsQ.data!.items, d.weight_packs)
      if (
        next.length === d.weight_packs.length &&
        next.every(
          (p, i) =>
            p.term === d.weight_packs[i]?.term &&
            p.label === d.weight_packs[i]?.label &&
            p.grams === d.weight_packs[i]?.grams
        )
      ) {
        return d
      }
      return { ...d, weight_packs: next }
    })
  }, [selectedAttr?.id, termsQ.data])

  const save = useMutation({
    mutationFn: (payload: { settings: CoffeePricingSettings; recalc?: boolean }) =>
      apiFetch<CoffeePricingPayload>('shop/coffee-pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: payload.settings,
          recalc: payload.recalc !== false,
        }),
      }),
    onSuccess: (data) => {
      const done = data.recalc?.done ?? data.queued?.done ?? 0
      const total = data.recalc?.total ?? data.queued?.total ?? 0
      if (data.recalc?.status === 'running') {
        toast.success(t('coffeeProfile.pricingQueued'))
      } else if (total > 0) {
        toast.success(t('coffeeProfile.pricingRecalcDone', { done, total, failed: data.recalc?.failed ?? 0 }))
      } else {
        toast.success(t('common.saved'))
      }
      void qc.setQueryData(['coffee-pricing'], data)
      void qc.invalidateQueries({ queryKey: ['coffee-blend-settings'] })
      if (data.settings) {
        syncedTermsKey.current = ''
        setDraft({
          ...emptySettings(),
          ...data.settings,
          weight_packs: Array.isArray(data.settings.weight_packs) ? data.settings.weight_packs : [],
          beans: data.beans?.length ? data.beans.map(stripComputedBean) : data.settings.beans,
          base_mixes: data.base_mixes?.length
            ? data.base_mixes.map(stripComputedMix)
            : data.settings.base_mixes,
        })
      }
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const applyAll = useMutation({
    mutationFn: async () => {
      if (draft) {
        await apiFetch('shop/coffee-pricing', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ settings: draft, recalc: false }),
        })
      }
      return apiFetch<CoffeePricingPayload & { total?: number }>('shop/coffee-pricing/apply-all', {
        method: 'POST',
      })
    },
    onSuccess: (data) => {
      if (data?.recalc?.status === 'running') {
        toast.success(t('coffeeProfile.pricingQueued'))
      } else if (data?.recalc) {
        toast.success(
          t('coffeeProfile.pricingRecalcDone', {
            done: data.recalc.done,
            total: data.recalc.total,
            failed: data.recalc.failed,
          })
        )
      } else {
        toast.success(t('coffeeProfile.pricingQueued'))
      }
      void qc.invalidateQueries({ queryKey: ['coffee-pricing'] })
      if (data?.recalc) {
        void qc.setQueryData(['coffee-pricing'], (prev: CoffeePricingPayload | undefined) =>
          prev ? { ...prev, recalc: data.recalc } : prev
        )
      }
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const beanAfter = useMemo(() => {
    const m = new Map<string, number>()
    if (!draft) return m
    const y = draft.roast_yield > 0 ? draft.roast_yield : 0.85
    for (const b of draft.beans) {
      m.set(b.id, b.green_price / y)
    }
    return m
  }, [draft])

  const mixAfter = useMemo(() => {
    const m = new Map<string, number>()
    if (!draft) return m
    for (const mix of draft.base_mixes) {
      let sum = 0
      let w = 0
      for (const p of mix.parts || []) {
        const after = beanAfter.get(p.bean_id)
        if (after === undefined || p.percent <= 0) continue
        sum += after * p.percent
        w += p.percent
      }
      m.set(mix.id, w > 0 ? sum / w : 0)
    }
    return m
  }, [draft, beanAfter])

  const shopMixRows = useMemo(() => {
    if (!draft) return []
    const cr = mixAfter.get(draft.shop_styles.classic.robusta_mix_id) ?? 0
    const ca = mixAfter.get(draft.shop_styles.classic.arabica_mix_id) ?? 0
    const lr = mixAfter.get(draft.shop_styles.luxury.robusta_mix_id) ?? 0
    const la = mixAfter.get(draft.shop_styles.luxury.arabica_mix_id) ?? 0
    return RATIOS.map((rPct) => {
      const aPct = 100 - rPct
      return {
        rPct,
        aPct,
        classicAfter: cr * (rPct / 100) + ca * (aPct / 100),
        luxuryAfter: lr * (rPct / 100) + la * (aPct / 100),
      }
    })
  }, [draft, mixAfter])

  const economyMixRows = useMemo(() => {
    if (!draft) return []
    const er = beanAfter.get(draft.economy_beans.robusta_bean_id) ?? 0
    const ea = beanAfter.get(draft.economy_beans.arabica_bean_id) ?? 0
    return RATIOS.map((rPct) => {
      const aPct = 100 - rPct
      return {
        rPct,
        aPct,
        after: er * (rPct / 100) + ea * (aPct / 100),
      }
    })
  }, [draft, beanAfter])

  if (!draft) {
    return (
      <PageShell title={t('coffeeProfile.pricingTitle')} description={t('coffeeProfile.pricingHint')}>
        <p className="text-muted-foreground text-sm">{t('common.loading')}</p>
      </PageShell>
    )
  }

  const wfcpConfig = q.data?.wfcp_config
  const recalc = q.data?.recalc
  const busy = save.isPending || applyAll.isPending || recalc?.status === 'running'
  const robustaBeans = draft.beans.filter((b) => b.kind === 'robusta')
  const arabicaBeans = draft.beans.filter((b) => b.kind === 'arabica')
  const robustaMixes = draft.base_mixes.filter((m) => m.kind === 'robusta')
  const arabicaMixes = draft.base_mixes.filter((m) => m.kind === 'arabica')

  function updateBean(id: string, patch: Partial<CoffeePricingBean>) {
    setDraft((d) =>
      d
        ? {
            ...d,
            beans: d.beans.map((b) => (b.id === id ? { ...b, ...patch } : b)),
          }
        : d
    )
  }

  function addBean() {
    setDraft((d) => {
      if (!d) return d
      const newId = makeNewBeanId(d.beans)
      return {
        ...d,
        beans: [
          ...d.beans,
          {
            id: newId,
            name: '',
            kind: 'robusta',
            green_price: 0,
            product_id: 0,
          },
        ],
      }
    })
  }

  function removeBean(id: string) {
    setDraft((d) => {
      if (!d || d.beans.length <= 1) return d
      const beans = d.beans.filter((b) => b.id !== id)
      const nextR = beans.find((b) => b.kind === 'robusta')?.id ?? beans[0]?.id ?? ''
      const nextA = beans.find((b) => b.kind === 'arabica')?.id ?? beans[0]?.id ?? ''
      return {
        ...d,
        beans,
        base_mixes: d.base_mixes.map((mix) => ({
          ...mix,
          parts: (mix.parts || []).filter((p) => p.bean_id !== id),
        })),
        economy_beans: {
          robusta_bean_id:
            d.economy_beans.robusta_bean_id === id ? nextR : d.economy_beans.robusta_bean_id,
          arabica_bean_id:
            d.economy_beans.arabica_bean_id === id ? nextA : d.economy_beans.arabica_bean_id,
        },
      }
    })
  }

  function updatePackGrams(index: number, grams: number) {
    setDraft((d) => {
      if (!d) return d
      const weight_packs = d.weight_packs.map((p, i) => (i === index ? { ...p, grams } : p))
      return { ...d, weight_packs }
    })
  }

  function selectWeightAttribute(attrId: string) {
    const attr = attributes.find((a) => String(a.id) === attrId)
    if (!attr) return
    syncedTermsKey.current = ''
    setDraft((d) =>
      d
        ? {
            ...d,
            weight_attribute: attrTaxonomy(attr),
            weight_packs: [],
          }
        : d
    )
  }

  function fmt(n: number) {
    return formatNumber(Math.round(n), i18n.language)
  }

  function previewRetail(after: number) {
    return computeWfcpRetail(after, wfcpConfig)
  }

  function formatPartsSummary(mix: CoffeePricingBaseMix) {
    const map = new Map(draft!.beans.map((b) => [b.id, b.name || b.id]))
    return (mix.parts || [])
      .filter((p) => p.percent > 0 && map.has(p.bean_id))
      .map((p) => `${fmt(p.percent)}٪ ${map.get(p.bean_id)}`)
      .join(' + ')
  }

  return (
    <PageShell title={t('coffeeProfile.pricingTitle')} description={t('coffeeProfile.pricingHint')}>
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          size="sm"
          disabled={busy}
          onClick={() => void save.mutateAsync({ settings: draft, recalc: true })}
        >
          {t('coffeeProfile.pricingSaveAndApply')}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => void applyAll.mutateAsync()}
        >
          {t('coffeeProfile.pricingApplyAll')}
        </Button>
      </div>

      {recalc && recalc.status !== 'idle' ? (
        <Card className="mb-4">
          <CardContent className="text-sm pt-4">
            {recalc.status === 'running'
              ? t('coffeeProfile.pricingRecalcRunning', {
                  done: recalc.done,
                  total: recalc.total,
                  failed: recalc.failed,
                })
              : t('coffeeProfile.pricingRecalcDone', {
                  done: recalc.done,
                  total: recalc.total,
                  failed: recalc.failed,
                })}
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('coffeeProfile.pricingRoastYield')}</CardTitle>
          </CardHeader>
          <CardContent className="max-w-xs space-y-2">
            <Label htmlFor="roast-yield">{t('coffeeProfile.pricingRoastYieldHint')}</Label>
            <Input
              id="roast-yield"
              type="number"
              step="0.01"
              min={0.5}
              max={1}
              value={draft.roast_yield}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  roast_yield: Math.min(1, Math.max(0.5, Number(e.target.value) || 0.85)),
                })
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle>{t('coffeeProfile.pricingBeans')}</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addBean}>
              <Plus className="me-1 h-4 w-4" />
              {t('coffeeProfile.pricingAddBean')}
            </Button>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('coffeeProfile.pricingColName')}</TableHead>
                  <TableHead>{t('coffeeProfile.pricingColKind')}</TableHead>
                  <TableHead>{t('coffeeProfile.pricingColGreen')}</TableHead>
                  <TableHead>{t('coffeeProfile.pricingColAfter')}</TableHead>
                  <TableHead>{t('coffeeProfile.pricingColRetail')}</TableHead>
                  <TableHead>{t('coffeeProfile.pricingColProduct')}</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {draft.beans.map((bean) => {
                  const after = beanAfter.get(bean.id) ?? 0
                  return (
                    <TableRow key={bean.id}>
                      <TableCell className="min-w-[170px]">
                        <Input
                          value={bean.name}
                          placeholder={t('coffeeProfile.pricingBeanNamePlaceholder')}
                          onChange={(e) => updateBean(bean.id, { name: e.target.value })}
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={bean.kind}
                          onValueChange={(v) =>
                            updateBean(bean.id, { kind: v as CoffeePricingBean['kind'] })
                          }
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="robusta">{t('coffeeProfile.pricingRobusta')}</SelectItem>
                            <SelectItem value="arabica">{t('coffeeProfile.pricingArabica')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="w-28"
                          value={bean.green_price}
                          onChange={(e) =>
                            updateBean(bean.id, { green_price: Number(e.target.value) || 0 })
                          }
                        />
                      </TableCell>
                      <TableCell className="tabular-nums">{fmt(after)}</TableCell>
                      <TableCell className="tabular-nums">{fmt(previewRetail(after))}</TableCell>
                      <TableCell className="min-w-[220px]">
                        <ProductMultiSelect
                          id={`bean-prod-${bean.id}`}
                          label=""
                          value={bean.product_id ? [bean.product_id] : []}
                          onChange={(ids) =>
                            updateBean(bean.id, { product_id: ids[ids.length - 1] ?? 0 })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={draft.beans.length <= 1}
                          onClick={() => removeBean(bean.id)}
                          aria-label={t('common.delete')}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('coffeeProfile.pricingBaseMixes')}</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('coffeeProfile.pricingColName')}</TableHead>
                  <TableHead>{t('coffeeProfile.pricingColKind')}</TableHead>
                  <TableHead>{t('coffeeProfile.pricingColFormula')}</TableHead>
                  <TableHead>{t('coffeeProfile.pricingColAfter')}</TableHead>
                  <TableHead>{t('coffeeProfile.pricingColRetail')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {draft.base_mixes.map((mix) => {
                  const after = mixAfter.get(mix.id) ?? 0
                  return (
                    <TableRow key={mix.id}>
                      <TableCell className="font-medium">{mix.name}</TableCell>
                      <TableCell>
                        {mix.kind === 'robusta'
                          ? t('coffeeProfile.pricingRobusta')
                          : t('coffeeProfile.pricingArabica')}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {formatPartsSummary(mix)}
                      </TableCell>
                      <TableCell className="tabular-nums">{fmt(after)}</TableCell>
                      <TableCell className="tabular-nums">{fmt(previewRetail(after))}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('coffeeProfile.pricingShopMixes')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{t('coffeeProfile.pricingShopClassicRobusta')}</Label>
                  <Select
                    value={draft.shop_styles.classic.robusta_mix_id}
                    onValueChange={(v) =>
                      setDraft({
                        ...draft,
                        shop_styles: {
                          ...draft.shop_styles,
                          classic: { ...draft.shop_styles.classic, robusta_mix_id: v },
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {robustaMixes.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t('coffeeProfile.pricingShopClassicArabica')}</Label>
                  <Select
                    value={draft.shop_styles.classic.arabica_mix_id}
                    onValueChange={(v) =>
                      setDraft({
                        ...draft,
                        shop_styles: {
                          ...draft.shop_styles,
                          classic: { ...draft.shop_styles.classic, arabica_mix_id: v },
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {arabicaMixes.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t('coffeeProfile.pricingShopLuxuryRobusta')}</Label>
                  <Select
                    value={draft.shop_styles.luxury.robusta_mix_id}
                    onValueChange={(v) =>
                      setDraft({
                        ...draft,
                        shop_styles: {
                          ...draft.shop_styles,
                          luxury: { ...draft.shop_styles.luxury, robusta_mix_id: v },
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {robustaMixes.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t('coffeeProfile.pricingShopLuxuryArabica')}</Label>
                  <Select
                    value={draft.shop_styles.luxury.arabica_mix_id}
                    onValueChange={(v) =>
                      setDraft({
                        ...draft,
                        shop_styles: {
                          ...draft.shop_styles,
                          luxury: { ...draft.shop_styles.luxury, arabica_mix_id: v },
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {arabicaMixes.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('coffeeProfile.pricingColRatio')}</TableHead>
                      <TableHead>{t('coffeeProfile.pricingClassicAfter')}</TableHead>
                      <TableHead>{t('coffeeProfile.pricingClassicRetail')}</TableHead>
                      <TableHead>{t('coffeeProfile.pricingLuxuryAfter')}</TableHead>
                      <TableHead>{t('coffeeProfile.pricingLuxuryRetail')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shopMixRows.map((row) => (
                      <TableRow key={row.rPct}>
                        <TableCell className="tabular-nums font-medium">
                          {fmt(row.rPct)} / {fmt(row.aPct)}
                        </TableCell>
                        <TableCell className="tabular-nums">{fmt(row.classicAfter)}</TableCell>
                        <TableCell className="tabular-nums">
                          {fmt(previewRetail(row.classicAfter))}
                        </TableCell>
                        <TableCell className="tabular-nums">{fmt(row.luxuryAfter)}</TableCell>
                        <TableCell className="tabular-nums">
                          {fmt(previewRetail(row.luxuryAfter))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('coffeeProfile.pricingEconomyMixes')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{t('coffeeProfile.pricingEconomyRobusta')}</Label>
                  <Select
                    value={draft.economy_beans.robusta_bean_id}
                    onValueChange={(v) =>
                      setDraft({
                        ...draft,
                        economy_beans: { ...draft.economy_beans, robusta_bean_id: v },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {robustaBeans.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name || b.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t('coffeeProfile.pricingEconomyArabica')}</Label>
                  <Select
                    value={draft.economy_beans.arabica_bean_id}
                    onValueChange={(v) =>
                      setDraft({
                        ...draft,
                        economy_beans: { ...draft.economy_beans, arabica_bean_id: v },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {arabicaBeans.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name || b.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('coffeeProfile.pricingColRatio')}</TableHead>
                      <TableHead>{t('coffeeProfile.pricingColAfter')}</TableHead>
                      <TableHead>{t('coffeeProfile.pricingColRetail')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {economyMixRows.map((row) => (
                      <TableRow key={row.rPct}>
                        <TableCell className="tabular-nums font-medium">
                          {fmt(row.rPct)} / {fmt(row.aPct)}
                        </TableCell>
                        <TableCell className="tabular-nums">{fmt(row.after)}</TableCell>
                        <TableCell className="tabular-nums">{fmt(previewRetail(row.after))}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('coffeeProfile.pricingWeightPacks')}</CardTitle>
            <p className="text-muted-foreground mt-1 text-sm">{t('coffeeProfile.pricingWeightPacksHint')}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-w-md space-y-2">
              <Label>{t('coffeeProfile.pricingWeightAttribute')}</Label>
              <Select
                value={selectedAttr ? String(selectedAttr.id) : undefined}
                onValueChange={selectWeightAttribute}
                disabled={attrsQ.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('coffeeProfile.pricingWeightAttributePick')} />
                </SelectTrigger>
                <SelectContent>
                  {attributes.map((attr) => (
                    <SelectItem key={attr.id} value={String(attr.id)}>
                      {attr.label || attr.slug || attrTaxonomy(attr)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs">{t('coffeeProfile.pricingWeightAttributeHint')}</p>
            </div>

            {!selectedAttr ? (
              <p className="text-muted-foreground text-sm">{t('coffeeProfile.pricingWeightNoAttribute')}</p>
            ) : termsQ.isPending ? (
              <p className="text-muted-foreground text-sm">{t('common.loading')}</p>
            ) : draft.weight_packs.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t('coffeeProfile.pricingWeightNoTerms')}</p>
            ) : (
              <div className="grid gap-3">
                {draft.weight_packs.map((pack, idx) => (
                  <div
                    key={`${pack.term}-${idx}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{pack.label || pack.term}</p>
                      <p className="text-muted-foreground text-xs">{pack.term}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-muted-foreground text-sm whitespace-nowrap">
                        {t('coffeeProfile.pricingPackGrams')}
                      </Label>
                      <Input
                        type="number"
                        className="w-28"
                        min={1}
                        value={pack.grams || ''}
                        onChange={(e) => updatePackGrams(idx, Number(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}

function stripComputedBean(b: CoffeePricingBean): CoffeePricingBean {
  return {
    id: b.id,
    name: b.name,
    kind: b.kind,
    green_price: b.green_price,
    product_id: b.product_id,
  }
}

function stripComputedMix(m: CoffeePricingBaseMix): CoffeePricingBaseMix {
  return {
    id: m.id,
    name: m.name,
    kind: m.kind,
    parts: m.parts ?? [],
  }
}
