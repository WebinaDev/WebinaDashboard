import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { registerDashboardServiceWorker } from '@/lib/serviceWorker'

export function ServiceWorkerRegister() {
  const { t } = useTranslation()
  const warned = useRef(false)

  useEffect(() => {
    const run = async () => {
      const result = await registerDashboardServiceWorker()
      if (result !== 'failed' || warned.current) {
        return
      }
      const root = document.getElementById('root')
      if (!root || root.childElementCount === 0) {
        return
      }
      warned.current = true
      toast.warning(t('serviceWorker.registrationFailedTitle'), {
        description: t('serviceWorker.registrationFailedBody'),
      })
    }

    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(() => void run(), { timeout: 4000 })
      return () => cancelIdleCallback(id)
    }
    const id = globalThis.setTimeout(() => void run(), 2000)
    return () => globalThis.clearTimeout(id)
  }, [t])

  return null
}
