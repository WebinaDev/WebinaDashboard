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
  CoffeePricingBean,
  CoffeePricingBaseMix,
  CoffeePricingPayload,
  CoffeePricingSettings,
  CoffeeWeightPack,
} from '../types'

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

function guessGrams(name: string, slug: string): number {
  const raw = `${name} ${slug}`.trim()
  const kg = raw.match(/(\d+(?:[.,]\d+)?)\s*(kg|کیلو)/iu)
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
      const t = p.term.toLowerCase()
      const l = p.label.toLowerCase()
      return (
        t === slug.toLowerCase() ||
        t === name.toLowerCase() ||
        l === name.toLowerCase() ||
        l === slug.toLowerCase()
      )
    })
    const grams =
      prevHit && prevHit.grams > 0 ? prevHit.grams : guessGrams(name, slug)
    return {
      term: slug || name,
      label: name,
      grams,
    }
  })
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
        body: JSON.stringify({ settings: payload.settings, recalc: payload.recalc === true }),
      }),
    onSuccess: (data, vars) => {
      toast.success(vars.recalc ? t('coffeeProfile.pricingQueued') : t('common.saved'))
      void qc.setQueryData(['coffee-pricing'], data)
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
          body: JSON.stringify({ settings: draft }),
        })
      }
      return apiFetch<CoffeePricingPayload & { total?: number }>('shop/coffee-pricing/apply-all', {
        method: 'POST',
      })
    },
    onSuccess: (data) => {
      toast.success(t('coffeeProfile.pricingQueued'))
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
    if (!draft) return new Map<string, number>()
    const y = draft.roast_yield > 0 ? draft.roast_yield : 0.85
    const m = new Map<string, number>()
    for (const b of draft.beans) {
      m.set(b.id, b.green_price / y)
    }
    return m
  }, [draft])

  const retailByPurchase = useMemo(() => {
    const map = new Map<number, number>()
    for (const b of q.data?.beans ?? []) {
      if (typeof b.after_roast === 'number' && typeof b.retail_preview === 'number') {
        map.set(Math.round(b.after_roast * 100), b.retail_preview)
      }
    }
    return map
  }, [q.data])

  if (!draft) {
    return (
      <PageShell title={t('coffeeProfile.pricingTitle')} description={t('coffeeProfile.pricingHint')}>
        <p className="text-muted-foreground text-sm">{t('common.loading')}</p>
      </PageShell>
    )
  }

  const recalc = q.data?.recalc
  const busy = save.isPending || applyAll.isPending || recalc?.status === 'running'

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
    const hit = retailByPurchase.get(Math.round(after * 100))
    return hit ?? after
  }

  return (
    <PageShell title={t('coffeeProfile.pricingTitle')} description={t('coffeeProfile.pricingHint')}>
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => void save.mutateAsync({ settings: draft })}
        >
          {t('common.save')}
        </Button>
        <Button type="button" size="sm" disabled={busy} onClick={() => void applyAll.mutateAsync()}>
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
          <CardHeader>
            <CardTitle>{t('coffeeProfile.pricingBeans')}</CardTitle>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {draft.beans.map((bean) => {
                  const after = beanAfter.get(bean.id) ?? 0
                  return (
                    <TableRow key={bean.id}>
                      <TableCell className="font-medium">{bean.name}</TableCell>
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
                      <TableCell>{fmt(after)}</TableCell>
                      <TableCell>{fmt(previewRetail(after))}</TableCell>
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
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

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
