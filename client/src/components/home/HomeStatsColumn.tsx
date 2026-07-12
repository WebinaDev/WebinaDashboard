import type { DashboardOverviewSales } from '@/types/dashboardOverview'

import { HomeSalesStatCard } from '@/components/home/HomeSalesStatCard'

type HomeStatsColumnProps = {
  sales?: DashboardOverviewSales
  currency: string
  currencySymbol?: string
  locale: string
  hasSales: boolean
}

export function HomeStatsColumn({ sales, currency, currencySymbol, locale, hasSales }: HomeStatsColumnProps) {
  if (!hasSales || !sales) return null

  return (
    <div className="space-y-4 lg:col-span-1">
      <HomeSalesStatCard sales={sales} currency={currency} currencySymbol={currencySymbol} locale={locale} />
    </div>
  )
}
