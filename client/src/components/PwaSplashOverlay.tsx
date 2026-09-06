import { useEffect, useState } from 'react'

function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return nav.standalone === true
}

/**
 * Short splash while the SPA hydrates in installed (standalone) mode.
 */
export function PwaSplashOverlay() {
  const pwa = typeof window !== 'undefined' ? window.webinoDashboard?.pwa : undefined
  const [show, setShow] = useState(() => {
    if (!pwa?.enabled || !pwa?.splashEnabled) return false
    return isStandaloneDisplay()
  })

  useEffect(() => {
    if (!show) return
    const t = window.setTimeout(() => setShow(false), 900)
    return () => window.clearTimeout(t)
  }, [show])

  if (!show || !pwa) return null

  const bg = pwa.backgroundColor || '#ffffff'
  const name = pwa.name || pwa.shortName || ''
  const icon = pwa.iconUrl || ''

  return (
    <div
      role="presentation"
      aria-hidden
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 transition-opacity duration-300"
      style={{ backgroundColor: bg }}
    >
      {icon ? (
        <img src={icon} alt="" width={96} height={96} className="size-24 rounded-2xl object-contain shadow-sm" />
      ) : null}
      {name ? <p className="text-foreground/90 max-w-[80%] truncate text-center text-base font-medium">{name}</p> : null}
    </div>
  )
}
