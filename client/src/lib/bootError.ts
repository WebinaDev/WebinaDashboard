/** Minimal boot strings — do not import full locale JSON (keeps shell chunk small). */
const bootStrings: Record<string, Record<string, string>> = {
  fa: {
    'errors.reloadPage': 'بارگذاری مجدد',
    'errors.boot.missingRoot': 'عنصر ریشهٔ داشبورد یافت نشد.',
    'errors.boot.missingRootDetail': 'عنصر #root در HTML صفحه نیست.',
    'errors.boot.missingConfig': 'پیکربندی داشبورد بارگذاری نشد.',
    'errors.boot.missingConfigDetail':
      'window.webinoDashboard موجود نیست. بررسی کنید افزونه و build روی سرور نصب باشد.',
    'errors.boot.i18nFailed': 'راه‌اندازی داشبورد ناموفق بود.',
    'errors.boot.loadFailed': 'بارگذاری داشبورد ناموفق بود.',
  },
  en: {
    'errors.reloadPage': 'Reload page',
    'errors.boot.missingRoot': 'Dashboard root element is missing.',
    'errors.boot.missingRootDetail': '#root was not found in the page HTML.',
    'errors.boot.missingConfig': 'Dashboard configuration failed to load.',
    'errors.boot.missingConfigDetail':
      'window.webinoDashboard is missing. Check that plugin assets are enqueued and the build exists on the server.',
    'errors.boot.i18nFailed': 'Dashboard failed to start.',
    'errors.boot.loadFailed': 'Dashboard failed to load.',
  },
}

/** Set once createRoot is about to own #root — boot UI must not fight React. */
let reactMountStarted = false

export function markReactMountStarted(): void {
  reactMountStarted = true
}

export function hasReactMountStarted(): boolean {
  return reactMountStarted
}

function bootLocale(): string {
  const raw = window.webinoDashboard?.locale ?? 'fa'
  return String(raw).startsWith('en') ? 'en' : 'fa'
}

export function bootI18n(key: string): string {
  const locale = bootLocale()
  return bootStrings[locale]?.[key] ?? bootStrings.en[key] ?? key
}

/** Visible fallback when React cannot mount (avoids a blank white screen). */
export function showBootError(message: string, detail?: string) {
  if (reactMountStarted) {
    console.error('[Webino Dashboard] Boot error after React mount started (UI suppressed):', message, detail)
    return
  }

  const root = document.getElementById('root')
  if (!root) {
    return
  }

  root.replaceChildren()

  const wrap = document.createElement('div')
  wrap.setAttribute('role', 'alert')
  wrap.style.cssText =
    'box-sizing:border-box;min-height:100vh;padding:1.5rem;font-family:system-ui,sans-serif;background:#fef2f2;color:#7f1d1d;'

  const heading = document.createElement('h1')
  heading.style.cssText = 'margin:0 0 0.5rem;font-size:1.125rem;font-weight:600;'
  heading.textContent = message
  wrap.appendChild(heading)

  if (detail) {
    const para = document.createElement('p')
    para.style.cssText = 'margin:0 0 1rem;font-size:0.875rem;word-break:break-word;'
    para.textContent = detail
    wrap.appendChild(para)
  }

  const reloadBtn = document.createElement('button')
  reloadBtn.type = 'button'
  reloadBtn.id = 'wd-boot-reload'
  reloadBtn.style.cssText =
    'padding:0.5rem 1rem;font-size:0.875rem;cursor:pointer;border:1px solid #b91c1c;border-radius:0.375rem;background:#fff;'
  reloadBtn.textContent = bootI18n('errors.reloadPage')
  reloadBtn.addEventListener('click', () => {
    window.location.reload()
  })
  wrap.appendChild(reloadBtn)

  root.appendChild(wrap)
}
