import { Building2, Store } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { PageShell } from '@/components/PageShell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsHubPage() {
  const { t } = useTranslation()

  return (
    <PageShell title={t('settings.hub.title')} description={t('settings.hub.description')}>
      <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
        <Card className="shadow-sm transition-shadow hover:shadow-md">
          <CardHeader>
            <Building2 className="text-muted-foreground mb-2 size-8" aria-hidden />
            <CardTitle className="text-lg">{t('settings.hub.siteTitle')}</CardTitle>
            <CardDescription>{t('settings.hub.siteDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to="/settings/site/general"
              className="text-primary text-sm font-medium underline-offset-4 hover:underline"
            >
              {t('settings.hub.openSite')}
            </Link>
          </CardContent>
        </Card>
        <Card className="shadow-sm transition-shadow hover:shadow-md">
          <CardHeader>
            <Store className="text-muted-foreground mb-2 size-8" aria-hidden />
            <CardTitle className="text-lg">{t('settings.hub.shopTitle')}</CardTitle>
            <CardDescription>{t('settings.hub.shopDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to="/settings/shop/general"
              className="text-primary text-sm font-medium underline-offset-4 hover:underline"
            >
              {t('settings.hub.openShop')}
            </Link>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
