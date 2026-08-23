import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Building2, ChevronLeft, ChevronRight, Puzzle, Store } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SettingsModuleGroup } from '@/lib/settingsModules'

type SettingsModuleCardStripProps = {
  groups: SettingsModuleGroup[]
  activeModuleSlug?: string
  className?: string
}

function CardIcon({ group, active }: { group: SettingsModuleGroup; active: boolean }) {
  const cls = cn('size-4', active ? 'text-primary' : 'text-muted-foreground')
  if (group.moduleSlug === 'site-core') return <Building2 className={cls} aria-hidden />
  if (group.moduleSlug === 'shop-core') return <Store className={cls} aria-hidden />
  return <Puzzle className={cls} aria-hidden />
}

export function SettingsModuleCardStrip({ groups, activeModuleSlug, className }: SettingsModuleCardStripProps) {
  const { t } = useTranslation()
  const scrollerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollerRef.current
    if (!el || !activeModuleSlug) return
    const active = el.querySelector<HTMLElement>(`[data-module-slug="${CSS.escape(activeModuleSlug)}"]`)
    active?.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' })
  }, [activeModuleSlug])

  if (groups.length === 0) {
    return null
  }

  const scrollBy = (dir: -1 | 1) => {
    const el = scrollerRef.current
    if (!el) return
    const amount = Math.min(320, el.clientWidth * 0.7)
    const rtl = getComputedStyle(el).direction === 'rtl'
    el.scrollBy({ left: dir * (rtl ? -1 : 1) * amount, behavior: 'smooth' })
  }

  return (
    <div className={cn('w-full min-w-0 space-y-2', className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          {t('settings.modules.stripTitle')}
        </p>
        <div className="flex shrink-0 gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            aria-label={t('settings.modules.scrollPrev')}
            onClick={() => scrollBy(-1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            aria-label={t('settings.modules.scrollNext')}
            onClick={() => scrollBy(1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
      <div
        ref={scrollerRef}
        className="wd-settings-card-scroll flex w-full min-w-0 gap-2.5 overflow-x-auto overscroll-x-contain touch-pan-x pb-2 snap-x snap-mandatory"
        role="list"
        aria-label={t('settings.modules.stripTitle')}
      >
        {groups.filter((g) => g.parentSlug !== 'wnc-core-module').map((g) => {
          const to = g.sections[0]?.route ?? `/settings/shop/ext/${g.moduleSlug}`
          const active = g.moduleSlug === activeModuleSlug
          const label = g.titleKey
            ? t(g.titleKey, { defaultValue: g.title || g.moduleSlug })
            : t(`marketplace.module.${g.moduleSlug}`, { defaultValue: g.title || g.moduleSlug })
          return (
            <NavLink
              key={g.moduleSlug}
              to={to}
              role="listitem"
              data-module-slug={g.moduleSlug}
              className={cn(
                'bg-card hover:bg-accent/40 flex w-[10.5rem] shrink-0 snap-start flex-col gap-2 rounded-2xl border px-3.5 py-3 shadow-sm transition-[box-shadow,border-color,background]',
                active ? 'border-primary/40 ring-primary/20 shadow-lift ring-2' : 'border-border/70',
              )}
            >
              <span
                className={cn(
                  'flex size-9 items-center justify-center rounded-xl',
                  active ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground',
                )}
              >
                <CardIcon group={g} active={active} />
              </span>
              <span className="truncate text-sm font-medium leading-tight">{label}</span>
              <span className="text-muted-foreground truncate text-[11px]">
                {t('settings.modules.sectionCount', { count: g.sections.length })}
              </span>
            </NavLink>
          )
        })}
      </div>
    </div>
  )
}
