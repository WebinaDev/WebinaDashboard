import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { MediaPickerDialog } from '@/components/magazine/MediaPickerDialog'
import { Button } from '@/components/ui/button'
import { LazyImage } from '@/components/ui/lazy-image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { GalleryImage } from '@/types/product'

type ProductImagesPanelProps = {
  imageId: number
  imageUrl: string
  gallery: GalleryImage[]
  onCoverChange: (item: { id: number; url: string }) => void
  onCoverRemove: () => void
  onGalleryChange: (items: GalleryImage[]) => void
}

export function ProductImagesPanel({
  imageId,
  imageUrl,
  gallery,
  onCoverChange,
  onCoverRemove,
  onGalleryChange,
}: ProductImagesPanelProps) {
  const { t } = useTranslation()
  const [coverPickerOpen, setCoverPickerOpen] = useState(false)
  const [galleryPickerOpen, setGalleryPickerOpen] = useState(false)

  function addGalleryItem(item: { id: number; url: string }) {
    if (gallery.some((g) => g.id === item.id)) return
    onGalleryChange([...gallery, item])
  }

  function removeGalleryItem(gid: number) {
    onGalleryChange(gallery.filter((g) => g.id !== gid))
  }

  function moveGallery(idx: number, dir: -1 | 1) {
    const next = [...gallery]
    const target = idx + dir
    if (target < 0 || target >= next.length) return
    const tmp = next[idx]
    next[idx] = next[target]
    next[target] = tmp
    onGalleryChange(next)
  }

  return (
    <>
      <Card className="gap-4 py-4 shadow-sm">
        <CardHeader className="px-4 pb-0">
          <CardTitle className="text-sm font-semibold">{t('products.editor.imagesPanel')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">{t('products.editor.coverImage')}</p>
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
              <Button type="button" size="sm" variant="outline" onClick={() => setCoverPickerOpen(true)}>
                {imageId > 0 ? t('posts.changeFeaturedImage') : t('posts.selectFeaturedImage')}
              </Button>
              {imageId > 0 ? (
                <Button type="button" size="sm" variant="ghost" onClick={onCoverRemove}>
                  {t('posts.removeFeaturedImage')}
                </Button>
              ) : null}
            </div>
          </div>

          <div className="space-y-2 border-t border-border pt-3">
            <p className="text-xs font-medium text-muted-foreground">{t('products.editor.gallery')}</p>
            {gallery.length === 0 ? (
              <p className="text-muted-foreground text-xs">{t('products.editor.noGallery')}</p>
            ) : (
              <ul className="space-y-2">
                {gallery.map((item, idx) => (
                  <li key={item.id} className="flex items-center gap-2 rounded-md border border-border p-1">
                    {item.url ? (
                      <LazyImage src={item.url} alt={t('a11y.thumbnail')} className="size-12 rounded object-cover" />
                    ) : (
                      <div className="bg-muted flex size-12 items-center justify-center rounded text-xs">#{item.id}</div>
                    )}
                    <span className="text-muted-foreground flex-1 text-xs">#{item.id}</span>
                    <div className="flex gap-0.5">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-7"
                        disabled={idx === 0}
                        onClick={() => moveGallery(idx, -1)}
                        aria-label={t('products.editor.moveUp')}
                      >
                        <ChevronUp className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-7"
                        disabled={idx === gallery.length - 1}
                        onClick={() => moveGallery(idx, 1)}
                        aria-label={t('products.editor.moveDown')}
                      >
                        <ChevronDown className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeGalleryItem(item.id)}
                      >
                        {t('common.delete')}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Button type="button" size="sm" variant="outline" onClick={() => setGalleryPickerOpen(true)}>
              {t('products.editor.addGalleryImage')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <MediaPickerDialog open={coverPickerOpen} onOpenChange={setCoverPickerOpen} onSelect={onCoverChange} />
      <MediaPickerDialog open={galleryPickerOpen} onOpenChange={setGalleryPickerOpen} onSelect={addGalleryItem} />
    </>
  )
}
