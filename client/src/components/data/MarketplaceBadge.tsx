import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export const MARKETPLACE_SLUGS = ['digikala', 'basalam', 'snappshop', 'tapsishop', 'technolife'] as const

export type MarketplaceSlug = (typeof MARKETPLACE_SLUGS)[number] | string

const SLUG_CLASS: Record<string, string> = {
  digikala: 'border-red-600/35 bg-red-600/12 text-red-800 dark:text-red-300',
  basalam: 'border-emerald-600/35 bg-emerald-600/12 text-emerald-800 dark:text-emerald-300',
  snappshop: 'border-pink-600/35 bg-pink-600/12 text-pink-800 dark:text-pink-300',
  tapsishop: 'border-orange-600/35 bg-orange-600/12 text-orange-800 dark:text-orange-300',
  technolife: 'border-sky-600/35 bg-sky-600/12 text-sky-800 dark:text-sky-300',
}

type MarketplaceBadgeProps = {
  slug?: string | null
  slugs?: string[]
  className?: string
}

export function marketplaceLabel(t: (key: string, fallback?: string) => string, slug: string): string {
  return t(`marketplace.badge.${slug}`, slug)
}

export function MarketplaceBadge({ slug, slugs, className }: MarketplaceBadgeProps) {
  const { t } = useTranslation()
  const list = (slugs && slugs.length > 0 ? slugs : slug ? [slug] : []).filter(Boolean)
  if (list.length === 0) {
    return null
  }
  return (
    <span className={cn('inline-flex flex-wrap items-center gap-1', className)}>
      {list.map((s) => (
        <Badge key={s} variant="outline" className={cn('font-medium', SLUG_CLASS[s] ?? '')}>
          {t(`marketplace.badge.${s}`, s)}
        </Badge>
      ))}
    </span>
  )
}

export default MarketplaceBadge
