import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from '@/App.tsx'
import { i18nReady } from '@/i18n'
import { bootI18n, showBootError } from '@/lib/bootError'
import { createQueryClient } from '@/lib/queryClient'
import { QueryClientProvider } from '@tanstack/react-query'
import '@/index.css'

const queryClient = createQueryClient()

function mountApp() {
  const el = document.getElementById('root')
  if (!el) {
    showBootError(bootI18n('errors.boot.missingRoot'), bootI18n('errors.boot.missingRootDetail'))
    return
  }

  createRoot(el).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>,
  )
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

window.addEventListener('error', (event) => {
  if (event.defaultPrevented) {
    return
  }
  const root = document.getElementById('root')
  if (!root || root.childElementCount > 0) {
    return
  }
  const msg = event.error instanceof Error ? event.error.message : event.message
  if (!msg) {
    return
  }
  console.error('[Webino Dashboard] Uncaught boot error', event.error ?? event.message)
  showBootError(bootI18n('errors.boot.loadFailed'), msg)
})

window.addEventListener('unhandledrejection', (event) => {
  const root = document.getElementById('root')
  if (!root || root.childElementCount > 0) {
    return
  }
  const reason = event.reason
  const msg = reason instanceof Error ? reason.message : String(reason)
  console.error('[Webino Dashboard] Unhandled rejection during boot', reason)
  showBootError(bootI18n('errors.boot.loadFailed'), msg)
})

boot()
