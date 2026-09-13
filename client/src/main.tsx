/* webino-dashboard 0.1.31 — force fresh entry hashes after importmap fix */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from '@/App.tsx'
import { i18nReady } from '@/i18n'
import { bootI18n, hasReactMountStarted, markReactMountStarted, showBootError } from '@/lib/bootError'
import { createQueryClient } from '@/lib/queryClient'
import { QueryClientProvider } from '@tanstack/react-query'
import '@/index.css'
import '@/fonts-fa.css'

const queryClient = createQueryClient()

/** Non-fatal CDN/Vite font CSS preload glitches must not block React mount. */
function isIgnorableBootError(msg: string): boolean {
  return (
    /Unable to preload CSS/i.test(msg) ||
    /fonts-fa/i.test(msg) ||
    /removeChild/i.test(msg) ||
    /NotFoundError/i.test(msg)
  )
}

function appTree() {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>
  )
}

/**
 * PHP first-paint (#wd-shell-loader / data-wd-ssr) is not isomorphic with React.
 * Clear it before createRoot so React never removeChilds foreign nodes (avoids
 * NotFoundError races that the boot error listener used to surface as a red screen).
 */
function mountApp() {
  const el = document.getElementById('root')
  if (!el) {
    showBootError(bootI18n('errors.boot.missingRoot'), bootI18n('errors.boot.missingRootDetail'))
    return
  }

  el.replaceChildren()
  markReactMountStarted()
  createRoot(el).render(appTree())
}

function boot() {
  if (typeof window.webinoDashboard === 'undefined') {
    showBootError(bootI18n('errors.boot.missingConfig'), bootI18n('errors.boot.missingConfigDetail'))
    return
  }

  void i18nReady
    .then(() => {
      mountApp()
    })
    .catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[Webino Dashboard] i18n bootstrap failed', err)
      showBootError(bootI18n('errors.boot.i18nFailed'), msg)
    })
}

/** True once React owns #root, or a boot error UI is already shown. */
function isDashboardBooted(): boolean {
  if (hasReactMountStarted()) {
    return true
  }
  const root = document.getElementById('root')
  if (!root) {
    return false
  }
  // Boot error UI replaces children with role=alert.
  if (root.querySelector('[role="alert"]')) {
    return true
  }
  return false
}

window.addEventListener('error', (event) => {
  if (event.defaultPrevented) {
    return
  }
  if (isDashboardBooted()) {
    return
  }
  const msg = event.error instanceof Error ? event.error.message : event.message
  if (!msg) {
    return
  }
  if (isIgnorableBootError(msg)) {
    console.warn('[Webino Dashboard] Ignored non-fatal boot asset error:', msg)
    return
  }
  console.error('[Webino Dashboard] Uncaught boot error', event.error ?? event.message)
  showBootError(bootI18n('errors.boot.loadFailed'), msg)
})

window.addEventListener('unhandledrejection', (event) => {
  if (isDashboardBooted()) {
    return
  }
  const reason = event.reason
  const msg = reason instanceof Error ? reason.message : String(reason)
  if (isIgnorableBootError(msg)) {
    console.warn('[Webino Dashboard] Ignored non-fatal boot rejection:', msg)
    event.preventDefault()
    return
  }
  console.error('[Webino Dashboard] Unhandled rejection during boot', reason)
  showBootError(bootI18n('errors.boot.loadFailed'), msg)
})

boot()
