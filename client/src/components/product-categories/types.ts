export type ProductCategoryRow = {
  id: number
  name: string
  slug: string
  description: string
  parent: number
  parent_name: string
  count: number
  thumbnail_id: number | null
  thumbnail_url: string
  views: number | null
  url: string
}

export type ProductCategoryColumnId = 'image' | 'name' | 'slug' | 'parent' | 'count' | 'views'

export type ProductCategoryColumnVisibility = Record<ProductCategoryColumnId, boolean>

export type ProductCategoryFormState = {
  name: string
  slug: string
  parent: number
  description: string
  thumbnail_id: number
  thumbnail_url: string
}
