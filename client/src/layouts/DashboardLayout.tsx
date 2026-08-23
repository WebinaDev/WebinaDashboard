import { EllipsisVertical, ExternalLink, Maximize, Minimize } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Outlet, useLocation } from 'react-router-dom'

import { AccentMenu } from '@/components/AccentMenu'
import { AppSidebar } from '@/components/app-sidebar'
import { LanguageMenu } from '@/components/LanguageMenu'
import { ThemeMenu } from '@/components/ThemeMenu'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { useBootstrapQuery } from '@/hooks/useBootstrapQuery'
import { normalizeCapabilities } from '@/lib/bootstrapQuery'
import { apiFetch } from '@/lib/api'
import { normalizeAccent } from '@/lib/accent'
import { resolveSiteHeaderTitle } from '@/lib/dashboard-header-title'
import { applyDashboardDocumentSeo } from '@/lib/dashboard-seo'
import {
  flattenNavLabels,
  groupModulesByNavGroup,
  moduleNavTitle,
  navSectionsToSidebar08MainItems,
} from '@/lib/nav-modules'
import { moduleIcon } from '@/lib/module-icons'
import type { NavMainSection } from '@/types/nav'
import { useTheme } from '@/theme/ThemeProvider'

function CloseMobileSidebarOnNavigate() {
  const { pathname } = useLocation()
  const { setOpenMobile } = useSidebar()

  useEffect(() => {
    setOpenMobile(false)
  }, [pathname, setOpenMobile])

  return null
}

