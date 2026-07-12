import { apiFetch } from '@/lib/api'
import { ApiError } from '@/lib/apiError'

export interface MarketplaceCategory {
  id: number
  slug: string
  name: string
  sort?: number
}

export interface MarketplaceModule {
  id: number
  slug: string
  name: string
  description?: string
  readme_md?: string
  icon_url?: string
  detail_url?: string
  category_slug?: string
  category_name?: string
  parent_slug?: string | null
  parent_name?: string | null
  catalog_status?: string
  price: number
  currency?: string
  is_free?: boolean
  is_builtin?: boolean
  owned?: boolean
  installed?: boolean
  active?: boolean
  version?: string
  latest_version?: string
  latest_updated_at?: string | null
  latest_changelog?: string
  package_available?: boolean
  installed_version?: string
  update_available?: boolean
  settings_area?: string
  settings_route?: string
}

export interface MarketplaceCatalog {
  categories: MarketplaceCategory[]
  modules: MarketplaceModule[]
  unavailable?: boolean
  stale?: boolean
  debug?: {
    crm_categories_ok?: boolean
    crm_modules_ok?: boolean
    elapsed_ms?: number
    domain?: string
  }
}

export interface MarketplaceInstalled {
  modules: MarketplaceModule[]
  entitlements: { module_slug: string; module_name?: string }[]
}

export interface MarketplaceSettingsSection {
  slug: string
  title: string
  area: 'site' | 'shop'
  route: string
}

export interface MarketplaceInstallJobStatus {
  job_id: string
  status: string
  step: string
  slug?: string
  message?: string
  ok?: boolean
  version?: string
  debug?: Record<string, unknown>
}

export type InstallProgressCallback = (status: MarketplaceInstallJobStatus) => void

const INSTALL_POLL_INTERVAL_MS = 2_000
/** Allow long CRM download + unzip (download_url timeout is 300s server-side). */
const INSTALL_POLL_MAX_MS = 600_000

export function installStepLabelKey(step: string) {
  return `marketplace.installStep.${step}`
}

export function fetchInstallJobStatus(jobId: string) {
  return apiFetch<MarketplaceInstallJobStatus>(`marketplace/install-status/${jobId}`, {}, 15_000)
}

export type InstallPollTimeoutError = ApiError & {
  step?: string
  stuckWorker?: boolean
  debug?: Record<string, unknown>
}

export async function pollInstallJob(
  jobId: string,
  onProgress?: InstallProgressCallback,
): Promise<{ ok: boolean; version?: string }> {
  const deadline = Date.now() + INSTALL_POLL_MAX_MS
  let lastStatus: MarketplaceInstallJobStatus | null = null
  while (Date.now() < deadline) {
    const status = await fetchInstallJobStatus(jobId)
    lastStatus = status
    onProgress?.(status)
    if (status.status === 'success' && status.ok) {
      return { ok: true, version: status.version }
    }
    if (status.status === 'failed') {
      const msg = status.message?.trim() || ''
      throw new ApiError(msg, { code: 'install_failed', status: 500 })
    }
    await new Promise((resolve) => window.setTimeout(resolve, INSTALL_POLL_INTERVAL_MS))
  }
  const step = lastStatus?.step ?? 'unknown'
  const err = new ApiError('', { code: 'install_timeout', status: 504 }) as InstallPollTimeoutError
  err.step = step
  err.stuckWorker = step === 'queued'
  if (lastStatus?.debug) {
    err.debug = lastStatus.debug
    console.error('[marketplace install timeout]', step, lastStatus.debug)
  }
  throw err
}

export function fetchMarketplaceCatalog() {
  return apiFetch<MarketplaceCatalog>('marketplace/catalog', {}, 30_000)
}

export function fetchMarketplaceModuleDetail(slug: string) {
  return apiFetch<{ ok: boolean; module: MarketplaceModule }>(
    `marketplace/module/${encodeURIComponent(slug)}`,
    {},
    30_000,
  )
}

export function fetchMarketplaceInstalled() {
  return apiFetch<MarketplaceInstalled>('marketplace/installed')
}

export async function installMarketplaceModule(
  slug: string,
  version?: string,
  onProgress?: InstallProgressCallback,
) {
  const body = version ? JSON.stringify({ version }) : '{}'
  const start = await apiFetch<{ job_id: string; status: string }>(
    `marketplace/install/${slug}`,
    {
      method: 'POST',
      headers: version ? { 'Content-Type': 'application/json' } : undefined,
      body,
    },
    15_000,
  )
  if (!start.job_id) {
    throw new ApiError('', { code: 'install_job_start_failed', status: 500 })
  }
  return pollInstallJob(start.job_id, onProgress)
}

export function uninstallMarketplaceModule(slug: string) {
  return apiFetch<{ ok: boolean }>(`marketplace/uninstall/${slug}`, { method: 'POST', body: '{}' })
}

export function toggleMarketplaceModule(slug: string, active: boolean) {
  return apiFetch<{ ok: boolean; active: boolean }>(`marketplace/toggle/${slug}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ active }),
  })
}

export function fetchPurchaseUrl(slug: string) {
  return apiFetch<{ payment_url?: string; owned?: boolean; is_free?: boolean }>(`marketplace/purchase-url/${slug}`)
}

export function verifyMarketplacePurchase(body: {
  authority?: string
  status?: string
  module_slug: string
  order_id?: number
}) {
  return apiFetch<{ ok: boolean; owned?: boolean }>('marketplace/purchase-verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export function marketplaceSettingsSectionsFromBootstrap(): MarketplaceSettingsSection[] {
  const raw =
    window.webinoDashboard.marketplaceSettingsSections ??
    window.webinoDashboard.bootstrap?.marketplaceSettingsSections
  return Array.isArray(raw) ? (raw as MarketplaceSettingsSection[]) : []
}
