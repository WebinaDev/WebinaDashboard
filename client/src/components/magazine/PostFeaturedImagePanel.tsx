import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { MediaPickerDialog } from '@/components/magazine/MediaPickerDialog'
import { Button } from '@/components/ui/button'
import { LazyImage } from '@/components/ui/lazy-image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type PostFeaturedImagePanelProps = {
  imageId: number
  imageUrl: string
  onChange: (next: { id: number; url: string }) => void
  onRemove: () => void
}

export function PostFeaturedImagePanel({ imageId, imageUrl, onChange, onRemove }: PostFeaturedImagePanelProps) {
  const { t } = useTranslation()
  const [pickerOpen, setPickerOpen] = useState(false)

  return (
    <>
      <Card className="gap-4 py-4 shadow-sm">
        <CardHeader className="px-4 pb-0">
          <CardTitle className="text-sm font-semibold">{t('posts.panelFeaturedImage')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4">
          {imageId > 0 && imageUrl ? (
            <div className="overflow-hidden rounded-md border border-border">
              <LazyImage src={imageUrl} alt={t('a11y.thumbnail')} className="aspect-video w-full object-cover" eager />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-md border border-dashed border-border bg-muted/30 text-xs text-muted-foreground">
              {t('posts.noFeaturedImage')}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => setPickerOpen(true)}>
              {imageId > 0 ? t('posts.changeFeaturedImage') : t('posts.selectFeaturedImage')}
            </Button>
            {imageId > 0 ? (
              <Button type="button" size="sm" variant="ghost" onClick={onRemove}>
                {t('posts.removeFeaturedImage')}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(item) => onChange(item)}
      />
    </>
  )
}
