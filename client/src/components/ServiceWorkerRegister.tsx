import { useEffect } from 'react'

import { registerDashboardServiceWorker } from '@/lib/serviceWorker'

/**
 * Best-effort PWA SW registration. Failures are console-only — offline cache
 * is optional and must not interrupt dashboard UX on every page load.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    const run = () => {
      void registerDashboardServiceWorker()
    }

    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(run, { timeout: 4000 })
      return () => cancelIdleCallback(id)
    }
    const id = globalThis.setTimeout(run, 2000)
    return () => globalThis.clearTimeout(id)
  }, [])

  return null
}
