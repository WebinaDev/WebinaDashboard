import { useQuery } from '@tanstack/react-query'
import { lazy, Suspense, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { HomeActionBar } from '@/components/home/HomeActionBar'
import { HomeCommentsQueue } from '@/components/home/HomeCommentsQueue'
import { HomeMiniCardsStrip } from '@/components/home/HomeMiniCardsStrip'
import { HomeOrdersTable } from '@/components/home/HomeOrdersTable'
import { HomeOverviewSkeleton } from '@/components/home/HomeOverviewSkeleton'
import { QueryErrorState } from '@/components/QueryErrorState'
import { HomeProductTable } from '@/components/home/HomeProductTable'
import { Skeleton } from '@/components/ui/skeleton'
import { TopCategoriesTable } from '@/components/orders/reports/TopCategoriesTable'
import { TopCustomersTable } from '@/components/orders/reports/TopCustomersTable'
import { PageShell } from '@/components/PageShell'
import { useBootstrapQuery } from '@/hooks/useBootstrapQuery'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { useStoreCurrency } from '@/hooks/useStoreCurrency'
import { apiFetch } from '@/lib/api'
import { formatDisplayDate } from '@/lib/date'
import type { DashboardOverviewPanels, DashboardOverviewResponse } from '@/types/dashboardOverview'

const HomeStatsColumn = lazy(() =>
  import('@/components/home/HomeStatsColumn').then((m) => ({ default: m.HomeStatsColumn })),
)
const HomeTrafficAnalyticsPanel = lazy(() =>
  import('@/components/home/HomeTrafficAnalyticsPanel').then((m) => ({
    default: m.HomeTrafficAnalyticsPanel,
  })),
)

function HomeChartFallback() {
  return <Skeleton className="h-80 w-full rounded-xl" />
}

export function HomePage() {
  const { t, i18n } = useTranslation()
  const store = useStoreCurrency()
  const boot = useBootstrapQuery()
  const overview = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => apiFetch<DashboardOverviewResponse>('dashboard/overview'),
    retry: false,
  })
  useQueryErrorToast(overview)

  const smsUnavailable = overview.data?.panels?.sms?.unavailable === true
  const smsPanelQ = useQuery({
    queryKey: ['dashboard-sms-panel'],
    queryFn: () => apiFetch<DashboardOverviewPanels['sms']>('dashboard/sms-panel'),
    enabled: smsUnavailable,
    retry: false,
    staleTime: 60_000,
  })

  const smsRefetch =
    smsUnavailable && (smsPanelQ.isFetching || smsPanelQ.isPending || smsPanelQ.isError)
      ? {
          status: (smsPanelQ.isError ? 'error' : 'loading') as 'error' | 'loading',
          onRetry: () => void smsPanelQ.refetch(),
          message: smsPanelQ.error?.message,
        }
      : undefined

  const panels = useMemo((): DashboardOverviewPanels | undefined => {
    const base = overview.data?.panels
    if (!base) return undefined
    if (smsPanelQ.data && !smsPanelQ.data.unavailable) {
      return { ...base, sms: smsPanelQ.data }
    }
    return base
  }, [overview.data?.panels, smsPanelQ.data])

  const data = overview.data
  const hasSection = (id: string) => data?.sections.includes(id) ?? false
  const currency = data?.sales?.currency || store.currency

  return (
    <PageShell title={t('home.welcome')} description={boot.data?.site.name}>
      <p className="text-sm text-muted-foreground">
        {formatDisplayDate(new Date().toISOString(), i18n.language)}
      </p>

      {overview.isLoading ? (
        <HomeOverviewSkeleton />
      ) : overview.isError ? (
        <QueryErrorState message={overview.error?.message} onRetry={() => void overview.refetch()} />
      ) : (
        <div className="space-y-6">
          <HomeActionBar alerts={data?.alerts} tasks={data?.tasks} locale={i18n.language} />

          <HomeMiniCardsStrip panels={panels} products={data?.products} locale={i18n.language} smsRefetch={smsRefetch} />

          {hasSection('traffic') && data?.traffic ? (
            <Suspense fallback={<HomeChartFallback />}>
              <HomeTrafficAnalyticsPanel traffic={data.traffic} locale={i18n.language} />
            </Suspense>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-3">
            <Suspense fallback={<HomeChartFallback />}>
              <HomeStatsColumn
                sales={data?.sales}
                currency={currency}
                currencySymbol={store.currencySymbol}
                locale={i18n.language}
                hasSales={hasSection('sales')}
              />
            </Suspense>

            <div className="space-y-6 lg:col-span-2">
              {hasSection('sales') && data?.sales ? (
                <HomeOrdersTable
                  title={t('home.recentOrders')}
                  rows={data.sales.recent_orders}
                  monthLabel={data.sales.month_label}
                  viewAllHref="/orders/list"
                  emptyMessage={t('home.orders.emptyMonth')}
                  currency={currency}
                  currencySymbol={store.currencySymbol}
                  locale={i18n.language}
                />
              ) : null}

              {hasSection('comments') && data?.comments ? (
                <HomeCommentsQueue
                  items={data.comments.items}
                  holdCount={data.comments.counts.hold}
                  locale={i18n.language}
                />
              ) : null}
            </div>
          </div>

          {hasSection('sales') && data?.sales ? (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">{t('home.sections.lists')}</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <HomeProductTable
                  title={t('home.recentProducts')}
                  rows={data.sales.recent_products}
                  viewAllHref="/shop/products"
                  emptyMessage={t('home.noProducts')}
                  metricKey="price"
                  currency={currency}
                  currencySymbol={store.currencySymbol}
                  locale={i18n.language}
                />
                <HomeProductTable
                  title={t('reports.table.topProducts')}
                  rows={data.sales.top_products}
                  viewAllHref="/orders/reports"
                  emptyMessage={t('reports.emptyHint')}
                  metricKey="revenue"
                  currency={currency}
                  currencySymbol={store.currencySymbol}
                  locale={i18n.language}
                />
                <HomeProductTable
                  title={t('home.tables.topByViews')}
                  rows={data.sales.top_products_by_views}
                  viewAllHref="/shop/products"
                  emptyMessage={t('reports.emptyHint')}
                  metricKey="views"
                  locale={i18n.language}
                />
                <TopCategoriesTable
                  rows={data.sales.top_categories}
                  currency={currency}
                  currencySymbol={store.currencySymbol}
                  locale={i18n.language}
                />
              </div>
              <TopCustomersTable
                rows={data.sales.top_customers}
                currency={currency}
                currencySymbol={store.currencySymbol}
                locale={i18n.language}
              />
            </section>
          ) : null}
        </div>
      )}
    </PageShell>
  )
}
