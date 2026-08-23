export type ProductAttribute = {
  name: string
  options: string[] | number[]
  variation?: boolean
  visible?: boolean
  attribute_id?: number
  taxonomy?: boolean
}

export type ProductTag = { id: number; name: string; slug?: string }

export type GalleryImage = { id: number; url: string }

export type WfcpPlatformPrices = {
  price?: number | null
  lock?: boolean
  manual_price?: number | string | null
}

export type WholesaleRule = {
  discount_percent?: number
  min_qty?: number
  min_weight?: number
  qty_step?: number
  sell_by?: 'unit' | 'weight'
  wholesale_enabled?: boolean
}

export type WholesaleRuleForm = {
  custom: boolean
  wholesale_enabled: boolean
  discount_percent: string
  sell_by: 'unit' | 'weight'
  min_qty: string
  min_weight: string
  qty_step: string
}

export type WfcpPrices = {
  purchase_price?: number | null
  lock_price?: boolean
  retail?: number | null
  credit?: number | null
  wholesale?: number | null
  installment?: number | null
  settings_currency?: string
  marketplace?: Record<string, number | null>
  platforms?: Record<string, WfcpPlatformPrices>
  wholesale_rule?: WholesaleRule | null
}

export type ProductSeo = {
  title?: string
  description?: string
  focus_keyword?: string
  canonical_url?: string
  robots?: string[]
  advanced_robots?: Record<string, string>
  breadcrumb_title?: string
  pillar_content?: boolean
  facebook_title?: string
  facebook_description?: string
  facebook_image?: string
  twitter_title?: string
  twitter_description?: string
  twitter_image?: string
  twitter_card_type?: string
  schema_type?: string
  gtin?: string
  mpn?: string
  isbn?: string
  sku_override?: string
  brand?: string
}

export type IshopCustomLabel = { text: string; color: string }

export type IshopFaq = { question: string; answer: string }

export type ProductIshop = {
  english_name?: string
  shipping_time?: string
  video_url?: string
  video_cover_url?: string
  labels?: Record<string, boolean>
  custom_labels?: IshopCustomLabel[]
  initial_stock_quantity?: string
  ai_review_summary?: string
  faqs?: IshopFaq[]
}

export type Product = {
  id: number
  name: string
  slug?: string
  sku: string
  status: string
  type?: string
  price?: string
  regular?: string
  sale?: string
  description?: string
  short_description?: string
  manage_stock?: boolean
  stock: number | null
  stock_status?: string
  backorders?: string
  image_id?: number
  image_url?: string
  gallery_ids?: number[]
  gallery_urls?: GalleryImage[]
  category_ids?: number[]
  brand_ids?: number[]
  tag_ids?: number[]
  tags?: ProductTag[]
  product_attributes?: ProductAttribute[]
  weight?: string
  length?: string
  width?: string
  height?: string
  catalog_visibility?: string
  featured?: boolean
  upsell_ids?: number[]
  cross_sell_ids?: number[]
  variation_ids?: number[]
  permalink?: string
  permalink_base?: string
  permalink_template?: string
  seo?: ProductSeo
  ishop?: ProductIshop
  rank_math_available?: boolean
  wfcp?: {
    purchase_price?: string | number
    lock_price?: boolean
    wholesale_rule?: WholesaleRule | string | null
    reference_url?: string
    reference_source?: string
    reference_last_sync?: { time?: string; status?: string; message?: string } | string | null
  }
  wfcp_prices?: WfcpPrices
}

export type ProductVariation = {
  id: number
  sku: string
  regular_price: string
  sale_price: string
  price: string
  manage_stock: boolean
  stock_quantity: number | null
  stock_status: string
  image_id: number
  attributes: Record<string, string>
  attribute_labels?: Record<string, { label: string; value: string }>
  status: string
  wfcp?: {
    purchase_price?: number | null
    lock_price?: boolean
    reference_url?: string
    reference_source?: string
    reference_last_sync?: { time?: string; status?: string; message?: string } | string | null
    wholesale_rule?: WholesaleRule | string | null
  }
  wfcp_prices?: {
    purchase_price?: number | null
    lock_price?: boolean
    retail?: number | null
    credit?: number | null
    wholesale?: number | null
    installment?: { price?: number; months?: number } | number | null
  }
}

export type AttributeRow = {
  name: string
  options: string
  variation: boolean
  visible: boolean
  attribute_id?: number
  taxonomy?: boolean
}

export type IshopLabelOption = { key: string; label: string }

export type ProductLookupTerm = {
  id: number
  name: string
  slug?: string
  parent?: number
}

export type ProductLookup = {
  categories: ProductLookupTerm[]
  brands: ProductLookupTerm[]
  tags: { id: number; name: string; slug?: string }[]
  permalink_base?: string
  rank_math_available?: boolean
  ishop_labels?: IshopLabelOption[]
  site_name?: string
  seo_sep?: string
}

export function emptyProductSeo(): ProductSeo {
  return {
    title: '',
    description: '',
    focus_keyword: '',
    canonical_url: '',
    robots: [],
    advanced_robots: {},
    breadcrumb_title: '',
    pillar_content: false,
    facebook_title: '',
    facebook_description: '',
    facebook_image: '',
    twitter_title: '',
    twitter_description: '',
    twitter_image: '',
    twitter_card_type: 'summary_large_image',
    schema_type: 'product',
    gtin: '',
    mpn: '',
    isbn: '',
    sku_override: '',
    brand: '',
  }
}

export function emptyProductIshop(): ProductIshop {
  return {
    english_name: '',
    shipping_time: '',
    video_url: '',
    video_cover_url: '',
    labels: {},
    custom_labels: [],
    initial_stock_quantity: '',
    ai_review_summary: '',
    faqs: [],
  }
}
