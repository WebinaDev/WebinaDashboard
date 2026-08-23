import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { PageShell } from '@/components/PageShell'
import { cn } from '@/lib/utils'

export type SettingsNavItem = {
  id: string
  to: string
  labelKey: string
  /** When set, shown instead of t(labelKey) — for dynamic marketplace module titles. */
  label?: string
  end?: boolean
}

type SettingsSectionLayoutProps = {
  titleKey: string
  descriptionKey?: string
  eyebrowKey?: string
  navItems: SettingsNavItem[]
  /** Optional block above the main content (e.g. module cards). */
  modulesSlot?: ReactNode
  children: ReactNode
}

/** Legacy layout — horizontal section chips only (no vertical sidebar). Prefer SettingsModulesChrome. */
export function SettingsSectionLayout({
  titleKey,
  descriptionKey,
  eyebrowKey,
  navItems,
  modulesSlot,
  children,
}: SettingsSectionLayoutProps) {
  const { t } = useTranslation()

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    cn(
      'shrink-0 snap-start rounded-xl px-3.5 py-2 text-sm whitespace-nowrap transition-colors',
      isActive
        ? 'bg-primary/10 font-medium text-primary'
        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
    )

  return (
    <PageShell
      title={t(titleKey)}
      description={descriptionKey ? t(descriptionKey) : undefined}
      eyebrow={eyebrowKey ? t(eyebrowKey) : undefined}
    >
      <div className="flex w-full min-w-0 flex-col gap-4">
        {modulesSlot}
        <nav
          className="wd-settings-tabs-scroll flex w-full min-w-0 gap-1.5 overflow-x-auto overscroll-x-contain touch-pan-x border-b border-border pb-2 snap-x snap-mandatory"
          aria-label={t('settings.sectionNav')}
        >
          {navItems.map((item) => {
            const translated = t(item.labelKey, { defaultValue: '' })
            const label = translated || item.label || t(item.labelKey)
            return (
              <NavLink key={item.id} to={item.to} className={linkCls} end={item.end ?? false}>
                {label}
              </NavLink>
            )
          })}
        </nav>
        <div className="min-w-0 space-y-4">{children}</div>
      </div>
    </PageShell>
  )
}
