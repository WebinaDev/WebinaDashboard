import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

import type { LocItem, TapinShipment } from '../types'

type Props = { orderId: number }
type Kiosk = { id?: number | string; kiosk_id?: number | string; title?: string; name?: string }

function openHtml(html: string) {
  const w = window.open('', '_blank')
  if (w) {
    w.document.write(html)
    w.document.close()
  }
}

export function OrderTapinPanel({ orderId }: Props) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [province, setProvince] = useState(0)
  const [city, setCity] = useState(0)
  const [boxId, setBoxId] = useState(1)
  const [contentType, setContentType] = useState(1)
  const [weight, setWeight] = useState(0)
  const [kioskId, setKioskId] = useState(0)
  const [detailJson, setDetailJson] = useState('')

  const q = useQuery({
    queryKey: ['tapin-order', orderId],
    queryFn: () =>
      apiFetch<{ shipment: TapinShipment; provinces: LocItem[] }>(`shipping/tapin/orders/${orderId}`),
    enabled: orderId > 0,
  })
  useQueryErrorToast(q)

  const kiosksQ = useQuery({
    queryKey: ['tapin-kiosks'],
    queryFn: () => apiFetch<{ items: Kiosk[] }>('shipping/tapin/kiosks'),
    enabled: !!q.data?.shipment?.connected,
  })

  useEffect(() => {
    if (q.data?.shipment) {
      const s = q.data.shipment
      setProvince(s.province_code || 0)
      setCity(s.city_code || 0)
      setBoxId(s.box_id || 1)
      setContentType(s.content_type || 1)
      setWeight(s.weight || 0)
      setKioskId(s.kiosk_id || 0)
    }
  }, [q.data])

  const citiesQ = useQuery({
    queryKey: ['tapin-cities', province],
    queryFn: () => apiFetch<{ items: LocItem[] }>(`shipping/tapin/cities?province=${province}`),
    enabled: province > 0,
  })

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['tapin-order', orderId] })
    void qc.invalidateQueries({ queryKey: ['order', orderId] })
  }

  const register = useMutation({
    mutationFn: () =>
      apiFetch<{ ok: boolean; message: string }>(`shipping/tapin/orders/${orderId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ box_id: boxId, content_type: contentType, weight, kiosk_id: kioskId }),
      }),
    onSuccess: (data) => {
      if (data.ok) toast.success(data.message)
      else toast.error(data.message)
      invalidate()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const edit = useMutation({
    mutationFn: () =>
      apiFetch<{ ok: boolean; message: string }>(`shipping/tapin/orders/${orderId}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          province_code: province,
          city_code: city,
          box_id: boxId,
          content_type: contentType,
          package_weight: weight,
          kiosk_id: kioskId,
        }),
      }),
    onSuccess: (data) => {
      if (data.ok) toast.success(data.message)
      else toast.error(data.message)
      invalidate()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const detail = useMutation({
    mutationFn: () =>
      apiFetch<{ ok: boolean; message: string; detail?: unknown }>(
        `shipping/tapin/orders/${orderId}/detail`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }
      ),
    onSuccess: (data) => {
      if (data.ok) {
        toast.success(data.message)
        setDetailJson(JSON.stringify(data.detail ?? {}, null, 2))
      } else toast.error(data.message)
      invalidate()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const ready = useMutation({
    mutationFn: () =>
      apiFetch<{ ok: boolean; message: string }>(`shipping/tapin/orders/${orderId}/ready`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      }),
    onSuccess: (data) => {
      if (data.ok) toast.success(data.message)
      else toast.error(data.message)
      invalidate()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const refresh = useMutation({
    mutationFn: () =>
      apiFetch<{ ok: boolean; message: string }>(`shipping/tapin/orders/${orderId}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      }),
    onSuccess: (data) => {
      if (data.ok) toast.success(data.message)
      else toast.error(data.message)
      invalidate()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const label = useMutation({
    mutationFn: (kind: string) =>
      apiFetch<{ ok: boolean; message: string; html?: string }>(
        `shipping/tapin/orders/${orderId}/label`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kind }),
        }
      ),
    onSuccess: (data) => {
      if (!data.ok) {
        toast.error(data.message)
        return
      }
      toast.success(data.message)
      if (data.html) openHtml(data.html)
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const saveLoc = useMutation({
    mutationFn: () =>
      apiFetch(`shipping/tapin/orders/${orderId}/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ province_code: province, city_code: city }),
      }),
    onSuccess: () => {
      toast.success(t('common.saved'))
      invalidate()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const saveMeta = useMutation({
    mutationFn: () =>
      apiFetch(`shipping/tapin/orders/${orderId}/meta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ box_id: boxId, content_type: contentType, weight, kiosk_id: kioskId }),
      }),
    onSuccess: () => toast.success(t('common.saved')),
    onError: (e: Error) => toastApiError(t, e),
  })

  const shipment = q.data?.shipment
  const provinces = q.data?.provinces ?? []
  const cities = citiesQ.data?.items ?? []
  const boxes = shipment?.packing_boxes ?? []
  const kiosks = kiosksQ.data?.items ?? []

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t('tapin.orderTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {q.isPending ? (
          <p className="text-muted-foreground">{t('common.loading')}</p>
        ) : (
          <>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>{t('tapin.province')}</Label>
                <Select
                  value={province ? String(province) : undefined}
                  onValueChange={(v) => {
                    setProvince(parseInt(v, 10) || 0)
                    setCity(0)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('tapin.pickProvince')} />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((p) => (
                      <SelectItem key={p.code} value={String(p.code)}>
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>{t('tapin.city')}</Label>
                <Select value={city ? String(city) : undefined} onValueChange={(v) => setCity(parseInt(v, 10) || 0)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('tapin.pickCity')} />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((c) => (
                      <SelectItem key={c.code} value={String(c.code)}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="button" size="sm" variant="secondary" disabled={saveLoc.isPending} onClick={() => void saveLoc.mutate()}>
              {t('tapin.saveAddress')}
            </Button>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1">
                <Label>{t('tapin.boxSize')}</Label>
                <Select value={String(boxId)} onValueChange={(v) => setBoxId(parseInt(v, 10) || 1)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(boxes.length
                      ? boxes
                      : Array.from({ length: 13 }, (_, i) => ({ id: i + 1, title: String(i + 1) }))
                    ).map((b) => (
                      <SelectItem key={b.id} value={String(b.id)}>
                        {b.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>{t('tapin.contentType')}</Label>
                <Input
                  type="number"
                  dir="ltr"
                  value={contentType}
                  onChange={(e) => setContentType(parseInt(e.target.value, 10) || 1)}
                />
              </div>
              <div className="space-y-1">
                <Label>{t('tapin.orderWeight')}</Label>
                <Input
                  type="number"
                  dir="ltr"
                  value={weight}
                  onChange={(e) => setWeight(parseInt(e.target.value, 10) || 0)}
                />
              </div>
              <div className="space-y-1">
                <Label>{t('tapin.kiosk')}</Label>
                <Select value={String(kioskId)} onValueChange={(v) => setKioskId(parseInt(v, 10) || 0)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">{t('tapin.kioskNone')}</SelectItem>
                    {kiosks.map((k) => {
                      const id = Number(k.id ?? k.kiosk_id ?? 0)
                      return (
                        <SelectItem key={id} value={String(id)}>
                          {k.title || k.name || String(id)}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="button" size="sm" variant="outline" disabled={saveMeta.isPending} onClick={() => void saveMeta.mutate()}>
              {t('tapin.saveParcelMeta')}
            </Button>

            <div className="rounded-lg bg-muted/40 px-3 py-2 text-xs leading-relaxed space-y-1">
              {shipment?.barcode ? (
                <p>
                  {t('tapin.barcode')}: <span dir="ltr">{shipment.barcode}</span>
                </p>
              ) : (
                <p className="text-muted-foreground">{t('tapin.noBarcode')}</p>
              )}
              <p>
                {t('tapin.status')}: {shipment?.status_label || '—'}
              </p>
              {shipment?.order_id ? (
                <p>
                  {t('tapin.tapinOrderId')}: <span dir="ltr">{shipment.order_id}</span>
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" disabled={!shipment?.connected || register.isPending} onClick={() => void register.mutate()}>
                {t('tapin.registerShipment')}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={!shipment?.order_id || edit.isPending}
                onClick={() => void edit.mutate()}
              >
                {t('tapin.editShipment')}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={!shipment?.order_id || ready.isPending}
                onClick={() => void ready.mutate()}
              >
                {t('tapin.readyToShip')}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={!shipment?.order_id || label.isPending}
                onClick={() => void label.mutate('html')}
              >
                {t('tapin.printLabel')}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!shipment?.order_id || label.isPending}
                onClick={() => void label.mutate('label')}
              >
                {t('tapin.printLabelNative')}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!shipment?.order_id || label.isPending}
                onClick={() => void label.mutate('barcode')}
              >
                {t('tapin.printBarcode')}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!shipment?.order_id || detail.isPending}
                onClick={() => void detail.mutate()}
              >
                {t('tapin.fetchDetail')}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!shipment?.order_id || refresh.isPending}
                onClick={() => void refresh.mutate()}
              >
                {t('tapin.refreshStatus')}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                disabled={!shipment?.order_id && !shipment?.barcode}
                onClick={() => {
                  if (!window.confirm(t('tapin.clearLocalConfirm'))) return
                  void apiFetch<{ ok: boolean; message: string }>(`shipping/tapin/orders/${orderId}/clear`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: '{}',
                  })
                    .then((data) => {
                      if (data.ok) toast.success(data.message)
                      else toast.error(data.message)
                      invalidate()
                    })
                    .catch((e: Error) => toastApiError(t, e))
                }}
              >
                {t('tapin.clearLocal')}
              </Button>
            </div>
            {detailJson ? (
              <pre className="bg-muted/30 max-h-48 overflow-auto rounded-md p-2 text-[11px]" dir="ltr">
                {detailJson}
              </pre>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  )
}
