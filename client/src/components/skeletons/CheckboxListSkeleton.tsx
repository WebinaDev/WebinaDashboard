import { Skeleton } from '@/components/ui/skeleton'

type CheckboxListSkeletonProps = {
  rows?: number
}

export function CheckboxListSkeleton({ rows = 5 }: CheckboxListSkeletonProps) {
  return (
    <div className="space-y-2" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <Skeleton className="size-4 shrink-0 rounded-sm" />
          <Skeleton className="h-4 flex-1 max-w-xs" />
        </div>
      ))}
    </div>
  )
}
