import { marketplaceSettingsSectionsFromBootstrap, type MarketplaceSettingsSection } from '@/lib/marketplace-api'
import { SITE_SECTIONS, type SettingsShopSectionId } from '@/lib/settings-nav'

export type SettingsModuleSection = {
  id: string
  /** Fallback / raw title from manifest */
  title: string
  /** i18n key preferred over title when set */
  titleKey?: string
  route: string
  slug: string
}

export type SettingsModuleGroup = {
  moduleSlug: string
  title: string
  titleKey?: string
  area: 'site' | 'shop' | 'core'
  kind: 'core' | 'module'
  parentSlug?: string
  sections: SettingsModuleSection[]
}

const SHOP_CORE_IDS: Exclude<SettingsShopSectionId, 'pricing'>[] = [
  'general',
  'products',
  'tax',
  'shipping',
  'payments',
  'invoices',
  'sms',
  'bots',
  'emails',
  'advanced',
]

function normalizeSection(raw: MarketplaceSettingsSection & {
  moduleSlug?: string
  sectionId?: string
  moduleTitle?: string
}): SettingsModuleSection & { moduleSlug: string; moduleTitle: string; area: 'site' | 'shop'; titleKey?: string } {
  const moduleSlug = (raw.moduleSlug || raw.slug.replace(/-[a-z0-9]+$/i, '') || raw.slug).trim()
  const route = raw.route.startsWith('/') ? raw.route : `/${raw.route}`
  return {
    id: raw.sectionId || raw.slug,
    title: raw.title,
    titleKey: raw.titleKey,
    route,
    slug: raw.slug,
    moduleSlug: raw.moduleSlug || moduleSlug,
    moduleTitle: raw.moduleTitle || raw.title,
    area: raw.area === 'site' ? 'site' : 'shop',
  }
}

function siteCoreGroup(): SettingsModuleGroup {
  return {
    moduleSlug: 'site-core',
    title: 'Site',
    titleKey: 'settings.hub.siteTitle',
    area: 'core',
    kind: 'core',
    sections: SITE_SECTIONS.map((id) => ({
      id,
      title: id,
      titleKey: `settings.site.sections.${id === 'system-logs' ? 'systemLogs' : id}`,
      route: `/settings/site/${id}`,
      slug: `site-${id}`,
    })),
  }
}

function shopCoreGroup(): SettingsModuleGroup {
  return {
    moduleSlug: 'shop-core',
    title: 'Shop',
    titleKey: 'settings.hub.shopTitle',
    area: 'core',
    kind: 'core',
    sections: SHOP_CORE_IDS.map((id) => ({
      id,
      title: id,
      titleKey: `settings.shop.sections.${id}`,
      route: `/settings/shop/${id}`,
      slug: `shop-${id}`,
    })),
  }
}

