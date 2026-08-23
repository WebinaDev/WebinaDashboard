import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useTextDirection } from '@/hooks/use-text-direction'

type ProductEditorLayoutProps = {
  productId?: number
  loading: boolean
  saving: boolean
  saveDisabled?: boolean
  onSave: () => void
  main: ReactNode
  sidebar: ReactNode
  headerActions?: ReactNode
}

export function ProductEditorLayout({
  productId,
  loading,
  saving,
  saveDisabled = false,
  onSave,
  main,
  sidebar,
  headerActions,
}: ProductEditorLayoutProps) {
  const { t } = useTranslation()
  const dir = useTextDirection()

  return (
    <PageShell title={productId ? t('products.editTitle') : t('products.newTitle')}>
      <div dir={dir} className="space-y-4">
        <div className="flex flex-wrap items-center justify-end gap-2">
          {headerActions}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={saving || loading || saveDisabled}
            onClick={onSave}
          >
            {t('common.save')}
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(240px,280px)] lg:items-start">
          <div className="min-w-0 space-y-3">{main}</div>
          <aside className="min-w-0 space-y-3 lg:sticky lg:top-4 lg:self-start">
            {loading ? (
              <>
                <Skeleton className="h-36 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-28 w-full rounded-xl" />
              </>
            ) : (
              sidebar
            )}
          </aside>
        </div>
      </div>
    </PageShell>
  )
}
