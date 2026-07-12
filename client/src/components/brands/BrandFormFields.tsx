import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import type { BrandFormState, BrandRow } from '@/components/brands/types'
import { PostFeaturedImagePanel } from '@/components/magazine/PostFeaturedImagePanel'
import { RichTextEditor } from '@/components/magazine/LazyRichTextEditor'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { parentSelectOptions, slugifyFromName } from '@/lib/categoryTree'

type BrandFormFieldsProps = {
  form: BrandFormState
  brands: BrandRow[]
  excludeId?: number
  slugAuto: boolean
  onSlugAutoChange: (auto: boolean) => void
  onChange: (next: BrandFormState) => void
  idPrefix?: string
}

export function BrandFormFields({
  form,
  brands,
  excludeId,
  slugAuto,
  onSlugAutoChange,
  onChange,
  idPrefix = 'brand',
}: BrandFormFieldsProps) {
  const { t } = useTranslation()

  const parentOptions = useMemo(() => {
    const asCategories = brands.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      parent: b.parent,
      description: b.description,
      count: b.count,
      url: b.url,
    }))
    return parentSelectOptions(asCategories, excludeId)
  }, [brands, excludeId])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-name`}>{t('brands.fieldName')}</Label>
          <Input
            id={`${idPrefix}-name`}
            value={form.name}
            onChange={(e) => onChange({ ...form, name: e.target.value })}
            onBlur={() => {
              if (slugAuto && form.name.trim()) {
                onChange({ ...form, slug: slugifyFromName(form.name) })
              }
            }}
          />
          <p className="text-muted-foreground text-xs">{t('brands.fieldNameHint')}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-slug`}>{t('brands.fieldSlug')}</Label>
          <Input
            id={`${idPrefix}-slug`}
            value={form.slug}
            onChange={(e) => {
              onSlugAutoChange(false)
              onChange({ ...form, slug: e.target.value })
            }}
          />
          <p className="text-muted-foreground text-xs">{t('brands.fieldSlugHint')}</p>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor={`${idPrefix}-parent`}>{t('brands.fieldParent')}</Label>
          <Select value={String(form.parent)} onValueChange={(v) => onChange({ ...form, parent: parseInt(v, 10) || 0 })}>
            <SelectTrigger id={`${idPrefix}-parent`} className="w-full max-w-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">{t('brands.filterParentNone')}</SelectItem>
              {parentOptions.map(({ node, depth }) => (
                <SelectItem key={node.id} value={String(node.id)}>
                  {`${'— '.repeat(depth)}${node.name}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-xs">{t('brands.fieldParentHint')}</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t('brands.fieldDescription')}</Label>
        <RichTextEditor value={form.description} onChange={(description) => onChange({ ...form, description })} />
        <p className="text-muted-foreground text-xs">{t('brands.fieldDescriptionHint')}</p>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">{t('brands.fieldThumbnail')}</p>
        <p className="text-muted-foreground mb-3 text-xs">{t('brands.fieldThumbnailHint')}</p>
        <PostFeaturedImagePanel
          imageId={form.thumbnail_id}
          imageUrl={form.thumbnail_url}
          onChange={(next) => onChange({ ...form, thumbnail_id: next.id, thumbnail_url: next.url })}
          onRemove={() => onChange({ ...form, thumbnail_id: 0, thumbnail_url: '' })}
        />
      </div>
    </div>
  )
}
