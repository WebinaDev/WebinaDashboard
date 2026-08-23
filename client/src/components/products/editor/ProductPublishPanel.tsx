import { useTranslation } from 'react-i18next'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { translatePostStatus } from '@/lib/enumLabels'

type ProductPublishPanelProps = {
  status: string
  catalogVisibility: string
  featured: boolean
  onStatusChange: (v: string) => void
  onCatalogVisibilityChange: (v: string) => void
  onFeaturedChange: (v: boolean) => void
}

export function ProductPublishPanel({
  status,
  catalogVisibility,
  featured,
  onStatusChange,
  onCatalogVisibilityChange,
  onFeaturedChange,
}: ProductPublishPanelProps) {
  const { t } = useTranslation()

  return (
    <Card className="gap-2 py-3 shadow-sm">
      <CardHeader className="px-3 pb-0">
        <CardTitle className="text-sm font-semibold">{t('products.editor.publishPanel')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-3">
        <div className="space-y-1.5">
          <Label>{t('products.fieldStatus')}</Label>
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">{translatePostStatus(t, 'draft')}</SelectItem>
              <SelectItem value="pending">{translatePostStatus(t, 'pending')}</SelectItem>
              <SelectItem value="publish">{translatePostStatus(t, 'publish')}</SelectItem>
              <SelectItem value="private">{translatePostStatus(t, 'private')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>{t('products.editor.catalogVisibility')}</Label>
          <Select value={catalogVisibility} onValueChange={onCatalogVisibilityChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="visible">{t('products.editor.visibilityVisible')}</SelectItem>
              <SelectItem value="catalog">{t('products.editor.visibilityCatalog')}</SelectItem>
              <SelectItem value="search">{t('products.editor.visibilitySearch')}</SelectItem>
              <SelectItem value="hidden">{t('products.editor.visibilityHidden')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <label className="flex cursor-pointer items-center gap-2">
          <Checkbox checked={featured} onCheckedChange={(v) => onFeaturedChange(v === true)} />
          <span className="text-sm">{t('products.editor.featured')}</span>
        </label>
      </CardContent>
    </Card>
  )
}
