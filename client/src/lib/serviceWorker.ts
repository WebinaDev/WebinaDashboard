export type ServiceWorkerRegisterResult = 'registered' | 'skipped' | 'failed'

function dashboardScopeUrl(): string | null {
  const base = window.webinoDashboard?.baseUrl
  if (!base) return null
  try {
    const u = new URL(base, window.location.origin)
    if (!u.pathname.endsWith('/')) {
      u.pathname += '/'
    }
    return u.href
  } catch {
    return null
  }
}

/** Drop legacy SW registrations scoped to plugin assetBase (pre-0.7.57). */
async function unregisterStaleWorkers(desiredScope: string): Promise<void> {
  const regs = await navigator.serviceWorker.getRegistrations()
  await Promise.all(
    regs.map(async (reg) => {
      const scope = reg.scope
      if (scope === desiredScope) return
      // Old registrations lived under .../plugins/WebinaDashboard/assets/...
      if (scope.includes('/WebinaDashboard/') || scope.includes('/assets/dashboard-build')) {
        try {
          await reg.unregister()
        } catch {
          /* ignore */
        }
      }
    }),
  )
}

export async function registerDashboardServiceWorker(): Promise<ServiceWorkerRegisterResult> {
  if (window.webinoDashboard?.flags?.disableServiceWorker) {
    return 'skipped'
  }
  if (!('serviceWorker' in navigator)) {
    return 'skipped'
  }

  const scope = dashboardScopeUrl()
  if (!scope) {
    return 'skipped'
  }

  // Entry script is already on the page; do not re-fetch it (cache:reload probes
  // falsely returned 'failed' and triggered noisy toasts while the app worked).

  try {
    await unregisterStaleWorkers(scope)
  } catch {
    /* ignore */
  }

  const v = window.webinoDashboard.assetVersion ?? window.webinoDashboard.version
  const url = new URL('sw.js', scope)
  url.searchParams.set('v', v)

  try {
    const reg = await navigator.serviceWorker.register(url.href, { scope })
    void reg.update()
    return 'registered'
  } catch (err) {
    console.warn('[Webino Dashboard] Service worker registration failed', err)
    return 'failed'
  }
}
