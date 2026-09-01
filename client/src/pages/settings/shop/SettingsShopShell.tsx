import { Navigate, useParams } from 'react-router-dom'

import { OrderDocumentsSettingsPanel } from '@/components/settings/OrderDocumentsSettingsPanel'
import { PaymentHubPanel } from '@/components/settings/PaymentHubPanel'
import { SettingsModulesChrome } from '@/components/settings/SettingsModulesChrome'
import { ShippingZonesPanel } from '@/components/settings/ShippingZonesPanel'
import { WcSettingsSectionPanel } from '@/components/settings/WcSettingsSectionPanel'
import { isShopSection } from '@/lib/settings-nav'

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
      {section === 'general' ? <WcSettingsSectionPanel page="general" /> : null}
      {section === 'products' ? <WcSettingsSectionPanel page="products" subsections={PRODUCT_SUBSECTIONS} /> : null}
      {section === 'tax' ? <WcSettingsSectionPanel page="tax" /> : null}
      {section === 'shipping' ? <ShippingZonesPanel /> : null}
      {section === 'payments' ? <PaymentHubPanel /> : null}
      {section === 'invoices' ? <OrderDocumentsSettingsPanel /> : null}
      {section === 'advanced' ? <WcSettingsSectionPanel page="advanced" /> : null}
    </SettingsModulesChrome>
  )
}
