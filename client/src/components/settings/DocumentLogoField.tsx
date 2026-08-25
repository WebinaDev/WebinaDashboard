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

type DocumentLogoFieldProps = {
  label: string
  hint?: string
  imageId: number
  imageUrl: string
  onChange: (next: { id: number; url: string }) => void
  onRemove: () => void
}

export function DocumentLogoField({
  label,
  hint,
  imageUrl,
  onChange,
  onRemove,
}: DocumentLogoFieldProps) {
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
        <Label>{label}</Label>
        {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
        {imageUrl ? (
          <LazyImage src={imageUrl} alt="" className="h-16 max-w-48 rounded-lg border object-contain bg-white p-1" />
        ) : (
          <div className="text-muted-foreground flex h-16 w-28 items-center justify-center rounded-lg border border-dashed text-xs">
            {t('settings.odNoLogo')}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => setPickerOpen(true)}>
            {t('settings.odPickLogo')}
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={upload.isPending} onClick={() => fileRef.current?.click()}>
            <Upload className="me-1 size-3.5" />
            {t('settings.odUploadLogo')}
          </Button>
          {imageUrl ? (
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
