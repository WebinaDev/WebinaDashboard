export type SettingsSiteSectionId = 'general' | 'privacy' | 'license' | 'dashboard' | 'modules' | 'bots' | 'system-logs' | 'analytics' | 'sms' | 'notifications'

export type SettingsShopSectionId =
  | 'general'
  | 'products'
  | 'tax'
  | 'shipping'
  | 'payments'
  | 'invoices'
  | 'sms'
  | 'bots'
  | 'emails'
  | 'advanced'
  | 'pricing'

export const SITE_SECTIONS: SettingsSiteSectionId[] = ['general', 'privacy', 'license', 'dashboard', 'modules', 'bots', 'system-logs', 'analytics', 'sms', 'notifications']

export const SHOP_SECTIONS: SettingsShopSectionId[] = [
  'general',
  'products',
  'tax',
  'shipping',
  'payments',
  'invoices',
  'sms',
  'bots',
  'emails',
  'advanced',
  'pricing',
]

export const WC_PRODUCT_SUBSECTIONS = ['', 'inventory', 'downloadable'] as const

export type WcProductSubsection = (typeof WC_PRODUCT_SUBSECTIONS)[number]

export function isSiteSection(s: string | undefined): s is SettingsSiteSectionId {
  return !!s && (SITE_SECTIONS as readonly string[]).includes(s)
}

export function isShopSection(s: string | undefined): s is SettingsShopSectionId {
  return !!s && (SHOP_SECTIONS as readonly string[]).includes(s)
}

/** Maps shop UI section → WooCommerce settings page id. */
export function shopSectionToWcPage(section: SettingsShopSectionId): string | null {
  switch (section) {
    case 'general':
      return 'general'
    case 'products':
      return 'products'
    case 'tax':
      return 'tax'
    case 'shipping':
      return 'shipping'
    case 'payments':
      return 'checkout'
    case 'advanced':
      return 'advanced'
    default:
      return null
  }
}
