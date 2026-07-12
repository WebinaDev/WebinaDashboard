import { Skeleton } from '@/components/ui/skeleton'

import { PageHeaderSkeleton } from './PageHeaderSkeleton'

export function EditorPageSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <PageHeaderSkeleton />
      <div className="flex justify-end">
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="min-h-72 w-full rounded-xl" />
        </div>
        <aside className="space-y-4">
          <Skeleton className="h-56 w-full rounded-xl" />
          <Skeleton className="h-44 w-full rounded-xl" />
          <Skeleton className="h-36 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </aside>
      </div>
    </div>
  )
}
