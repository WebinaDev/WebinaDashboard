import { Suspense, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { PermissionGate } from '@/components/PermissionGate'
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary'
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister'
import { PwaSplashOverlay } from '@/components/PwaSplashOverlay'
import { DashboardPrefetch } from '@/components/DashboardPrefetch'
import { RoutePageSkeleton } from '@/components/skeletons'
import { useBootstrapQuery } from '@/hooks/useBootstrapQuery'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { AuthGate } from '@/layouts/AuthGate'
import { LicenseGate } from '@/layouts/LicenseGate'
import { Toaster } from '@/components/ui/sonner'
import { lazyPage } from '@/routes/lazyPage'
import { useModuleDynamicRoutes } from '@/routes/ModuleDynamicRoutes'
import { dashboardRoutes } from '@/routes/routes.config'
import { resolveWfcpPricingTab } from '@/pages/settings/shop/wfcpPricingTabs'
import { ThemeProvider } from '@/theme/ThemeProvider'

const HomePage = lazyPage(() =>
  import('@/pages/HomePage').then((m) => ({ default: m.HomePage })),
)
const LoginPage = lazyPage(() =>
  import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const LicensePage = lazyPage(() => import('@/pages/LicensePage'))
const NotFoundPage = lazyPage(() => import('@/pages/NotFoundPage'))

function dashboardBasename(): string {
  try {
    const u = new URL(window.webinoDashboard.baseUrl)
    const p = u.pathname.replace(/\/$/, '')
    return p || '/'
  } catch {
    return '/dashboard'
  }
}

function LegacyModuleRedirect({
  requiredSlug,
  to,
}: {
  requiredSlug: string
  to: string
}) {
  const bootstrap = useBootstrapQuery()
  const installed = bootstrap.data?.installedModuleSlugs ?? []
  if ((bootstrap.isPending || bootstrap.isLoading) && bootstrap.data === undefined) {
    return <RoutePageSkeleton />
  }
  // Bootstrap unavailable after error — do not spin forever; send to marketplace.
  if (bootstrap.data === undefined) {
    return <Navigate to="/marketplace" replace state={{ missingModule: requiredSlug }} />
  }
  if (!installed.includes(requiredSlug)) {
    return <Navigate to="/marketplace" replace state={{ missingModule: requiredSlug }} />
  }
  return <Navigate to={to} replace />
}

function LegacyAnalyticsSectionRedirect() {
  const { section } = useParams()
  const safe = section && /^[a-z0-9-]+$/.test(section) ? section : 'overview'
  return (
    <LegacyModuleRedirect
      requiredSlug="analytics-module"
      to={`/analytics/${safe}`}
    />
  )
}

function LegacyWfcpSettingsRedirect() {
  const { tab } = useParams()
  return (
    <LegacyModuleRedirect
      requiredSlug="wfcp-module"
      to={`/settings/shop/pricing/${resolveWfcpPricingTab(tab)}`}
    />
  )
}

function LegacyBasalamRedirect() {
  const loc = useLocation()
  const suffix = loc.pathname.replace(/^.*?\/basalam-module\/?/, '')
  const to = suffix ? `/settings/shop/basalam/${suffix}` : '/settings/shop/basalam'
  return <Navigate to={to} replace />
}

function LegacyExtSettingsRedirect() {
  const { moduleSlug } = useParams<{ moduleSlug: string }>()
  const loc = useLocation()
  if (!moduleSlug) {
    return <Navigate to="/settings/shop/general" replace />
  }
  const marker = `/module/${moduleSlug}`
  const idx = loc.pathname.indexOf(marker)
  const rest = idx >= 0 ? loc.pathname.slice(idx + marker.length) : ''
  return <Navigate to={`/settings/shop/ext/${moduleSlug}${rest}`} replace />
}

function RuntimeErrorToasts() {
  const { t } = useTranslation()

  useEffect(() => {
    const onRejection = (event: PromiseRejectionEvent) => {
      const root = document.getElementById('root')
      if (!root || root.childElementCount === 0) {
        return
      }
      const reason = event.reason
      const msg = reason instanceof Error ? reason.message : String(reason)
      if (!msg) {
        return
      }
      console.error('[Webino Dashboard] Unhandled rejection', reason)
      toast.error(t('common.loadFailed'), { description: msg })
    }
    window.addEventListener('unhandledrejection', onRejection)
    return () => window.removeEventListener('unhandledrejection', onRejection)
  }, [t])

  return null
}

function LegacyShopBotRedirect() {
  const { provider, tab } = useParams<{ provider: string; tab?: string }>()
  const p = provider === 'telegram' ? 'telegram' : 'bale'
  const requiredSlug = p === 'telegram' ? 'telegram-bot-module' : 'bale-bot-module'
  const t = tab ?? 'dashboard'

  const targets: Record<string, string> = {
    dashboard: `/bots/${p}`,
    settings: `/settings/site/bots?provider=${p}`,
    users: `/users/list?bot=${p}`,
    broadcast: `/marketing/bot-broadcast?provider=${p}`,
    campaigns: `/marketing/bot-campaigns?provider=${p}`,
    logs: `/settings/site/system-logs?provider=${p}`,
  }

  return (
    <LegacyModuleRedirect
      requiredSlug={requiredSlug}
      to={targets[t] ?? targets.dashboard}
    />
  )
}

export default function App() {
  const base = dashboardBasename()
  const moduleRoutes = useModuleDynamicRoutes()

  return (
    <ThemeProvider>
      <RuntimeErrorToasts />
      <ServiceWorkerRegister />
      <PwaSplashOverlay />
      <DashboardPrefetch />
      <BrowserRouter basename={base}>
        <Routes>
          <Route
            path="/login"
            element={
              <AuthGate mode="guest">
                <Suspense fallback={<RoutePageSkeleton />}>
                  <LoginPage />
                </Suspense>
              </AuthGate>
            }
          />
          <Route element={<AuthGate mode="protected" />}>
            <Route
              path="license"
              element={
                <RouteErrorBoundary>
                  <Suspense fallback={<RoutePageSkeleton />}>
                    <LicensePage />
                  </Suspense>
                </RouteErrorBoundary>
              }
            />
            <Route element={<LicenseGate />}>
            <Route element={<DashboardLayout />}>
              <Route
                index
                element={
                  <RouteErrorBoundary>
                    <Suspense fallback={<RoutePageSkeleton />}>
                      <HomePage />
                    </Suspense>
                  </RouteErrorBoundary>
                }
              />
              <Route path="magazine" element={<Navigate to="posts" replace relative="path" />} />
              <Route path="shop" element={<Navigate to="products" replace relative="path" />} />
              <Route path="orders" element={<Navigate to="list" replace relative="path" />} />
              <Route path="marketing" element={<Navigate to="coupons" replace relative="path" />} />
              <Route path="users" element={<Navigate to="list" replace relative="path" />} />
              <Route path="analytics" element={<Navigate to="/analytics/overview" replace />} />
              <Route path="reports" element={<Navigate to="/reports/overview" replace />} />
              <Route path="analytics/bots" element={<LegacyModuleRedirect requiredSlug="bale-bot-module" to="/bots/bale" />} />
              <Route path="analytics-module" element={<Navigate to="/analytics/overview" replace />} />
              <Route path="analytics-module/:section" element={<LegacyAnalyticsSectionRedirect />} />
              <Route path="wfcp/settings/:tab" element={<LegacyWfcpSettingsRedirect />} />
              <Route path="wfcp/bulk-editor" element={<LegacyModuleRedirect requiredSlug="wfcp-module" to="/shop/wfcp/bulk-editor" />} />
              <Route path="wfcp/quick-add" element={<LegacyModuleRedirect requiredSlug="wfcp-module" to="/shop/wfcp/quick-add" />} />
              <Route path="wfcp/price-changer" element={<LegacyModuleRedirect requiredSlug="wfcp-module" to="/shop/wfcp/price-changer" />} />
              <Route path="shop/wfcp-module/quick-add" element={<LegacyModuleRedirect requiredSlug="wfcp-module" to="/shop/wfcp/quick-add" />} />
              <Route path="shop/wfcp-module/price-changer" element={<LegacyModuleRedirect requiredSlug="wfcp-module" to="/shop/wfcp/price-changer" />} />
              <Route path="shop/wfcp-module/bulk-editor" element={<LegacyModuleRedirect requiredSlug="wfcp-module" to="/shop/wfcp/bulk-editor" />} />
              <Route path="settings/wfcp-module/:tab" element={<LegacyWfcpSettingsRedirect />} />
              <Route path="settings/wfcp/:tab" element={<LegacyWfcpSettingsRedirect />} />
              <Route path="wfcp" element={<LegacyModuleRedirect requiredSlug="wfcp-module" to="/settings/shop/pricing/dashboard" />} />
              <Route path="settings/shop/pricing" element={<Navigate to="/settings/shop/pricing/dashboard" replace />} />
              <Route path="settings/shop/basalam-module/*" element={<LegacyBasalamRedirect />} />
              <Route path="settings/shop/basalam-module" element={<Navigate to="/settings/shop/basalam" replace />} />
              <Route path="settings/site/analytics-module" element={<Navigate to="/settings/site/analytics" replace />} />
              <Route path="shop/bots/bale" element={<LegacyModuleRedirect requiredSlug="bale-bot-module" to="/bots/bale" />} />
              <Route path="shop/bots/telegram" element={<LegacyModuleRedirect requiredSlug="telegram-bot-module" to="/bots/telegram" />} />
              <Route path="shop/bots/:provider/:tab" element={<LegacyShopBotRedirect />} />
              <Route path="shop/bots/:provider" element={<LegacyShopBotRedirect />} />
              <Route path="settings/shop/module/:moduleSlug/*" element={<LegacyExtSettingsRedirect />} />
              <Route path="settings/shop/module/:moduleSlug" element={<LegacyExtSettingsRedirect />} />
              {dashboardRoutes.map(({ path, capability, Component }) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    <RouteErrorBoundary key={path}>
                      <PermissionGate capability={capability}>
                        <Suspense fallback={<RoutePageSkeleton />}>
                          <Component />
                        </Suspense>
                      </PermissionGate>
                    </RouteErrorBoundary>
                  }
                />
              ))}
              {moduleRoutes}
              <Route
                path="*"
                element={
                  <RouteErrorBoundary>
                    <Suspense fallback={<RoutePageSkeleton />}>
                      <NotFoundPage />
                    </Suspense>
                  </RouteErrorBoundary>
                }
              />
            </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" />
    </ThemeProvider>
  )
}
