import { Building2, CreditCard, FileText, KeyRound, Settings2, Store } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { PageShell } from '@/components/PageShell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsHubPage() {
  const { t } = useTranslation()

  const siteShortcuts = [
    { to: '/settings/site/general', labelKey: 'settings.site.sections.general', icon: Settings2 },
    { to: '/settings/site/license', labelKey: 'settings.site.sections.license', icon: KeyRound },
    { to: '/settings/site/dashboard', labelKey: 'settings.site.sections.dashboard', icon: Settings2 },
  ] as const

  const shopShortcuts = [
    { to: '/settings/shop/general', labelKey: 'settings.shop.sections.general', icon: Store },
    { to: '/settings/shop/payments', labelKey: 'settings.shop.sections.payments', icon: CreditCard },
    { to: '/settings/shop/invoices', labelKey: 'settings.shop.sections.invoices', icon: FileText },
  ] as const

  return (
    <PageShell title={t('settings.hub.title')} description={t('settings.hub.description')}>
      <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
        <Link to="/settings/site/general" className="group block min-w-0 focus-visible:outline-none">
          <Card
            variant="hero"
            className="h-full transition-[box-shadow,transform] group-hover:shadow-lift group-focus-visible:ring-2 group-focus-visible:ring-ring"
          >
            <CardHeader>
              <div className="bg-primary/10 text-primary mb-3 flex size-12 items-center justify-center rounded-2xl">
                <Building2 className="size-6" aria-hidden />
              </div>
              <CardTitle className="text-lg">{t('settings.hub.siteTitle')}</CardTitle>
              <CardDescription>{t('settings.hub.siteDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-wrap gap-2">
                {siteShortcuts.map((item) => (
                  <li key={item.to}>
                    <span className="bg-background/70 text-muted-foreground inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs">
                      <item.icon className="size-3.5" aria-hidden />
                      {t(item.labelKey)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-primary mt-4 text-sm font-medium">{t('settings.hub.openSite')}</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/settings/shop/general" className="group block min-w-0 focus-visible:outline-none">
          <Card
            variant="hero"
            className="h-full transition-[box-shadow,transform] group-hover:shadow-lift group-focus-visible:ring-2 group-focus-visible:ring-ring"
          >
            <CardHeader>
              <div className="bg-primary/10 text-primary mb-3 flex size-12 items-center justify-center rounded-2xl">
                <Store className="size-6" aria-hidden />
              </div>
              <CardTitle className="text-lg">{t('settings.hub.shopTitle')}</CardTitle>
              <CardDescription>{t('settings.hub.shopDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-wrap gap-2">
                {shopShortcuts.map((item) => (
                  <li key={item.to}>
                    <span className="bg-background/70 text-muted-foreground inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs">
                      <item.icon className="size-3.5" aria-hidden />
                      {t(item.labelKey)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-primary mt-4 text-sm font-medium">{t('settings.hub.openShop')}</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </PageShell>
  )
}
