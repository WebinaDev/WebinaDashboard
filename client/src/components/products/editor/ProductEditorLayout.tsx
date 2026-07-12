import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

type ProductEditorLayoutProps = {
  productId?: number
  loading: boolean
  saving: boolean
  saveDisabled?: boolean
  onSave: () => void
  main: ReactNode
  sidebar: ReactNode
}

export function ProductEditorLayout({
  productId,
  loading,
  saving,
  saveDisabled = false,
  onSave,
  main,
  sidebar,
}: ProductEditorLayoutProps) {
  const { t } = useTranslation()

  return (
    <PageShell title={productId ? t('products.editTitle') : t('products.newTitle')}>
      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" disabled={saving || loading || saveDisabled} onClick={onSave}>
          {t('common.save')}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">{main}</div>
        <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          {loading ? (
            <>
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-36 w-full rounded-xl" />
            </>
          ) : (
            sidebar
          )}
        </aside>
      </div>
    </PageShell>
  )
}
