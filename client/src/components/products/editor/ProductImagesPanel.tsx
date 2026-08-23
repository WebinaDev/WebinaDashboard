import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { MediaPickerDialog } from '@/components/magazine/MediaPickerDialog'
import { Button } from '@/components/ui/button'
import { LazyImage } from '@/components/ui/lazy-image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { GalleryImage } from '@/types/product'

type ProductImagesPanelProps = {
  imageId: number
  imageUrl: string
  gallery: GalleryImage[]
  videoUrl?: string
  videoCoverUrl?: string
  onCoverChange: (item: { id: number; url: string }) => void
  onCoverRemove: () => void
  onGalleryChange: (items: GalleryImage[]) => void
  onVideoUrlChange?: (v: string) => void
  onVideoCoverUrlChange?: (v: string) => void
}

export function ProductImagesPanel({
  imageId,
  imageUrl,
  gallery,
  videoUrl = '',
  videoCoverUrl = '',
  onCoverChange,
  onCoverRemove,
  onGalleryChange,
  onVideoUrlChange,
  onVideoCoverUrlChange,
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
      <Card className="gap-2 py-3 shadow-sm">
        <CardHeader className="px-3 pb-0">
          <CardTitle className="text-sm font-semibold">{t('products.editor.imagesPanel')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-3">
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-medium">{t('products.editor.coverImage')}</p>
            {imageId > 0 && imageUrl ? (
              <div className="bg-muted/20 overflow-hidden rounded-md border border-border">
                <LazyImage
                  src={imageUrl}
                  alt={t('a11y.thumbnail')}
                  className="aspect-square w-full object-contain"
                  eager
                />
              </div>
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-md border border-dashed border-border bg-muted/30 text-xs text-muted-foreground">
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
              <ul className="grid grid-cols-2 gap-2">
                {gallery.map((item, idx) => (
                  <li key={item.id} className="space-y-1 rounded-md border border-border p-1">
                    <div className="bg-muted/20 overflow-hidden rounded">
                      {item.url ? (
                        <LazyImage
                          src={item.url}
                          alt={t('a11y.thumbnail')}
                          className="aspect-square w-full object-contain"
                        />
                      ) : (
                        <div className="bg-muted flex aspect-square items-center justify-center text-xs">#{item.id}</div>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-0.5">
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
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
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

          {onVideoUrlChange && onVideoCoverUrlChange ? (
            <div className="space-y-3 border-t border-border pt-3">
              <p className="text-xs font-medium text-muted-foreground">{t('products.editor.videoSection')}</p>
              <div className="space-y-2">
                <Label htmlFor="product-video-url">{t('products.ishop.videoUrl')}</Label>
                <Input
                  id="product-video-url"
                  value={videoUrl}
                  onChange={(e) => onVideoUrlChange(e.target.value)}
                  placeholder="https://"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-video-cover">{t('products.ishop.videoCover')}</Label>
                <Input
                  id="product-video-cover"
                  value={videoCoverUrl}
                  onChange={(e) => onVideoCoverUrlChange(e.target.value)}
                  placeholder="https://"
                  dir="ltr"
                />
                {videoCoverUrl ? (
                  <div className="bg-muted/20 overflow-hidden rounded-md border border-border">
                    <LazyImage
                      src={videoCoverUrl}
                      alt={t('products.ishop.videoCover')}
                      className="aspect-square w-full object-contain"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <MediaPickerDialog open={coverPickerOpen} onOpenChange={setCoverPickerOpen} onSelect={onCoverChange} />
      <MediaPickerDialog open={galleryPickerOpen} onOpenChange={setGalleryPickerOpen} onSelect={addGalleryItem} />
    </>
  )
}
