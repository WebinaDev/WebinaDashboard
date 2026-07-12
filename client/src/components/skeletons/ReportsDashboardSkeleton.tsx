import { Skeleton } from '@/components/ui/skeleton'

import { PageHeaderSkeleton } from './PageHeaderSkeleton'

export type ReportsDashboardSkeletonProps = {
  showPageHeader?: boolean
}

export function ReportsDashboardSkeleton({ showPageHeader = true }: ReportsDashboardSkeletonProps) {
  return (
    <div className="space-y-6" aria-busy="true">
      {showPageHeader ? <PageHeaderSkeleton /> : null}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24" />
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Skeleton className="h-80 rounded-lg" />
        <Skeleton className="h-80 rounded-lg" />
      </div>
      <Skeleton className="h-64 rounded-lg" />
      <Skeleton className="h-56 rounded-lg" />
    </div>
  )
}
