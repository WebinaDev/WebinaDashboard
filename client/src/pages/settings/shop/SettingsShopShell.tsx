import { lazy, Suspense } from 'react'
import { Navigate, useParams } from 'react-router-dom'

import { SettingsModulesChrome } from '@/components/settings/SettingsModulesChrome'
import { RoutePageSkeleton } from '@/components/skeletons'
import { isShopSection } from '@/lib/settings-nav'

const OrderDocumentsSettingsPanel = lazy(() =>
  import('@/components/settings/OrderDocumentsSettingsPanel').then((m) => ({
    default: m.OrderDocumentsSettingsPanel,
  })),
)
const PaymentHubPanel = lazy(() =>
  import('@/components/settings/PaymentHubPanel').then((m) => ({ default: m.PaymentHubPanel })),
)
const ShippingZonesPanel = lazy(() =>
  import('@/components/settings/ShippingZonesPanel').then((m) => ({ default: m.ShippingZonesPanel })),
)
const WcSettingsSectionPanel = lazy(() =>
  import('@/components/settings/WcSettingsSectionPanel').then((m) => ({ default: m.WcSettingsSectionPanel })),
)

const PRODUCT_SUBSECTIONS = [
  { id: '', labelKey: 'settings.shop.productsGeneral' },
  { id: 'inventory', labelKey: 'settings.shop.productsInventory' },
  { id: 'downloadable', labelKey: 'settings.shop.productsDownloadable' },
]

const NOTIFY_REDIRECT: Record<string, string> = {
  sms: '/settings/site/notifications?tab=sms',
  bots: '/settings/site/notifications?tab=bale',
  emails: '/settings/site/notifications?tab=email',
}

export default function SettingsShopShell() {
  const { section } = useParams<{ section: string }>()

  if (section && NOTIFY_REDIRECT[section]) {
    return <Navigate to={NOTIFY_REDIRECT[section]} replace />
  }

  if (!isShopSection(section) || section === 'pricing') {
    return <Navigate to="/settings/shop/general" replace />
  }

  return (
    <SettingsModulesChrome>
      <Suspense fallback={<RoutePageSkeleton />}>
        {section === 'general' ? <WcSettingsSectionPanel page="general" /> : null}
        {section === 'products' ? (
          <WcSettingsSectionPanel page="products" subsections={PRODUCT_SUBSECTIONS} />
        ) : null}
        {section === 'tax' ? <WcSettingsSectionPanel page="tax" /> : null}
        {section === 'shipping' ? <ShippingZonesPanel /> : null}
        {section === 'payments' ? <PaymentHubPanel /> : null}
        {section === 'invoices' ? <OrderDocumentsSettingsPanel /> : null}
        {section === 'advanced' ? <WcSettingsSectionPanel page="advanced" /> : null}
      </Suspense>
    </SettingsModulesChrome>
  )
}
