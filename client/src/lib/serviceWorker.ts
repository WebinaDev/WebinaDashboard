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

export async function registerDashboardServiceWorker(): Promise<ServiceWorkerRegisterResult> {
  if (window.webinoDashboard?.flags?.disableServiceWorker) {
    return 'skipped'
  }
  const base = window.webinoDashboard?.assetBase
  if (!base || !('serviceWorker' in navigator)) {
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

  const v = window.webinoDashboard.assetVersion ?? window.webinoDashboard.version
  const url = `${base}dashboard-sw.js?v=${encodeURIComponent(v)}`
  try {
    const reg = await navigator.serviceWorker.register(url, { scope: base })
    void reg.update()
    return 'registered'
  } catch (err) {
    console.warn('[Webino Dashboard] Service worker registration failed', err)
    return 'failed'
  }
}
