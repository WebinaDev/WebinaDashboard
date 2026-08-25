import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
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

type ProductVariationsPanelProps = {
  productId: number
  /** True when the saved product has at least one variation attribute with options. */
  hasSavedVariationAttributes?: boolean
}

export function ProductVariationsPanel({
  productId,
  hasSavedVariationAttributes = true,
}: ProductVariationsPanelProps) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [newSku, setNewSku] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newPurchase, setNewPurchase] = useState('')
  const [newStock, setNewStock] = useState('')
  const [bulkPrice, setBulkPrice] = useState('')
  const [bulkPurchase, setBulkPurchase] = useState('')
  const [bulkStock, setBulkStock] = useState('')
  const [applyPrice, setApplyPrice] = useState(true)
  const [applyPurchase, setApplyPurchase] = useState(false)
  const [applyStock, setApplyStock] = useState(true)
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false)
  const [generateOpen, setGenerateOpen] = useState(false)
  const [generatePreview, setGeneratePreview] = useState<{
    total: number
    existing: number
    missing: number
  } | null>(null)
  const [generating, setGenerating] = useState(false)

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
      void qc.invalidateQueries({ queryKey: ['product-variations', productId] })
      void qc.invalidateQueries({ queryKey: ['product', productId] })
      toast.success(t('common.saved'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const patch = useMutation({
    mutationFn: ({ vid, body }: { vid: number; body: Record<string, unknown> }) =>
      apiFetch(`shop/products/${productId}/variations/${vid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['product-variations', productId] })
      toast.success(t('common.saved'))
    },
    onError: (e: Error) => toastApiError(t, e),
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
    let offset = 0
    let created = 0
    try {
      while (true) {
        const res = await apiFetch<{
          created: number
          skipped: number
          total: number
          remaining: number
          next_offset: number
        }>(`shop/products/${productId}/variations/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ offset }),
        })
        created += res.created ?? 0
        if (!res.remaining) {
          break
        }
        offset = res.next_offset ?? offset
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

  const items = q.data?.items ?? []
  const defaultVariationId = q.data?.default_variation_id ?? 0

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
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!hasSavedVariationAttributes || previewGenerate.isPending || generating}
          onClick={() => void previewGenerate.mutateAsync()}
        >
          {t('products.editor.generateAll')}
        </Button>

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
            {items.map((v) => (
              <VariationCard
                key={v.id}
                productId={productId}
                variation={v}
                isDefault={defaultVariationId === v.id}
                defaultPending={setDefault.isPending}
                dkMap={dkMapsQ.data?.maps?.find((m) => m.wc_variation_id === v.id)}
                onSave={(body) => void patch.mutateAsync({ vid: v.id, body })}
                onDelete={() => void del.mutateAsync(v.id)}
                onSetDefault={(id) => void setDefault.mutateAsync(id)}
                onMapped={() => void qc.invalidateQueries({ queryKey: ['digikala', 'product-maps', productId] })}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">{t('products.editor.noVariations')}</p>
        )}

        <div className="space-y-3 rounded-lg border border-dashed border-border p-3">
          <p className="text-sm font-medium">{t('products.editor.addVariation')}</p>
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
            disabled={create.isPending || !newPrice.trim()}
            onClick={() => void create.mutateAsync()}
          >
            {t('products.editor.addVariation')}
          </Button>
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
    </Card>
  )
}

