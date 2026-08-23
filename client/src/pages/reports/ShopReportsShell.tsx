import { Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { PageShell } from '@/components/PageShell'
import { isShopReportsSection, shopReportsSectionTitleKey } from '@/lib/shop-reports-nav'
import { CategoriesReportPanel } from '@/pages/reports/panels/CategoriesReportPanel'
import { CouponsReportPanel } from '@/pages/reports/panels/CouponsReportPanel'
import { CustomersReportPanel } from '@/pages/reports/panels/CustomersReportPanel'
import { DownloadsReportPanel } from '@/pages/reports/panels/DownloadsReportPanel'
import { FinancialReportPanel } from '@/pages/reports/panels/FinancialReportPanel'
import { OrdersReportPanel } from '@/pages/reports/panels/OrdersReportPanel'
import { OverviewReportPanel } from '@/pages/reports/panels/OverviewReportPanel'
import { ProductsReportPanel } from '@/pages/reports/panels/ProductsReportPanel'
import { RevenueReportPanel } from '@/pages/reports/panels/RevenueReportPanel'
import { SalesReportPanel } from '@/pages/reports/panels/SalesReportPanel'
import { StockReportPanel } from '@/pages/reports/panels/StockReportPanel'
import { TaxesReportPanel } from '@/pages/reports/panels/TaxesReportPanel'
import { VariationsReportPanel } from '@/pages/reports/panels/VariationsReportPanel'

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
      </div>
    </PageShell>
  )
}
