import type { SettingsNavItem } from '@/layouts/SettingsSectionLayout'

/** Core WooCommerce / store settings only (modules live in the card strip). */
export function shopCoreNavItems(): SettingsNavItem[] {
  return [
    { id: 'general', to: '/settings/shop/general', labelKey: 'settings.shop.sections.general' },
    { id: 'products', to: '/settings/shop/products', labelKey: 'settings.shop.sections.products' },
    { id: 'tax', to: '/settings/shop/tax', labelKey: 'settings.shop.sections.tax' },
    { id: 'shipping', to: '/settings/shop/shipping', labelKey: 'settings.shop.sections.shipping' },
    { id: 'payments', to: '/settings/shop/payments', labelKey: 'settings.shop.sections.payments' },
    { id: 'invoices', to: '/settings/shop/invoices', labelKey: 'settings.shop.sections.invoices' },
    { id: 'sms', to: '/settings/shop/sms', labelKey: 'settings.shop.sections.sms' },
    { id: 'bots', to: '/settings/shop/bots', labelKey: 'settings.shop.sections.bots' },
    { id: 'emails', to: '/settings/shop/emails', labelKey: 'settings.shop.sections.emails' },
    { id: 'advanced', to: '/settings/shop/advanced', labelKey: 'settings.shop.sections.advanced' },
  ]
}

/** @deprecated Use shopCoreNavItems — marketplace modules are in the card strip. */
export function shopNavItems(): SettingsNavItem[] {
  return shopCoreNavItems()
}

/** @deprecated Use shopCoreNavItems */
export function shopNavItemsWithModules(): SettingsNavItem[] {
  return shopCoreNavItems()
}
