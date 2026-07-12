import { Skeleton } from '@/components/ui/skeleton'

type CardGridSkeletonProps = {
  tabs?: number
  cards?: number
}

export function CardGridSkeleton({ tabs = 4, cards = 6 }: CardGridSkeletonProps) {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56 max-w-full" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      {tabs > 0 ? (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: tabs }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24" />
          ))}
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: cards }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
