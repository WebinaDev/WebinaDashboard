import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { MoneyDisplay } from '@/components/currency/MoneyDisplay'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LazyImage } from '@/components/ui/lazy-image'
import {
  fetchMarketplaceModuleDetail,
  installStepLabelKey,
  type MarketplaceModule,
} from '@/lib/marketplace-api'
import { sanitizeMarkdownUrl, isAllowedRemoteUrl } from '@/lib/safeUrl'
import { formatDisplayDateTime } from '@/lib/date'
import { moduleLatestVersion, moduleVersionLabel } from '@/components/marketplace/module-version'

type Props = {
  slug: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  busy?: boolean
  installStep?: string | null
  onInstall: (mod: MarketplaceModule, version?: string) => void
  onBuy: (mod: MarketplaceModule) => void
}

export function ModuleDetailDialog({
  slug,
  open,
  onOpenChange,
  busy,
  installStep,
  onInstall,
  onBuy,
}: Props) {
  const { t, i18n } = useTranslation()
  const [iconFailed, setIconFailed] = useState(false)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['marketplace', 'module', slug],
    queryFn: () => fetchMarketplaceModuleDetail(slug!),
    enabled: open && Boolean(slug),
  })

  const module = data?.module ?? null

  const priceLabel = useMemo(() => {
    if (!module) return null
    if (module.is_free) return t('marketplace.free')
    return (
      <MoneyDisplay amount={module.price ?? 0} currency={module.currency || 'IRT'} locale={i18n.language} />
    )
  }, [module, t, i18n.language])

  const versionLabel = module ? moduleVersionLabel(module, t) : null
  const installable = module?.package_available !== false
  const showInstall =
    module &&
    (module.owned || module.is_free) &&
    !module.installed &&
    installable
  const showUpdate =
    module &&
    module.installed &&
    (module.update_available ||
      (moduleLatestVersion(module) &&
        module.installed_version &&
        moduleLatestVersion(module) !== module.installed_version))
  const showBuy = module && !module.is_free && !module.owned && !module.installed
  const showInstalled = module && module.installed && !showUpdate

  const busyLabel = busy
    ? installStep
      ? t(installStepLabelKey(installStep), { defaultValue: t('marketplace.installing') })
      : t('marketplace.installing')
    : null

  const iconSrc =
    module?.icon_url && isAllowedRemoteUrl(module.icon_url) ? module.icon_url : ''
  const showIcon = Boolean(iconSrc) && !iconFailed
  const detailUrl =
    module?.detail_url && isAllowedRemoteUrl(module.detail_url) ? module.detail_url : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,720px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        {isLoading ? (
          <div className="text-muted-foreground p-6 text-sm">{t('marketplace.loading')}</div>
        ) : error || !module ? (
          <div className="space-y-3 p-6">
            <p className="text-destructive text-sm">{t('marketplace.detailLoadError')}</p>
            <button
              type="button"
              className="border-input hover:bg-muted rounded-md border px-3 py-1.5 text-sm"
              onClick={() => void refetch()}
            >
              {t('license.retry')}
            </button>
          </div>
        ) : (
          <>
            <DialogHeader className="border-border space-y-3 border-b px-6 py-4 text-start">
              <div className="flex items-start gap-4">
                {showIcon ? (
                  <LazyImage
                    src={iconSrc}
                    alt={module.name || t('a11y.moduleIcon')}
                    className="h-16 w-16 shrink-0 rounded-lg object-cover"
                    onError={() => setIconFailed(true)}
                  />
                ) : (
                  <div className="bg-muted h-16 w-16 shrink-0 rounded-lg" />
                )}
                <div className="min-w-0 flex-1 space-y-2">
                  <DialogTitle className="text-start text-xl">{module.name}</DialogTitle>
                  <div className="flex flex-wrap gap-1">
                    {module.category_name ? (
                      <Badge variant="secondary">{module.category_name}</Badge>
                    ) : null}
                    {module.installed ? (
                      <Badge variant="outline">{t('marketplace.installed')}</Badge>
                    ) : null}
                  </div>
                  {module.description ? (
                    <DialogDescription className="text-start">{module.description}</DialogDescription>
                  ) : null}
                </div>
              </div>
              <div className="text-muted-foreground grid gap-1 text-xs sm:grid-cols-2">
                {versionLabel ? (
                  <p className="text-start" dir="ltr">
                    {versionLabel}
                  </p>
                ) : null}
                <p className="text-start">
                  {t('marketplace.lastUpdated', {
                    date: formatDisplayDateTime(module.latest_updated_at ?? undefined, i18n.language),
                  })}
                </p>
                <p className="text-start">{priceLabel}</p>
                {module.parent_name ? (
                  <p className="text-start">{t('marketplace.submoduleOf', { name: module.parent_name })}</p>
                ) : null}
              </div>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              <h4 className="mb-2 text-sm font-medium">{t('marketplace.readmeHeading')}</h4>
              {module.readme_md?.trim() ? (
                <div className="prose prose-sm dark:prose-invert max-w-none text-start">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} urlTransform={sanitizeMarkdownUrl}>
                    {module.readme_md}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">{module.description || '—'}</p>
              )}
            </div>

            <DialogFooter className="border-border flex-row flex-wrap gap-2 border-t px-6 py-4 sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {detailUrl ? (
                  <a
                    href={detailUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-sm font-medium hover:underline"
                  >
                    {t('marketplace.details')}
                  </a>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {showInstall ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onInstall(module)}
                    className="bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-50"
                  >
                    {busy ? busyLabel : t('marketplace.install')}
                  </button>
                ) : null}
                {showUpdate ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onInstall(module, moduleLatestVersion(module))}
                    className="bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-50"
                  >
                    {busy ? busyLabel : t('marketplace.update')}
                  </button>
                ) : null}
                {showBuy ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onBuy(module)}
                    className="bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-50"
                  >
                    {t('marketplace.buy')}
                  </button>
                ) : null}
                {showInstalled ? (
                  <span className="text-muted-foreground text-sm">{t('marketplace.installed')}</span>
                ) : null}
                {!installable && !module.installed && (module.owned || module.is_free) ? (
                  <span className="text-muted-foreground text-sm">{t('marketplace.packageNotAvailable')}</span>
                ) : null}
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
