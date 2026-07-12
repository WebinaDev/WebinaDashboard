import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { toPersianDigits } from '@/lib/digits'

const fromWp = typeof window !== 'undefined' ? window.webinoDashboard?.locale : ''
const initial = fromWp?.toLowerCase().startsWith('fa') ? 'fa' : 'en'

const loadedLocales = new Set<string>()

async function loadLocaleBundle(lng: string): Promise<Record<string, string>> {
  if (lng === 'fa') {
    await import('../fonts-fa.css')
    return (await import('./locales/fa.json')).default
  }
  return (await import('./locales/en.json')).default
}

async function ensureLocale(lng: string) {
  if (loadedLocales.has(lng)) {
    return
  }
  const bundle = await loadLocaleBundle(lng)
  i18n.addResourceBundle(lng, 'translation', bundle, true, true)
  loadedLocales.add(lng)
}

export function dashboardDir(lng: string): 'rtl' | 'ltr' {
  return lng === 'fa' ? 'rtl' : 'ltr'
}

const faDigitsProcessor = {
  type: 'postProcessor' as const,
  name: 'faDigits',
  process(value: string, _key: string, options: { lng?: string }) {
    if (options.lng !== 'fa' && !options.lng?.startsWith('fa')) return value
    return toPersianDigits(value)
  },
}

export async function setDashboardLanguage(lng: string) {
  await ensureLocale(lng)
  await i18n.changeLanguage(lng)
  document.documentElement.lang = lng
  document.documentElement.dir = dashboardDir(lng)
}

function scheduleSecondaryLocaleLoad() {
  const secondary = initial === 'fa' ? 'en' : 'fa'
  const load = () => {
    void ensureLocale(secondary)
  }
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(load, { timeout: 8000 })
  } else {
    globalThis.setTimeout(load, 3000)
  }
}

export const i18nReady = (async () => {
  const bundle = await loadLocaleBundle(initial)
  loadedLocales.add(initial)
  await i18n
    .use(faDigitsProcessor)
    .use(initReactI18next)
    .init({
      resources: {
        [initial]: { translation: bundle },
      },
      lng: initial,
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
      postProcess: ['faDigits'],
    })
  document.documentElement.lang = initial
  document.documentElement.dir = dashboardDir(initial)
  scheduleSecondaryLocaleLoad()
})()

export { i18n }
