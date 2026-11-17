import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { PageShell } from '@/components/PageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type SectionKey = 'packaging' | 'tools' | 'cities' | 'map' | 'rules' | 'item_cost' | 'tapin'
type HubStatusResponse = { sections: Record<SectionKey, boolean> }

const cards: ReadonlyArray<{
  to: string
  sectionKey?: SectionKey
  title: string
  hint: string
  cta: string
  secondary?: boolean
}> = [
  { to: '/settings/shop/transport/packaging', sectionKey: 'packaging', title: 'shipping.packagingTitle', hint: 'shipping.packagingCardHint', cta: 'shipping.openPackaging' },
  { to: '/settings/shop/transport/tapin', sectionKey: 'tapin', title: 'tapin.hubCardTitle', hint: 'tapin.hubCardHint', cta: 'tapin.openSettings' },
  { to: '/settings/shop/transport/tapin/ops', title: 'tapin.opsTitle', hint: 'tapin.opsHint', cta: 'tapin.openOps' },
  { to: '/settings/shop/transport/tapin/finance', title: 'tapin.financeTitle', hint: 'tapin.financeHint', cta: 'tapin.openFinance' },
  { to: '/settings/shop/transport/tapin/catalog', title: 'tapin.catalogTitle', hint: 'tapin.catalogHint', cta: 'tapin.openCatalog' },
  { to: '/settings/shop/transport/tools', sectionKey: 'tools', title: 'shipping.toolsTitle', hint: 'shipping.toolsCardHint', cta: 'shipping.openTools' },
  { to: '/settings/shop/transport/cities', sectionKey: 'cities', title: 'shipping.citiesTitle', hint: 'shipping.citiesCardHint', cta: 'shipping.openCities' },
  { to: '/settings/shop/transport/map', sectionKey: 'map', title: 'shipping.mapTitle', hint: 'shipping.mapCardHint', cta: 'shipping.openMap' },
  { to: '/settings/shop/transport/rules', sectionKey: 'rules', title: 'shipping.rulesTitle', hint: 'shipping.rulesCardHint', cta: 'shipping.openRules' },
  { to: '/settings/shop/transport/item-cost', sectionKey: 'item_cost', title: 'shipping.itemCost.title', hint: 'shipping.itemCost.cardHint', cta: 'shipping.itemCost.open' },
  { to: '/settings/shop/shipping', title: 'shipping.zonesTitle', hint: 'shipping.zonesHint', cta: 'shipping.openZones', secondary: true },
]

export default function TransportHubPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()

  const statusQ = useQuery({
    queryKey: ['shipping-hub-status'],
    queryFn: () => apiFetch<HubStatusResponse>('shipping/hub/status'),
  })

  const toggle = useMutation({
    mutationFn: (payload: { section: SectionKey; enabled: boolean }) =>
      apiFetch<HubStatusResponse>('shipping/hub/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      qc.setQueryData(['shipping-hub-status'], data)
      void qc.invalidateQueries({ queryKey: ['shop-locations-states'] })
      toast.success(t('common.saved'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const sections = statusQ.data?.sections

  return (
    <PageShell title={t('shipping.hubTitle')}>
      <p className="text-muted-foreground mb-4 text-sm">{t('shipping.hubHint')}</p>
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((c) => {
          const isOn = c.sectionKey && sections ? Boolean(sections[c.sectionKey]) : null
          return (
            <Card key={c.to} className="shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base">{t(c.title)}</CardTitle>
                      {c.sectionKey && isOn !== null ? (
                        <Badge variant={isOn ? 'default' : 'secondary'}>
                          {isOn ? t('shipping.statusOn') : t('shipping.statusOff')}
                        </Badge>
                      ) : null}
                    </div>
                    <CardDescription>{t(c.hint)}</CardDescription>
                  </div>
                  {c.sectionKey ? (
                    <Switch
                      aria-label={t(c.title)}
                      checked={Boolean(isOn)}
                      disabled={toggle.isPending || !sections}
                      onCheckedChange={(v) =>
                        c.sectionKey && void toggle.mutate({ section: c.sectionKey, enabled: v })
                      }
                    />
                  ) : null}
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild variant={c.secondary ? 'secondary' : 'default'}>
                  <Link to={c.to}>{t(c.cta)}</Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </PageShell>
  )
}
