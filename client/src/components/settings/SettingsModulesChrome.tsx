import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { SettingsModuleCardStrip } from '@/components/settings/SettingsModuleCardStrip'
import { SettingsModuleTabs } from '@/components/settings/SettingsModuleTabs'
import { PageShell } from '@/components/PageShell'
import {
  activeSectionForPath,
  allSettingsUnits,
  findModuleGroupByPath,
} from '@/lib/settingsModules'

type SettingsModulesChromeProps = {
  children: ReactNode
  titleKey?: string
  descriptionKey?: string
  eyebrowKey?: string
}

/**
 * Unified settings chrome: horizontal card strip (site + shop + modules) + horizontal tabs.
 * No vertical sidebar nav.
 */
export function SettingsModulesChrome({
  children,
  titleKey,
  descriptionKey,
  eyebrowKey = 'settings.hub.title',
}: SettingsModulesChromeProps) {
  const { t } = useTranslation()
  const loc = useLocation()
  const groups = useMemo(() => allSettingsUnits(), [])
  const activeGroup = useMemo(() => findModuleGroupByPath(groups, loc.pathname), [groups, loc.pathname])
  const activeSection = activeGroup ? activeSectionForPath(activeGroup, loc.pathname) : undefined
  const stripGroups = useMemo(
    () => groups.filter((g) => g.parentSlug !== 'wnc-core-module'),
    [groups],
  )
  const stripActiveSlug =
    activeGroup?.parentSlug === 'wnc-core-module' ? 'wnc-core-module' : activeGroup?.moduleSlug

  const resolvedTitleKey =
    titleKey ??
    (activeGroup?.moduleSlug === 'site-core'
      ? 'settings.site.title'
      : activeGroup?.moduleSlug === 'shop-core'
        ? 'settings.shop.title'
        : activeGroup?.titleKey ?? 'settings.hub.title')

  const resolvedDescriptionKey =
    descriptionKey ??
    (activeGroup?.moduleSlug === 'site-core'
      ? 'settings.site.description'
      : activeGroup?.moduleSlug === 'shop-core'
        ? 'settings.shop.description'
        : 'settings.modules.activeHint')

  return (
    <PageShell
      title={t(resolvedTitleKey, {
        defaultValue: activeGroup?.title ?? t('settings.hub.title'),
      })}
      description={t(resolvedDescriptionKey)}
      eyebrow={eyebrowKey ? t(eyebrowKey) : undefined}
    >
      <div className="flex w-full min-w-0 flex-col gap-4">
        <SettingsModuleCardStrip groups={stripGroups} activeModuleSlug={stripActiveSlug} />
        {activeGroup ? (
          <>
            <SettingsModuleTabs
              sections={activeGroup.sections}
              activeRoute={activeSection?.route ?? loc.pathname}
              alwaysShow={activeGroup.kind === 'core' || activeGroup.sections.length > 1}
            />
            <div className="min-w-0">{children}</div>
          </>
        ) : (
          <div className="min-w-0 space-y-3">
            <p className="text-muted-foreground text-sm">{t('settings.modules.pickHint')}</p>
            {children}
          </div>
        )}
      </div>
    </PageShell>
  )
}