/** Marketplace modules only (both areas), plus WFCP when enabled. */
export function groupSettingsModules(area?: 'site' | 'shop'): SettingsModuleGroup[] {
  const map = new Map<string, SettingsModuleGroup>()

  for (const raw of marketplaceSettingsSectionsFromBootstrap()) {
    if (area && raw.area !== area) continue
    const parentSlug = (raw.parentSlug || '').trim()
    if (parentSlug === 'payment-module' || raw.moduleSlug === 'payment-module') continue
    const sec = normalizeSection(raw as MarketplaceSettingsSection & {
      moduleSlug?: string
      sectionId?: string
      moduleTitle?: string
    })
    let group = map.get(sec.moduleSlug)
    if (!group) {
      group = {
        moduleSlug: sec.moduleSlug,
        title: sec.moduleTitle,
        titleKey: `marketplace.module.${sec.moduleSlug}`,
        area: sec.area,
        kind: 'module',
        parentSlug: parentSlug || undefined,
        sections: [],
      }
      map.set(sec.moduleSlug, group)
    }
    const sectionId = sec.id
    const titleKey =
      sec.titleKey ||
      (sec.moduleSlug === 'wfcp-module' && sectionId ? `wfcp.tab.${sectionId}` : `marketplace.module.${sec.slug}`)
    group.sections.push({
      id: sec.id,
      title: sec.title,
      titleKey,
      route: sec.route,
      slug: sec.slug,
    })
  }

  if ((!area || area === 'shop') && window.webinoDashboard.flags?.wfcp && !map.has('wfcp-module')) {
    map.set('wfcp-module', {
      moduleSlug: 'wfcp-module',
      title: 'Pricing',
      titleKey: 'settings.shop.sections.pricing',
      area: 'shop',
      kind: 'module',
      sections: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          titleKey: 'wfcp.tab.dashboard',
          route: '/settings/shop/pricing/dashboard',
          slug: 'wfcp-dashboard',
        },
        {
          id: 'exchange',
          title: 'Exchange',
          titleKey: 'wfcp.tab.exchange',
          route: '/settings/shop/pricing/exchange',
          slug: 'wfcp-exchange',
        },
        {
          id: 'retail',
          title: 'Retail',
          titleKey: 'wfcp.tab.retail',
          route: '/settings/shop/pricing/retail',
          slug: 'wfcp-retail',
        },
        {
          id: 'credit',
          title: 'Credit',
          titleKey: 'wfcp.tab.credit',
          route: '/settings/shop/pricing/credit',
          slug: 'wfcp-credit',
        },
        {
          id: 'installment',
          title: 'Installment',
          titleKey: 'wfcp.tab.installment',
          route: '/settings/shop/pricing/installment',
          slug: 'wfcp-installment',
        },
        {
          id: 'wholesale',
          title: 'Wholesale',
          titleKey: 'wfcp.tab.wholesale',
          route: '/settings/shop/pricing/wholesale',
          slug: 'wfcp-wholesale',
        },
        {
          id: 'marketplaces',
          title: 'Marketplaces',
          titleKey: 'wfcp.tab.marketplaces',
          route: '/settings/shop/pricing/marketplaces',
          slug: 'wfcp-marketplaces',
        },
        {
          id: 'search-engines',
          title: 'Search engines',
          titleKey: 'wfcp.tab.search-engines',
          route: '/settings/shop/pricing/search-engines',
          slug: 'wfcp-search-engines',
        },
        {
          id: 'notifications',
          title: 'Notifications',
          titleKey: 'wfcp.tab.notifications',
          route: '/settings/shop/pricing/notifications',
          slug: 'wfcp-notifications',
        },
        {
          id: 'style',
          title: 'Style',
          titleKey: 'wfcp.tab.style',
          route: '/settings/shop/pricing/style',
          slug: 'wfcp-style',
        },
        {
          id: 'advanced',
          title: 'Advanced',
          titleKey: 'wfcp.tab.advanced',
          route: '/settings/shop/pricing/advanced',
          slug: 'wfcp-advanced',
        },
      ],
    })
  }

  return Array.from(map.values()).sort((a, b) => a.title.localeCompare(b.title))
}

/**
 * Full card strip for every settings page: Site + Shop cores, then all modules.
 */
export function allSettingsUnits(): SettingsModuleGroup[] {
  return [siteCoreGroup(), shopCoreGroup(), ...groupSettingsModules()]
}

const SHOP_CORE_PATH =
  /^\/settings\/shop\/(general|products|tax|shipping|payments|invoices|sms|emails|advanced)(\/|$)/
const SITE_CORE_PATH =
  /^\/settings\/site\/(general|privacy|license|dashboard|modules|bots|system-logs|analytics|sms)(\/|$)/

export function findModuleGroupByPath(
  groups: SettingsModuleGroup[],
  pathname: string,
): SettingsModuleGroup | undefined {
  const path = pathname.replace(/\/$/, '') || '/'

  // Core routes win so site/shop tabs stay on site-core / shop-core cards.
  if (SITE_CORE_PATH.test(path)) {
    return groups.find((g) => g.moduleSlug === 'site-core')
  }
  if (SHOP_CORE_PATH.test(path)) {
    return groups.find((g) => g.moduleSlug === 'shop-core')
  }

  if (path === '/settings' || path === '/settings/shop') {
    return groups.find((g) => g.moduleSlug === 'shop-core')
  }
  if (path === '/settings/site') {
    return groups.find((g) => g.moduleSlug === 'site-core')
  }

  const modules = groups.filter((g) => g.kind === 'module')
  for (const g of modules) {
    for (const s of g.sections) {
      const route = s.route.replace(/\/$/, '')
      if (path === route || path.startsWith(route + '/')) {
        return g
      }
    }
    if (path.includes(`/ext/${g.moduleSlug}`)) {
      return g
    }
    const short = `/settings/shop/${g.moduleSlug.replace(/-module$/, '')}`
    if (path === short || path.startsWith(short + '/')) {
      return g
    }
    if (g.moduleSlug.endsWith('-module')) {
      const bare = g.moduleSlug.replace(/-module$/, '')
      const p = `/settings/shop/${bare}`
      if (path === p || path.startsWith(p + '/')) {
        return g
      }
    }
  }

  return undefined
}

export function activeSectionForPath(group: SettingsModuleGroup, pathname: string): SettingsModuleSection {
  const path = pathname.replace(/\/$/, '') || '/'
  const exact = group.sections.find((s) => {
    const route = s.route.replace(/\/$/, '')
    return path === route || path.startsWith(route + '/')
  })
  return exact ?? group.sections[0]
}
