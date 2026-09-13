import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type Hist = Record<string, unknown>

export default function TapinFinancePage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [price, setPrice] = useState(100000)
  const [page, setPage] = useState(1)
  const [shopName, setShopName] = useState('')
  const [shopMobile, setShopMobile] = useState('')
  const [shopFirst, setShopFirst] = useState('')
  const [shopLast, setShopLast] = useState('')

  const histQ = useQuery({
    queryKey: ['tapin-credit-history', page],
    queryFn: () =>
      apiFetch<{ ok: boolean; items: Hist[]; credit: number | null; total_count: number }>(
        `shipping/tapin/credit/history?page=${page}&count=20`
      ),
  })
  useQueryErrorToast(histQ)

  const detailQ = useQuery({
    queryKey: ['tapin-shop-detail'],
    queryFn: () => apiFetch<{ ok: boolean; detail: unknown; message: string }>('shipping/tapin/shop/detail'),
  })

  const topup = useMutation({
    mutationFn: () =>
      apiFetch<{ ok: boolean; message: string; url?: string }>('shipping/tapin/credit/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price,
          redirect_page: window.location.href,
        }),
      }),
    onSuccess: (d) => {
      if (!d.ok) {
        toast.error(d.message)
        return
      }
      toast.success(d.message)
      if (d.url) window.open(d.url, '_blank')
      void qc.invalidateQueries({ queryKey: ['tapin-credit-history'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const createShop = useMutation({
    mutationFn: () =>
      apiFetch<{ ok: boolean; message: string }>('shipping/tapin/shop/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_name: shopName,
          mobile: shopMobile,
          first_name: shopFirst,
          last_name: shopLast,
        }),
      }),
    onSuccess: (d) => {
      if (d.ok) {
        toast.success(d.message)
        void qc.invalidateQueries({ queryKey: ['tapin-shop-detail'] })
      } else toast.error(d.message)
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  return (
    <PageShell title={t('tapin.financeTitle')} description={t('tapin.financeHint')}>
      <div className="mb-4 flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link to="/settings/shop/transport/tapin">{t('tapin.openSettings')}</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/settings/shop/transport/tapin/ops">{t('tapin.opsTitle')}</Link>
        </Button>
      </div>

      <Card className="mb-4 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('tapin.credit')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-lg" dir="ltr">
            {histQ.data?.credit != null ? histQ.data.credit.toLocaleString() : '—'}
          </p>
          <div className="flex flex-wrap items-end gap-2">
            <div className="space-y-1.5">
              <Label>{t('tapin.topupAmount')}</Label>
              <Input type="number" dir="ltr" value={price} onChange={(e) => setPrice(parseInt(e.target.value, 10) || 0)} />
            </div>
            <Button type="button" disabled={topup.isPending || price < 1} onClick={() => void topup.mutate()}>
              {t('tapin.startTopup')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('tapin.creditHistory')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b text-start">
                  <th className="p-2">{t('tapin.price')}</th>
                  <th className="p-2">{t('tapin.status')}</th>
                  <th className="p-2">{t('tapin.createdAt')}</th>
                </tr>
              </thead>
              <tbody>
                {(histQ.data?.items ?? []).map((row, i) => (
                  <tr key={String(row.id ?? i)} className="border-b border-border/50">
                    <td className="p-2" dir="ltr">
                      {String(row.price ?? '—')}
                    </td>
                    <td className="p-2">{String(row.status_description ?? row.status ?? '—')}</td>
                    <td className="p-2" dir="ltr">
                      {String(row.create_at ?? row.created_at ?? '—')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              {t('common.prev')}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setPage((p) => p + 1)}>
              {t('common.next')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('tapin.shopDetail')}</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted/30 max-h-80 overflow-auto rounded-md p-2 text-[11px]" dir="ltr">
            {JSON.stringify(detailQ.data?.detail ?? { message: detailQ.data?.message }, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('tapin.createShop')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t('tapin.shopName')}</Label>
            <Input value={shopName} onChange={(e) => setShopName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t('tapin.mobile')}</Label>
            <Input dir="ltr" value={shopMobile} onChange={(e) => setShopMobile(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t('tapin.firstName')}</Label>
            <Input value={shopFirst} onChange={(e) => setShopFirst(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t('tapin.lastName')}</Label>
            <Input value={shopLast} onChange={(e) => setShopLast(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Button
              type="button"
              disabled={!shopName || createShop.isPending}
              onClick={() => void createShop.mutate()}
            >
              {t('tapin.createShop')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}
