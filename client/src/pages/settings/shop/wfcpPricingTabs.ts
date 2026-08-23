export const WFCP_MARKETPLACE_CHANNELS = [
  'digikala',
  'basalam',
  'technolife',
  'snappshop',
  'tapsishop',
] as const

export const WFCP_SEARCH_CHANNELS = ['zarehbin', 'emalls', 'snapppay-search', 'torob'] as const

export const WFCP_SETTINGS_TABS = [
  'dashboard',
  'exchange',
  'retail',
  'credit',
  'installment',
  'wholesale',
  'marketplaces',
  'search-engines',
  'notifications',
  'style',
  'advanced',
] as const

export type WfcpSettingsTab = (typeof WFCP_SETTINGS_TABS)[number]
export type WfcpMarketplaceChannel = (typeof WFCP_MARKETPLACE_CHANNELS)[number]
export type WfcpSearchChannel = (typeof WFCP_SEARCH_CHANNELS)[number]
export type WfcpChannelSlug = WfcpMarketplaceChannel | WfcpSearchChannel

const MARKETPLACE_SET = new Set<string>(WFCP_MARKETPLACE_CHANNELS)
const SEARCH_SET = new Set<string>(WFCP_SEARCH_CHANNELS)
const TAB_SET = new Set<string>(WFCP_SETTINGS_TABS)

export function resolveWfcpPricingTab(tab: string | undefined): WfcpSettingsTab {
  const safe = tab && /^[a-z0-9-]+$/.test(tab) ? tab : 'dashboard'
  if (MARKETPLACE_SET.has(safe) || safe === 'platform') return 'marketplaces'
  if (SEARCH_SET.has(safe)) return 'search-engines'
  if (safe === 'currency') return 'exchange'
  if (TAB_SET.has(safe)) return safe as WfcpSettingsTab
  return 'dashboard'
}

export function isWfcpCompareChannel(slug: string): boolean {
  return SEARCH_SET.has(slug)
}
