import { useTranslation } from 'react-i18next'

import { RichTextEditor } from '@/components/magazine/LazyRichTextEditor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type ProductDescriptionsSectionProps = {
  shortDescription: string
  description: string
  disabled?: boolean
  onShortChange: (v: string) => void
  onDescriptionChange: (v: string) => void
  /** When true, only short description card is rendered. */
  shortOnly?: boolean
  /** When true, only full description card is rendered. */
  longOnly?: boolean
}

export function ProductDescriptionsSection({
  shortDescription,
  description,
  disabled,
  onShortChange,
  onDescriptionChange,
  shortOnly = false,
  longOnly = false,
}: ProductDescriptionsSectionProps) {
  const { t } = useTranslation()
  const showShort = !longOnly
  const showLong = !shortOnly

  return (
    <>
      {showShort ? (
        <Card className="gap-2 py-3 shadow-sm">
          <CardHeader className="px-3 pb-0">
            <CardTitle className="text-sm font-semibold">{t('products.fieldShortDescription')}</CardTitle>
          </CardHeader>
          <CardContent className="px-3">
            <RichTextEditor
              value={shortDescription}
              onChange={onShortChange}
              disabled={disabled}
              placeholder={t('products.editor.shortDescPlaceholder')}
            />
          </CardContent>
        </Card>
      ) : null}
      {showLong ? (
        <Card className="gap-2 py-3 shadow-sm">
          <CardHeader className="px-3 pb-0">
            <CardTitle className="text-sm font-semibold">{t('products.fieldDescription')}</CardTitle>
          </CardHeader>
          <CardContent className="px-3">
            <RichTextEditor
              value={description}
              onChange={onDescriptionChange}
              disabled={disabled}
              placeholder={t('products.editor.descPlaceholder')}
            />
          </CardContent>
        </Card>
      ) : null}
    </>
  )
}
