import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { MoneyDisplay } from '@/components/currency/MoneyDisplay'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { FormattedNumberInput } from '@/components/ui/formatted-number-input'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { WholesaleRuleFields } from '@/components/products/editor/ProductPricingPanel'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import type { ProductVariation, WholesaleRule, WholesaleRuleForm } from '@/types/product'

export type VariationAxis = {
  name: string
  label: string
  options: string[]
}

function emptyAttrValues(axes: VariationAxis[]): Record<string, string> {
  const out: Record<string, string> = {}
  for (const axis of axes) out[axis.name] = ''
  return out
}

function axisKeyAliases(name: string, label = ''): string[] {
  const decoded = decodeAttrPart(name)
  const slug = name.toLowerCase().replace(/\s+/g, '-')
  const bare = name.startsWith('pa_') ? name.slice(3) : name
  const withPa = name.startsWith('pa_') ? name : `pa_${slug}`
  const labelDecoded = label ? decodeAttrPart(label) : ''
  return [
    ...new Set(
      [
        name,
        decoded,
        slug,
        bare,
        withPa,
        label,
        labelDecoded,
        `attribute_${slug}`,
        `attribute_${name}`,
      ].filter(Boolean),
    ),
  ]
}

function aliasesOverlap(a: string[], b: string[]): boolean {
  const set = new Set(a)
  return b.some((x) => set.has(x))
}

function readAttrRawForAxis(
  attrs: Record<string, string>,
  labels: Record<string, { label?: string; value?: string }>,
  axis: VariationAxis,
): string {
  const axisAliases = axisKeyAliases(axis.name, axis.label)
  for (const key of axisAliases) {
    if (attrs[key] != null && String(attrs[key]) !== '') {
      return String(attrs[key])
    }
    const labelVal = labels[key]?.value
    if (labelVal) return labelVal
  }
  for (const [key, val] of Object.entries(attrs)) {
    if (val == null || String(val) === '') continue
    if (aliasesOverlap(axisKeyAliases(key), axisAliases)) {
      return String(val)
    }
  }
  for (const [key, meta] of Object.entries(labels)) {
    if (!meta?.value) continue
    if (aliasesOverlap(axisKeyAliases(key), axisAliases)) {
      return String(meta.value)
    }
    const axisLabel = decodeAttrPart(axis.label)
    const metaLabel = meta.label ? decodeAttrPart(meta.label) : ''
    if (
      metaLabel &&
      (metaLabel === axisLabel || metaLabel === decodeAttrPart(axis.name) || key === axis.label)
    ) {
      return String(meta.value)
    }
  }
  return ''
}

function hydrateAttrValues(
  axes: VariationAxis[],
  variation: ProductVariation,
): Record<string, string> {
  const attrs = variation.attributes ?? {}
  const labels = variation.attribute_labels ?? {}
  const out = emptyAttrValues(axes)
  for (const axis of axes) {
    const raw = readAttrRawForAxis(attrs, labels, axis)
    if (!raw) continue
    if (axis.options.includes(raw)) {
      out[axis.name] = raw
      continue
    }
    const labelVal =
      labels[axis.name]?.value ??
      labels[axis.label]?.value ??
      Object.values(labels).find(
        (meta) =>
          meta?.value &&
          meta.label &&
          (decodeAttrPart(meta.label) === decodeAttrPart(axis.label) ||
            decodeAttrPart(meta.label) === decodeAttrPart(axis.name)),
      )?.value
    if (labelVal && axis.options.includes(labelVal)) {
      out[axis.name] = labelVal
      continue
    }
    const bySlug = axis.options.find(
      (opt) => opt.toLowerCase().replace(/\s+/g, '-') === raw.toLowerCase() || opt === raw,
    )
    out[axis.name] = bySlug ?? raw
  }
  return out
}

function attrsComplete(axes: VariationAxis[], values: Record<string, string>): boolean {
  if (axes.length === 0) return true
  return axes.every((axis) => Boolean(values[axis.name]?.trim()))
}

function decodeAttrPart(s: string): string {
  try {
    return decodeURIComponent(s.replace(/\+/g, '%20'))
  } catch {
    return s
  }
}

function emptyVarWholesale(): WholesaleRuleForm {
  return {
    custom: false,
    wholesale_enabled: true,
    discount_percent: '',
    sell_by: 'unit',
    min_qty: '',
    min_weight: '',
    qty_step: '',
  }
}

function hydrateVarWholesale(raw: unknown): WholesaleRuleForm {
  if (!raw || typeof raw !== 'object') return emptyVarWholesale()
  const rule = raw as WholesaleRule
  return {
    custom: true,
    wholesale_enabled: rule.wholesale_enabled !== false,
    discount_percent: rule.discount_percent != null ? String(rule.discount_percent) : '',
    sell_by: rule.sell_by === 'weight' ? 'weight' : 'unit',
    min_qty: rule.min_qty != null ? String(rule.min_qty) : '',
    min_weight: rule.min_weight != null ? String(rule.min_weight) : '',
    qty_step: rule.qty_step != null ? String(rule.qty_step) : '',
  }
}

