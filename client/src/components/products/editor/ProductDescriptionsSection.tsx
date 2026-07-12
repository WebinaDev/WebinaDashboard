import { useTranslation } from 'react-i18next'

import { RichTextEditor } from '@/components/magazine/LazyRichTextEditor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type ProductDescriptionsSectionProps = {
  shortDescription: string
  description: string
  disabled?: boolean
  onShortChange: (v: string) => void
  onDescriptionChange: (v: string) => void
}

export function ProductDescriptionsSection({
  shortDescription,
  description,
  disabled,
  onShortChange,
  onDescriptionChange,
}: ProductDescriptionsSectionProps) {
  const { t } = useTranslation()

  return (
    <>
      <Card className="gap-4 py-4 shadow-sm">
        <CardHeader className="px-4 pb-0">
          <CardTitle className="text-sm font-semibold">{t('products.fieldShortDescription')}</CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          <RichTextEditor
            value={shortDescription}
            onChange={onShortChange}
            disabled={disabled}
            placeholder={t('products.editor.shortDescPlaceholder')}
          />
        </CardContent>
      </Card>
      <Card className="gap-4 py-4 shadow-sm">
        <CardHeader className="px-4 pb-0">
          <CardTitle className="text-sm font-semibold">{t('products.fieldDescription')}</CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          <RichTextEditor
            value={description}
            onChange={onDescriptionChange}
            disabled={disabled}
            placeholder={t('products.editor.descPlaceholder')}
          />
        </CardContent>
      </Card>
    </>
  )
}
