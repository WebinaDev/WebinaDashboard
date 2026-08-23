export type ReportInterval = 'day' | 'week' | 'month'

export type ReportPreset =
  | 'today'
  | 'yesterday'
  | 'last7'
  | 'last30'
  | 'thisWeek'
  | 'lastWeek'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisYear'
  | 'custom'

export type OrderReportSummary = {
  revenue: number
  net_revenue: number
  refunds: number
  refund_count: number
  order_count: number
  avg_order_value: number
  items_sold: number
  discount_total: number
  shipping_total: number
  tax_total: number
  cogs: number
  gross_profit: number
  gross_margin_pct: number
  items_missing_cost: number
  wfcp_enabled: boolean
  new_customers?: number
  returning_customers?: number
  items_per_order?: number
  target_margin_pct?: number
}

export type OrderReportSeriesPoint = {
  key: string
  label: string
  revenue: number
  orders: number
  items: number
  cogs: number
  profit: number
  refunds?: number
  coupons?: number
  net?: number
  tax?: number
  shipping?: number
}

export type OrderReportStatusRow = {
  status: string
  label: string
  count: number
  revenue: number
}

export type OrderReportPaymentRow = {
  method: string
  title: string
  count: number
  revenue: number
  cogs?: number
  profit?: number
  margin_pct?: number
  avg_order_value?: number
}

export type OrderReportSourceRow = {
  source: string
  count: number
  revenue: number
}

export type OrderReportUtmDimRow = {
  source?: string
  medium?: string
  campaign?: string
  count: number
  revenue: number
  cogs: number
  profit: number
  margin_pct: number
  avg_order_value: number
}

export type OrderReportUtmComboRow = {
  source: string
  medium: string
  campaign: string
  count: number
  revenue: number
  cogs: number
  profit: number
  margin_pct: number
  avg_order_value: number
}

export type OrderReportOrderLite = {
  id: number
  number: string
  date: string | null
  status: string
  status_label: string
  total: number
  payment_method: string
  payment_title: string
  utm_source: string
  utm_medium: string
  utm_campaign: string
  customer_name: string
}

export type FinancialOrdersFiltered = {
  items: OrderReportOrderLite[]
  total: number
  page: number
  per_page: number
}

export type FinancialReportResponse = OrderReportResponse & {
  by_utm_source?: OrderReportUtmDimRow[]
  by_utm_medium?: OrderReportUtmDimRow[]
  by_utm_campaign?: OrderReportUtmDimRow[]
  by_utm?: OrderReportUtmComboRow[]
  orders_by_payment?: Record<string, OrderReportOrderLite[]>
  orders_by_utm_source?: Record<string, OrderReportOrderLite[]>
  orders_filtered?: FinancialOrdersFiltered
}

export type OrderReportHourRow = {
  hour: number
  orders: number
}

export type OrderReportPriceTierRow = {
  tier: string
  label: string
  count: number
  revenue: number
  cogs: number
  profit: number
  margin_pct: number
}

export type OrderReportHeatmapCell = {
  dow: number
  hour: number
  orders: number
  revenue: number
}

export type OrderReportProductRow = {
  product_id: number
  name: string
  quantity: number
  revenue: number
}

export type OrderReportProductProfitRow = {
  product_id?: number
  variation_id?: number
  term_id?: number
  name: string
  quantity: number
  revenue: number
  cogs: number
  profit: number
  margin_pct: number
  missing_cost: number
  avg_sell_price?: number
  avg_cost?: number
}

export type OrderReportCategoryRow = {
  term_id: number
  name: string
  quantity: number
  revenue: number
  cogs?: number
  profit?: number
  margin_pct?: number
}

export type OrderReportCustomerRow = {
  customer_id: number
  name: string
  email: string
  orders: number
  revenue: number
  aov?: number
  is_new?: boolean
  last_order?: number
}

export type OrderReportCouponRow = {
  code: string
  count: number
  revenue: number
  discount?: number
}

export type OrderReportTaxRow = {
  rate_id: number
  code: string
  label: string
  rate_percent: number
  order_tax: number
  shipping_tax: number
  total: number
  orders: number
}

export type OrderReportDownloadRow = {
  product_id: number
  name: string
  downloads: number
}

export type OrderReportCompare = {
  from: number
  to: number
  from_date: string
  to_date: string
  summary: OrderReportSummary
  series: OrderReportSeriesPoint[]
}

export type OrderReportResponse = {
  currency: string
  from: number
  to: number
  from_date: string
  to_date: string
  interval: ReportInterval
  statuses: string[]
  summary: OrderReportSummary
  series: OrderReportSeriesPoint[]
  by_status: OrderReportStatusRow[]
  by_payment: OrderReportPaymentRow[]
  by_source: OrderReportSourceRow[]
  by_hour: OrderReportHourRow[]
  by_price_tier: OrderReportPriceTierRow[]
  heatmap: OrderReportHeatmapCell[]
  top_products: OrderReportProductRow[]
  top_products_profit: OrderReportProductProfitRow[]
  top_categories: OrderReportCategoryRow[]
  top_customers: OrderReportCustomerRow[]
  top_coupons: OrderReportCouponRow[]
  taxes?: OrderReportTaxRow[]
  downloads?: OrderReportDownloadRow[]
  compare?: OrderReportCompare
  truncated?: boolean
}

export type OrderReportFilters = {
  preset: ReportPreset
  from: Date
  to: Date
  interval: ReportInterval
  compare: boolean
  statuses: string[]
}

export type ReportListResponse<T> = {
  currency: string
  from: number
  to: number
  summary: OrderReportSummary
  series?: OrderReportSeriesPoint[]
  items: T[]
  total: number
  page: number
  per_page: number
  truncated?: boolean
}

export type InventoryReportSummary = {
  sku_count: number
  units_in_stock: number
  outofstock_count: number
  low_stock_count: number
  missing_cost_count: number
  value_purchase: number
  value_retail: number
  value_current: number
  value_wholesale: number
  value_credit: number
  potential_profit: number
  wfcp_enabled: boolean
  target_margin_pct: number
}

export type InventoryReportRow = {
  id: number
  parent_id: number
  name: string
  sku: string
  type: string
  manage_stock: boolean
  stock_qty: number
  stock_status: string
  low_stock_amount: number
  is_low_stock: boolean
  missing_cost: boolean
  prices: Record<string, number>
  values: Record<string, number>
  potential_profit: number
  potential_margin: number
}

export type InventoryReportResponse = {
  currency: string
  summary: InventoryReportSummary
  price_keys: string[]
  items: InventoryReportRow[]
  total: number
  page: number
  per_page: number
  filter: string
}
