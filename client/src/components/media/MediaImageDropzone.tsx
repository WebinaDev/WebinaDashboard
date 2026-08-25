import { Upload } from 'lucide-react'
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
} from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { filterImageFiles } from '@/hooks/useMediaFileUpload'
import { cn } from '@/lib/utils'

export type MediaImageDropzoneHandle = {
  openFilePicker: () => void
}

type MediaImageDropzoneProps = {
  multiple?: boolean
  disabled?: boolean
  busy?: boolean
  onFiles: (files: File[]) => void
  emptyLabel?: string
  className?: string
  children?: ReactNode
}

export const MediaImageDropzone = forwardRef<MediaImageDropzoneHandle, MediaImageDropzoneProps>(
  function MediaImageDropzone(
    { multiple = false, disabled = false, busy = false, onFiles, emptyLabel, className, children },
    ref,
  ) {
    const { t } = useTranslation()
    const fileRef = useRef<HTMLInputElement>(null)
    const dragDepthRef = useRef(0)
    const [isDragging, setIsDragging] = useState(false)

    const inactive = disabled || busy

    useImperativeHandle(ref, () => ({
      openFilePicker: () => {
        if (!inactive) {
          fileRef.current?.click()
        }
      },
    }))

    const emitFiles = useCallback(
      (files: File[]) => {
        if (inactive || files.length === 0) {
          return
        }
        const images = filterImageFiles(files)
        if (images.length === 0) {
          toast.error(t('products.editor.invalidImageType'))
          return
        }
        if (images.length < files.length) {
          toast.error(t('products.editor.invalidImageType'))
        }
        onFiles(multiple ? images : images.slice(0, 1))
      },
      [inactive, multiple, onFiles, t],
    )

    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      if (inactive) {
        return
      }
      dragDepthRef.current += 1
      setIsDragging(true)
    }

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      if (inactive) {
        return
      }
      e.dataTransfer.dropEffect = 'copy'
    }

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      dragDepthRef.current = Math.max(0, dragDepthRef.current - 1)
      if (dragDepthRef.current === 0) {
        setIsDragging(false)
      }
    }

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      dragDepthRef.current = 0
      setIsDragging(false)
      if (inactive) {
        return
      }
      const dropped = Array.from(e.dataTransfer.files)
      emitFiles(dropped)
    }

    const handleClick = () => {
      if (!inactive && !children) {
        fileRef.current?.click()
      }
    }

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      const picked = Array.from(e.target.files ?? [])
      e.target.value = ''
      emitFiles(picked)
    }

    const showEmpty = !children

    return (
      <div
        role={showEmpty ? 'button' : undefined}
        tabIndex={showEmpty && !inactive ? 0 : undefined}
        aria-disabled={inactive || undefined}
        aria-busy={busy || undefined}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (showEmpty && !inactive && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            fileRef.current?.click()
          }
        }}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative overflow-hidden rounded-md border border-dashed transition-colors',
          showEmpty
            ? 'flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 bg-muted/30 p-4 text-center text-xs text-muted-foreground'
            : 'border-transparent',
          isDragging && !inactive && 'border-primary bg-primary/5 ring-2 ring-primary/30',
          !isDragging && showEmpty && 'border-border',
          inactive && 'pointer-events-none opacity-60',
          className,
        )}
      >
        {children ?? (
          <>
            <Upload className="size-5 shrink-0 opacity-70" aria-hidden />
            <span>{busy ? t('products.editor.uploading') : (emptyLabel ?? t('products.editor.dropImageHere'))}</span>
          </>
        )}
        {isDragging && !inactive ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-primary/10 text-xs font-medium text-primary">
            {t('products.editor.dropImageHere')}
          </div>
        ) : null}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          disabled={inactive}
          onChange={handleInputChange}
        />
      </div>
    )
  },
)
