import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { CommentRowActions } from '@/components/comments/CommentRowActions'
import type { CommentRow } from '@/components/comments/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'
import { formatDisplayDate } from '@/lib/date'
import { formatNumber } from '@/lib/formatNumber'

type HomeCommentsQueueProps = {
  items: CommentRow[]
  holdCount: number
  locale: string
}

export function HomeCommentsQueue({ items, holdCount, locale }: HomeCommentsQueueProps) {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const [busyId, setBusyId] = useState<number | null>(null)

  const patchStatus = useMutation({
    mutationFn: ({ id, nextStatus }: { id: number; nextStatus: string }) => {
      setBusyId(id)
      return apiFetch(`comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
    },
    onSuccess: () => {
      toast.success(t('common.saved'))
      void qc.invalidateQueries({ queryKey: ['dashboard-overview'] })
      void qc.invalidateQueries({ queryKey: ['comments'] })
    },
    onError: (err) => toastApiError(t, err),
    onSettled: () => setBusyId(null),
  })

  if (items.length === 0 && holdCount === 0) return null

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">
          {t('home.comments.queueTitle')} ({formatNumber(holdCount, locale)})
        </CardTitle>
        <Link className="text-primary text-xs hover:underline" to="/users/comments">
          {t('home.viewAll')}
        </Link>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0 pt-2">
        {items.length === 0 ? (
          <p className="text-muted-foreground px-4 pb-4 text-sm">{t('comments.emptyQueue')}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('comments.colAuthor')}</TableHead>
                <TableHead>{t('comments.colExcerpt')}</TableHead>
                <TableHead>{t('comments.colPost')}</TableHead>
                <TableHead className="text-end">{t('home.tables.colDate')}</TableHead>
                <TableHead className="w-28" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="text-sm font-medium">{row.author}</TableCell>
                  <TableCell className="max-w-[12rem] truncate text-sm">{row.excerpt}</TableCell>
                  <TableCell className="max-w-[8rem] truncate text-sm">{row.post_title}</TableCell>
                  <TableCell className="text-muted-foreground text-end text-xs">
                    {formatDisplayDate(row.date, i18n.language)}
                  </TableCell>
                  <TableCell>
                    <CommentRowActions
                      row={row}
                      statusFilter="hold"
                      quickEditOpen={false}
                      replyOpen={false}
                      busy={busyId === row.id}
                      onApprove={async () => {
                        await patchStatus.mutateAsync({ id: row.id, nextStatus: 'approve' })
                      }}
                      onUnapprove={async () => {
                        await patchStatus.mutateAsync({ id: row.id, nextStatus: 'hold' })
                      }}
                      onSpam={async () => {
                        await patchStatus.mutateAsync({ id: row.id, nextStatus: 'spam' })
                      }}
                      onTrash={async () => {
                        await patchStatus.mutateAsync({ id: row.id, nextStatus: 'trash' })
                      }}
                      onDelete={async () => {
                        await apiFetch(`comments/${row.id}`, { method: 'DELETE' })
                        void qc.invalidateQueries({ queryKey: ['dashboard-overview'] })
                      }}
                      onQuickEditToggle={() => {}}
                      onReplyToggle={() => {}}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
