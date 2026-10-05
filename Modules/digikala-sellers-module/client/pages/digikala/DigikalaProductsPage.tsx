import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { JobsTable, type JobLike } from '@/components/data/DumpUi'
import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type MappedRow = {
  wc_product_id: number
  wc_variation_id: number
  dk_product_id: string
  dk_variant_id: string
  last_sync_at?: string
  name?: string
  sku?: string
}

export default function DigikalaProductsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [productId, setProductId] = useState('')
  const [dkp, setDkp] = useState('')

  const run = useMutation({
    mutationFn: (path: string) => apiFetch(path, { method: 'POST', body: '{}' }),
    onSuccess: async () => {
      toast.success(t('digikala.jobQueued'))
      await qc.invalidateQueries({ queryKey: ['digikala', 'jobs'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })
  const jobsQ = useQuery({
    queryKey: ['digikala', 'jobs'],
    queryFn: () => apiFetch<{ jobs?: JobLike[] }>('digikala/jobs'),
  })
  const mappedQ = useQuery({
    queryKey: ['digikala', 'mapped'],
    queryFn: () => apiFetch<{ items: MappedRow[] }>('digikala/products/mapped'),
  })

  const mapOne = useMutation({
    mutationFn: () =>
      apiFetch(`digikala/products/${Number(productId) || 0}/map`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dkp }),
      }),
    onSuccess: async () => {
      toast.success(t('digikala.dkpMapped'))
      setDkp('')
      await qc.invalidateQueries({ queryKey: ['digikala', 'mapped'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const syncOne = useMutation({
    mutationFn: (row: MappedRow) =>
      apiFetch(`digikala/products/${row.wc_product_id}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variation_id: row.wc_variation_id }),
      }),
    onSuccess: () => toast.success(t('digikala.syncQueued')),
    onError: (e: Error) => toastApiError(t, e),
  })

  const items = mappedQ.data?.items ?? []

  return (
    <PageShell title={t('digikala.productsTitle')} description={t('digikala.productsSubtitle')}>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{t('digikala.productActions')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={() => run.mutate('digikala/sync/products/import')}>{t('digikala.importProducts')}</Button>
          <Button variant="secondary" onClick={() => run.mutate('digikala/sync/products/export')}>
            {t('digikala.exportProducts')}
          </Button>
          <Button variant="outline" onClick={() => run.mutate('digikala/sync/inventory')}>
            {t('digikala.syncInventory')}
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{t('digikala.mapDkpTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <Label className="text-xs">{t('digikala.wcProductId')}</Label>
            <Input value={productId} onChange={(e) => setProductId(e.target.value)} className="w-32" dir="ltr" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t('digikala.dkpCode')}</Label>
            <Input
              value={dkp}
              onChange={(e) => setDkp(e.target.value)}
              placeholder="DKP-10252314"
              className="w-48"
              dir="ltr"
            />
          </div>
          <Button onClick={() => void mapOne.mutateAsync()} disabled={!productId || !dkp || mapOne.isPending}>
            {t('digikala.findVariants')}
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{t('digikala.mappedProducts')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('products.colName')}</TableHead>
                <TableHead>{t('digikala.dkpCode')}</TableHead>
                <TableHead>{t('wnc.remoteVariantId')}</TableHead>
                <TableHead>{t('wnc.lastSync')}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground p-6 text-center text-sm">
                    {t('common.empty')}
                  </TableCell>
                </TableRow>
              ) : (
                items.map((row) => (
                  <TableRow key={`${row.wc_product_id}-${row.wc_variation_id}`}>
                    <TableCell>
                      <Link to={`/shop/products/${row.wc_product_id}`} className="hover:underline">
                        {row.name || `#${row.wc_product_id}`}
                      </Link>
                      {row.wc_variation_id > 0 ? (
                        <span className="text-muted-foreground text-xs"> · #{row.wc_variation_id}</span>
                      ) : null}
                    </TableCell>
                    <TableCell className="font-mono text-xs" dir="ltr">
                      {row.dk_product_id ? `DKP-${row.dk_product_id}` : '—'}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{row.dk_variant_id || '—'}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{row.last_sync_at || '—'}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={syncOne.isPending || !row.dk_variant_id}
                        onClick={() => void syncOne.mutateAsync(row)}
                      >
                        {t('digikala.syncPriceStock')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('digikala.recentJobs')}</CardTitle>
        </CardHeader>
        <CardContent>
          <JobsTable
            jobs={jobsQ.data?.jobs ?? []}
            emptyLabel={t('common.empty')}
            typeLabel={t('digikala.col.type', 'Type')}
            statusLabel={t('digikala.col.status', 'Status')}
            errorLabel={t('digikala.col.error', 'Error')}
          />
        </CardContent>
      </Card>
    </PageShell>
  )
}
