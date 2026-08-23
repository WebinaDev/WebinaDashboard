export type AttributeType = 'select' | 'text' | 'color' | 'image' | 'button'

export type GlobalAttribute = {
  id: number
  label: string
  slug: string
  type: AttributeType
  order_by: string
  has_archives: boolean
  show_swatch_label?: boolean
  taxonomy: string
  term_count: number
}

export type AttributeTerm = {
  id: number
  name: string
  slug: string
  description: string
  menu_order: number
  count: number
  color?: string
  image_id?: number
  image_url?: string
}

export type AttributeFormState = {
  label: string
  slug: string
  type: AttributeType
  order_by: string
  has_archives: boolean
  show_swatch_label: boolean
}

export type AttributeTermFormState = {
  name: string
  slug: string
  description: string
  menu_order: number
  color: string
  image_id: number
  image_url: string
}

export type AttributeGroup = {
  id: string
  name: string
  attribute_ids: number[]
}
