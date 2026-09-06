export type ServiceWorkerRegisterResult = 'registered' | 'skipped' | 'failed'

function entryModuleScriptUrl(): string | null {
  const scripts = document.querySelectorAll('script[type="module"][src]')
  for (const node of scripts) {
    const src = (node as HTMLScriptElement).src
    if (src.includes('dashboard-build') && src.includes('/assets/index-')) {
      return src
    }
  }
  return null
}

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

  const entryUrl = entryModuleScriptUrl()
  if (entryUrl) {
    try {
      const probe = await fetch(entryUrl, { method: 'GET', cache: 'reload', credentials: 'same-origin' })
      if (!probe.ok) {
        console.warn('[Webino Dashboard] Skipping service worker — entry script not reachable', probe.status)
        return 'failed'
      }
    } catch (err) {
      console.warn('[Webino Dashboard] Skipping service worker — entry script fetch failed', err)
      return 'failed'
    }
  }

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
