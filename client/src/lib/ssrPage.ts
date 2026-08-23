import type { DashboardOverviewResponse } from '@/types/dashboardOverview'

export type SsrPagePayload = {
  path?: string
  route?: string
  generated?: number
  overview?: DashboardOverviewResponse
  siteGeneral?: Record<string, unknown>
  siteSms?: Record<string, unknown>
  shopInvoices?: Record<string, unknown>
  shopSms?: Record<string, unknown>
  wcSettings?: Record<string, unknown>
  paymentGateways?: { gateways?: unknown[] }
  shippingZones?: Record<string, unknown>
  wcEmails?: Record<string, unknown>
}

export function getSsrPage(): SsrPagePayload | undefined {
  const page = window.webinoDashboard?.page
  if (!page || typeof page !== 'object') {
    return undefined
  }
  return page as SsrPagePayload
}

export function getSsrOverview(): DashboardOverviewResponse | undefined {
  return getSsrPage()?.overview
}
