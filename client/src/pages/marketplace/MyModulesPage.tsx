import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { CardGridSkeleton } from '@/components/skeletons'
import { ModuleCard } from '@/components/marketplace/ModuleCard'
import { apiErrorMessage, toastApiError } from '@/lib/apiError'
import {
  fetchMarketplaceInstalled,
  installMarketplaceModule,
  installStepLabelKey,
  toggleMarketplaceModule,
  type MarketplaceModule,
} from '@/lib/marketplace-api'

export default function MyModulesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [busySlug, setBusySlug] = useState<string | null>(null)
  const [installStep, setInstallStep] = useState<string | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['marketplace', 'installed'],
    queryFn: fetchMarketplaceInstalled,
  })

  const modules = data?.modules ?? []

  const handleToggle = async (mod: MarketplaceModule, active: boolean) => {
    setBusySlug(mod.slug)
    try {
      await toggleMarketplaceModule(mod.slug, active)
      void qc.invalidateQueries({ queryKey: ['marketplace'] })
    } catch (e) {
      toastApiError(t, e)
    } finally {
      setBusySlug(null)
    }
  }

  const handleUpdate = async (mod: MarketplaceModule) => {
    setBusySlug(mod.slug)
    setInstallStep(null)
    try {
      await installMarketplaceModule(mod.slug, mod.latest_version ?? mod.version, (status) =>
        setInstallStep(status.step),
      )
      void qc.invalidateQueries({ queryKey: ['marketplace'] })
    } catch (e) {
      const debug = e && typeof e === 'object' && 'debug' in e ? (e as { debug?: Record<string, unknown> }).debug : undefined
      if (debug) {
        console.error('[marketplace install]', e, debug)
      }
      toast.error(apiErrorMessage(t, e))
    } finally {
      setBusySlug(null)
      setInstallStep(null)
    }
  }

  const openSettings = (mod: MarketplaceModule) => {
    const route = mod.settings_route?.startsWith('/') ? mod.settings_route : `/settings/shop/ext/${mod.slug}`
    navigate(route)
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold">{t('marketplace.myModulesTitle')}</h1>
        <p className="text-muted-foreground text-sm">{t('marketplace.myModulesSubtitle')}</p>
      </div>

      {isLoading ? <CardGridSkeleton tabs={0} cards={6} /> : null}
      {busySlug ? (
        <p className="text-muted-foreground text-sm">
          {installStep
            ? t(installStepLabelKey(installStep), { defaultValue: t('marketplace.installing') })
            : t('marketplace.installing')}
        </p>
      ) : null}
      {error ? (
        <div className="space-y-1">
          <p className="text-destructive">{apiErrorMessage(t, error)}</p>
          <p className="text-muted-foreground text-xs">{t('marketplace.errorHint')}</p>
        </div>
      ) : null}
      {!isLoading && modules.length === 0 ? (
        <p className="text-muted-foreground">{t('marketplace.noInstalled')}</p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((mod) => (
          <ModuleCard
            key={mod.slug}
            module={mod}
            mode="installed"
            busy={busySlug === mod.slug}
            installStep={busySlug === mod.slug ? installStep : null}
            onToggle={(active) => handleToggle(mod, active)}
            onUpdate={() => handleUpdate(mod)}
            onSettings={() => openSettings(mod)}
          />
        ))}
      </div>
    </div>
  )
}
