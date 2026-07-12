import { useTranslation } from 'react-i18next'

import { ProductMultiSelect } from '@/components/coupons/ProductMultiSelect'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type ProductRelatedPanelProps = {
  upsellIds: number[]
  crossSellIds: number[]
  onUpsellChange: (ids: number[]) => void
  onCrossSellChange: (ids: number[]) => void
}

export function ProductRelatedPanel({
  upsellIds,
  crossSellIds,
  onUpsellChange,
  onCrossSellChange,
}: ProductRelatedPanelProps) {
  const { t } = useTranslation()

  return (
    <Card className="gap-4 py-4 shadow-sm">
      <CardHeader className="px-4 pb-0">
        <CardTitle className="text-sm font-semibold">{t('products.editor.relatedPanel')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4">
        <ProductMultiSelect
          id="product-upsell"
          label={t('products.editor.upsell')}
          value={upsellIds}
          onChange={onUpsellChange}
        />
        <ProductMultiSelect
          id="product-cross-sell"
          label={t('products.editor.crossSell')}
          value={crossSellIds}
          onChange={onCrossSellChange}
        />
      </CardContent>
    </Card>
  )
}
