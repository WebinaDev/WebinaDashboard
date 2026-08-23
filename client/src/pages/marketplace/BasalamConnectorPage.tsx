import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type Status = {
  engine?: boolean
  connected?: boolean
  vendor_id?: string | number | null
  jobs_pending?: number
  webhook_url?: string
  version?: string
}

export default function BasalamHomePage() {
  const { t } = useTranslation()
  const qc = useQueryClient()

  const statusQ = useQuery({
    queryKey: ['basalam', 'status'],
    queryFn: () => apiFetch<Status>('basalam/status'),
  })

  const oauth = useMutation({
    mutationFn: () => apiFetch<{ url: string }>('basalam/oauth/start', { method: 'POST' }),
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url
        return
      }
      toast.error(t('basalam.oauthMissingUrl'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const pullOrders = useMutation({
    mutationFn: () => apiFetch('basalam/sync/orders/pull', { method: 'POST' }),
    onSuccess: async () => {
      toast.success(t('basalam.ordersPullQueued'))
      await qc.invalidateQueries({ queryKey: ['basalam'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const s = statusQ.data

  return (
    <PageShell title={t('basalam.title')} description={t('basalam.subtitle')}>
      <div className="mb-4 flex flex-wrap gap-2">
        <Button asChild variant="secondary">
          <Link to="/settings/shop/basalam/products">{t('basalam.nav.products')}</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/settings/shop/basalam/orders">{t('basalam.nav.orders')}</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/settings/shop/basalam/categories">{t('basalam.nav.categories')}</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/settings/shop/basalam/settings">{t('basalam.nav.settings')}</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/settings/shop/basalam/finance">{t('basalam.nav.finance')}</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/settings/shop/basalam/tickets">{t('basalam.nav.tickets')}</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/settings/shop/basalam/logs">{t('basalam.nav.logs')}</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('basalam.connection')}</CardTitle>
            <CardDescription>{t('basalam.connectionHint')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              {s?.connected ? t('basalam.connected') : t('basalam.notConnected')}
              {s?.vendor_id ? ` · vendor #${s.vendor_id}` : ''}
            </p>
            <p className="text-muted-foreground text-xs">
              engine {s?.version ?? '—'} · jobs {s?.jobs_pending ?? 0}
            </p>
            <Button onClick={() => oauth.mutate()} disabled={oauth.isPending}>
              {t('basalam.connectOAuth')}
            </Button>
            <p className="text-muted-foreground text-xs leading-relaxed">{t('basalam.oauthWafHint')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('basalam.operations')}</CardTitle>
            <CardDescription>{t('basalam.operationsHint')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button onClick={() => pullOrders.mutate()} disabled={pullOrders.isPending}>
              {t('basalam.pullOrders')}
            </Button>
            <Button asChild variant="outline">
              <Link to="/settings/shop/pricing/marketplaces">{t('wnc.openPricingTab')}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t('basalam.webhook')}</CardTitle>
          </CardHeader>
          <CardContent>
            <code className="bg-muted block overflow-x-auto rounded-md p-3 text-xs">{s?.webhook_url ?? '—'}</code>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
