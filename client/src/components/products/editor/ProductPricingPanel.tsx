import { useTranslation } from 'react-i18next'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatNumber } from '@/lib/formatNumber'
import type { WfcpPrices } from '@/types/product'

function formatPrice(v: number | null | undefined, currency: string | undefined, locale: string) {
  if (v == null || v <= 0) return '—'
  const n = formatNumber(Number(v), locale)
  return currency ? `${n} ${currency}` : n
}

type ProductPricingPanelProps = {
  productType: 'simple' | 'variable'
  purchase: string
  lockPrice: boolean
  wfcpPrices?: WfcpPrices
  regular: string
  sale: string
  savingWfcp?: boolean
  onPurchaseChange: (v: string) => void
  onLockPriceChange: (v: boolean) => void
  onRegularChange: (v: string) => void
  onSaleChange: (v: string) => void
  onPurchaseBlur?: () => void
}

export function ProductPricingPanel({
  productType,
  purchase,
  lockPrice,
  wfcpPrices,
  regular,
  sale,
  savingWfcp,
  onPurchaseChange,
  onLockPriceChange,
  onRegularChange,
  onSaleChange,
  onPurchaseBlur,
}: ProductPricingPanelProps) {
  const { t, i18n } = useTranslation()
  const currency = wfcpPrices?.settings_currency

  return (
    <Card className="gap-4 py-4 shadow-sm">
      <CardHeader className="px-4 pb-0">
        <CardTitle className="text-sm font-semibold">{t('products.editor.pricingPanel')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="product-purchase">{t('products.editor.purchasePrice')}</Label>
            <Input
              id="product-purchase"
              value={purchase}
              onChange={(e) => onPurchaseChange(e.target.value)}
              onBlur={onPurchaseBlur}
              disabled={savingWfcp}
            />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex cursor-pointer items-center gap-2">
              <Checkbox checked={lockPrice} onCheckedChange={(v) => onLockPriceChange(v === true)} />
              <span className="text-sm">{t('products.fieldLockPrice')}</span>
            </label>
          </div>
        </div>

        <dl className="grid gap-2 rounded-md border border-border bg-muted/20 p-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground text-xs">{t('products.editor.retailPrice')}</dt>
            <dd className="font-medium">{formatPrice(wfcpPrices?.retail, currency, i18n.language)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">{t('products.editor.wholesalePrice')}</dt>
            <dd className="font-medium">{formatPrice(wfcpPrices?.wholesale, currency, i18n.language)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">{t('products.editor.installmentPrice')}</dt>
            <dd className="font-medium">{formatPrice(wfcpPrices?.installment, currency, i18n.language)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">{t('products.editor.creditPrice')}</dt>
            <dd className="font-medium">{formatPrice(wfcpPrices?.credit, currency, i18n.language)}</dd>
          </div>
        </dl>

        {productType === 'simple' ? (
          <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product-regular">{t('products.fieldRegular')}</Label>
              <Input id="product-regular" value={regular} onChange={(e) => onRegularChange(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-sale">{t('products.fieldSale')}</Label>
              <Input
                id="product-sale"
                value={sale}
                onChange={(e) => onSaleChange(e.target.value)}
                placeholder={t('products.salePlaceholder')}
              />
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-xs">{t('products.editor.variablePricingHint')}</p>
        )}
      </CardContent>
    </Card>
  )
}
