import { TableListSkeleton } from '@/components/TableListSkeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { PageHeaderSkeleton } from './PageHeaderSkeleton'

type ListPageSkeletonProps = {
  showPageHeader?: boolean
  filterFields?: number
  tableRows?: number
  tableColumns?: number
}

export function ListPageSkeleton({
  showPageHeader = true,
  filterFields = 4,
  tableRows = 8,
  tableColumns = 5,
}: ListPageSkeletonProps) {
  return (
    <div className="space-y-4" aria-busy="true">
      {showPageHeader ? <PageHeaderSkeleton /> : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-28" />
      </div>
      <Card className="shadow-sm">
        <CardContent className="space-y-4 pt-6">
          {filterFields > 0 ? (
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: filterFields }).map((_, i) => (
                <Skeleton key={i} className="h-10 min-w-[8rem] flex-1" />
              ))}
            </div>
          ) : null}
          {tableRows > 0 ? <TableListSkeleton rows={tableRows} columns={tableColumns} /> : null}
        </CardContent>
      </Card>
    </div>
  )
}
