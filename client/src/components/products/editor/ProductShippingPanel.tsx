import { useTranslation } from 'react-i18next'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type ProductShippingPanelProps = {
  weight: string
  length: string
  width: string
  height: string
  onWeightChange: (v: string) => void
  onLengthChange: (v: string) => void
  onWidthChange: (v: string) => void
  onHeightChange: (v: string) => void
}

export function ProductShippingPanel({
  weight,
  length,
  width,
  height,
  onWeightChange,
  onLengthChange,
  onWidthChange,
  onHeightChange,
}: ProductShippingPanelProps) {
  const { t } = useTranslation()

  return (
    <Card className="gap-2 py-3 shadow-sm">
      <CardHeader className="px-3 pb-0">
        <CardTitle className="text-sm font-semibold">{t('products.editor.shippingPanel')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-3">
        <div className="space-y-1.5">
          <Label htmlFor="product-weight">{t('products.fieldWeight')}</Label>
          <Input id="product-weight" value={weight} onChange={(e) => onWeightChange(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>{t('products.fieldDimensions')}</Label>
          <div className="grid grid-cols-3 gap-2">
            <Input
              value={length}
              onChange={(e) => onLengthChange(e.target.value)}
              placeholder={t('products.dimLength')}
            />
            <Input value={width} onChange={(e) => onWidthChange(e.target.value)} placeholder={t('products.dimWidth')} />
            <Input
              value={height}
              onChange={(e) => onHeightChange(e.target.value)}
              placeholder={t('products.dimHeight')}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
