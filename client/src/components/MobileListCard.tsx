import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type MobileListCardProps = {
  children: ReactNode
  className?: string
  /** Leading control (checkbox). */
  leading?: ReactNode
  /** Trailing actions row. */
  actions?: ReactNode
  media?: ReactNode
}

/**
 * Shared shell for admin list rows on mobile (< md).
 */
export function MobileListCard({ children, className, leading, actions, media }: MobileListCardProps) {
  return (
    <article
      className={cn(
        'bg-card text-card-foreground flex flex-col gap-3 rounded-xl border p-3 shadow-sm',
        className
      )}
    >
      {(leading || media) && (
        <div className="flex items-start gap-3">
          {leading ? <div className="pt-1">{leading}</div> : null}
          {media ? <div className="min-w-0 flex-1">{media}</div> : null}
        </div>
      )}
      <div className="min-w-0 space-y-2">{children}</div>
      {actions ? <div className="flex flex-wrap items-center gap-2 border-t pt-3">{actions}</div> : null}
    </article>
  )
}
