import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { SmsServiceBanner } from '@/components/marketing/SmsServiceBanner'
import { CardGridSkeleton } from '@/components/skeletons'
import { CategoryTabs } from '@/components/marketplace/CategoryTabs'
import { ModuleCard } from '@/components/marketplace/ModuleCard'
import { ModuleDetailDialog } from '@/components/marketplace/ModuleDetailDialog'
import {
  fetchMarketplaceCatalog,
  fetchPurchaseUrl,
  installMarketplaceModule,
  installStepLabelKey,
  type MarketplaceModule,
} from '@/lib/marketplace-api'
import { isAllowedRemoteUrl } from '@/lib/safeUrl'
import { invalidateModuleBundleCache } from '@/lib/moduleRuntime'
import { toastApiError, apiErrorMessage } from '@/lib/apiError'

export default function MarketplacePage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [category, setCategory] = useState('')
  const [busySlug, setBusySlug] = useState<string | null>(null)
  const [installStep, setInstallStep] = useState<string | null>(null)
  const [detailSlug, setDetailSlug] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['marketplace', 'catalog'],
    queryFn: fetchMarketplaceCatalog,
    retry: false,
  })

  const modules = useMemo(() => {
    const list = data?.modules ?? []
    if (!category) return list
    return list.filter((m) => m.category_slug === category)
  }, [data?.modules, category])

  const reload = useCallback(() => {
    void qc.invalidateQueries({ queryKey: ['marketplace'] })
  }, [qc])

  const handleInstall = async (mod: MarketplaceModule, version?: string) => {
    setBusySlug(mod.slug)
    setInstallStep(null)
    try {
      await installMarketplaceModule(mod.slug, version, (status) => setInstallStep(status.step))
      invalidateModuleBundleCache(mod.slug)
      reload()
    } catch (e) {
      toastApiError(t, e)
    } finally {
      setBusySlug(null)
      setInstallStep(null)
    }
  }

  const handleBuy = async (mod: MarketplaceModule) => {
    setBusySlug(mod.slug)
    try {
      const res = await fetchPurchaseUrl(mod.slug)
      if (res.owned || res.is_free) {
        reload()
        return
      }
      if (res.payment_url) {
        if (!isAllowedRemoteUrl(res.payment_url)) {
          toast.error(t('marketplace.error'))
          return
        }
        window.location.assign(res.payment_url)
      }
    } catch (e) {
      toastApiError(t, e)
    } finally {
      setBusySlug(null)
    }
  }

  const openDetails = (mod: MarketplaceModule) => {
    setDetailSlug(mod.slug)
    setDetailOpen(true)
  }

  const catalogBanner =
    data?.stale === true
      ? t('marketplace.catalogStale')
      : data?.unavailable === true
        ? t('marketplace.catalogUnavailable')
        : null

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold">{t('marketplace.title')}</h1>
        <p className="text-muted-foreground text-sm">{t('marketplace.subtitle')}</p>
      </div>

      <CategoryTabs categories={data?.categories ?? []} active={category} onChange={setCategory} />

      {catalogBanner ? (
        <SmsServiceBanner message={catalogBanner} onRetry={() => void refetch()} />
      ) : null}

      {busySlug ? (
        <p className="text-muted-foreground text-sm">
          {installStep
            ? t(installStepLabelKey(installStep), { defaultValue: t('marketplace.installing') })
            : t('marketplace.installing')}
        </p>
      ) : null}

      {isLoading ? <CardGridSkeleton tabs={4} cards={6} /> : null}
      {error ? (
        <div className="space-y-1">
          <p className="text-destructive">{apiErrorMessage(t, error)}</p>
          <p className="text-muted-foreground text-xs">{t('marketplace.errorHint')}</p>
        </div>
      ) : null}

      {import.meta.env.DEV && data?.debug ? (
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer hover:text-foreground">{t('marketplace.debugSummary')}</summary>
          <pre className="mt-2 overflow-auto rounded-md border border-border bg-muted/40 p-2" dir="ltr">
            {JSON.stringify(data.debug, null, 2)}
          </pre>
        </details>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((mod) => (
          <ModuleCard
            key={mod.slug}
            module={mod}
            busy={busySlug === mod.slug}
            installStep={busySlug === mod.slug ? installStep : null}
            onInstall={() => handleInstall(mod)}
            onUpdate={() => handleInstall(mod, mod.latest_version ?? mod.version)}
            onBuy={() => handleBuy(mod)}
            onShowDetails={() => openDetails(mod)}
          />
        ))}
      </div>

      <ModuleDetailDialog
        slug={detailSlug}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open)
          if (!open) setDetailSlug(null)
        }}
        busy={detailSlug != null && busySlug === detailSlug}
        installStep={detailSlug != null && busySlug === detailSlug ? installStep : null}
        onInstall={(mod, version) => void handleInstall(mod, version)}
        onBuy={(mod) => void handleBuy(mod)}
      />
    </div>
  )
}
