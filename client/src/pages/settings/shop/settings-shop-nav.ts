import type { SettingsNavItem } from '@/layouts/SettingsSectionLayout'
import { marketplaceSettingsSectionsFromBootstrap } from '@/lib/marketplace-api'

export function shopNavItems(): SettingsNavItem[] {
  return shopNavItemsWithModules()
}

export function shopNavItemsWithModules(): SettingsNavItem[] {
  const items: SettingsNavItem[] = [
    { id: 'general', to: '/settings/shop/general', labelKey: 'settings.shop.sections.general' },
    { id: 'products', to: '/settings/shop/products', labelKey: 'settings.shop.sections.products' },
    { id: 'tax', to: '/settings/shop/tax', labelKey: 'settings.shop.sections.tax' },
    { id: 'shipping', to: '/settings/shop/shipping', labelKey: 'settings.shop.sections.shipping' },
    { id: 'payments', to: '/settings/shop/payments', labelKey: 'settings.shop.sections.payments' },
    { id: 'invoices', to: '/settings/shop/invoices', labelKey: 'settings.shop.sections.invoices' },
    { id: 'sms', to: '/settings/shop/sms', labelKey: 'settings.shop.sections.sms' },
    { id: 'emails', to: '/settings/shop/emails', labelKey: 'settings.shop.sections.emails' },
    { id: 'advanced', to: '/settings/shop/advanced', labelKey: 'settings.shop.sections.advanced' },
  ]
  if (window.webinoDashboard.flags?.wfcp) {
    items.push({ id: 'pricing', to: '/settings/shop/pricing/dashboard', labelKey: 'settings.shop.sections.pricing' })
  }
  for (const sec of marketplaceSettingsSectionsFromBootstrap()) {
    if (sec.area !== 'shop') continue
    const to = sec.route.startsWith('/') ? sec.route : `/settings/shop/ext/${sec.slug}`
    if (items.some((i) => i.id === sec.slug || i.to === to)) continue
    items.push({ id: sec.slug, to, labelKey: `marketplace.module.${sec.slug}`, label: sec.title })
  }
  return items
}