function decodeAttrPart(s: string): string {
  try {
    return decodeURIComponent(s.replace(/\+/g, '%20'))
  } catch {
    return s
  }
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
  isDefault,
  defaultPending,
  dkMap,
  onSave,
  onDelete,
  onSetDefault,
  onMapped,
}: {
  productId: number
  variation: ProductVariation
  isDefault: boolean
  defaultPending: boolean
  dkMap?: { dk_product_id: string; dk_variant_id: string }
  onSave: (body: Record<string, unknown>) => void
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
  const [dkp, setDkp] = useState(dkMap?.dk_product_id ? `DKP-${dkMap.dk_product_id}` : '')
  const [dkVariant, setDkVariant] = useState(dkMap?.dk_variant_id ?? '')
  const [referenceUrl, setReferenceUrl] = useState(variation.wfcp?.reference_url ?? '')
  const [wholesaleRule, setWholesaleRule] = useState<WholesaleRuleForm>(() =>
    hydrateVarWholesale(variation.wfcp?.wholesale_rule),
  )
  const [referenceMeta, setReferenceMeta] = useState(() => formatReferenceMeta(variation))
  const [fetchingRef, setFetchingRef] = useState(false)

  useEffect(() => {
    setSku(variation.sku ?? '')
    setPrice(variation.regular_price ?? '')
    setPurchase(variation.wfcp?.purchase_price != null ? String(variation.wfcp.purchase_price) : '')
    setLockPrice(Boolean(variation.wfcp?.lock_price))
    setManageStock(Boolean(variation.manage_stock))
    setStock(variation.stock_quantity != null ? String(variation.stock_quantity) : '')
    setReferenceUrl(variation.wfcp?.reference_url ?? '')
    setWholesaleRule(hydrateVarWholesale(variation.wfcp?.wholesale_rule))
    setReferenceMeta(formatReferenceMeta(variation))
  }, [variation])

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
  const title = formatAttrs(variation) || `#${variation.id}`

  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-muted-foreground text-xs">#{variation.id}</p>
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
        <div className="flex gap-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              const stockQty = stock === '' ? null : parseInt(stock, 10)
              onSave({
                sku,
                regular_price: price,
                manage_stock: manageStock,
                stock_quantity: manageStock ? stockQty : null,
                wfcp: {
                  purchase_price: purchase.trim() === '' ? '' : purchase.trim(),
                  lock_price: lockPrice,
                  reference_url: referenceUrl.trim(),
                  wholesale_rule: wholesaleRule.custom
                    ? {
                        discount_percent: parseFloat(wholesaleRule.discount_percent) || 0,
                        min_qty: parseFloat(wholesaleRule.min_qty) || 0,
                        min_weight: parseFloat(wholesaleRule.min_weight) || 0,
                        qty_step: parseFloat(wholesaleRule.qty_step) || 0,
                        sell_by: wholesaleRule.sell_by,
                        wholesale_enabled: wholesaleRule.wholesale_enabled,
                      }
                    : null,
                },
              })
            }}
          >
            {t('common.save')}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onDelete}>
            {t('common.delete')}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>{t('products.fieldPurchase')}</Label>
          <FormattedNumberInput value={purchase} onChange={setPurchase} disabled={lockPrice} />
          <label className="flex items-center gap-2 text-xs">
            <Switch checked={lockPrice} onCheckedChange={setLockPrice} />
            <span>{t('products.lockPrice')}</span>
          </label>
        </div>
        <div className="space-y-1.5">
          <Label>{t('products.fieldRegular')}</Label>
          <FormattedNumberInput value={price} onChange={setPrice} disabled={lockPrice} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>{t('products.editor.referenceUrl')}</Label>
          <div className="flex flex-wrap gap-2">
            <Input
              dir="ltr"
              className="min-w-0 flex-1"
              value={referenceUrl}
              onChange={(e) => setReferenceUrl(e.target.value)}
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
          <WholesaleRuleFields rule={wholesaleRule} onChange={setWholesaleRule} />
        </div>
        <div className="space-y-1.5">
          <Label>{t('products.fieldSku')}</Label>
          <Input value={sku} onChange={(e) => setSku(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="flex cursor-pointer items-center gap-2">
            <Switch checked={manageStock} onCheckedChange={setManageStock} />
            <span className="text-sm">{t('products.fieldManageStock')}</span>
          </label>
          {manageStock ? (
            <>
              <Label>{t('products.fieldStock')}</Label>
              <FormattedNumberInput value={stock} onChange={setStock} />
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
              disabled={!dkp.trim()}
              onClick={() => {
                void apiFetch<{ dk_variant_id?: string; dk_product_id?: string }>(`digikala/products/${productId}/map`, {
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
                    toast.success(t('digikala.dkpMapped'))
                    onMapped()
                  })
                  .catch((e: Error) => toastApiError(t, e))
              }}
            >
              {t('digikala.findVariants')}
            </Button>
          </div>
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
