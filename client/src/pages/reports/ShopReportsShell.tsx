import { lazy, Suspense } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { PageShell } from '@/components/PageShell'
import { RoutePageSkeleton } from '@/components/skeletons'
import { isShopReportsSection, shopReportsSectionTitleKey } from '@/lib/shop-reports-nav'

const CategoriesReportPanel = lazy(() =>
  import('@/pages/reports/panels/CategoriesReportPanel').then((m) => ({ default: m.CategoriesReportPanel })),
)
const CouponsReportPanel = lazy(() =>
  import('@/pages/reports/panels/CouponsReportPanel').then((m) => ({ default: m.CouponsReportPanel })),
)
const CustomersReportPanel = lazy(() =>
  import('@/pages/reports/panels/CustomersReportPanel').then((m) => ({ default: m.CustomersReportPanel })),
)
const DownloadsReportPanel = lazy(() =>
  import('@/pages/reports/panels/DownloadsReportPanel').then((m) => ({ default: m.DownloadsReportPanel })),
)
const FinancialReportPanel = lazy(() =>
  import('@/pages/reports/panels/FinancialReportPanel').then((m) => ({ default: m.FinancialReportPanel })),
)
const OrdersReportPanel = lazy(() =>
  import('@/pages/reports/panels/OrdersReportPanel').then((m) => ({ default: m.OrdersReportPanel })),
)
const OverviewReportPanel = lazy(() =>
  import('@/pages/reports/panels/OverviewReportPanel').then((m) => ({ default: m.OverviewReportPanel })),
)
const ProductsReportPanel = lazy(() =>
  import('@/pages/reports/panels/ProductsReportPanel').then((m) => ({ default: m.ProductsReportPanel })),
)
const RevenueReportPanel = lazy(() =>
  import('@/pages/reports/panels/RevenueReportPanel').then((m) => ({ default: m.RevenueReportPanel })),
)
const SalesReportPanel = lazy(() =>
  import('@/pages/reports/panels/SalesReportPanel').then((m) => ({ default: m.SalesReportPanel })),
)
const StockReportPanel = lazy(() =>
  import('@/pages/reports/panels/StockReportPanel').then((m) => ({ default: m.StockReportPanel })),
)
const TaxesReportPanel = lazy(() =>
  import('@/pages/reports/panels/TaxesReportPanel').then((m) => ({ default: m.TaxesReportPanel })),
)
const VariationsReportPanel = lazy(() =>
  import('@/pages/reports/panels/VariationsReportPanel').then((m) => ({ default: m.VariationsReportPanel })),
)

export default function ShopReportsShell() {
  const { section } = useParams<{ section: string }>()
  const { t } = useTranslation()

  if (!isShopReportsSection(section)) {
    return <Navigate to="/reports/overview" replace />
  }

  return (
    <PageShell
      title={t(shopReportsSectionTitleKey(section))}
      description={t('reports.shopDescription')}
    >
      <div className="min-w-0 space-y-4">
        <Suspense fallback={<RoutePageSkeleton />}>
          {section === 'overview' ? <OverviewReportPanel /> : null}
          {section === 'revenue' ? <RevenueReportPanel /> : null}
          {section === 'orders' ? <OrdersReportPanel /> : null}
          {section === 'products' ? <ProductsReportPanel /> : null}
          {section === 'variations' ? <VariationsReportPanel /> : null}
          {section === 'categories' ? <CategoriesReportPanel /> : null}
          {section === 'coupons' ? <CouponsReportPanel /> : null}
          {section === 'taxes' ? <TaxesReportPanel /> : null}
          {section === 'customers' ? <CustomersReportPanel /> : null}
          {section === 'downloads' ? <DownloadsReportPanel /> : null}
          {section === 'stock' ? <StockReportPanel /> : null}
          {section === 'sales' ? <SalesReportPanel /> : null}
          {section === 'financial' ? <FinancialReportPanel /> : null}
        </Suspense>
      </div>
    </PageShell>
  )
}
