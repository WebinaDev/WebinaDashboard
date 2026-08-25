import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { apiUploadFile } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

export type MediaUploadItem = { id: number; url: string }

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

export function filterImageFiles(files: Iterable<File>): File[] {
  return Array.from(files).filter(isImageFile)
}

type UseMediaFileUploadOptions = {
  /** When false, skip per-file success toasts (caller handles batch feedback). */
  toastOnSuccess?: boolean
}

export function useMediaFileUpload(options: UseMediaFileUploadOptions = {}) {
  const { toastOnSuccess = true } = options
  const { t } = useTranslation()
  const qc = useQueryClient()

  const upload = useMutation({
    mutationFn: (file: File) => apiUploadFile('content/media', file),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['media', 'picker'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const uploadOne = useCallback(
    async (file: File): Promise<MediaUploadItem | null> => {
      if (!isImageFile(file)) {
        toast.error(t('products.editor.invalidImageType'))
        return null
      }
      try {
        const item = await upload.mutateAsync(file)
        if (toastOnSuccess) {
          toast.success(t('products.editor.uploadImageOk'))
        }
        return item
      } catch {
        return null
      }
    },
    [toastOnSuccess, t, upload],
  )

  const uploadMany = useCallback(
    async (files: File[]): Promise<MediaUploadItem[]> => {
      if (files.length === 0) {
        return []
      }

      const images = filterImageFiles(files)
      if (images.length === 0) {
        toast.error(t('products.editor.invalidImageType'))
        return []
      }
      if (images.length < files.length) {
        toast.error(t('products.editor.invalidImageType'))
      }

      const results: MediaUploadItem[] = []
      for (const file of images) {
        try {
          const item = await upload.mutateAsync(file)
          results.push(item)
        } catch {
          // toastApiError already handled in mutation
        }
      }

      if (results.length > 0 && toastOnSuccess) {
        if (results.length === 1) {
          toast.success(t('products.editor.uploadImageOk'))
        } else {
          toast.success(t('products.editor.uploadImagesOk', { count: results.length }))
        }
      }

      return results
    },
    [t, toastOnSuccess, upload],
  )

  return {
    uploadOne,
    uploadMany,
    isPending: upload.isPending,
  }
}
