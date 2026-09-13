import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { MoneyDisplay } from '@/components/currency/MoneyDisplay'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

import type { PackagingPlan } from '../types'

type Props = {
  orderId: number
  currency?: string
  locale?: string
}

export function OrderPackagingPanel({ orderId, currency = 'IRT', locale = 'fa-IR' }: Props) {
  const { t } = useTranslation()
  const qc = useQueryClient()

  const q = useQuery({
    queryKey: ['shipping-order-packaging', orderId],
    queryFn: () => apiFetch<{ plan: PackagingPlan | null }>(`shipping/orders/${orderId}/packaging`),
    enabled: orderId > 0,
  })
  useQueryErrorToast(q)

  const recalc = useMutation({
    mutationFn: () =>
      apiFetch<{ plan: PackagingPlan }>(`shipping/orders/${orderId}/packaging`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      }),
    onSuccess: (data) => {
      qc.setQueryData(['shipping-order-packaging', orderId], data)
      toast.success(t('shipping.recalcOk'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const plan = q.data?.plan

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-base">{t('shipping.orderPackagingTitle')}</CardTitle>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={recalc.isPending}
          onClick={() => void recalc.mutateAsync()}
        >
          {t('shipping.recalcPlan')}
        </Button>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {q.isPending ? (
          <p className="text-muted-foreground">{t('common.loading')}</p>
        ) : !plan || !plan.boxes?.length ? (
          <p className="text-muted-foreground">{t('shipping.noPackagingPlan')}</p>
        ) : (
          <>
            <ul className="space-y-1">
              {plan.boxes.map((box, i) => (
                <li key={`${box.size}-${i}`} className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    {t('shipping.sizeN', { n: box.size })}
                    <span className="text-muted-foreground ms-2 text-xs" dir="ltr">
                      {box.length}×{box.width}×{box.height}
                    </span>
                    {box.oversized ? (
                      <span className="text-amber-700 ms-2 text-xs dark:text-amber-300">
                        {t('shipping.oversized')}
                      </span>
                    ) : null}
                  </span>
                  <MoneyDisplay amount={box.price} currency={currency} locale={locale} />
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-border pt-2 font-medium">
              <span>
                {t('shipping.boxCount', { count: plan.box_count })}
                {plan.oversized ? ` · ${t('shipping.oversized')}` : ''}
              </span>
              <MoneyDisplay
                amount={plan.total_packaging_cost}
                currency={currency}
                locale={locale}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
