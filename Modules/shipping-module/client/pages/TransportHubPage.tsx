import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const cards = [
  { to: '/settings/shop/transport/packaging', title: 'shipping.packagingTitle', hint: 'shipping.packagingCardHint', cta: 'shipping.openPackaging' },
  { to: '/settings/shop/transport/tapin', title: 'tapin.hubCardTitle', hint: 'tapin.hubCardHint', cta: 'tapin.openSettings' },
  { to: '/settings/shop/transport/tapin/ops', title: 'tapin.opsTitle', hint: 'tapin.opsHint', cta: 'tapin.openOps' },
  { to: '/settings/shop/transport/tapin/finance', title: 'tapin.financeTitle', hint: 'tapin.financeHint', cta: 'tapin.openFinance' },
  { to: '/settings/shop/transport/tapin/catalog', title: 'tapin.catalogTitle', hint: 'tapin.catalogHint', cta: 'tapin.openCatalog' },
  { to: '/settings/shop/transport/tools', title: 'shipping.toolsTitle', hint: 'shipping.toolsCardHint', cta: 'shipping.openTools' },
  { to: '/settings/shop/transport/cities', title: 'shipping.citiesTitle', hint: 'shipping.citiesCardHint', cta: 'shipping.openCities' },
  { to: '/settings/shop/transport/map', title: 'shipping.mapTitle', hint: 'shipping.mapCardHint', cta: 'shipping.openMap' },
  { to: '/settings/shop/transport/rules', title: 'shipping.rulesTitle', hint: 'shipping.rulesCardHint', cta: 'shipping.openRules' },
  { to: '/settings/shop/shipping', title: 'shipping.zonesTitle', hint: 'shipping.zonesHint', cta: 'shipping.openZones', secondary: true },
] as const

export default function TransportHubPage() {
  const { t } = useTranslation()

  return (
    <PageShell title={t('shipping.hubTitle')}>
      <p className="text-muted-foreground mb-4 text-sm">{t('shipping.hubHint')}</p>
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((c) => (
          <Card key={c.to} className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t(c.title)}</CardTitle>
              <CardDescription>{t(c.hint)}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant={'secondary' in c && c.secondary ? 'secondary' : 'default'}>
                <Link to={c.to}>{t(c.cta)}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  )
}
