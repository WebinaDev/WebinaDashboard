import { useMutation, useQuery } from '@tanstack/react-query'
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

type Row = Record<string, unknown>

function openHtml(html: string) {
  const w = window.open('', '_blank')
  if (w) {
    w.document.write(html)
    w.document.close()
  }
}

export default function TapinOpsPage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [wcIds, setWcIds] = useState('')
  const [bulkStatus, setBulkStatus] = useState(2)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const listQ = useQuery({
    queryKey: ['tapin-orders-list', page],
    queryFn: () =>
      apiFetch<{ ok: boolean; items: Row[]; total_count: number; message: string }>(
        `shipping/tapin/orders-list?page=${page}&count=20`
      ),
  })
  useQueryErrorToast(listQ)

  const reportQ = useQuery({
    queryKey: ['tapin-change-report'],
    queryFn: () => apiFetch<{ ok: boolean; entries: unknown }>('shipping/tapin/status/change-report'),
  })

  const lastQ = useQuery({
    queryKey: ['tapin-last-change'],
    queryFn: () => apiFetch<{ ok: boolean; entries: unknown }>('shipping/tapin/status/last-change'),
  })

  const [statusReportIds, setStatusReportIds] = useState('')
  const [statusReport, setStatusReport] = useState<unknown>(null)

  const parseIds = () =>
    wcIds
      .split(/[,\s]+/)
      .map((x) => parseInt(x, 10))
      .filter((n) => n > 0)

  const statusReportMut = useMutation({
    mutationFn: () =>
      apiFetch<{ ok: boolean; message: string; entries?: unknown }>('shipping/tapin/status/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orders_id: statusReportIds
            .split(/[,\s]+/)
            .map((x) => x.trim())
            .filter(Boolean),
        }),
      }),
    onSuccess: (d) => {
      if (d.ok) {
        toast.success(d.message)
        setStatusReport(d.entries)
      } else toast.error(d.message)
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const bulkStatusMut = useMutation({
    mutationFn: () =>
      apiFetch<{ ok: boolean; message: string }>('shipping/tapin/orders/bulk-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_ids: parseIds(), status: bulkStatus }),
      }),
    onSuccess: (d) => (d.ok ? toast.success(d.message) : toast.error(d.message)),
    onError: (e: Error) => toastApiError(t, e),
  })

  const bulkLabels = useMutation({
    mutationFn: () =>
      apiFetch<{ ok: boolean; message: string; html?: string }>('shipping/tapin/orders/bulk-labels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_ids: parseIds() }),
      }),
    onSuccess: (d) => {
      if (!d.ok) {
        toast.error(d.message)
        return
      }
      toast.success(d.message)
      if (d.html) openHtml(d.html)
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const labelsByDate = useMutation({
    mutationFn: () =>
      apiFetch<{ ok: boolean; message: string; html?: string }>('shipping/tapin/labels/by-date', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from_date: fromDate, to_date: toDate }),
      }),
    onSuccess: (d) => {
      if (!d.ok) {
        toast.error(d.message)
        return
      }
      toast.success(d.message)
      if (d.html) openHtml(d.html)
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const items = listQ.data?.items ?? []

  return (
    <PageShell title={t('tapin.opsTitle')} description={t('tapin.opsHint')}>
      <div className="mb-4 flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link to="/settings/shop/transport/tapin">{t('tapin.openSettings')}</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/settings/shop/transport/tapin/finance">{t('tapin.financeTitle')}</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/settings/shop/transport/tapin/catalog">{t('tapin.catalogTitle')}</Link>
        </Button>
      </div>

      <Card className="mb-4 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('tapin.tapinOrdersList')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {listQ.isPending ? (
            <p className="text-muted-foreground text-sm">{t('common.loading')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b text-start">
                    <th className="p-2">ID</th>
                    <th className="p-2">{t('tapin.barcode')}</th>
                    <th className="p-2">{t('tapin.status')}</th>
                    <th className="p-2">{t('tapin.recipient')}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row, i) => (
                    <tr key={String(row.id ?? row.order_id ?? i)} className="border-b border-border/50">
                      <td className="p-2" dir="ltr">
                        {String(row.order_id ?? row.id ?? '—')}
                      </td>
                      <td className="p-2" dir="ltr">
                        {String(row.barcode ?? '—')}
                      </td>
                      <td className="p-2">{String(row.status ?? '—')}</td>
                      <td className="p-2">
                        {String(row.first_name ?? '')} {String(row.last_name ?? '')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
          <CardTitle className="text-base">{t('tapin.bulkOps')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>{t('tapin.wcOrderIds')}</Label>
            <Input dir="ltr" value={wcIds} onChange={(e) => setWcIds(e.target.value)} placeholder="101, 102, 103" />
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <div className="space-y-1.5">
              <Label>{t('tapin.bulkStatus')}</Label>
              <Input type="number" dir="ltr" value={bulkStatus} onChange={(e) => setBulkStatus(parseInt(e.target.value, 10) || 2)} />
            </div>
            <Button type="button" disabled={bulkStatusMut.isPending} onClick={() => void bulkStatusMut.mutate()}>
              {t('tapin.applyBulkStatus')}
            </Button>
            <Button type="button" variant="secondary" disabled={bulkLabels.isPending} onClick={() => void bulkLabels.mutate()}>
              {t('tapin.bulkLabels')}
            </Button>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>{t('tapin.fromDate')}</Label>
              <Input dir="ltr" value={fromDate} onChange={(e) => setFromDate(e.target.value)} placeholder="1403-12-01" />
            </div>
            <div className="space-y-1.5">
              <Label>{t('tapin.toDate')}</Label>
              <Input dir="ltr" value={toDate} onChange={(e) => setToDate(e.target.value)} placeholder="1404-01-01" />
            </div>
            <div className="flex items-end">
              <Button type="button" variant="outline" disabled={labelsByDate.isPending} onClick={() => void labelsByDate.mutate()}>
                {t('tapin.labelsByDate')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('tapin.changeReport')}</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted/30 max-h-64 overflow-auto rounded-md p-2 text-[11px]" dir="ltr">
              {JSON.stringify(reportQ.data?.entries ?? {}, null, 2)}
            </pre>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('tapin.lastChange')}</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted/30 max-h-64 overflow-auto rounded-md p-2 text-[11px]" dir="ltr">
              {JSON.stringify(lastQ.data?.entries ?? {}, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('tapin.statusReport')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>{t('tapin.tapinOrderIds')}</Label>
            <Input
              dir="ltr"
              value={statusReportIds}
              onChange={(e) => setStatusReportIds(e.target.value)}
              placeholder="uuid-1, uuid-2"
            />
          </div>
          <Button type="button" disabled={statusReportMut.isPending} onClick={() => void statusReportMut.mutate()}>
            {t('tapin.fetchStatusReport')}
          </Button>
          {statusReport ? (
            <pre className="bg-muted/30 max-h-64 overflow-auto rounded-md p-2 text-[11px]" dir="ltr">
              {JSON.stringify(statusReport, null, 2)}
            </pre>
          ) : null}
        </CardContent>
      </Card>
    </PageShell>
  )
}
