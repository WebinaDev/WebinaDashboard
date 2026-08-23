import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export function ScrollTable({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn('min-w-0 overflow-x-auto rounded-xl', className)}>{children}</div>
}
