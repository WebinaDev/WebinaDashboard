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

export type IdLabel = { id: string; label: string }

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
  grinds: IdLabel[]
  roasts: IdLabel[]
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

export type CoffeeFulfillmentTerm = {
  id: number
  slug: string
  name: string
  image_url: string
}

export type CoffeePriceMode = 'none' | 'single' | 'base_mix' | 'shop' | 'economy' | 'custom'

export type CoffeePricePart = { bean_id: string; percent: number }

export type CoffeeProfile = {
  blend_robusta: number
  blend_arabica: number
  acidity: Record<string, number>
  caffeine_mg: number
  bitterness: number
  sweetness: number
  body: number
  pack_weight_g: number
  price_mode: CoffeePriceMode
  price_bean_id: string
  price_mix_id: string
  price_shop_style: 'classic' | 'luxury'
  price_parts: CoffeePricePart[]
  visible: CoffeeVisible
  origin_ids: number[]
}

export type CoffeePricingBean = {
  id: string
  name: string
  kind: 'robusta' | 'arabica'
  green_price: number
  product_id: number
  after_roast?: number
  product_name?: string
  retail_preview?: number
}

export type CoffeePricingBaseMix = {
  id: string
  name: string
  kind: 'robusta' | 'arabica'
  parts: CoffeePricePart[]
  after_roast?: number
  retail_preview?: number
}

export type CoffeeWeightPack = {
  term: string
  label: string
  grams: number
}

export type CoffeePricingSettings = {
  roast_yield: number
  weight_attribute: string
  weight_packs: CoffeeWeightPack[]
  beans: CoffeePricingBean[]
  base_mixes: CoffeePricingBaseMix[]
  shop_styles: {
    classic: { robusta_mix_id: string; arabica_mix_id: string }
    luxury: { robusta_mix_id: string; arabica_mix_id: string }
  }
  economy_beans: { robusta_bean_id: string; arabica_bean_id: string }
}

export type CoffeePricingRecalc = {
  status: string
  total: number
  done: number
  failed: number
  offset: number
  started_at?: string
  updated_at?: string
  finished_at?: string
  errors?: { product_id: number; message: string }[]
}

export type CoffeePricingPayload = {
  settings: CoffeePricingSettings
  beans: CoffeePricingBean[]
  base_mixes: CoffeePricingBaseMix[]
  shop_styles: CoffeePricingSettings['shop_styles']
  economy: {
    robusta_bean_id: string
    arabica_bean_id: string
    robusta_after: number
    arabica_after: number
  }
  recalc: CoffeePricingRecalc
  queued?: { ok: boolean; total: number; queued: boolean }
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
  source: 'pricing' | 'profile' | 'category' | 'products'
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
