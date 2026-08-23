export type AcidityLevel = {
  id: string
  label: string
}

export type CoffeeColors = {
  card_bg: string
  card_text: string
  card_border: string
  track: string
  blend_fill: string
  acidity_line: string
  acidity_dot: string
  caffeine_fill: string
  bitterness_fill: string
  sweetness_fill: string
  body_fill: string
  label: string
  value: string
}

export type CoffeeSettings = {
  placement: 'summary' | 'before_cart' | 'after_cart' | 'before_tabs' | 'after_tabs' | 'none'
  robusta_label: string
  arabica_label: string
  caffeine_unit: string
  scale_min: number
  scale_max: number
  caffeine_max: number
  use_flagcdn: boolean
  acidity_levels: AcidityLevel[]
  colors: CoffeeColors
  font_title: number
  font_label: number
  font_value: number
  radius: number
  gap: number
  bar_height: number
  stroke_width: number
}

export type CoffeeVisible = {
  blend: boolean
  acidity: boolean
  caffeine: boolean
  bitterness: boolean
  sweetness: boolean
  body: boolean
  origin: boolean
}

export type CoffeeProfile = {
  blend_robusta: number
  blend_arabica: number
  acidity: Record<string, number>
  caffeine_mg: number
  bitterness: number
  sweetness: number
  body: number
  pack_weight_g: number
  visible: CoffeeVisible
  origin_ids: number[]
}

export type CoffeeOrigin = {
  id: number
  name: string
  slug: string
  description: string
  count: number
  iso_code: string
  flag_emoji: string
  flag_url: string
  thumbnail_id: number | null
  thumbnail_url: string
  url: string
}

export type CoffeeProductPayload = {
  profile: CoffeeProfile
  settings: CoffeeSettings
  origins: CoffeeOrigin[]
}

export type BlendIdLabel = { id: string; label: string }

export type BlendSuggestion = {
  id: string
  label: string
  arabica: number
  robusta: number
  hint: string
}

export type BlendGuideItem = { title: string; body: string }

export type CoffeeBlendSettings = {
  source: 'profile' | 'category' | 'products'
  category_ids: number[]
  product_ids: number[]
  min_beans: number
  max_beans: number
  default_mode: 'both' | 'simple' | 'advanced'
  price_basis: 'per_kg' | 'pack'
  default_pack_weight_g: number
  holder_product_id: number
  robusta_product_id: number
  arabica_product_id: number
  grind_fee: number
  weights: number[]
  roasts: BlendIdLabel[]
  grind_devices: BlendIdLabel[]
  suggestions: BlendSuggestion[]
  guide: BlendGuideItem[]
}
