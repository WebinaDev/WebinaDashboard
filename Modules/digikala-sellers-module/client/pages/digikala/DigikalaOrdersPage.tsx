import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { DigikalaOrderActions } from '@/components/orders/DigikalaOrderActions'
import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'
import type { OrderListRow } from '@/components/orders/OrdersTable'

type DigikalaOrderRow = OrderListRow & {
  digikala_fulfillment?: string
  digikala_native_status?: string
  remote_status?: string
}

export default function DigikalaOrdersPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()

  const pull = useMutation({
    mutationFn: () => apiFetch('digikala/sync/orders/pull', { method: 'POST', body: '{}' }),
    onSuccess: async () => {
      toast.success(t('digikala.ordersPullQueued'))
      await qc.invalidateQueries({ queryKey: ['orders'] })
      await qc.invalidateQueries({ queryKey: ['digikala'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const listQ = useQuery({
    queryKey: ['orders', 'digikala'],
    queryFn: () =>
      apiFetch<{ items: DigikalaOrderRow[] }>('shop/orders?marketplace=digikala&per_page=50&orderby=date&order=desc'),
  })

  const items = listQ.data?.items ?? []

  return (
    <PageShell title={t('digikala.ordersTitle')} description={t('digikala.ordersSubtitle')}>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{t('digikala.pullOrders')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => pull.mutate()} disabled={pull.isPending}>
            {t('digikala.pullOrders')}
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t('digikala.wcOrders')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('orders.colNumber')}</TableHead>
                <TableHead>{t('orders.marketplaceRemoteId')}</TableHead>
                <TableHead>{t('orders.colStatus')}</TableHead>
                <TableHead>{t('digikala.nativeStatusLabel')}</TableHead>
                <TableHead>{t('digikala.fulfillment')}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground p-6 text-center text-sm">
                    {t('common.empty')}
                  </TableCell>
                </TableRow>
              ) : (
                items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Link to={`/orders/list/${row.id}`} className="text-primary font-medium hover:underline">
                        #{row.number}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{row.remote_order_id || '—'}</TableCell>
                    <TableCell className="text-sm">{row.status}</TableCell>
                    <TableCell className="text-sm">
                      {t(`digikala.nativeStatus.${row.remote_status || 'active'}`, row.remote_status || '—')}
                    </TableCell>
                    <TableCell className="text-sm">
                      {t(`digikala.fulfillment.${row.digikala_fulfillment || 'digikala'}`, row.digikala_fulfillment || '—')}
                    </TableCell>
                    <TableCell>
                      <DigikalaOrderActions
                        orderId={row.id}
                        order={{
                          marketplace: 'digikala',
                          digikala_fulfillment: row.digikala_fulfillment,
                          digikala_native_status: row.remote_status,
                          remote_status: row.remote_status,
                          remote_order_id: row.remote_order_id,
                          status: row.status,
                        }}
                        onDone={() => void qc.invalidateQueries({ queryKey: ['orders', 'digikala'] })}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageShell>
  )
}
