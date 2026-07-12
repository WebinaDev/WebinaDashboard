import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

import type { BotProvider } from '@/types/bots'

export function useBotProvider(defaultProvider: BotProvider = 'bale') {
  const [params, setParams] = useSearchParams()
  const raw = params.get('provider')
  const provider: BotProvider = raw === 'telegram' ? 'telegram' : raw === 'bale' ? 'bale' : defaultProvider

  const setProvider = useCallback(
    (next: BotProvider) => {
      setParams(
        (prev) => {
          const p = new URLSearchParams(prev)
          p.set('provider', next)
          return p
        },
        { replace: true },
      )
    },
    [setParams],
  )

  return { provider, setProvider }
}
