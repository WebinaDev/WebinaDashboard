import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { BasalamNav } from '../../components/BasalamNav'
import {
  basalamJobErrorLabel,
  basalamJobStatusLabel,
  basalamJobTime,
  basalamJobType,
  basalamJobTypeLabel,
  type BasalamJobLike,
} from '../../lib/basalamJobs'
import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'
import { formatDisplayDateTime } from '@/lib/date'

type ProductRow = {
  id: number
  name: string
  sku?: string
  connected?: boolean
  basalam_product_id?: string | null
  basalam_product_ids?: string[]
  sync_status?: string | null
}

type QueueResponse = {
  ok?: boolean
  cancelled?: boolean
  creatable_count?: number
  message?: string
  job_type?: string
}

export default function BasalamProductsPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const [filter, setFilter] = useState<'all' | 'connected' | 'unconnected'>('all')
  const [connectBasalamId, setConnectBasalamId] = useState<Record<number, string>>({})

  const productsQ = useQuery({
    queryKey: ['basalam', 'products', filter],
    queryFn: () =>
      apiFetch<{ products: ProductRow[]; total: number }>(
        `basalam/products?filter=${filter}&per_page=50`,
      ),
    refetchInterval: 15000,
  })

  const jobsQ = useQuery({
    queryKey: ['basalam', 'jobs'],
    queryFn: () => apiFetch<{ jobs: BasalamJobLike[] }>('basalam/jobs'),
    refetchInterval: 5000,
  })

  const run = useMutation({
    mutationFn: (path: string) => apiFetch<QueueResponse>(path, { method: 'POST' }),
    onSuccess: async (data, path) => {
      if (path.includes('jobs/cancel')) {
        toast.success(t('basalam.jobsCancelled'))
      } else if (path.includes('create-all')) {
        const n = Number(data?.creatable_count ?? 0)
        if (n <= 0) {
          toast.message(t('basalam.createAllNoneEligible'))
        } else {
          toast.success(t('basalam.createAllQueued', { count: n }))
        }
      } else {
        toast.success(t('basalam.jobQueued'))
      }
      await qc.invalidateQueries({ queryKey: ['basalam'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const single = useMutation({
    mutationFn: (body: { path: string; payload: Record<string, unknown> }) =>
      apiFetch(body.path, { method: 'POST', body: JSON.stringify(body.payload) }),
    onSuccess: async () => {
      toast.success(t('basalam.jobQueued'))
      await qc.invalidateQueries({ queryKey: ['basalam'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  return (
    <PageShell title={t('basalam.productsTitle')} description={t('basalam.productsSubtitle')}>
      <BasalamNav />
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{t('basalam.productActions')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={() => run.mutate('basalam/sync/products/create-all')}>{t('basalam.createAll')}</Button>
          <Button variant="secondary" onClick={() => run.mutate('basalam/sync/products/update-all')}>
            {t('basalam.updateAll')}
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              apiFetch('basalam/sync/products/update-all', {
                method: 'POST',
                body: JSON.stringify({ mode: 'quick' }),
              })
                .then(async () => {
                  toast.success(t('basalam.jobQueued'))
                  await qc.invalidateQueries({ queryKey: ['basalam', 'jobs'] })
                })
                .catch((e: Error) => toastApiError(t, e))
            }
          >
            {t('basalam.quickUpdate')}
          </Button>
          <Button variant="outline" onClick={() => run.mutate('basalam/sync/products/connect-all')}>
            {t('basalam.autoConnect')}
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (!window.confirm(t('basalam.cancelJobsConfirm'))) return
              run.mutate('basalam/jobs/cancel')
            }}
          >
            {t('basalam.cancelJobs')}
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{t('basalam.productList')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(['all', 'connected', 'unconnected'] as const).map((f) => (
              <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)}>
                {t(`basalam.filter.${f}`)}
              </Button>
            ))}
            <span className="text-muted-foreground self-center text-xs">
              {t('basalam.total')}: {productsQ.data?.total ?? 0}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-start">
                  <th className="py-2 pe-2">ID</th>
                  <th className="py-2 pe-2">{t('basalam.col.name')}</th>
                  <th className="py-2 pe-2">{t('basalam.col.basalamId')}</th>
                  <th className="py-2 pe-2">{t('basalam.col.status')}</th>
                  <th className="py-2">{t('basalam.col.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {(productsQ.data?.products ?? []).map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="py-2 pe-2">{p.id}</td>
                    <td className="py-2 pe-2">{p.name}</td>
                    <td className="py-2 pe-2">
                      {(p.basalam_product_ids && p.basalam_product_ids.length > 1
                        ? p.basalam_product_ids.join(', ')
                        : null) ??
                        p.basalam_product_id ??
                        '—'}
                    </td>
                    <td className="py-2 pe-2">{p.connected ? t('basalam.connected') : t('basalam.notConnected')}</td>
                    <td className="flex flex-wrap gap-1 py-2">
                      {!p.connected ? (
                        <Button
                          size="sm"
                          onClick={() =>
                            single.mutate({
                              path: 'basalam/sync/products/create',
                              payload: { product_id: p.id },
                            })
                          }
                        >
                          {t('basalam.createOne')}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            single.mutate({
                              path: 'basalam/sync/products/update',
                              payload: { product_id: p.id },
                            })
                          }
                        >
                          {t('basalam.updateOne')}
                        </Button>
                      )}
                      {p.connected ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              single.mutate({
                                path: 'basalam/sync/products/disconnect',
                                payload: { product_id: p.id },
                              })
                            }
                          >
                            {t('basalam.disconnect')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              single.mutate({
                                path: 'basalam/sync/products/archive',
                                payload: { product_id: p.id },
                              })
                            }
                          >
                            {t('basalam.archiveOne')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              single.mutate({
                                path: 'basalam/sync/products/restore',
                                payload: { product_id: p.id },
                              })
                            }
                          >
                            {t('basalam.restoreOne')}
                          </Button>
                        </>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          <Input
                            className="h-8 max-w-[8rem]"
                            placeholder="Basalam ID"
                            value={connectBasalamId[p.id] ?? ''}
                            onChange={(e) =>
                              setConnectBasalamId((prev) => ({ ...prev, [p.id]: e.target.value }))
                            }
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!connectBasalamId[p.id]}
                            onClick={() =>
                              single.mutate({
                                path: 'basalam/sync/products/connect',
                                payload: {
                                  product_id: p.id,
                                  basalam_product_id: Number(connectBasalamId[p.id]) || 0,
                                },
                              })
                            }
                          >
                            {t('basalam.connectOne')}
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('basalam.recentJobs')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-start">
                  <th className="py-2 pe-2">ID</th>
                  <th className="py-2 pe-2">{t('basalam.col.type')}</th>
                  <th className="py-2 pe-2">{t('basalam.col.status')}</th>
                  <th className="py-2 pe-2">{t('basalam.col.time')}</th>
                  <th className="py-2">{t('basalam.col.error')}</th>
                </tr>
              </thead>
              <tbody>
                {(jobsQ.data?.jobs ?? []).slice(0, 30).map((j) => (
                  <tr key={String(j.id)} className="border-b align-top">
                    <td className="py-2 pe-2">{j.id}</td>
                    <td className="py-2 pe-2">{basalamJobTypeLabel(basalamJobType(j), t)}</td>
                    <td className="py-2 pe-2">{basalamJobStatusLabel(j.status, t)}</td>
                    <td className="text-muted-foreground py-2 pe-2 text-xs">
                      {formatDisplayDateTime(basalamJobTime(j), i18n.language)}
                    </td>
                    <td className="text-muted-foreground max-w-md break-all py-2 text-xs">
                      {basalamJobErrorLabel(j.error_message, t)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}
