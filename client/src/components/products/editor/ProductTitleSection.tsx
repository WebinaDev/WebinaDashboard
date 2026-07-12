import { useTranslation } from 'react-i18next'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type ProductTitleSectionProps = {
  name: string
  slug: string
  onNameChange: (v: string) => void
  onSlugChange: (v: string) => void
  onSlugTouched: () => void
}

export function ProductTitleSection({
  name,
  slug,
  onNameChange,
  onSlugChange,
  onSlugTouched,
}: ProductTitleSectionProps) {
  const { t } = useTranslation()

  return (
    <Card className="gap-4 py-4 shadow-sm">
      <CardHeader className="px-4 pb-0">
        <CardTitle className="text-sm font-semibold">{t('products.editor.titleSection')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4">
        <div className="space-y-2">
          <Label htmlFor="product-name">{t('products.fieldName')}</Label>
          <Input
            id="product-name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder={t('products.editor.namePlaceholder')}
            className="text-lg font-medium"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="product-slug">{t('products.editor.slug')}</Label>
          <Input
            id="product-slug"
            value={slug}
            onChange={(e) => {
              onSlugTouched()
              onSlugChange(e.target.value)
            }}
            placeholder={t('products.editor.slugPlaceholder')}
            dir="ltr"
            className="font-mono text-sm"
          />
          <p className="text-muted-foreground text-xs">{t('products.editor.slugHint')}</p>
        </div>
      </CardContent>
    </Card>
  )
}
