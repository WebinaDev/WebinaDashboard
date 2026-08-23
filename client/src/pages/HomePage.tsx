import { useQuery } from '@tanstack/react-query'
import { lazy, Suspense, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'

import { HomeActionBar } from '@/components/home/HomeActionBar'
import { HomeCommentsQueue } from '@/components/home/HomeCommentsQueue'
import { HomeKpiStrip } from '@/components/home/HomeKpiStrip'
import { HomeMiniCardsStrip } from '@/components/home/HomeMiniCardsStrip'
import { HomeOrdersTable } from '@/components/home/HomeOrdersTable'
import { HomeOverviewSkeleton } from '@/components/home/HomeOverviewSkeleton'
import { HomeProductStatsCard } from '@/components/home/HomeProductStatsCard'
import { HomeProductTable } from '@/components/home/HomeProductTable'
import { QueryErrorState } from '@/components/QueryErrorState'
import { TopCategoriesTable } from '@/components/orders/reports/TopCategoriesTable'
import { TopCustomersTable } from '@/components/orders/reports/TopCustomersTable'
import { Skeleton } from '@/components/ui/skeleton'
import { useBootstrapQuery } from '@/hooks/useBootstrapQuery'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { useStoreCurrency } from '@/hooks/useStoreCurrency'
import { apiFetch } from '@/lib/api'
import { normalizeCapabilities } from '@/lib/bootstrapQuery'
import { formatDisplayDate } from '@/lib/date'
import { getSsrOverview } from '@/lib/ssrPage'
import type { DashboardOverviewPanels, DashboardOverviewResponse } from '@/types/dashboardOverview'

const HomeSalesStatCard = lazy(() =>
  import('@/components/home/HomeSalesStatCard').then((m) => ({ default: m.HomeSalesStatCard })),
)
const HomeTrafficAnalyticsPanel = lazy(() =>
  import('@/components/home/HomeTrafficAnalyticsPanel').then((m) => ({
    default: m.HomeTrafficAnalyticsPanel,
  })),
)
const ProfitChart = lazy(() =>
  import('@/components/orders/reports/ProfitChart').then((m) => ({ default: m.ProfitChart })),
)
const HomeOrdersBreakdown = lazy(() =>
  import('@/components/home/HomeOrdersBreakdown').then((m) => ({ default: m.HomeOrdersBreakdown })),
)

function HomeChartFallback() {
  return <Skeleton className="h-48 w-full rounded-2xl sm:h-64 lg:h-80" />
}

export function HomePage() {
  const { t, i18n } = useTranslation()
  const store = useStoreCurrency()
  const boot = useBootstrapQuery()
  const ssrOverview = useMemo(() => getSsrOverview(), [])
  const overview = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => apiFetch<DashboardOverviewResponse>('dashboard/overview'),
    retry: false,
    initialData: ssrOverview,
    initialDataUpdatedAt: ssrOverview ? Date.now() : undefined,
    staleTime: 90_000,
    refetchOnMount: ssrOverview ? false : true,
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
  const showLoading = overview.isLoading && !overview.data
  const caps = normalizeCapabilities(boot.data?.capabilities)
  const isPortalOnly =
    boot.isSuccess &&
    (caps.includes('webino_account_portal') || caps.includes('webino_partner_portal')) &&
    !caps.includes('edit_shop_orders')

  if (isPortalOnly) {
    return <Navigate to="/account" replace />
  }

  const licenseActive =
    panels?.license?.active ?? boot.data?.license?.active ?? boot.data?.license?.demo ?? false
  const trafficActive = panels?.analytics?.active ?? data?.traffic?.active ?? false
  const trafficOnline = panels?.analytics?.online ?? data?.traffic?.online ?? 0
  const shopActive =
    panels?.woocommerce?.active ?? Boolean(data?.products || data?.sales) ?? false

  return (
    <div className="space-y-5">
      <header className="wd-home-hero relative z-0 space-y-1.5">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          {formatDisplayDate(new Date().toISOString(), i18n.language)}
        </p>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{t('home.welcome')}</h1>
        {boot.data?.site.name ? (
          <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">{boot.data.site.name}</p>
        ) : null}
      </header>

      {showLoading ? (
        <HomeOverviewSkeleton />
      ) : overview.isError && !overview.data ? (
        <QueryErrorState message={overview.error?.message} onRetry={() => void overview.refetch()} />
      ) : (
        <div className="space-y-4 sm:space-y-6">
          <HomeActionBar alerts={data?.alerts} tasks={data?.tasks} locale={i18n.language} />

          <HomeMiniCardsStrip
            panels={panels}
            products={data?.products}
            locale={i18n.language}
            smsRefetch={smsRefetch}
            licenseActive={licenseActive}
            trafficActive={trafficActive}
            trafficOnline={trafficOnline}
            shopActive={shopActive}
          />

          {(hasSection('account') || hasSection('partner')) && (data?.account || data?.partner) ? (
            <section className="space-y-4">
              <h2 className="text-sm font-semibold tracking-tight">{t('home.partner.title')}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="bg-card rounded-2xl border p-4 shadow-sm">
                  <p className="text-muted-foreground text-xs">{t('home.partner.orderCount')}</p>
                  <p className="mt-1 text-2xl font-semibold">{(data.account ?? data.partner)?.order_count}</p>
                </div>
                <div className="bg-card rounded-2xl border p-4 shadow-sm">
                  <p className="text-muted-foreground text-xs">{t('home.partner.lastOrder')}</p>
                  <p className="mt-1 text-sm font-medium">
                    {(data.account ?? data.partner)?.last_order_at
                      ? formatDisplayDate((data.account ?? data.partner)?.last_order_at, i18n.language)
                      : t('home.noOrders')}
                  </p>
                </div>
              </div>
              <HomeOrdersTable
                title={t('home.recentOrders')}
                rows={(data.account ?? data.partner)?.recent_orders ?? []}
                monthLabel=""
                viewAllHref="/account/orders"
                orderHrefBase="/account/orders"
                emptyMessage={t('home.noOrders')}
                currency={currency}
                currencySymbol={store.currencySymbol}
                locale={i18n.language}
              />
            </section>
          ) : null}

          {hasSection('sales') && data?.sales ? (
            <HomeKpiStrip
              summary={data.sales.summary}
              compareSummary={data.sales.compare_summary}
              currency={currency}
              currencySymbol={store.currencySymbol}
              locale={i18n.language}
            />
          ) : null}

          <section className="space-y-2">
            <h2 className="text-sm font-semibold tracking-tight">{t('home.sections.charts')}</h2>
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              {hasSection('sales') && data?.sales ? (
                <Suspense fallback={<HomeChartFallback />}>
                  <HomeSalesStatCard
                    sales={data.sales}
                    currency={currency}
                    currencySymbol={store.currencySymbol}
                    locale={i18n.language}
                  />
                </Suspense>
              ) : null}

              {hasSection('traffic') && data?.traffic ? (
                <Suspense fallback={<HomeChartFallback />}>
                  <HomeTrafficAnalyticsPanel traffic={data.traffic} locale={i18n.language} />
                </Suspense>
              ) : null}

              {hasSection('sales') && data?.sales ? (
                <Suspense fallback={<HomeChartFallback />}>
                  <ProfitChart
                    series={data.sales.series}
                    compareSeries={data.sales.compare_series}
                    locale={i18n.language}
                  />
                </Suspense>
              ) : null}

              {hasSection('products') && data?.products ? (
                <HomeProductStatsCard stats={data.products} locale={i18n.language} />
              ) : null}
            </div>
          </section>

          {hasSection('sales') && data?.sales ? (
            <Suspense fallback={<HomeChartFallback />}>
              <HomeOrdersBreakdown
                locale={i18n.language}
                byStatus={data.sales.by_status ?? []}
                byPayment={data.sales.by_payment ?? []}
                byHour={data.sales.by_hour ?? []}
              />
            </Suspense>
          ) : null}

          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
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

          {hasSection('sales') && data?.sales ? (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold tracking-tight">{t('home.sections.lists')}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
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
                  viewAllHref="/reports/overview"
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
              <div className="min-w-0 overflow-x-auto rounded-2xl">
                <TopCustomersTable
                  rows={data.sales.top_customers}
                  currency={currency}
                  currencySymbol={store.currencySymbol}
                  locale={i18n.language}
                />
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  )
}
