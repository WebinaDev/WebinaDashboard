import { Skeleton } from '@/components/ui/skeleton'

type Props = { rows?: number; columns?: number }

export function TableListSkeleton({ rows = 6, columns = 4 }: Props) {
  return (
    <div className="p-4 space-y-3" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-2">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}
