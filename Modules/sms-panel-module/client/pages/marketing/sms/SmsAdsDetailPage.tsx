import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { toPersianDigits } from '@/lib/date'
import { fetchSmsAdStats, smsQueryOptions } from '@/lib/modirpayamak-api'
import { formatSmsDateTime } from '@/lib/sms-report'

export default function SmsAdsDetailPage() {
  const { t, i18n } = useTranslation()
  const { adId = '' } = useParams<{ adId: string }>()
  const locale = i18n.language

  const q = useQuery({
    queryKey: ['sms', 'ads', 'stats', adId],
    queryFn: () => fetchSmsAdStats(adId),
    enabled: !!adId,
    ...smsQueryOptions,
  })
  useQueryErrorToast(q)

  const fmt = (n: number) =>
    locale.startsWith('fa') ? toPersianDigits(n.toLocaleString('en-US')) : n.toLocaleString()

  if (q.isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  const data = q.data
  const camp = data?.campaign

  if (!data || !camp) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground text-sm">{t('marketing.smsAds.notFound')}</p>
        <Button asChild className="mt-3" variant="outline">
          <Link to="/marketing/sms">{t('marketing.smsAds.backHome')}</Link>
        </Button>
      </div>
    )
  }

  const kpis = [
    { label: t('marketing.smsAds.kpi.sent'), value: fmt(data.sent) },
    { label: t('marketing.smsAds.kpi.failed'), value: fmt(data.failed) },
    { label: t('marketing.smsAds.kpi.cost'), value: fmt(data.cost) },
    { label: t('marketing.smsAds.kpi.orders'), value: fmt(data.orders) },
    { label: t('marketing.smsAds.kpi.revenue'), value: fmt(data.revenue) },
    {
      label: t('marketing.smsAds.kpi.roas'),
      value: data.roas == null ? '—' : fmt(data.roas),
    },
    { label: t('marketing.smsAds.kpi.conversion'), value: `${fmt(data.conversion_pct)}%` },
  ]

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 p-4 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{camp.name}</h1>
          <p className="text-muted-foreground text-sm">
            {t(`marketing.smsAds.status.${camp.status}`, { defaultValue: camp.status })} ·{' '}
            {formatSmsDateTime(
              camp.scheduled_at ? new Date(camp.scheduled_at * 1000).toISOString() : '',
              locale,
            )}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/marketing/sms">{t('marketing.smsAds.backHome')}</Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm font-normal">{k.label}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{k.value}</CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('marketing.smsAds.attributedOrders')}</CardTitle>
        </CardHeader>
        <CardContent>
          {(data.order_samples ?? []).length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('marketing.smsAds.noOrders')}</p>
          ) : (
            <ul className="divide-border divide-y text-sm">
              {data.order_samples.map((o) => (
                <li key={o.id} className="flex justify-between gap-2 py-2">
                  <Link className="text-primary hover:underline" to={`/orders/${o.id}`}>
                    #{o.number}
                  </Link>
                  <span dir="ltr">{fmt(o.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('marketing.sms.message')}</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted/40 whitespace-pre-wrap rounded-lg p-3 text-sm">{camp.message}</pre>
        </CardContent>
      </Card>
    </div>
  )
}
