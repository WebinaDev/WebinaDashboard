import { Skeleton } from '@/components/ui/skeleton'

export function AnalyticsPanelSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20" />
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-lg" />
      <Skeleton className="h-28 rounded-lg" />
    </div>
  )
}