type VariationDraft = {
  sku: string
  price: string
  purchase: string
  lockPrice: boolean
  manageStock: boolean
  stock: string
  attrValues: Record<string, string>
  referenceUrl: string
  wholesaleRule: WholesaleRuleForm
}

function buildVariationPatchBody(draft: VariationDraft): Record<string, unknown> {
  const stockQty = draft.stock === '' ? null : parseInt(draft.stock, 10)
  return {
    sku: draft.sku,
    regular_price: draft.price,
    manage_stock: draft.manageStock,
    stock_quantity: draft.manageStock ? stockQty : null,
    attributes: draft.attrValues,
    wfcp: {
      purchase_price: draft.purchase.trim() === '' ? '' : draft.purchase.trim(),
      lock_price: draft.lockPrice,
      reference_url: draft.referenceUrl.trim(),
      wholesale_rule: draft.wholesaleRule.custom
        ? {
            discount_percent: parseFloat(draft.wholesaleRule.discount_percent) || 0,
            min_qty: parseFloat(draft.wholesaleRule.min_qty) || 0,
            min_weight: parseFloat(draft.wholesaleRule.min_weight) || 0,
            qty_step: parseFloat(draft.wholesaleRule.qty_step) || 0,
            sell_by: draft.wholesaleRule.sell_by,
            wholesale_enabled: draft.wholesaleRule.wholesale_enabled,
          }
        : null,
    },
  }
}

function snapshotVariationDraft(draft: VariationDraft): string {
  return JSON.stringify(buildVariationPatchBody(draft))
}

type ProductVariationsPanelProps = {
  productId: number
  /** Parent variation attribute axes (taxonomy + options). */
  variationAxes?: VariationAxis[]
  /** True when the saved product has at least one variation attribute with options. */
  hasSavedVariationAttributes?: boolean
}

