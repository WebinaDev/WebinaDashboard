import { useTranslation } from 'react-i18next'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export type SimpleSeo = {
  title?: string
  description?: string
  focus_keyword?: string
  facebook_title?: string
  facebook_description?: string
  schema_type?: string
}

type Props = {
  seo: SimpleSeo
  onChange: (next: SimpleSeo) => void
}

export function SimpleSeoFields({ seo, onChange }: Props) {
  const { t } = useTranslation()
  const patch = (partial: Partial<SimpleSeo>) => onChange({ ...seo, ...partial })

  return (
    <Card className="gap-4 py-4 shadow-sm">
      <CardHeader className="px-4 pb-0">
        <CardTitle className="text-sm font-semibold">{t('aiContent.seoPanel')}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 px-4 md:grid-cols-2">
        <div className="space-y-1 md:col-span-2">
          <Label>{t('products.seo.focusKeyword')}</Label>
          <Input value={seo.focus_keyword ?? ''} onChange={(e) => patch({ focus_keyword: e.target.value })} />
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label>{t('products.seo.seoTitle')}</Label>
          <Input value={seo.title ?? ''} onChange={(e) => patch({ title: e.target.value })} />
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label>{t('products.seo.metaDescription')}</Label>
          <Textarea rows={3} value={seo.description ?? ''} onChange={(e) => patch({ description: e.target.value })} />
        </div>
      </CardContent>
    </Card>
  )
}
