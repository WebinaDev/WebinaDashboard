import type { ImgHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

type LazyImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  eager?: boolean
}

export function LazyImage({ className, eager, loading, decoding, fetchPriority, ...props }: LazyImageProps) {
  return (
    <img
      className={cn(className)}
      loading={loading ?? (eager ? 'eager' : 'lazy')}
      decoding={decoding ?? 'async'}
      fetchPriority={fetchPriority ?? (eager ? 'high' : 'low')}
      referrerPolicy="no-referrer"
      {...props}
    />
  )
}
