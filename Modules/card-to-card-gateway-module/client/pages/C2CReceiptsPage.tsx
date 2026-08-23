import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type C2CReceipt = {
  id: number
  number: string
  status: string
  total_html: string
  customer: string
  receipt_url: string
  thumb_url: string
  decided_by: string
  date: string
  edit_url: string
}

export default function C2CReceiptsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()

  const q = useQuery({
    queryKey: ['c2c', 'receipts'],
    queryFn: () => apiFetch<{ items: C2CReceipt[] }>('c2c/receipts?status=pending'),
  })

  const decide = useMutation({
    mutationFn: async (payload: { id: number; action: 'approve' | 'reject' }) =>
      apiFetch<{ item: C2CReceipt }>(`c2c/receipts/${payload.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: payload.action }),
      }),
    onSuccess: async () => {
      toast.success(t('common.saved'))
      await qc.invalidateQueries({ queryKey: ['c2c', 'receipts'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const items = q.data?.items ?? []

  return (
    <PageShell title={t('c2c.receiptsTitle')} subtitle={t('c2c.receiptsSubtitle')}>
      {q.isLoading ? (
        <p className="text-muted-foreground text-sm">{t('common.loading')}</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t('c2c.empty')}</p>
      ) : (
        <div className="grid gap-4">
          {items.map((row) => (
            <article
              key={row.id}
              className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-[180px_1fr_auto] md:items-center"
            >
              <div className="overflow-hidden rounded-md border bg-muted">
                {row.thumb_url ? (
                  <a href={row.receipt_url || row.thumb_url} target="_blank" rel="noreferrer">
                    <img src={row.thumb_url} alt="" className="h-40 w-full object-cover" />
                  </a>
                ) : (
                  <div className="text-muted-foreground flex h-40 items-center justify-center text-xs">
                    {t('c2c.noImage')}
                  </div>
                )}
              </div>
              <div className="space-y-1 text-sm">
                <p className="font-semibold">
                  {t('c2c.order')} #{row.number}
                </p>
                <p>
                  {t('c2c.amount')}:{' '}
                  <span dangerouslySetInnerHTML={{ __html: row.total_html }} />
                </p>
                {row.customer ? (
                  <p>
                    {t('c2c.customer')}: {row.customer}
                  </p>
                ) : null}
                {row.date ? <p className="text-muted-foreground">{row.date}</p> : null}
                {row.edit_url ? (
                  <p>
                    <a className="text-primary underline-offset-4 hover:underline" href={row.edit_url}>
                      {t('c2c.openOrder')}
                    </a>
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  disabled={decide.isPending}
                  onClick={() => void decide.mutateAsync({ id: row.id, action: 'approve' })}
                >
                  {t('c2c.approve')}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={decide.isPending}
                  onClick={() => void decide.mutateAsync({ id: row.id, action: 'reject' })}
                >
                  {t('c2c.reject')}
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  )
}
