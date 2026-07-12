import { Suspense, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { PermissionGate } from '@/components/PermissionGate'
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary'
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister'
import { RoutePageSkeleton } from '@/components/skeletons'
import { useBootstrapQuery } from '@/hooks/useBootstrapQuery'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { AuthGate } from '@/layouts/AuthGate'
import { LicenseGate } from '@/layouts/LicenseGate'
import { Toaster } from '@/components/ui/sonner'
import { lazyPage } from '@/routes/lazyPage'
import { useModuleDynamicRoutes } from '@/routes/ModuleDynamicRoutes'
import { dashboardRoutes } from '@/routes/routes.config'
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
  if (!bootstrap.isFetched) {
    return <RoutePageSkeleton />
  }
  if (!installed.includes(requiredSlug)) {
    return <Navigate to="/marketplace" replace state={{ missingModule: requiredSlug }} />
  }
  return <Navigate to={to} replace />
}

function LegacyWfcpSettingsRedirect() {
  const { tab } = useParams()
  const safe = tab && /^[a-z0-9-]+$/.test(tab) ? tab : 'dashboard'
  return (
    <LegacyModuleRedirect
      requiredSlug="wfcp-module"
      to={`/settings/shop/pricing/${safe}`}
    />
  )
}

function LegacyAnalyticsSectionRedirect() {
  const { section } = useParams()
  const safe = section && /^[a-z0-9-]+$/.test(section) ? section : 'overview'
  return (
    <LegacyModuleRedirect
      requiredSlug="analytics-module"
      to={`/analytics-module/${safe}`}
    />
  )
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
              <Route path="analytics" element={<Navigate to="/analytics-module/overview" replace />} />
              <Route path="analytics/:section" element={<LegacyAnalyticsSectionRedirect />} />
              <Route path="analytics/bots" element={<LegacyModuleRedirect requiredSlug="bale-bot-module" to="/bots/bale" />} />
              <Route path="wfcp/settings/:tab" element={<LegacyWfcpSettingsRedirect />} />
              <Route path="wfcp/bulk-editor" element={<Navigate to="/shop/products" replace />} />
              <Route path="wfcp/quick-add" element={<LegacyModuleRedirect requiredSlug="wfcp-module" to="/shop/wfcp-module/quick-add" />} />
              <Route path="wfcp/price-changer" element={<LegacyModuleRedirect requiredSlug="wfcp-module" to="/shop/wfcp-module/price-changer" />} />
              <Route path="shop/wfcp/quick-add" element={<LegacyModuleRedirect requiredSlug="wfcp-module" to="/shop/wfcp-module/quick-add" />} />
              <Route path="shop/wfcp/price-changer" element={<LegacyModuleRedirect requiredSlug="wfcp-module" to="/shop/wfcp-module/price-changer" />} />
              <Route path="shop/wfcp/bulk-editor" element={<LegacyModuleRedirect requiredSlug="wfcp-module" to="/shop/wfcp-module/bulk-editor" />} />
              <Route path="settings/wfcp/:tab" element={<LegacyWfcpSettingsRedirect />} />
              <Route path="wfcp" element={<LegacyModuleRedirect requiredSlug="wfcp-module" to="/settings/shop/pricing/dashboard" />} />
              <Route path="shop/bots/bale" element={<LegacyModuleRedirect requiredSlug="bale-bot-module" to="/bots/bale" />} />
              <Route path="shop/bots/telegram" element={<LegacyModuleRedirect requiredSlug="telegram-bot-module" to="/bots/telegram" />} />
              <Route path="shop/bots/:provider/:tab" element={<LegacyShopBotRedirect />} />
              <Route path="shop/bots/:provider" element={<LegacyShopBotRedirect />} />
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
