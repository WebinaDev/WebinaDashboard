/// <reference types="vite/client" />

import type { BootstrapPayload } from './types/modules'

export interface WebinoDashboardConfig {
  version: string
  /** Max filemtime of built entry assets; use for SW / cache bust when chunk names are stable. */
  assetVersion?: string
  baseUrl: string
  assetBase?: string
  homeUrl: string
  restUrl: string
  /** admin-ajax.php URL — fallback when /wp-json is blocked by CDN/WAF. */
  ajaxUrl?: string
  nonce: string
  /** CSRF token for POST /auth/login (guest-safe). */
  loginNonce: string
  /** Public OTP auth flags for login UI. */
  otpAuth?: {
    login_enabled?: boolean
    register_enabled?: boolean
  }
  locale: string
  isLogged: boolean
  userId: number
  /** Public site title from the CMS (login + SEO). */
  siteName?: string
  /** Site icon or bundled favicon for og:image. */
  siteIconUrl?: string
  /** Outbound CRM license snapshot (no secrets). */
  license?: {
    active: boolean
    status: string
    message?: string
    expiry?: string | null
    demo?: boolean
    domain?: string
    nag_since?: number | null
    force_license_page?: boolean
    show_banner?: boolean
    show_unreachable_banner?: boolean
  }
  allowedRemoteHosts?: string[]
  /** Optional server-injected bootstrap snapshot for first paint / placeholderData. */
  bootstrap?: BootstrapPayload
  /** Route-scoped SSR page payload (overview / settings) for zero round-trip first paint. */
  page?: {
    path?: string
    route?: string
    generated?: number
    overview?: import('./types/dashboardOverview').DashboardOverviewResponse
    siteGeneral?: Record<string, unknown>
    siteSms?: Record<string, unknown>
    shopInvoices?: Record<string, unknown>
    shopSms?: Record<string, unknown>
    wcSettings?: Record<string, unknown>
    paymentGateways?: { gateways?: unknown[] }
    shippingZones?: Record<string, unknown>
    wcEmails?: Record<string, unknown>
  }
  marketplaceSettingsSections?: BootstrapPayload['marketplaceSettingsSections']
  /** Mirrors bootstrap `flags` (WooCommerce / WFCP loaded). */
  flags?: {
    woocommerce?: boolean
    wfcp?: boolean
    baleBot?: boolean
    telegramBot?: boolean
    elementor?: boolean
    /** When true, do not register dashboard-sw.js (avoids stale SW after deploy). */
    disableServiceWorker?: boolean
  }
}

declare global {
  interface Window {
    webinoDashboard: WebinoDashboardConfig
  }
}

export {}
