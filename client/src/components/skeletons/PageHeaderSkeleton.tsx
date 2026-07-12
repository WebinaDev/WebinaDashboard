import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

type PageHeaderSkeletonProps = {
  /** When false, only title bar (no description line). */
  withDescription?: boolean
}

export function PageHeaderSkeleton({ withDescription = true }: PageHeaderSkeletonProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">
          <Skeleton className="h-7 w-48 max-w-full" />
        </CardTitle>
        {withDescription ? (
          <CardDescription>
            <Skeleton className="mt-1 h-4 w-64 max-w-full" />
          </CardDescription>
        ) : null}
      </CardHeader>
    </Card>
  )
}
