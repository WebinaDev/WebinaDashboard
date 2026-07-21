import type { TFunction } from 'i18next'
import { LayoutDashboard, type LucideIcon } from 'lucide-react'

import { moduleIcon } from '@/lib/module-icons'
import type { DashboardModule, DashboardNavGroup } from '@/types/modules'
import type { NavMainSection } from '@/types/nav'

export function routeFromModulePath(path: string): string {
  const p = path.replace(/^\//, '')
  if (p === '') {
    return '/'
  }
  return `/${p}`
}

function stableModuleId(m: DashboardModule): string {
  const id = m.id?.trim()
  if (id) return id
  const raw = routeFromModulePath(m.path).replace(/^\//, '').replace(/\//g, '-') || 'root'
  return raw
}

/** Map current sidebar/manifest IDs to legacy nav.module.* keys when present. */
const NAV_MODULE_ID_ALIASES: Record<string, string> = {
  'wfcp-module-quick': 'wfcp-quick',
  'wfcp-module-bulk': 'wfcp-bulk',
  'wfcp-module-price': 'wfcp-price',
  'analytics-module': 'analytics',
  'analytics-module-overview': 'analytics-overview',
  'analytics-module-visitors': 'analytics-visitors',
  'analytics-module-pages': 'analytics-pages',
  'analytics-module-referrals': 'analytics-referrals',
  'analytics-module-geo': 'analytics-geo',
  'analytics-module-devices': 'analytics-devices',
  'analytics-module-bots': 'analytics-bots',
  'sms-panel-module': 'sms-panel',
  'bale-bot-module': 'bale-bot',
  'telegram-bot-module': 'telegram-bot',
  'bots-bale': 'bale-bot',
  'bots-telegram': 'telegram-bot',
}

export function moduleNavTitle(t: TFunction, id: string, fallback: string): string {
  if (id === 'settings-app') {
    const settings = t('nav.module.settings', { defaultValue: '' })
    if (settings) return settings
  }
  const primary = t(`nav.module.${id}`, { defaultValue: '' })
  if (primary) return primary
  const alias = NAV_MODULE_ID_ALIASES[id]
  if (alias) {
    const aliased = t(`nav.module.${alias}`, { defaultValue: '' })
    if (aliased) return aliased
  }
  return fallback
}

export const NAV_GROUP_ORDER: DashboardNavGroup[] = ['content', 'shop', 'tools', 'reports', 'admin']

export type SidebarNavGroup = {
  id: DashboardNavGroup
  label: string
  sections: NavMainSection[]
}

export type GroupedSidebarNav = {
  homeSection: NavMainSection | null
  groups: SidebarNavGroup[]
}

export function groupModulesByNavGroup(modules: DashboardModule[], t: TFunction): GroupedSidebarNav {
  let homeSection: NavMainSection | null = null
  const byGroup = new Map<DashboardNavGroup, DashboardModule[]>()

  for (const m of modules) {
    if (m.id === 'home' || m.path === '/') {
      const sections = modulesToNavSections([m], t)
      homeSection = sections[0] ?? null
      continue
    }
    const g = (m.navGroup as DashboardNavGroup) || 'content'
    const list = byGroup.get(g) ?? []
    list.push(m)
    byGroup.set(g, list)
  }

  const groups: SidebarNavGroup[] = []
  for (const id of NAV_GROUP_ORDER) {
    const mods = byGroup.get(id)
    if (!mods?.length) continue
    groups.push({
      id,
      label: t(`nav.section.${id}`),
      sections: modulesToNavSections(mods, t),
    })
  }

  return { homeSection, groups }
}

export function modulesToNavSections(modules: DashboardModule[], t: TFunction): NavMainSection[] {
  return modules.map((m) => {
    const groupId = stableModuleId(m)
    if (m.children?.length) {
      const ParentIcon = moduleIcon(m.icon)
      return {
        kind: 'group' as const,
        id: groupId,
        title: moduleNavTitle(t, groupId, m.title),
        icon: ParentIcon,
        children: m.children.map((c) => ({
          id: c.id,
          to: routeFromModulePath(c.path),
          title: moduleNavTitle(t, c.id, c.title),
          icon: moduleIcon(c.icon ?? m.icon),
        })),
      }
    }
    const leafId = m.id?.trim() || groupId
    return {
      kind: 'item' as const,
      id: leafId,
      to: routeFromModulePath(m.path),
      title: moduleNavTitle(t, leafId, m.title),
      icon: moduleIcon(m.icon),
    }
  })
}

export function flattenNavLabels(sections: NavMainSection[]): { to: string; label: string }[] {
  const out: { to: string; label: string }[] = []
  for (const s of sections) {
    if (s.kind === 'item') {
      out.push({ to: s.to, label: s.title })
    } else {
      for (const c of s.children) {
        out.push({ to: c.to, label: c.title })
      }
    }
  }
  return out
}

export type Sidebar08MainNavItem = {
  id: string
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  items?: { id: string; title: string; url: string }[]
}

function pathIsActive(pathname: string, to: string): boolean {
  const p = pathname.replace(/\/$/, '') || '/'
  if (to === '/') return p === '/'
  const t = to.replace(/\/$/, '')
  return p === t || p.startsWith(`${t}/`)
}

/** Maps bootstrap nav sections to shadcn sidebar-08 `NavMain` items (SPA routes). */
export function navSectionsToSidebar08MainItems(
  sections: NavMainSection[],
  pathname: string,
): Sidebar08MainNavItem[] {
  return sections.map((section) => {
    const Icon = section.icon ?? LayoutDashboard
    if (section.kind === 'item') {
      return {
        id: section.id,
        title: section.title,
        url: section.to,
        icon: Icon,
        isActive: pathIsActive(pathname, section.to),
      }
    }
    const childActive = section.children.some((c) => pathIsActive(pathname, c.to))
    return {
      id: section.id,
      title: section.title,
      url: '#',
      icon: Icon,
      isActive: childActive,
      items: section.children.map((c) => ({
        id: c.id,
        title: c.title,
        url: c.to,
      })),
    }
  })
}
