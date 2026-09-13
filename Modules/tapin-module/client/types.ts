export type TapinMethods = {
  pishtaz: boolean
  vip: boolean
  tipax: boolean
  courier: boolean
  tipax_api: boolean
  alonomic: boolean
}

export type TapinSettings = {
  enabled: boolean
  token: string
  shop_id: string
  shop_title: string
  gateway: 'tapin' | 'posteketab'
  show_credit: boolean
  use_pws_formula: boolean
  content_type: number
  tipax_pickup_type: number
  tipax_delivery_type: number
  origin_province_code: number
  origin_city_code: number
  auto_register: boolean
  auto_register_status: string
  register_type: number
  default_pay_type: number
  default_order_type: number
  has_insurance: boolean
  employee_code: number
  methods: TapinMethods
  courier_base_price: number
  courier_per_kg: number
  free_shipping_min: number
  rate_extra_percent: number
  rate_extra_fixed: number
  box_id_map: Record<string, number>
  default_box_id: number
  default_kiosk_id: number
  notify_customer_link: boolean
}

export type TapinShop = { id: string; title: string }

export type LocItem = { code: number; title: string }

export type TariffRow = {
  min_weight_g: number
  max_weight_g: number
  price: number
  province_code: number
}

export type TapinTariffs = {
  pishtaz: TariffRow[]
  vip: TariffRow[]
  tipax: TariffRow[]
  tipax_api?: TariffRow[]
  alonomic?: TariffRow[]
}

export type PackingBox = { id: number; title: string }

export type TapinShipment = {
  barcode: string
  order_id: string
  status: number
  status_label?: string
  province_code: number
  city_code: number
  connected: boolean
  auto_register: boolean
  box_id?: number
  content_type?: number
  weight?: number
  packet_type?: number
  kiosk_id?: number
  packing_boxes?: PackingBox[]
}
