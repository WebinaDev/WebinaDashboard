import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormattedNumberInput } from '@/components/ui/formatted-number-input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type AttrOption = { name: string; label: string }

type PriceRow = {
  term: string
  label: string
  purchase_price: string
  stock_quantity: string
  variation_count: number
}

type PriceByAttrPayload = {
  product_type: string
  attribute: string
  attributes: AttrOption[]
  rows: PriceRow[]
}

type Props = {
  productId?: number
}

export function CoffeeWeightPricingPanel({ productId }: Props) {
  const { t } = useTranslation()
  const [attribute, setAttribute] = useState('')
  const [attrs, setAttrs] = useState<AttrOption[]>([])
  const [rows, setRows] = useState<PriceRow[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState(false)

  async function load(attr?: string) {
    if (!productId) return
    setLoading(true)
    setLoadError(false)
    try {
      const q = attr ? `?attribute=${encodeURIComponent(attr)}` : ''
      const res = await apiFetch<PriceByAttrPayload>(
        `shop/products/${productId}/coffee-profile/price-by-attribute${q}`,
      )
      setAttrs(res.attributes ?? [])
      setAttribute(res.attribute ?? '')
      setRows(
        (res.rows ?? []).map((r) => ({
          ...r,
          purchase_price: r.purchase_price != null ? String(r.purchase_price) : '',
          stock_quantity: r.stock_quantity != null ? String(r.stock_quantity) : '',
        })),
      )
    } catch (e) {
      setLoadError(true)
      toastApiError(t, e as Error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when product changes
  }, [productId])

  function patchRow(term: string, field: 'purchase_price' | 'stock_quantity', value: string) {
    setRows((prev) => prev.map((r) => (r.term === term ? { ...r, [field]: value } : r)))
  }

  async function apply() {
    if (!productId || !attribute) return
    setSaving(true)
    let offset = 0
    let updated = 0
    try {
      while (true) {
        const res = await apiFetch<{ updated: number; remaining: number; next_offset: number }>(
          `shop/products/${productId}/coffee-profile/price-by-attribute`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              attribute,
              offset,
              rows: rows.map((r) => ({
                term: r.term,
                purchase_price: r.purchase_price,
                stock_quantity: r.stock_quantity,
              })),
            }),
          },
        )
        updated += res.updated ?? 0
        if (!res.remaining) break
        offset = res.next_offset ?? offset
      }
      toast.success(t('coffeeProfile.priceByAttrDone', { count: updated }))
      void load(attribute)
    } catch (e) {
      toastApiError(t, e as Error)
    } finally {
      setSaving(false)
    }
  }

  if (!productId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('coffeeProfile.priceByAttrTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">{t('coffeeProfile.saveProductFirst')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>{t('coffeeProfile.priceByAttrTitle')}</CardTitle>
        <Button type="button" size="sm" disabled={saving || loading || rows.length === 0} onClick={() => void apply()}>
          {t('coffeeProfile.priceByAttrApply')}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-xs">{t('coffeeProfile.priceByAttrHint')}</p>
        {loadError ? (
          <Button type="button" variant="outline" size="sm" onClick={() => void load(attribute)}>
            {t('license.retry')}
          </Button>
        ) : null}
        {attrs.length > 0 ? (
          <div className="max-w-xs space-y-1">
            <Label>{t('coffeeProfile.priceByAttrAttribute')}</Label>
            <Select
              value={attribute}
              onValueChange={(v) => {
                setAttribute(v)
                void load(v)
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {attrs.map((a) => (
                  <SelectItem key={a.name} value={a.name}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
        {loading ? (
          <p className="text-muted-foreground text-sm">{t('common.loading')}</p>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <div key={row.term} className="grid gap-3 rounded-lg border p-3 sm:grid-cols-3">
                <div>
                  <p className="text-sm font-medium">{row.label}</p>
                  <p className="text-muted-foreground text-xs">
                    {t('coffeeProfile.priceByAttrCount', { count: row.variation_count })}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t('products.fieldPurchase')}</Label>
                  <FormattedNumberInput
                    value={row.purchase_price}
                    onChange={(v) => patchRow(row.term, 'purchase_price', v)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t('products.fieldStock')}</Label>
                  <FormattedNumberInput
                    value={row.stock_quantity}
                    onChange={(v) => patchRow(row.term, 'stock_quantity', v)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
