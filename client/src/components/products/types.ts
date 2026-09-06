export type ProductTaxTerm = { id: number; name: string; slug: string }

export type ProductWfcp = {
  purchase_price?: number | null
  purchase_price_min?: number | null
  purchase_price_max?: number | null
  lock_price?: boolean
  retail?: number | null
  retail_min?: number | null
  retail_max?: number | null
  credit?: number | null
  wholesale?: number | null
  installment?: number | null
  settings_currency?: string
}

export type ProductListRow = {
  id: number
  name: string
  sku: string
  type: string
  status: string
  catalog_visibility?: string
  image_url: string
  permalink: string
  date: string | null
  views: number | null
  price: string
  regular: string
  sale: string
  discount_percent: number | null
  stock: number | null
  stock_status: string
  manage_stock: boolean
  brand: ProductTaxTerm | null
  categories: ProductTaxTerm[]
  tags: ProductTaxTerm[]
  wfcp?: ProductWfcp
  marketplace_badges?: string[]
}

export type ProductLookup = {
  categories: ProductTaxTerm[]
  brands: ProductTaxTerm[]
  tags: ProductTaxTerm[]
}

export type ProductColumnId =
  | 'image'
  | 'name'
  | 'sku'
  | 'purchase_price'
  | 'retail'
  | 'installment'
  | 'credit'
  | 'wholesale'
  | 'discount'
  | 'sale'
  | 'stock'
  | 'brand'
  | 'categories'
  | 'tags'
  | 'date'
  | 'views'
  | 'status'
  | 'catalog_visibility'
  | 'type'
  | 'marketplaces'

export type ProductColumnVisibility = Record<ProductColumnId, boolean>

export type ProductFilters = {
  search: string
  category: string
  brand: string
  tag: string
  type: string
  stock_status: string
  status: string
  catalog_visibility: string
  sort: string
  date_from: string
  date_to: string
}
