import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'
import { formatDisplayDateTime } from '@/lib/date'
import { cn } from '@/lib/utils'

type NotificationRow = {
  id: number
  type: string
  title: string
  body: string
  link: string
  read: boolean
  created_at: string
}

export default function AccountNotificationsPage() {
  const { t, i18n } = useTranslation()
  const nav = useNavigate()
  const qc = useQueryClient()
  const q = useQuery({
    queryKey: ['account', 'notifications'],
    queryFn: () => apiFetch<{ items: NotificationRow[]; total: number; unread: number }>('account/notifications'),
  })
  useQueryErrorToast(q)

  const markOne = useMutation({
    mutationFn: (id: number) => apiFetch(`account/notifications/${id}/read`, { method: 'POST' }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['account', 'notifications'] }),
    onError: (e: Error) => toastApiError(t, e),
  })

  const markAll = useMutation({
    mutationFn: () => apiFetch('account/notifications', { method: 'POST' }),
    onSuccess: () => {
      toast.success(t('common.saved'))
      void qc.invalidateQueries({ queryKey: ['account', 'notifications'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const items = q.data?.items ?? []

  return (
    <PageShell title={t('account.notificationsTitle')} description={t('account.notificationsSubtitle')}>
      <div className="mb-3 flex justify-end">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={markAll.isPending || (q.data?.unread ?? 0) === 0}
          onClick={() => void markAll.mutateAsync()}
        >
          {t('account.markAllRead')}
        </Button>
      </div>
      <Card>
        <CardContent className="divide-y p-0">
          {items.length === 0 ? (
            <p className="text-muted-foreground p-6 text-sm">{t('common.empty')}</p>
          ) : (
            items.map((row) => (
              <button
                key={row.id}
                type="button"
                className={cn(
                  'block w-full p-4 text-start transition-colors hover:bg-muted/40',
                  !row.read && 'bg-muted/30',
                )}
                onClick={() => {
                  if (!row.read) void markOne.mutateAsync(row.id)
                  if (!row.link) return
                  if (row.link.startsWith('/')) nav(row.link)
                  else window.location.assign(row.link)
                }}
              >
                <p className="text-sm font-medium">{row.title}</p>
                {row.body ? <p className="text-muted-foreground mt-1 text-sm">{row.body}</p> : null}
                <p className="text-muted-foreground mt-1 text-xs">
                  {formatDisplayDateTime(row.created_at, i18n.language)}
                </p>
              </button>
            ))
          )}
        </CardContent>
      </Card>
    </PageShell>
  )
}
