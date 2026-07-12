import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { LoginForm } from '@/components/blocks/login-04/components/login-form'
import { applyDashboardDocumentSeo } from '@/lib/dashboard-seo'

export function LoginPage() {
  const { t } = useTranslation()
  useEffect(() => {
    const site = window.webinoDashboard.siteName?.trim() || t('app.title')
    const title = `${t('login.title')} — ${site}`
    const description = t('seo.loginDescription', { site })
    const canonicalUrl = `${window.location.origin}${window.location.pathname}${window.location.search}`
    const icon = window.webinoDashboard.siteIconUrl?.trim()
    applyDashboardDocumentSeo({
      title,
      description,
      canonicalUrl,
      ogImageUrl: icon || undefined,
      structuredSite: { name: site, url: window.webinoDashboard.homeUrl || `${window.location.origin}/` },
    })
  }, [t])

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm />
      </div>
    </div>
  )
}
