export type ShopReportsSectionId =
  | 'overview'
  | 'revenue'
  | 'orders'
  | 'products'
  | 'variations'
  | 'categories'
  | 'coupons'
  | 'taxes'
  | 'customers'
  | 'downloads'
  | 'stock'
  | 'sales'
  | 'financial'

export const SHOP_REPORTS_SECTIONS: ShopReportsSectionId[] = [
  'overview',
  'revenue',
  'orders',
  'products',
  'variations',
  'categories',
  'coupons',
  'taxes',
  'customers',
  'downloads',
  'stock',
  'sales',
  'financial',
]

export function isShopReportsSection(s: string | undefined): s is ShopReportsSectionId {
  return !!s && (SHOP_REPORTS_SECTIONS as readonly string[]).includes(s)
}

export function shopReportsSectionTitleKey(section: ShopReportsSectionId): string {
  return `reports.sections.${section}`
}
