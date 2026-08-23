import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { MoneyDisplay } from '@/components/currency/MoneyDisplay'
import { LazyImage } from '@/components/ui/lazy-image'
import { cn } from '@/lib/utils'
import { isAllowedRemoteUrl } from '@/lib/safeUrl'
import type { MarketplaceModule } from '@/lib/marketplace-api'
import { installStepLabelKey } from '@/lib/marketplace-api'
import { moduleLatestVersion, moduleVersionLabel } from '@/components/marketplace/module-version'

type Props = {
  module: MarketplaceModule
  onInstall?: () => void
  onUpdate?: () => void
  onBuy?: () => void
  onToggle?: (active: boolean) => void
  onSettings?: () => void
  onShowDetails?: () => void
  busy?: boolean
  installStep?: string | null
  mode?: 'marketplace' | 'installed'
}

export function ModuleCard({
  module,
  onInstall,
  onUpdate,
  onBuy,
  onToggle,
  onSettings,
  onShowDetails,
  busy,
  installStep,
  mode = 'marketplace',
}: Props) {
  const { t, i18n } = useTranslation()
  const [iconFailed, setIconFailed] = useState(false)
  const busyLabel = busy
    ? installStep
      ? t(installStepLabelKey(installStep), { defaultValue: t('marketplace.installing') })
      : t('marketplace.installing')
    : null
  const priceLabel = module.is_free ? (
    t('marketplace.free')
  ) : (
    <MoneyDisplay amount={module.price ?? 0} currency={module.currency || 'IRT'} locale={i18n.language} />
  )

  const installable = module.package_available !== false
  const showInstall =
    mode === 'marketplace' && (module.owned || module.is_free) && !module.installed && installable
  const showUpdate =
    (mode === 'marketplace' || mode === 'installed') &&
    module.installed &&
    (module.update_available ||
      (moduleLatestVersion(module) &&
        module.installed_version &&
        moduleLatestVersion(module) !== module.installed_version))
  const showBuy = mode === 'marketplace' && !module.is_free && !module.owned && !module.installed
  const showInstalled = mode === 'marketplace' && module.installed && !showUpdate
  const versionLabel = moduleVersionLabel(module, t)
  const iconSrc =
    module.icon_url && isAllowedRemoteUrl(module.icon_url) ? module.icon_url : ''
  const showIcon = Boolean(iconSrc) && !iconFailed
  const displayName = t(`marketplace.module.${module.slug}`, { defaultValue: module.name || module.slug })

  return (
    <article className="border-border bg-card flex flex-col overflow-hidden rounded-xl border shadow-sm">
      <div className="flex flex-1 flex-row gap-4 p-4">
        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="text-lg font-semibold leading-tight">{displayName}</h3>
          {module.parent_name ? (
            <p className="text-muted-foreground text-xs">
              {t('marketplace.submoduleOf', { name: module.parent_name })}
            </p>
          ) : null}
          {module.description ? (
            <p className="text-muted-foreground line-clamp-3 text-sm">{module.description}</p>
          ) : null}
          {versionLabel ? (
            <p className="text-muted-foreground text-xs" dir="ltr">
              {versionLabel}
            </p>
          ) : null}
        </div>
        {showIcon ? (
          <LazyImage
            src={iconSrc}
            alt={displayName || t('a11y.moduleIcon')}
            className="h-20 w-20 shrink-0 rounded-lg object-cover"
            onError={() => setIconFailed(true)}
          />
        ) : (
          <div className="bg-muted h-20 w-20 shrink-0 rounded-lg" />
        )}
      </div>
      <div className="border-border flex flex-wrap items-center justify-between gap-2 border-t px-4 py-3">
        <span className="text-muted-foreground text-sm font-medium">{priceLabel}</span>
        <div className="flex flex-wrap gap-2">
          {mode === 'installed' ? (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => onToggle?.(!module.active)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium',
                  module.active ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground',
                )}
              >
                {module.active ? t('marketplace.disable') : t('marketplace.enable')}
              </button>
              {onSettings ? (
                <button
                  type="button"
                  className="border-input hover:bg-muted rounded-md border px-3 py-1.5 text-sm"
                  onClick={onSettings}
                >
                  {t('marketplace.settings')}
                </button>
              ) : null}
            </>
          ) : null}
          {mode === 'marketplace' &&
          (module.owned || module.is_free) &&
          !module.installed &&
          !installable ? (
            <span
              className="text-muted-foreground text-sm"
              title={t('marketplace.packageNotAvailable')}
            >
              {t('marketplace.packageNotAvailable')}
            </span>
          ) : null}
          {onShowDetails ? (
            <button
              type="button"
              className="border-input hover:bg-muted rounded-md border px-3 py-1.5 text-sm"
              onClick={onShowDetails}
            >
              {t('marketplace.fullDetails')}
            </button>
          ) : null}
          {showInstall ? (
            <button
              type="button"
              disabled={busy}
              onClick={onInstall}
              title={installable ? undefined : t('marketplace.packageNotAvailable')}
              className="bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-50"
            >
              {busy ? busyLabel : t('marketplace.install')}
            </button>
          ) : null}
          {showUpdate ? (
            <button
              type="button"
              disabled={busy}
              onClick={onUpdate ?? onInstall}
              className="bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-50"
            >
              {busy ? busyLabel : t('marketplace.update')}
            </button>
          ) : null}
          {showBuy ? (
            <button
              type="button"
              disabled={busy}
              onClick={onBuy}
              className="bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-50"
            >
              {t('marketplace.buy')}
            </button>
          ) : null}
          {showInstalled ? <span className="text-muted-foreground text-sm">{t('marketplace.installed')}</span> : null}
        </div>
      </div>
    </article>
  )
}
