import { ModuleDynamicRoute } from '@/components/ModuleDynamicRoute'
import { SettingsSectionLayout } from '@/layouts/SettingsSectionLayout'
import { shopNavItems } from '@/pages/settings/shop/settings-shop-nav'

export default function SettingsShopPricingPage() {
  return (
    <SettingsSectionLayout titleKey="settings.shop.title" descriptionKey="settings.shop.description" navItems={shopNavItems()}>
      <ModuleDynamicRoute slug="wfcp-module" routePath="settings/wfcp-module/:tab" />
    </SettingsSectionLayout>
  )
}
