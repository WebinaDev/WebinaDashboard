import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { MediaPickerDialog } from '@/components/magazine/MediaPickerDialog'
import { LazyImage } from '@/components/ui/lazy-image'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { apiUploadFile } from '@/lib/api'

type QuickAddImagePanelProps = {
  imageId: number
  imageUrl: string
  onChange: (next: { id: number; url: string }) => void
  onRemove: () => void
}

export function QuickAddImagePanel({ imageId, imageUrl, onChange, onRemove }: QuickAddImagePanelProps) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [pickerOpen, setPickerOpen] = useState(false)

  const upload = useMutation({
    mutationFn: (file: File) => apiUploadFile('content/media', file),
    onSuccess: (item) => {
      if (item.id > 0) {
        onChange(item)
        void qc.invalidateQueries({ queryKey: ['media', 'picker'] })
        toast.success(t('wfcp.uploadImageOk'))
      }
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  return (
    <>
      <div className="space-y-2">
        <Label>{t('wfcp.productImage')}</Label>
        {imageId > 0 && imageUrl ? (
          <div className="overflow-hidden rounded-md border border-border">
            <LazyImage src={imageUrl} alt={t('a11y.thumbnail')} className="aspect-video w-full object-cover" />
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-md border border-dashed border-border bg-muted/30 text-xs text-muted-foreground">
            {t('wfcp.noImage')}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => setPickerOpen(true)}>
            {imageId > 0 ? t('wfcp.changeImage') : t('wfcp.selectImage')}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={upload.isPending}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="me-1 size-3.5" />
            {t('wfcp.uploadImage')}
          </Button>
          {imageId > 0 ? (
            <Button type="button" size="sm" variant="ghost" onClick={onRemove}>
              {t('wfcp.removeImage')}
            </Button>
          ) : null}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (file) void upload.mutateAsync(file)
          }}
        />
      </div>
      <MediaPickerDialog open={pickerOpen} onOpenChange={setPickerOpen} onSelect={(item) => onChange(item)} />
    </>
  )
}
