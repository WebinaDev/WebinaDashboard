export type PackagingBox = {
  size: number
  length: number
  width: number
  height: number
  price: number
  tare_weight_g: number
  enabled: boolean
}

export type PackagingSettings = {
  add_packaging_cost_to_checkout: boolean
  fill_factor: number
  boxes: Record<string, PackagingBox>
  professional_fee_enabled: boolean
  professional_fee_label: string
  professional_fee_description: string
  professional_fee_amount: number
  professional_fee_default_selected: boolean
  professional_fee_replaces_carton: boolean
  professional_fee_mandatory: boolean
}

export type PackagingPlanBox = {
  size: number
  length: number
  width: number
  height: number
  price: number
  item_ids?: string[]
  oversized?: boolean
}

export type PackagingPlan = {
  boxes: PackagingPlanBox[]
  box_count: number
  total_packaging_cost: number
  oversized?: boolean
  add_to_checkout?: boolean
  unit_count?: number
}

export type ProfessionalPackagingFee = {
  selected: boolean
  label: string
  amount: number
}