export function DashboardLayout() {
  const { t, i18n } = useTranslation()
  const loc = useLocation()
  const { setTheme } = useTheme()
  const bq = useBootstrapQuery()
  const applyBootstrapTheme = useCallback(
    (th?: string) => {
      if (th === 'light' || th === 'dark' || th === 'system') {
        setTheme(th)
      }
    },
    [setTheme],
  )

  useEffect(() => {
    if (bq.data?.uiTheme) applyBootstrapTheme(bq.data.uiTheme)
  }, [bq.data?.uiTheme, applyBootstrapTheme])

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', normalizeAccent(bq.data?.uiAccent))
  }, [bq.data?.uiAccent])

  const groupedNav = useMemo(() => {
    if (bq.data?.modules?.length) {
      return groupModulesByNavGroup(bq.data.modules, t)
    }
    const homeSection: NavMainSection = {
      kind: 'item',
      id: 'home',
      to: '/',
      title: moduleNavTitle(t, 'home', t('nav.overview')),
      icon: moduleIcon('layout-dashboard'),
    }
    return { homeSection, groups: [] as ReturnType<typeof groupModulesByNavGroup>['groups'] }
  }, [bq.data?.modules, t])

  const navSections = useMemo((): NavMainSection[] => {
    const sections: NavMainSection[] = []
    if (groupedNav.homeSection) {
      sections.push(groupedNav.homeSection)
    }
    for (const g of groupedNav.groups) {
      sections.push(...g.sections)
    }
    return sections
  }, [groupedNav])

  const homeNavItem = useMemo(() => {
    if (!groupedNav.homeSection) return undefined
    return navSectionsToSidebar08MainItems([groupedNav.homeSection], loc.pathname)[0]
  }, [groupedNav.homeSection, loc.pathname])

  const navGroups = useMemo(
    () =>
      groupedNav.groups.map((g) => ({
        id: g.id,
        label: g.label,
        items: navSectionsToSidebar08MainItems(g.sections, loc.pathname),
      })),
    [groupedNav.groups, loc.pathname],
  )

  const navLabels = useMemo(() => flattenNavLabels(navSections), [navSections])

  const headerTitle = useMemo(() => {
    return resolveSiteHeaderTitle(loc.pathname, navLabels, t, bq.data?.activeModuleClients)
  }, [loc.pathname, navLabels, t, bq.data?.activeModuleClients])

  const siteName = bq.data?.site?.name ?? t('app.title')

  useEffect(() => {
    const description = t('seo.pageDescription', { page: headerTitle, site: siteName })
    const canonicalUrl = `${window.location.origin}${window.location.pathname}${window.location.search}`
    const icon = bq.data?.site?.icon?.trim()
    applyDashboardDocumentSeo({
      title: `${headerTitle} — ${siteName}`,
      description,
      canonicalUrl,
      ogImageUrl: icon || undefined,
      structuredSite: { name: siteName, url: bq.data?.site?.url ?? window.location.origin + '/' },
    })
  }, [headerTitle, siteName, t, loc.pathname, loc.search, bq.data?.site?.icon, bq.data?.site?.url])

  const [fs, setFs] = useState(false)
  useEffect(() => {
    const h = () => setFs(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', h)
    return () => document.removeEventListener('fullscreenchange', h)
  }, [])

  async function toggleFs() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch {
      /* ignore */
    }
  }

  async function logout() {
    try {
      await apiFetch('auth/logout', { method: 'POST' })
    } catch {
      /* ignore */
    }
    window.location.assign(new URL('login', window.webinoDashboard.baseUrl).href)
  }

  const siteUrl = bq.data?.site?.url ?? '/'
  const userName = bq.data?.user?.name?.trim() || t('nav.userFallback')
  const userEmail = bq.data?.user?.email?.trim() || ''
  const userAvatar = bq.data?.user?.avatar

  const sidebarSide = useMemo(() => (i18n.dir() === 'rtl' ? 'right' : 'left'), [i18n.language])

  const canAdmin = normalizeCapabilities(bq.data?.capabilities).includes('manage_options')
  const singleNavHint =
    bq.isSuccess && navSections.length === 1 && navSections[0].kind === 'item' && !canAdmin
      ? t('nav.singleNavHint')
      : undefined

  return (
    <SidebarProvider>
      <CloseMobileSidebarOnNavigate />
      <AppSidebar
        side={sidebarSide}
        brandTitle={siteName}
        brandSubtitle={t('nav.siteSubtitle')}
        brandTo="/"
        homeNavItem={homeNavItem}
        navGroups={navGroups}
        navLoading={bq.isPending}
        footerHint={singleNavHint}
        user={{ name: userName, email: userEmail || '—', avatar: userAvatar }}
        logoutLabel={t('nav.logout')}
        onLogout={() => void logout()}
      />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 sm:h-16">
          <div className="flex w-full min-w-0 items-center gap-2 px-3 sm:px-4">
            <SidebarTrigger className="-ms-1" />
            <Separator orientation="vertical" className="me-2 hidden data-[orientation=vertical]:h-4 sm:block" />
            <Breadcrumb className="min-w-0 flex-1 overflow-hidden">
              <BreadcrumbList className="flex-nowrap">
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link to="/">{t('nav.overview')}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="min-w-0">
                  <BreadcrumbPage className="truncate">{headerTitle}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ms-auto hidden items-center gap-2 md:flex">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={t('nav.fullscreen')}
                onClick={() => void toggleFs()}
              >
                {fs ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
              </Button>
              <Button variant="outline" size="icon" asChild>
                <a
                  href={siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t('nav.visitSite')}
                >
                  <ExternalLink className="size-4" />
                </a>
              </Button>
              <LanguageMenu />
              <AccentMenu />
              <ThemeMenu />
            </div>
            <div className="ms-auto flex items-center gap-1 md:hidden">
              <ThemeMenu />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="outline" size="icon" aria-label={t('nav.moreActions')}>
                    <EllipsisVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>{t('nav.moreActions')}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => void toggleFs()}>
                    {fs ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
                    {t('nav.fullscreen')}
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href={siteUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-4" />
                      {t('nav.visitSite')}
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <div className="flex flex-col gap-2 px-2 py-1.5">
                    <LanguageMenu />
                    <AccentMenu />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <div className="@container/main wd-app-atmosphere flex min-w-0 flex-1 flex-col gap-3 p-3 pt-0 sm:gap-4 sm:p-4 sm:pt-0">
          {bq.isError ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-destructive text-sm" role="alert">
              {t('errors.restUnavailable')}
            </p>
          ) : null}
          <Outlet />
        </div>
        <footer className="mt-auto border-t px-4 py-3 text-muted-foreground text-xs">
          <p className="text-center md:text-start">{siteName}</p>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  )
}
