import { TrendingDown, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber } from '@/lib/formatNumber'
import type { DashboardOverviewProductStats } from '@/types/dashboardOverview'

type HomeProductStatsCardProps = {
  stats: DashboardOverviewProductStats
  locale: string
}

const STATUS_KEYS = ['publish', 'draft', 'pending', 'private', 'trash'] as const
const STOCK_KEYS = ['instock', 'outofstock', 'onbackorder'] as const

export function HomeProductStatsCard({ stats, locale }: HomeProductStatsCardProps) {
  const { t } = useTranslation()

  return (
    <Card variant="stat">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{t('home.sections.products')}</CardTitle>
        <Link className="text-primary text-xs hover:underline" to="/shop/products">
          {t('home.viewAll')}
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-muted-foreground text-xs">{t('home.products.total')}</p>
          <p className="text-2xl font-semibold">{formatNumber(stats.total, locale)}</p>
        </div>
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground mb-1 text-xs">{t('home.products.byStatusTitle')}</p>
            <ul className="space-y-0.5">
              {STATUS_KEYS.map((key) =>
                stats.by_status[key] ? (
                  <li key={key} className="flex justify-between gap-2">
                    <span>{t(`home.products.byStatus.${key}`)}</span>
                    <span className="font-medium">{formatNumber(stats.by_status[key], locale)}</span>
                  </li>
                ) : null,
              )}
            </ul>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-xs">{t('home.products.byStockTitle')}</p>
            <ul className="space-y-0.5">
              {STOCK_KEYS.map((key) => (
                <li key={key} className="flex justify-between gap-2">
                  <span>{t(`home.products.byStock.${key}`)}</span>
                  <span className="font-medium">{formatNumber(stats.by_stock[key] ?? 0, locale)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ChangePctBadge({ value }: { value: number | null }) {
  const { t } = useTranslation()
  if (value === null) {
    return <span className="text-muted-foreground text-xs">{t('reports.deltaNew')}</span>
  }
  const up = value >= 0
  const Icon = up ? TrendingUp : TrendingDown
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs ${up ? 'text-emerald-600' : 'text-red-600'}`}>
      <Icon className="size-3" />
      {Math.abs(value).toFixed(1)}%
    </span>
  )
}
