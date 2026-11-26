import { useQuery } from '@tanstack/react-query'
import { MessageCircle, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/api'
import { cn } from '@/lib/utils'

import { BASALAM_CHAT_OPEN_EVENT } from './basalamChatBus'

const SCRIPT_ID = 'basalam-chat-widget-script'
const DISMISS_KEY = 'webino.basalam.chat.dismissed'

type ChatToken = { enabled?: boolean; token?: string | null; script_url?: string }

/**
 * Floating Basalam buyer-chat launcher, dashboard-native.
 *
 * The widget used to be injected into every wp-admin page by AdminRegistrar. /dashboard is the only
 * product surface now, so the launcher lives here: it sits in the dashboard shell (bottom-left),
 * follows the merchant across pages, and only loads the upstream chat bundle after an explicit
 * click — no third-party script on cold page loads.
 */
export function BasalamChatDock() {
  const { t } = useTranslation()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    try {
      setDismissed(window.sessionStorage.getItem(DISMISS_KEY) === '1')
    } catch {
      // Storage can be blocked; the dock simply starts visible.
    }
  }, [])

  useEffect(() => {
    const onOpen = () => {
      setDismissed(false)
      setOpen(true)
      try {
        window.sessionStorage.removeItem(DISMISS_KEY)
      } catch {
        // Storage can be blocked; opening for this render is enough.
      }
    }
    window.addEventListener(BASALAM_CHAT_OPEN_EVENT, onOpen)
    return () => window.removeEventListener(BASALAM_CHAT_OPEN_EVENT, onOpen)
  }, [])

  const tokenQ = useQuery({
    queryKey: ['basalam', 'chat', 'dock'],
    queryFn: () => apiFetch<ChatToken>('basalam/chat/token'),
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  const ready = Boolean(tokenQ.data?.enabled && tokenQ.data.token && tokenQ.data.script_url)
  const active = open && !dismissed

  // Load the upstream bundle only while the dock is open, and tear it down when it closes.
  useEffect(() => {
    if (!active || !ready) {
      return
    }
    const already = document.getElementById(SCRIPT_ID)
    if (already) {
      return
    }
    const el = document.createElement('script')
    el.id = SCRIPT_ID
    el.src = String(tokenQ.data?.script_url)
    el.async = true
    el.setAttribute('token', String(tokenQ.data?.token))
    // Move the launcher out of the click path while the panel is up.
    el.dataset.basalamDock = '1'
    document.body.appendChild(el)
    void apiFetch('basalam/chat/notify', {
      method: 'POST',
      body: JSON.stringify({ event: 'widget_opened', route: location.pathname }),
    }).catch(() => undefined)

    return () => {
      el.remove()
    }
  }, [active, ready, tokenQ.data?.script_url, tokenQ.data?.token, location.pathname])

  const dismiss = useCallback(() => {
    setOpen(false)
    setDismissed(true)
    try {
      window.sessionStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // Non-fatal: hiding for this render is enough.
    }
  }, [])

  // Connected booth only: an unconnected shop has nothing to chat about, and the empty dock would
  // just be noise on every page.
  if (!ready || dismissed) {
    return null
  }

  return (
    <>
      {active ? (
        <div className="fixed inset-x-3 bottom-3 z-40 flex justify-start sm:inset-x-auto sm:left-5 sm:bottom-5">
          <div className="bg-card flex w-full max-w-sm flex-col overflow-hidden rounded-xl border shadow-lg">
            <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
              <span className="text-sm font-medium">{t('basalam.chatDockTitle')}</span>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-7"
                aria-label={t('common.close')}
                onClick={dismiss}
              >
                <X className="size-4" />
              </Button>
            </div>
            <p className="text-muted-foreground px-3 py-3 text-xs leading-relaxed">
              {t('basalam.chatDockHint')}
            </p>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            'fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-full px-4 py-2.5',
            'bg-[#ff5c35] text-sm font-medium text-white shadow-lg transition-transform',
            'hover:scale-105 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none',
          )}
          aria-label={t('basalam.chatDockOpen')}
        >
          <MessageCircle className="size-4" />
          <span>{t('basalam.chatDockOpen')}</span>
        </button>
      )}
    </>
  )
}

export default BasalamChatDock
