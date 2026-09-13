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
