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
  nonce: string
  /** CSRF token for POST /auth/login (guest-safe). */
  loginNonce: string
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
  }
  allowedRemoteHosts?: string[]
  /** Optional server-injected bootstrap snapshot for first paint / placeholderData. */
  bootstrap?: BootstrapPayload
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
