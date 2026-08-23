export type BrandRow = {
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
  seo?: {
    title?: string
    description?: string
    focus_keyword?: string
    facebook_title?: string
    facebook_description?: string
    schema_type?: string
  }
}

export type BrandColumnId = 'image' | 'name' | 'slug' | 'parent' | 'count' | 'views'

export type BrandColumnVisibility = Record<BrandColumnId, boolean>

export type BrandFormState = {
  name: string
  slug: string
  parent: number
  description: string
  thumbnail_id: number
  thumbnail_url: string
  seo: {
    title: string
    description: string
    focus_keyword: string
  }
}
