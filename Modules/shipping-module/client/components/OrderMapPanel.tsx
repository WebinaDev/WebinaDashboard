import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

export function OrderMapPanel({ orderId }: { orderId: number }) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [lat, setLat] = useState(0)
  const [lng, setLng] = useState(0)
  const q = useQuery({
    queryKey: ['shipping-order-map', orderId],
    queryFn: () =>
      apiFetch<{ location: string; lat: number; lng: number }>(`shipping/orders/${orderId}/map`),
    enabled: orderId > 0,
  })
  useQueryErrorToast(q)
  useEffect(() => {
    if (q.data) {
      setLat(q.data.lat || 0)
      setLng(q.data.lng || 0)
    }
  }, [q.data])
  const save = useMutation({
    mutationFn: () =>
      apiFetch(`shipping/orders/${orderId}/map`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng }),
      }),
    onSuccess: () => {
      toast.success(t('common.saved'))
      void qc.invalidateQueries({ queryKey: ['shipping-order-map', orderId] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t('shipping.orderMapTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1">
          <Label>Lat</Label>
          <Input type="number" dir="ltr" value={lat} onChange={(e) => setLat(parseFloat(e.target.value) || 0)} />
        </div>
        <div className="space-y-1">
          <Label>Lng</Label>
          <Input type="number" dir="ltr" value={lng} onChange={(e) => setLng(parseFloat(e.target.value) || 0)} />
        </div>
        <Button type="button" size="sm" className="sm:col-span-2" disabled={save.isPending} onClick={() => void save.mutate()}>
          {t('common.save')}
        </Button>
      </CardContent>
    </Card>
  )
}
