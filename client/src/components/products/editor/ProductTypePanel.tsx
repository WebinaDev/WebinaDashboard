import { useTranslation } from 'react-i18next'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type ProductTypePanelProps = {
  productType: 'simple' | 'variable'
  disabled: boolean
  onChange: (v: 'simple' | 'variable') => void
}

export function ProductTypePanel({ productType, disabled, onChange }: ProductTypePanelProps) {
  const { t } = useTranslation()

  return (
    <Card className="gap-4 py-4 shadow-sm">
      <CardHeader className="px-4 pb-0">
        <CardTitle className="text-sm font-semibold">{t('products.fieldType')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-4">
        <Select
          value={productType}
          onValueChange={(v) => onChange(v as 'simple' | 'variable')}
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="simple">{t('products.typeSimple')}</SelectItem>
            <SelectItem value="variable">{t('products.typeVariable')}</SelectItem>
          </SelectContent>
        </Select>
        {disabled ? (
          <p className="text-muted-foreground text-xs">{t('products.editor.typeLockedHint')}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
