import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'
import type { MarketplaceCategory } from '@/lib/marketplace-api'

type Props = {
  categories: MarketplaceCategory[]
  active: string
  onChange: (slug: string) => void
}

export function CategoryTabs({ categories, active, onChange }: Props) {
  const { t } = useTranslation()
  const tabs = [{ slug: '', name: t('marketplace.allCategories') }, ...categories]

  return (
    <div className="flex flex-wrap gap-2 border-b pb-3">
      {tabs.map((cat) => (
        <button
          key={cat.slug || 'all'}
          type="button"
          onClick={() => onChange(cat.slug)}
          className={cn(
            'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
            active === cat.slug
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80',
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}
