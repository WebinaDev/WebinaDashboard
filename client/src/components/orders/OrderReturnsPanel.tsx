import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type OrderItem = {
  item_id?: number
  name: string
  quantity: number
  returnable_qty?: number
}

type ReturnRow = {
  id: number
  order_item_id: number
  item_name: string
  qty: number
  reason: string
  status: string
  status_label: string
  resolution: string
  exchange_order_id?: number
  wc_refund_id?: number
}

type Props = {
  orderId: number
  items: OrderItem[]
  returns: ReturnRow[]
  returnEligible?: boolean
  returnAddress?: string
  staffMode: boolean
  orderBasePath?: string
}

export function OrderReturnsPanel({
  orderId,
  items,
  returns,
  returnEligible,
  returnAddress,
  staffMode,
  orderBasePath = '/orders/list',
}: Props) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [itemId, setItemId] = useState('')
  const [qty, setQty] = useState('1')
  const [reason, setReason] = useState('')

  const eligibleItems = items.filter((it) => (it.returnable_qty ?? it.quantity) > 0)

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['order', orderId] })
  }

  const createReturn = useMutation({
    mutationFn: () =>
      apiFetch(`orders/${orderId}/returns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_item_id: Number(itemId),
          qty: Number(qty) || 1,
          reason: reason.trim(),
          source: staffMode ? 'staff' : 'portal',
        }),
      }),
    onSuccess: () => {
      toast.success(t('orders.returns.created'))
      setReason('')
      setItemId('')
      setQty('1')
      invalidate()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const action = useMutation({
    mutationFn: ({ returnId, act }: { returnId: number; act: string }) =>
      apiFetch(`orders/${orderId}/returns/${returnId}/${act}`, { method: 'POST' }),
    onSuccess: () => {
      toast.success(t('common.saved'))
      invalidate()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const selected = eligibleItems.find((it) => String(it.item_id) === itemId)
  const maxQty = selected ? (selected.returnable_qty ?? selected.quantity) : 1

  return (
    <Card className="min-w-0 overflow-hidden shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">{t('orders.returns.title')}</CardTitle>
        <CardDescription>{t('orders.returns.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="min-w-0 space-y-4">
        {returnEligible && eligibleItems.length > 0 ? (
          <div className="space-y-3 rounded-lg border p-4">
            <p className="text-sm font-medium">{t('orders.returns.newRequest')}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>{t('orders.returns.selectItem')}</Label>
                <Select value={itemId} onValueChange={setItemId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={t('orders.returns.selectItem')} />
                  </SelectTrigger>
                  <SelectContent>
                    {eligibleItems.map((it) => (
                      <SelectItem key={it.item_id} value={String(it.item_id)}>
                        {it.name} ({t('orders.returns.availableQty', { count: it.returnable_qty ?? it.quantity })})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('orders.returns.qty')}</Label>
                <Input
                  className="mt-1"
                  type="number"
                  min={1}
                  max={maxQty}
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>{t('orders.returns.reason')}</Label>
                <Textarea className="mt-1" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              disabled={!itemId || !reason.trim() || createReturn.isPending}
              onClick={() => void createReturn.mutateAsync()}
            >
              {t('orders.returns.submit')}
            </Button>
          </div>
        ) : null}

        {returns.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t('orders.returns.empty')}</p>
        ) : (
          <ul className="space-y-3">
            {returns.map((row) => (
              <li key={row.id} className="min-w-0 rounded-lg border p-3">
                <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-medium">{row.item_name}</p>
                    <p className="text-muted-foreground break-words text-sm">
                      ×{row.qty} — {row.reason}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {row.status_label}
                  </Badge>
                </div>
                {row.status === 'approved' && returnAddress ? (
                  <p className="text-muted-foreground mt-2 break-words text-xs">
                    {t('orders.returns.shipTo')}: {returnAddress}
                  </p>
                ) : null}
                {row.exchange_order_id ? (
                  <p className="mt-2 text-sm">
                    <Link className="text-primary underline" to={`${orderBasePath}/${row.exchange_order_id}`}>
                      {t('orders.returns.exchangeOrder', { id: row.exchange_order_id })}
                    </Link>
                  </p>
                ) : null}
                {staffMode ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {row.status === 'requested' ? (
                      <>
                        <Button size="sm" variant="outline" disabled={action.isPending} onClick={() => void action.mutateAsync({ returnId: row.id, act: 'approve' })}>
                          {t('orders.returns.approve')}
                        </Button>
                        <Button size="sm" variant="outline" disabled={action.isPending} onClick={() => void action.mutateAsync({ returnId: row.id, act: 'reject' })}>
                          {t('orders.returns.reject')}
                        </Button>
                      </>
                    ) : null}
                    {row.status === 'approved' ? (
                      <Button size="sm" variant="outline" disabled={action.isPending} onClick={() => void action.mutateAsync({ returnId: row.id, act: 'receive' })}>
                        {t('orders.returns.receive')}
                      </Button>
                    ) : null}
                    {row.status === 'parcel_received' ? (
                      <>
                        <Button size="sm" variant="outline" disabled={action.isPending} onClick={() => void action.mutateAsync({ returnId: row.id, act: 'refund' })}>
                          {t('orders.returns.refund')}
                        </Button>
                        <Button size="sm" variant="outline" disabled={action.isPending} onClick={() => void action.mutateAsync({ returnId: row.id, act: 'exchange' })}>
                          {t('orders.returns.exchange')}
                        </Button>
                      </>
                    ) : null}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
