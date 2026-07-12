export type WcSettingsField = {
  id?: string
  type: string
  title?: string
  desc?: string
  default?: unknown
  options?: Record<string, string>
}

export type WcSettingsResponse = {
  page: string
  section: string
  sections: Record<string, string>
  fields: WcSettingsField[]
  values: Record<string, unknown>
}

export type ShippingZoneRow = {
  id: number
  name: string
  order: number
  locations: unknown[]
  methods: unknown[]
  method_count: number
}

export type PaymentGatewayRow = {
  id: string
  title: string
  description: string
  enabled: boolean
  fields: WcSettingsField[]
  settings: Record<string, unknown>
}

export type EmailSettingsRow = {
  id: string
  title: string
  description: string
  enabled: boolean
  fields: WcSettingsField[]
  settings: Record<string, unknown>
}
