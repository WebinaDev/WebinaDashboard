import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'
import type { SettingsModuleSection } from '@/lib/settingsModules'

type SettingsModuleTabsProps = {
  sections: SettingsModuleSection[]
  activeRoute?: string
  className?: string
  /** Show even when only one section */
  alwaysShow?: boolean
}

export function SettingsModuleTabs({
  sections,
  activeRoute,
  className,
  alwaysShow = false,
}: SettingsModuleTabsProps) {
  const { t } = useTranslation()

  if (sections.length === 0) return null
  if (!alwaysShow && sections.length <= 1) return null

  const path = (activeRoute ?? '').replace(/\/$/, '')

  return (
    <nav
      className={cn(
        'wd-settings-tabs-scroll flex w-full min-w-0 gap-1 overflow-x-auto overscroll-x-contain touch-pan-x border-b border-border pb-px snap-x snap-mandatory',
        className,
      )}
      aria-label={t('settings.modules.tabsLabel')}
    >
      {sections.map((s) => {
        const route = s.route.replace(/\/$/, '')
        const isActive = path === route || path.startsWith(route + '/')
        const label = s.titleKey ? t(s.titleKey, { defaultValue: s.title }) : s.title
        return (
          <NavLink
            key={s.id}
            to={s.route}
            className={cn(
              'shrink-0 snap-start border-b-2 px-3.5 py-2.5 text-sm whitespace-nowrap transition-colors',
              isActive
                ? 'border-primary text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground border-transparent',
            )}
          >
            {label}
          </NavLink>
        )
      })}
    </nav>
  )
}
