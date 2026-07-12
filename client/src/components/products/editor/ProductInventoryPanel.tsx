import { useTranslation } from 'react-i18next'

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

type ProductInventoryPanelProps = {
  productType: 'simple' | 'variable'
  sku: string
  manageStock: boolean
  stock: string
  backorders: string
  onSkuChange: (v: string) => void
  onManageStockChange: (v: boolean) => void
  onStockChange: (v: string) => void
  onBackordersChange: (v: string) => void
}

export function ProductInventoryPanel({
  productType,
  sku,
  manageStock,
  stock,
  backorders,
  onSkuChange,
  onManageStockChange,
  onStockChange,
  onBackordersChange,
}: ProductInventoryPanelProps) {
  const { t } = useTranslation()

  return (
    <Card className="gap-4 py-4 shadow-sm">
      <CardHeader className="px-4 pb-0">
        <CardTitle className="text-sm font-semibold">{t('products.editor.inventoryPanel')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4">
        <div className="space-y-2">
          <Label htmlFor="product-sku">{t('products.fieldSku')}</Label>
          <Input id="product-sku" value={sku} onChange={(e) => onSkuChange(e.target.value)} />
        </div>
        {productType === 'simple' ? (
          <>
            <label className="flex cursor-pointer items-center gap-2">
              <Checkbox checked={manageStock} onCheckedChange={(v) => onManageStockChange(v === true)} />
              <span className="text-sm">{t('products.fieldManageStock')}</span>
            </label>
            <div className="space-y-2">
              <Label htmlFor="product-stock">{t('products.fieldStock')}</Label>
              <Input id="product-stock" value={stock} onChange={(e) => onStockChange(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t('products.editor.backorders')}</Label>
              <Select value={backorders} onValueChange={onBackordersChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">{t('products.editor.backordersNo')}</SelectItem>
                  <SelectItem value="notify">{t('products.editor.backordersNotify')}</SelectItem>
                  <SelectItem value="yes">{t('products.editor.backordersYes')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground text-xs">{t('products.editor.variableStockHint')}</p>
        )}
      </CardContent>
    </Card>
  )
}
