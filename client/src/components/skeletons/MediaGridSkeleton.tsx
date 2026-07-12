import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { PageHeaderSkeleton } from './PageHeaderSkeleton'

type MediaGridSkeletonProps = {
  items?: number
  showPageHeader?: boolean
}

export function MediaGridSkeleton({ items = 8, showPageHeader = true }: MediaGridSkeletonProps) {
  return (
    <div className="space-y-4" aria-busy="true">
      {showPageHeader ? <PageHeaderSkeleton /> : null}
      <Card className="shadow-sm">
        <CardContent className="flex flex-wrap gap-3 pt-6">
          <Skeleton className="h-10 flex-1 min-w-[12rem]" />
          <Skeleton className="h-10 w-28" />
        </CardContent>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: items }).map((_, i) => (
          <Skeleton key={i} className="aspect-video w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
