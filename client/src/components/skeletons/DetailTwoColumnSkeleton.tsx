import { Skeleton } from '@/components/ui/skeleton'

import { PageHeaderSkeleton } from './PageHeaderSkeleton'

export function DetailTwoColumnSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <PageHeaderSkeleton withDescription={false} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
        <aside className="space-y-4">
          <Skeleton className="h-56 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </aside>
      </div>
    </div>
  )
}
