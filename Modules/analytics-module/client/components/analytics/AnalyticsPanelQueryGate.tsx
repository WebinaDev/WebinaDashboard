import type { ReactNode } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { AnalyticsPanelSkeleton } from '@/components/skeletons/AnalyticsPanelSkeleton'
import { ListPageSkeleton } from '@/components/skeletons/ListPageSkeleton'
import { TableListSkeleton } from '@/components/TableListSkeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export type AnalyticsSkeletonVariant = 'table' | 'overview' | 'chart'

type AnalyticsPanelQueryGateProps = {
  query: Pick<UseQueryResult<unknown, Error>, 'isLoading' | 'isError' | 'error' | 'refetch'>
  skeletonRows?: number
  skeletonColumns?: number
  variant?: AnalyticsSkeletonVariant
  children: ReactNode
}

function LoadingSkeleton({
  variant,
  skeletonRows,
  skeletonColumns,
}: {
  variant: AnalyticsSkeletonVariant
  skeletonRows: number
  skeletonColumns: number
}) {
  if (variant === 'overview' || variant === 'chart') {
    return <AnalyticsPanelSkeleton />
  }
  if (variant === 'table') {
    return (
      <Card className="shadow-sm">
        <CardContent className="overflow-x-auto p-0">
          <TableListSkeleton rows={skeletonRows} columns={skeletonColumns} />
        </CardContent>
      </Card>
    )
  }
  return <ListPageSkeleton showPageHeader={false} tableRows={skeletonRows} tableColumns={skeletonColumns} />
}

export function AnalyticsPanelQueryGate({
  query,
  skeletonRows = 6,
  skeletonColumns = 4,
  variant = 'table',
  children,
}: AnalyticsPanelQueryGateProps) {
  const { t } = useTranslation()

  if (query.isError) {
    return (
      <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <p className="text-sm text-destructive">{query.error?.message ?? t('license.retry')}</p>
        <Button type="button" variant="outline" size="sm" onClick={() => void query.refetch()}>
          {t('license.retry')}
        </Button>
      </div>
    )
  }

  if (query.isLoading) {
    return (
      <LoadingSkeleton
        variant={variant}
        skeletonRows={skeletonRows}
        skeletonColumns={skeletonColumns}
      />
    )
  }

  return <>{children}</>
}
