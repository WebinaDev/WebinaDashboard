import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { SmsServiceBanner, isSmsUnavailable } from '@/components/marketing/SmsServiceBanner'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { toastApiError } from '@/lib/apiError'
import { fetchSmsPackages, initSmsTopup, smsQueryOptions, type SmsPackage } from '@/lib/modirpayamak-api'

export default function SmsTopupPage() {
  const { t } = useTranslation()

  const packagesQ = useQuery({
    queryKey: ['sms', 'packages'],
    queryFn: () => fetchSmsPackages(),
    ...smsQueryOptions,
  })
  useQueryErrorToast(packagesQ)

  const payM = useMutation({
    mutationFn: (id: number) => initSmsTopup(id),
    onSuccess: (res) => {
      if (res.payment_url) {
        window.location.href = res.payment_url
        return
      }
      if (isSmsUnavailable(res)) {
        toast.error(res.message ?? t('marketing.sms.serviceUnavailable'))
        return
      }
      toast.error(t('marketing.sms.sendFailed'))
    },
    onError: (err: Error) => toastApiError(t, err),
  })

  const unavailable = isSmsUnavailable(packagesQ.data)
  const packages: SmsPackage[] = unavailable ? [] : (packagesQ.data?.packages ?? [])
  const loading = packagesQ.isPending

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-semibold">{t('marketing.sms.topupTitle')}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t('marketing.sms.topupHint')}</p>
      </div>

      {unavailable ? (
        <SmsServiceBanner message={packagesQ.data?.message} onRetry={() => void packagesQ.refetch()} />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }, (_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-24" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))
          : packages.map((p) => (
              <Card key={p.id}>
                <CardHeader>
                  <CardTitle>{p.name}</CardTitle>
                  <CardDescription>{t('marketing.sms.topupHint')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-2xl font-bold">
                    {p.amount.toLocaleString()} {t('marketing.sms.toman')}
                  </p>
                  {p.bonus > 0 ? (
                    <p className="text-muted-foreground text-sm">
                      + {p.bonus.toLocaleString()} {t('marketing.sms.bonus')}
                    </p>
                  ) : null}
                  <Button disabled={unavailable || payM.isPending} onClick={() => payM.mutate(p.id)}>
                    {t('marketing.sms.buy')}
                  </Button>
                </CardContent>
              </Card>
            ))}
        {!loading && !packages.length && !unavailable ? (
          <p className="text-muted-foreground text-sm">{t('common.empty')}</p>
        ) : null}
      </div>
    </div>
  )
}