function AxisSelects({
  axes,
  values,
  onChange,
}: {
  axes: VariationAxis[]
  values: Record<string, string>
  onChange: (next: Record<string, string>) => void
}) {
  const { t } = useTranslation()
  if (axes.length === 0) return null
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {axes.map((axis) => {
        const current = values[axis.name] ?? ''
        const options = current && !axis.options.includes(current) ? [current, ...axis.options] : axis.options
        return (
          <div key={axis.name} className="space-y-1.5">
            <Label>{decodeAttrPart(axis.label) || axis.name}</Label>
            <Select
              value={current || undefined}
              onValueChange={(v) => onChange({ ...values, [axis.name]: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('products.editor.selectAttributeValue')} />
              </SelectTrigger>
              <SelectContent>
                {options.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {decodeAttrPart(opt)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      })}
    </div>
  )
}

export function ProductVariationsPanel({
  productId,
  variationAxes = [],
  hasSavedVariationAttributes = true,
}: ProductVariationsPanelProps) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [newSku, setNewSku] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newPurchase, setNewPurchase] = useState('')
  const [newStock, setNewStock] = useState('')
  const [newAttrs, setNewAttrs] = useState<Record<string, string>>(() => emptyAttrValues(variationAxes))
  const [bulkPrice, setBulkPrice] = useState('')
  const [bulkPurchase, setBulkPurchase] = useState('')
  const [bulkStock, setBulkStock] = useState('')
  const [applyPrice, setApplyPrice] = useState(true)
  const [applyPurchase, setApplyPurchase] = useState(false)
  const [applyStock, setApplyStock] = useState(true)
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false)
  const [generateOpen, setGenerateOpen] = useState(false)
  const [deleteAllOpen, setDeleteAllOpen] = useState(false)
  const [generatePreview, setGeneratePreview] = useState<{
    total: number
    existing: number
    missing: number
  } | null>(null)
  const [generating, setGenerating] = useState(false)

  const axesKey = useMemo(
    () => variationAxes.map((a) => `${a.name}:${a.options.join(',')}`).join('|'),
    [variationAxes],
  )

  useEffect(() => {
    setNewAttrs(emptyAttrValues(variationAxes))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset create attrs when parent axes change
  }, [axesKey])

  const q = useQuery({
    queryKey: ['product-variations', productId],
    queryFn: () =>
      apiFetch<{ items: ProductVariation[]; default_variation_id?: number }>(
        `shop/products/${productId}/variations?per_page=250`,
      ),
    enabled: productId > 0,
  })
  useQueryErrorToast(q)

  const create = useMutation({
    mutationFn: () => {
      const stockQty = newStock.trim() === '' ? null : parseInt(newStock, 10)
      const body: Record<string, unknown> = {
        sku: newSku,
        regular_price: newPrice,
        status: 'publish',
        attributes: newAttrs,
        wfcp: newPurchase.trim()
          ? { purchase_price: newPurchase.trim() }
          : undefined,
      }
      if (stockQty != null && !Number.isNaN(stockQty)) {
        body.manage_stock = true
        body.stock_quantity = stockQty
      }
      return apiFetch<ProductVariation>(`shop/products/${productId}/variations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => {
      setNewSku('')
      setNewPrice('')
      setNewPurchase('')
      setNewStock('')
      setNewAttrs(emptyAttrValues(variationAxes))
      void qc.invalidateQueries({ queryKey: ['product-variations', productId] })
      void qc.invalidateQueries({ queryKey: ['product', productId] })
      toast.success(t('common.saved'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const createReady =
    Boolean(newPrice.trim()) &&
    (variationAxes.length === 0 || attrsComplete(variationAxes, newAttrs))

  const patch = useMutation({
    mutationFn: ({
      vid,
      body,
    }: {
      vid: number
      body: Record<string, unknown>
      silent?: boolean
    }) =>
      apiFetch(`shop/products/${productId}/variations/${vid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    onSuccess: (_data, variables) => {
      if (variables.silent) {
        return
      }
      void qc.invalidateQueries({ queryKey: ['product-variations', productId] })
      toast.success(t('common.saved'))
    },
    onError: (e: Error, variables) => {
      if (!variables.silent) {
        toastApiError(t, e)
      }
    },
  })

  const del = useMutation({
    mutationFn: (vid: number) =>
      apiFetch(`shop/products/${productId}/variations/${vid}`, { method: 'DELETE' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['product-variations', productId] })
      void qc.invalidateQueries({ queryKey: ['product', productId] })
      toast.success(t('common.deleted'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const deleteAll = useMutation({
    mutationFn: () =>
      apiFetch<{ deleted: number }>(`shop/products/${productId}/variations`, { method: 'DELETE' }),
    onSuccess: (res) => {
      setDeleteAllOpen(false)
      void qc.invalidateQueries({ queryKey: ['product-variations', productId] })
      void qc.invalidateQueries({ queryKey: ['product', productId] })
      toast.success(t('products.editor.deleteAllVariationsDone', { count: res.deleted ?? 0 }))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const bulk = useMutation({
    mutationFn: () => {
      const body: Record<string, unknown> = {}
      if (applyPrice) {
        body.regular_price = bulkPrice.trim()
      }
      if (applyStock) {
        const qty = bulkStock.trim() === '' ? null : parseInt(bulkStock.replace(/[^\d-]/g, ''), 10)
        body.manage_stock = true
        body.stock_quantity = qty != null && !Number.isNaN(qty) ? qty : 0
      }
      if (applyPurchase && bulkPurchase.trim()) {
        body.wfcp = { purchase_price: bulkPurchase.trim() }
      }
      return apiFetch<{ updated: number }>(`shop/products/${productId}/variations/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    },
    onSuccess: (res) => {
      setBulkConfirmOpen(false)
      void qc.invalidateQueries({ queryKey: ['product-variations', productId] })
      void qc.invalidateQueries({ queryKey: ['product', productId] })
      toast.success(t('products.editor.bulkUpdated', { count: res.updated ?? 0 }))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const previewGenerate = useMutation({
    mutationFn: () =>
      apiFetch<{ total: number; existing: number; missing: number }>(
        `shop/products/${productId}/variations/generate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dry_run: true }),
        },
      ),
    onSuccess: (res) => {
      setGeneratePreview({
        total: res.total ?? 0,
        existing: res.existing ?? 0,
        missing: res.missing ?? 0,
      })
      setGenerateOpen(true)
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  async function runGenerateAll() {
    setGenerating(true)
    let created = 0
    const maxIterations = Math.ceil(2500 / 40) + 2
    const generateTimeoutMs = 120_000
    try {
      for (let i = 0; i < maxIterations; i++) {
        const res = await apiFetch<{
          created: number
          skipped: number
          total: number
          remaining: number
          next_offset: number
        }>(
          `shop/products/${productId}/variations/generate`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
          },
          generateTimeoutMs,
        )
        created += res.created ?? 0
        if (!res.remaining || (res.created ?? 0) === 0) {
          break
        }
      }
      setGenerateOpen(false)
      void qc.invalidateQueries({ queryKey: ['product-variations', productId] })
      void qc.invalidateQueries({ queryKey: ['product', productId] })
      toast.success(t('products.editor.generateDone', { count: created }))
    } catch (e) {
      toastApiError(t, e as Error)
    } finally {
      setGenerating(false)
    }
  }

  const setDefault = useMutation({
    mutationFn: (variationId: number) =>
      apiFetch<{ default_variation_id: number }>(`shop/products/${productId}/variations/default`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variation_id: variationId }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['product-variations', productId] })
      void qc.invalidateQueries({ queryKey: ['product', productId] })
      toast.success(t('common.saved'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const dkMapsQ = useQuery({
    queryKey: ['digikala', 'product-maps', productId],
    queryFn: () =>
      apiFetch<{ maps: { wc_variation_id: number; dk_product_id: string; dk_variant_id: string }[] }>(
        `digikala/products/${productId}/maps`,
      ),
    enabled: productId > 0,
  })

  const dkLabelsQ = useQuery({
    queryKey: ['digikala', 'variant-labels', productId],
    queryFn: () =>
      apiFetch<{
        labels: Record<
          string,
          { variant_id: string; label: string; title: string; color: string; size: string; price: number; stock: number }
        >
      }>(`digikala/products/${productId}/variant-labels`),
    enabled: productId > 0 && (dkMapsQ.data?.maps?.some((m) => Boolean(m.dk_variant_id)) ?? false),
  })

  const items = q.data?.items ?? []
  const defaultVariationId = q.data?.default_variation_id ?? 0
  const dkLabels = dkLabelsQ.data?.labels ?? {}

  return (
    <Card className="gap-2 py-3 shadow-sm">
      <CardHeader className="px-3 pb-0">
        <CardTitle className="text-sm font-semibold">{t('products.editor.variationsPanel')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-3">
        <p className="text-muted-foreground text-xs">{t('products.editor.variationsHint')}</p>
        <p className="text-muted-foreground text-xs">{t('products.editor.variationsWfcpHint')}</p>
        {!hasSavedVariationAttributes ? (
          <p className="text-amber-700 dark:text-amber-400 text-xs">{t('products.editor.needVariationAttrs')}</p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!hasSavedVariationAttributes || previewGenerate.isPending || generating}
            onClick={() => void previewGenerate.mutateAsync()}
          >
            {t('products.editor.generateAll')}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={items.length === 0 || deleteAll.isPending}
            onClick={() => setDeleteAllOpen(true)}
          >
            {t('products.editor.deleteAllVariations')}
          </Button>
        </div>

        {items.length > 0 ? (
          <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-3">
            <div>
              <p className="text-sm font-medium">{t('products.editor.bulkVariations')}</p>
              <p className="text-muted-foreground text-xs">{t('products.editor.bulkVariationsHint')}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs">
                  <Checkbox checked={applyPrice} onCheckedChange={(v) => setApplyPrice(v === true)} />
                  {t('products.fieldRegular')}
                </label>
                <FormattedNumberInput value={bulkPrice} onChange={setBulkPrice} disabled={!applyPrice} />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs">
                  <Checkbox checked={applyStock} onCheckedChange={(v) => setApplyStock(v === true)} />
                  {t('products.fieldStock')}
                </label>
                <FormattedNumberInput value={bulkStock} onChange={setBulkStock} disabled={!applyStock} />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs">
                  <Checkbox checked={applyPurchase} onCheckedChange={(v) => setApplyPurchase(v === true)} />
                  {t('products.fieldPurchase')}
                </label>
                <FormattedNumberInput value={bulkPurchase} onChange={setBulkPurchase} disabled={!applyPurchase} />
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={bulk.isPending || (!applyPrice && !applyStock && !applyPurchase)}
              onClick={() => {
                if (!applyPrice && !applyStock && !applyPurchase) {
                  toast.error(t('products.editor.bulkNeedField'))
                  return
                }
                setBulkConfirmOpen(true)
              }}
            >
              {t('products.editor.bulkApply')}
            </Button>
          </div>
        ) : null}

        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((v) => {
              const map = dkMapsQ.data?.maps?.find((m) => m.wc_variation_id === v.id)
              const dkRemote = map?.dk_variant_id ? dkLabels[map.dk_variant_id] : undefined
              return (
              <VariationCard
                key={v.id}
                productId={productId}
                variation={v}
                axes={variationAxes}
                isDefault={defaultVariationId === v.id}
                defaultPending={setDefault.isPending}
                dkMap={map}
                dkRemote={dkRemote}
                onSave={(body, opts) =>
                  patch.mutateAsync({ vid: v.id, body, silent: opts?.silent ?? false })
                }
                onDelete={() => void del.mutateAsync(v.id)}
                onSetDefault={(id) => void setDefault.mutateAsync(id)}
                onMapped={() => {
                  void qc.invalidateQueries({ queryKey: ['digikala', 'product-maps', productId] })
                  void qc.invalidateQueries({ queryKey: ['digikala', 'variant-labels', productId] })
                }}
              />
              )
            })}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">{t('products.editor.noVariations')}</p>
        )}

        <div className="space-y-3 rounded-lg border border-dashed border-border p-3">
          <p className="text-sm font-medium">{t('products.editor.addVariation')}</p>
          {variationAxes.length > 0 ? (
            <AxisSelects axes={variationAxes} values={newAttrs} onChange={setNewAttrs} />
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t('products.fieldSku')}</Label>
              <Input value={newSku} onChange={(e) => setNewSku(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>{t('products.fieldPurchase')}</Label>
              <FormattedNumberInput value={newPurchase} onChange={setNewPurchase} />
            </div>
            <div className="space-y-1.5">
              <Label>{t('products.fieldRegular')}</Label>
              <FormattedNumberInput value={newPrice} onChange={setNewPrice} />
            </div>
            <div className="space-y-1.5">
              <Label>{t('products.fieldStock')}</Label>
              <FormattedNumberInput value={newStock} onChange={setNewStock} />
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            disabled={create.isPending || !createReady}
            onClick={() => void create.mutateAsync()}
          >
            {t('products.editor.addVariation')}
          </Button>
          {variationAxes.length > 0 && !attrsComplete(variationAxes, newAttrs) ? (
            <p className="text-muted-foreground text-xs">{t('products.editor.variationAttrsRequired')}</p>
          ) : null}
        </div>
      </CardContent>
      <AlertDialog open={bulkConfirmOpen} onOpenChange={setBulkConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('products.editor.bulkConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('products.editor.bulkConfirmBody')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              disabled={bulk.isPending}
              onClick={(e) => {
                e.preventDefault()
                void bulk.mutateAsync()
              }}
            >
              {t('products.editor.bulkApply')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('products.editor.generateConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('products.editor.generateConfirmBody', {
                total: generatePreview?.total ?? 0,
                existing: generatePreview?.existing ?? 0,
                missing: generatePreview?.missing ?? 0,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={generating}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              disabled={generating || (generatePreview?.missing ?? 0) < 1}
              onClick={(e) => {
                e.preventDefault()
                void runGenerateAll()
              }}
            >
              {t('products.editor.generateAll')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={deleteAllOpen} onOpenChange={setDeleteAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('products.editor.deleteAllVariationsTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('products.editor.deleteAllVariationsBody')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteAll.isPending}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteAll.isPending}
              onClick={(e) => {
                e.preventDefault()
                void deleteAll.mutateAsync()
              }}
            >
              {t('products.editor.deleteAllVariations')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

function formatAttrs(v: ProductVariation): string {
  const labels = v.attribute_labels
  if (labels && Object.keys(labels).length > 0) {
    return Object.values(labels)
      .map((a) => `${decodeAttrPart(a.label)}: ${decodeAttrPart(a.value)}`)
      .join(' · ')
  }
  const attrs = v.attributes ?? {}
  return Object.entries(attrs)
    .map(([k, val]) => {
      const key = decodeAttrPart(k.replace(/^pa_/, '')).replace(/-/g, ' ')
      return `${key}: ${decodeAttrPart(String(val))}`
    })
    .join(' · ')
}

function formatReferenceMeta(v: ProductVariation): string {
  const source = v.wfcp?.reference_source ?? ''
  const last = v.wfcp?.reference_last_sync
  let sync = ''
  if (last && typeof last === 'object') {
    sync = String(last.time ?? last.message ?? last.status ?? '')
  } else if (typeof last === 'string') {
    sync = last
  }
  return [source, sync].filter(Boolean).join(' · ')
}

function VariationCard({
  productId,
  variation,
  axes,
  isDefault,
  defaultPending,
  dkMap,
  dkRemote,
  onSave,
  onDelete,
  onSetDefault,
  onMapped,
}: {
  productId: number
  variation: ProductVariation
  axes: VariationAxis[]
  isDefault: boolean
  defaultPending: boolean
  dkMap?: { dk_product_id: string; dk_variant_id: string }
  dkRemote?: { label: string; title: string; color: string; size: string; price: number; stock: number }
  onSave: (body: Record<string, unknown>, opts?: { silent?: boolean }) => Promise<unknown>
  onDelete: () => void
  onSetDefault: (variationId: number) => void
  onMapped: () => void
}) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language?.startsWith('fa') ? 'fa-IR' : 'en-US'
  const [sku, setSku] = useState(variation.sku ?? '')
  const [price, setPrice] = useState(variation.regular_price ?? '')
  const [purchase, setPurchase] = useState(
    variation.wfcp?.purchase_price != null ? String(variation.wfcp.purchase_price) : '',
  )
  const [lockPrice, setLockPrice] = useState(Boolean(variation.wfcp?.lock_price))
  const [manageStock, setManageStock] = useState(Boolean(variation.manage_stock))
  const [stock, setStock] = useState(
    variation.stock_quantity != null ? String(variation.stock_quantity) : '',
  )
  const [attrValues, setAttrValues] = useState(() => hydrateAttrValues(axes, variation))
  const [dkp, setDkp] = useState(dkMap?.dk_product_id ? `DKP-${dkMap.dk_product_id}` : '')
  const [dkVariant, setDkVariant] = useState(dkMap?.dk_variant_id ?? '')
  const [dkPickList, setDkPickList] = useState<
    { variant_id: string; title: string; label?: string; color?: string; size?: string; price: number; stock: number }[]
  >([])
  const [referenceUrl, setReferenceUrl] = useState(variation.wfcp?.reference_url ?? '')
  const [wholesaleRule, setWholesaleRule] = useState<WholesaleRuleForm>(() =>
    hydrateVarWholesale(variation.wfcp?.wholesale_rule),
  )
  const [referenceMeta, setReferenceMeta] = useState(() => formatReferenceMeta(variation))
  const [fetchingRef, setFetchingRef] = useState(false)
  const [findingDk, setFindingDk] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const draftRef = useRef<VariationDraft>({
    sku: variation.sku ?? '',
    price: variation.regular_price ?? '',
    purchase: variation.wfcp?.purchase_price != null ? String(variation.wfcp.purchase_price) : '',
    lockPrice: Boolean(variation.wfcp?.lock_price),
    manageStock: Boolean(variation.manage_stock),
    stock: variation.stock_quantity != null ? String(variation.stock_quantity) : '',
    attrValues: hydrateAttrValues(axes, variation),
    referenceUrl: variation.wfcp?.reference_url ?? '',
    wholesaleRule: hydrateVarWholesale(variation.wfcp?.wholesale_rule),
  })
  const lastSavedRef = useRef(snapshotVariationDraft(draftRef.current))
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedFadeRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const saveGenRef = useRef(0)

  draftRef.current = {
    sku,
    price,
    purchase,
    lockPrice,
    manageStock,
    stock,
    attrValues,
    referenceUrl,
    wholesaleRule,
  }

  const persistIfDirty = useCallback(async () => {
    const snap = snapshotVariationDraft(draftRef.current)
    if (snap === lastSavedRef.current) {
      return
    }
    const gen = ++saveGenRef.current
    setSaveStatus('saving')
    try {
      await onSave(JSON.parse(snap) as Record<string, unknown>, { silent: true })
      if (gen !== saveGenRef.current) {
        return
      }
      lastSavedRef.current = snap
      setSaveStatus('saved')
      if (savedFadeRef.current) {
        clearTimeout(savedFadeRef.current)
      }
      savedFadeRef.current = setTimeout(() => setSaveStatus('idle'), 2000)
    } catch {
      if (gen !== saveGenRef.current) {
        return
      }
      setSaveStatus('error')
    }
  }, [onSave])

  const scheduleAutosave = useCallback(
    (immediate = false) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
        debounceRef.current = null
      }
      if (immediate) {
        void persistIfDirty()
        return
      }
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null
        void persistIfDirty()
      }, 700)
    },
    [persistIfDirty],
  )

  useEffect(
    () => () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      if (savedFadeRef.current) {
        clearTimeout(savedFadeRef.current)
      }
    },
    [],
  )

  useEffect(() => {
    const nextDraft: VariationDraft = {
      sku: variation.sku ?? '',
      price: variation.regular_price ?? '',
      purchase: variation.wfcp?.purchase_price != null ? String(variation.wfcp.purchase_price) : '',
      lockPrice: Boolean(variation.wfcp?.lock_price),
      manageStock: Boolean(variation.manage_stock),
      stock: variation.stock_quantity != null ? String(variation.stock_quantity) : '',
      attrValues: hydrateAttrValues(axes, variation),
      referenceUrl: variation.wfcp?.reference_url ?? '',
      wholesaleRule: hydrateVarWholesale(variation.wfcp?.wholesale_rule),
    }
    draftRef.current = nextDraft
    lastSavedRef.current = snapshotVariationDraft(nextDraft)
    setSku(nextDraft.sku)
    setPrice(nextDraft.price)
    setPurchase(nextDraft.purchase)
    setLockPrice(nextDraft.lockPrice)
    setManageStock(nextDraft.manageStock)
    setStock(nextDraft.stock)
    setAttrValues(nextDraft.attrValues)
    setReferenceUrl(nextDraft.referenceUrl)
    setWholesaleRule(nextDraft.wholesaleRule)
    setReferenceMeta(formatReferenceMeta(variation))
    setSaveStatus('idle')
    saveGenRef.current += 1
  }, [variation, axes])

  useEffect(() => {
    setDkp(dkMap?.dk_product_id ? `DKP-${dkMap.dk_product_id}` : '')
    setDkVariant(dkMap?.dk_variant_id ?? '')
  }, [dkMap])

  const retail = variation.wfcp_prices?.retail
  const installment = variation.wfcp_prices?.installment
  const installmentPrice =
    installment && typeof installment === 'object' && installment !== null && 'price' in installment
      ? installment.price
      : typeof installment === 'number'
        ? installment
        : null
  const formatted = formatAttrs(variation)
  const isOrphan =
    Object.keys(variation.attributes ?? {}).length === 0 &&
    Object.keys(variation.attribute_labels ?? {}).length === 0

  const dkIdentity = dkRemote?.label || dkRemote?.title || ''
  const priceNum = price.trim() !== '' ? Number(price) : NaN
  const stockNum = stock.trim() !== '' ? Number(stock) : NaN
  const hasPrice = !Number.isNaN(priceNum) && priceNum > 0
  const hasStock = !Number.isNaN(stockNum)
  const orphanIdLine = [
    `#${variation.id}`,
    dkp.trim() || null,
    dkVariant.trim() ? `var ${dkVariant.trim()}` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  const saveStatusLabel =
    saveStatus === 'saving'
      ? t('products.editor.autosaving')
      : saveStatus === 'saved'
        ? t('products.editor.autosaved')
        : saveStatus === 'error'
          ? t('common.errors.saveFailed')
          : null

  return (
    <div
      className={
        isOrphan
          ? 'space-y-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3'
          : 'space-y-3 rounded-lg border border-border p-3'
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {isOrphan ? (
            <>
              {dkIdentity ? (
                <>
                  <p className="text-sm font-semibold">{dkIdentity}</p>
                  <p className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-2 text-xs">
                    <span>{orphanIdLine}</span>
                    {hasPrice ? <MoneyDisplay amount={priceNum} currency="IRT" locale={locale} /> : null}
                    {hasStock ? (
                      <span>
                        {t('products.fieldStock')}: {stock}
                      </span>
                    ) : null}
                    {sku.trim() ? <span>SKU: {sku.trim()}</span> : null}
                  </p>
                </>
              ) : (
                <>
                  <p className="flex flex-wrap items-center gap-x-2 text-sm font-semibold">
                    {sku.trim() ? <span>{sku.trim()}</span> : null}
                    {hasPrice ? <MoneyDisplay amount={priceNum} currency="IRT" locale={locale} /> : null}
                    {hasStock ? (
                      <span className="text-muted-foreground font-normal text-xs">
                        {t('products.fieldStock')}: {stock}
                      </span>
                    ) : null}
                    {!sku.trim() && !hasPrice && !hasStock
                      ? t('products.editor.orphanVariation', { id: variation.id })
                      : null}
                  </p>
                  <p className="text-muted-foreground text-xs">{orphanIdLine}</p>
                </>
              )}
              <p className="mt-1 text-amber-800 text-xs dark:text-amber-200">
                {t('products.editor.orphanVariationHint')}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold">{formatted}</p>
              <p className="text-muted-foreground text-xs">#{variation.id}</p>
            </>
          )}
          <label className="mt-1.5 flex items-center gap-2 text-xs">
            <input
              type="radio"
              name={`default-variation-${productId}`}
              className="size-3.5 accent-primary"
              checked={isDefault}
              disabled={defaultPending}
              onChange={() => onSetDefault(variation.id)}
              onClick={() => {
                if (isDefault) onSetDefault(0)
              }}
            />
            {t('products.editor.defaultVariation')}
          </label>
        </div>
        <div className="flex items-center gap-2">
          {saveStatusLabel ? (
            <span
              className={
                saveStatus === 'error'
                  ? 'text-destructive text-xs'
                  : 'text-muted-foreground text-xs'
              }
            >
              {saveStatusLabel}
            </span>
          ) : null}
          <Button type="button" size="sm" variant="ghost" onClick={onDelete}>
            {t('common.delete')}
          </Button>
        </div>
      </div>

      {axes.length > 0 ? (
        <AxisSelects
          axes={axes}
          values={attrValues}
          onChange={(next) => {
            setAttrValues(next)
            scheduleAutosave(true)
          }}
        />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>{t('products.fieldPurchase')}</Label>
          <FormattedNumberInput
            value={purchase}
            onChange={(v) => {
              setPurchase(v)
              scheduleAutosave()
            }}
            disabled={lockPrice}
          />
          <label className="flex items-center gap-2 text-xs">
            <Switch
              checked={lockPrice}
              onCheckedChange={(v) => {
                setLockPrice(v)
                scheduleAutosave(true)
              }}
            />
            <span>{t('products.lockPrice')}</span>
          </label>
        </div>
        <div className="space-y-1.5">
          <Label>{t('products.fieldRegular')}</Label>
          <FormattedNumberInput
            value={price}
            onChange={(v) => {
              setPrice(v)
              scheduleAutosave()
            }}
            disabled={lockPrice}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>{t('products.editor.referenceUrl')}</Label>
          <div className="flex flex-wrap gap-2">
            <Input
              dir="ltr"
              className="min-w-0 flex-1"
              value={referenceUrl}
              onChange={(e) => {
                setReferenceUrl(e.target.value)
                scheduleAutosave()
              }}
              placeholder="https://"
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={fetchingRef || !referenceUrl.trim()}
              onClick={() => {
                setFetchingRef(true)
                void apiFetch<{
                  purchase_price?: number
                  last_sync?: { time?: string; message?: string }
                  source?: string
                  url?: string
                }>(`wfcp/products/${variation.id}/reference-fetch`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ url: referenceUrl }),
                })
                  .then((res) => {
                    if (res.url) setReferenceUrl(res.url)
                    if (res.purchase_price != null) setPurchase(String(res.purchase_price))
                    const bits = [res.source, res.last_sync?.time ?? res.last_sync?.message].filter(Boolean)
                    setReferenceMeta(bits.join(' · '))
                    toast.success(t('common.saved'))
                    scheduleAutosave(true)
                    onMapped()
                  })
                  .catch((e: Error) => toastApiError(t, e))
                  .finally(() => setFetchingRef(false))
              }}
            >
              {t('products.editor.referenceFetch')}
            </Button>
          </div>
          {referenceMeta ? <p className="text-muted-foreground text-xs">{referenceMeta}</p> : null}
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <WholesaleRuleFields
            rule={wholesaleRule}
            onChange={(r) => {
              setWholesaleRule(r)
              scheduleAutosave()
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label>{t('products.fieldSku')}</Label>
          <Input
            value={sku}
            onChange={(e) => {
              setSku(e.target.value)
              scheduleAutosave()
            }}
          />
        </div>
        <div className="space-y-1.5">
          <label className="flex cursor-pointer items-center gap-2">
            <Switch
              checked={manageStock}
              onCheckedChange={(v) => {
                setManageStock(v)
                scheduleAutosave(true)
              }}
            />
            <span className="text-sm">{t('products.fieldManageStock')}</span>
          </label>
          {manageStock ? (
            <>
              <Label>{t('products.fieldStock')}</Label>
              <FormattedNumberInput
                value={stock}
                onChange={(v) => {
                  setStock(v)
                  scheduleAutosave()
                }}
              />
            </>
          ) : null}
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>{t('digikala.dkpCode')}</Label>
          <div className="flex flex-wrap gap-2">
            <Input
              value={dkp}
              onChange={(e) => setDkp(e.target.value)}
              placeholder="DKP-10252314"
              dir="ltr"
              className="max-w-xs"
            />
            <Input
              value={dkVariant}
              onChange={(e) => setDkVariant(e.target.value)}
              placeholder={t('wnc.remoteVariantId')}
              dir="ltr"
              className="max-w-[10rem]"
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={!dkp.trim() || findingDk}
              onClick={() => {
                setFindingDk(true)
                setDkPickList([])
                void apiFetch<{
                  dk_variant_id?: string
                  dk_product_id?: string
                  needs_variant?: boolean
                  variants?: {
                    variant_id: string
                    title: string
                    label?: string
                    color?: string
                    size?: string
                    price: number
                    stock: number
                  }[]
                }>(`digikala/products/${productId}/map`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    dkp,
                    variant_id: dkVariant,
                    variation_id: variation.id,
                  }),
                })
                  .then((res) => {
                    if (res.dk_product_id) setDkp(`DKP-${res.dk_product_id}`)
                    if (res.dk_variant_id) setDkVariant(res.dk_variant_id)
                    const list = Array.isArray(res.variants) ? res.variants : []
                    if (res.needs_variant || (list.length > 1 && !res.dk_variant_id)) {
                      setDkPickList(list)
                      toast.message(t('digikala.pickVariant'))
                    } else {
                      setDkPickList([])
                      toast.success(t('digikala.dkpMapped'))
                    }
                    onMapped()
                  })
                  .catch((e: Error) => toastApiError(t, e))
                  .finally(() => setFindingDk(false))
              }}
            >
              {t('digikala.findVariants')}
            </Button>
          </div>
          {dkPickList.length > 0 ? (
            <div className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded-md border border-border p-2">
              <p className="text-muted-foreground mb-1 text-xs">{t('digikala.pickVariant')}</p>
              {dkPickList.map((v) => {
                const name = v.label || [v.color, v.size].filter(Boolean).join(' · ') || v.title || `#${v.variant_id}`
                return (
                  <button
                    key={v.variant_id}
                    type="button"
                    className="hover:bg-muted flex w-full flex-col items-start gap-0.5 rounded px-2 py-1.5 text-start text-xs"
                    onClick={() => {
                      setFindingDk(true)
                      void apiFetch<{ dk_variant_id?: string; dk_product_id?: string }>(
                        `digikala/products/${productId}/map`,
                        {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            dkp,
                            variant_id: v.variant_id,
                            variation_id: variation.id,
                          }),
                        },
                      )
                        .then((res) => {
                          if (res.dk_product_id) setDkp(`DKP-${res.dk_product_id}`)
                          if (res.dk_variant_id) setDkVariant(res.dk_variant_id)
                          setDkPickList([])
                          toast.success(t('digikala.dkpMapped'))
                          onMapped()
                        })
                        .catch((e: Error) => toastApiError(t, e))
                        .finally(() => setFindingDk(false))
                    }}
                  >
                    <span className="font-medium">{name}</span>
                    <span className="text-muted-foreground">
                      #{v.variant_id}
                      {v.price > 0 ? ` · ${v.price.toLocaleString(locale)}` : ''}
                      {v.stock != null ? ` · ${t('products.fieldStock')}: ${v.stock}` : ''}
                    </span>
                  </button>
                )
              })}
            </div>
          ) : null}
        </div>
      </div>

      {(retail != null && retail > 0) || installmentPrice != null ? (
        <div className="text-muted-foreground flex flex-wrap gap-4 text-xs">
          {retail != null && retail > 0 ? (
            <span>
              {t('products.colRetail')}:{' '}
              <MoneyDisplay amount={Number(retail)} currency="IRT" locale={locale} />
            </span>
          ) : null}
          {installmentPrice != null ? (
            <span>
              {t('products.colInstallment')}:{' '}
              <MoneyDisplay amount={Number(installmentPrice)} currency="IRT" locale={locale} />
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
