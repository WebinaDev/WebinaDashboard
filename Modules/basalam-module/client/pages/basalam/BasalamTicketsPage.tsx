import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Hamsalam ticket surface removed — Webina owns support.
 */
export default function BasalamTicketsPage() {
  const { t } = useTranslation()

  return (
    <PageShell title={t('basalam.ticketsTitle')} description={t('basalam.ticketsSubtitle')}>
      <Card>
        <CardHeader>
          <CardTitle>{t('basalam.ticketsDisabledTitle')}</CardTitle>
          <CardDescription>{t('basalam.ticketsDisabledHint')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="secondary">
            <Link to="/settings/shop/basalam">{t('basalam.nav.home')}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/settings/shop/basalam/logs">{t('basalam.nav.logs')}</Link>
          </Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
