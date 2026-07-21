export type DashboardNavGroup = 'content' | 'shop' | 'tools' | 'reports' | 'admin'

export interface DashboardModule {
  id: string
  title: string
  path: string
  capability: string
  icon?: string
  /** Sidebar section key (omit on home). */
  navGroup?: DashboardNavGroup | string
  children?: DashboardModule[]
}

export type ActiveModuleRoute = {
  path: string
  capability: string
  headerTitleKey?: string
  headerParamKeys?: Record<string, string> | string[]
}

export type ActiveModuleClient = {
  slug: string
  entry: string
  routes: ActiveModuleRoute[]
}

export type CoreUpdateInfo = {
  version: string
  latest_version: string
  update_available: boolean
  release_notes?: string
  package_available?: boolean
  license_active?: boolean
  unavailable?: boolean
}

export interface BootstrapPayload {
  modules: DashboardModule[]
  activeModuleClients?: ActiveModuleClient[]
  installedModuleSlugs?: string[]
  coreUpdate?: CoreUpdateInfo
  locale: string
  uiTheme?: string
  uiAccent?: string
  /** User preference: prefer fullscreen when opening dashboard. */
  uiFullscreen?: boolean
  capabilities?: string[]
  user?: { name: string; email: string; avatar?: string }
  site: { name: string; url: string; icon?: string; currency?: string; currency_symbol?: string }
  flags: { woocommerce: boolean; wfcp: boolean }
  license?: {
    active: boolean
    status: string
    message?: string
    expiry?: string | null
    demo?: boolean
    domain?: string
  }
  marketplaceSettingsSections?: {
    slug: string
    title: string
    area: 'site' | 'shop'
    route: string
  }[]
}
