import type { TFunction } from 'i18next'

import type { MarketplaceModule } from '@/lib/marketplace-api'

export function moduleLatestVersion(module: MarketplaceModule): string {
  return (module.latest_version ?? module.version ?? '').trim()
}

export function moduleVersionLabel(module: MarketplaceModule, t: TFunction): string | null {
  const latest = moduleLatestVersion(module)
  const installed = (module.installed_version ?? '').trim()
  const hasUpdate =
    module.installed &&
    latest !== '' &&
    installed !== '' &&
    Boolean(module.update_available || latest !== installed)

  if (hasUpdate) {
    return t('marketplace.updateAvailable', { installed, latest })
  }
  if (module.installed && installed) {
    return t('marketplace.installedVersion', { version: installed })
  }
  if (latest) {
    return t('marketplace.latestVersion', { version: latest })
  }
  return null
}
