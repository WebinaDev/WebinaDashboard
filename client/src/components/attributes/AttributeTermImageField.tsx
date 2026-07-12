import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toastApiError } from '@/lib/apiError'

import { MediaPickerDialog } from '@/components/magazine/MediaPickerDialog'
import { Button } from '@/components/ui/button'
import { LazyImage } from '@/components/ui/lazy-image'
import { Label } from '@/components/ui/label'
import { apiUploadFile } from '@/lib/api'

type AttributeTermImageFieldProps = {
  imageId: number
  imageUrl: string
  onChange: (next: { id: number; url: string }) => void
  onRemove: () => void
}

export function AttributeTermImageField({ imageId, imageUrl, onChange, onRemove }: AttributeTermImageFieldProps) {
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
      }
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  return (
    <>
      <div className="space-y-2">
        <Label>{t('attributes.terms.image')}</Label>
        {imageId > 0 && imageUrl ? (
          <LazyImage src={imageUrl} alt={t('a11y.thumbnail')} className="size-16 rounded-md border object-cover" />
        ) : (
          <div className="text-muted-foreground flex size-16 items-center justify-center rounded-md border border-dashed text-xs">
            {t('attributes.terms.noImage')}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => setPickerOpen(true)}>
            {t('attributes.terms.selectImage')}
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={upload.isPending} onClick={() => fileRef.current?.click()}>
            <Upload className="me-1 size-3.5" />
            {t('attributes.terms.uploadImage')}
          </Button>
          {imageId > 0 ? (
            <Button type="button" size="sm" variant="ghost" onClick={onRemove}>
              {t('common.delete')}
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
