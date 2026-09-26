import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { PageShell } from '@/components/PageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'
import { formatDisplayDateTime } from '@/lib/date'
import { ticketStatusLabel } from '@/pages/account/AccountTicketsPage'

type Reply = {
  id: number
  author: string
  is_staff: boolean
  body: string
  created_at: string
}

type TicketDetail = {
  id: number
  subject: string
  status: string
  user_name?: string
  user_email?: string
  csat_rating?: number | null
  replies: Reply[]
}

export function TicketDetailView({ staff }: { staff: boolean }) {
  const { t, i18n } = useTranslation()
  const { ticketId } = useParams()
  const qc = useQueryClient()
  const [body, setBody] = useState('')
  const [status, setStatus] = useState('')
  const id = Number(ticketId)
  const base = staff ? 'shop/tickets' : 'account/tickets'

  const q = useQuery({
    queryKey: ['ticket', staff ? 'staff' : 'account', id],
    queryFn: () => apiFetch<TicketDetail>(`${base}/${id}`),
    enabled: Number.isFinite(id) && id > 0,
  })
  useQueryErrorToast(q)

  const reply = useMutation({
    mutationFn: () =>
      apiFetch(`${base}/${id}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      }),
    onSuccess: () => {
      toast.success(t('common.saved'))
      setBody('')
      void qc.invalidateQueries({ queryKey: ['ticket'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const patchStatus = useMutation({
    mutationFn: (next: string) =>
      apiFetch(`${base}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      }),
    onSuccess: () => {
      toast.success(t('common.saved'))
      void qc.invalidateQueries({ queryKey: ['ticket'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const patchCsat = useMutation({
    mutationFn: (rating: number) =>
      apiFetch(`${base}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csat_rating: rating }),
      }),
    onSuccess: () => {
      toast.success(t('common.saved'))
      void qc.invalidateQueries({ queryKey: ['ticket'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const ticket = q.data
  const closed = ticket?.status === 'closed'
  const canRate =
    !!ticket &&
    (ticket.status === 'answered' || ticket.status === 'closed') &&
    (ticket.csat_rating == null || ticket.csat_rating < 1)

  return (
    <PageShell
      title={ticket?.subject || t('account.ticketDetailTitle')}
      description={staff && ticket?.user_name ? ticket.user_name : undefined}
    >
      {ticket ? (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Badge>{ticketStatusLabel(t, ticket.status)}</Badge>
          {staff ? (
            <select
              className="border-input bg-background h-9 rounded-md border px-2 text-sm"
              value={status || ticket.status}
              onChange={(e) => {
                setStatus(e.target.value)
                void patchStatus.mutateAsync(e.target.value)
              }}
            >
              {['open', 'answered', 'pending', 'closed'].map((s) => (
                <option key={s} value={s}>
                  {ticketStatusLabel(t, s)}
                </option>
              ))}
            </select>
          ) : null}
          {canRate || (ticket?.csat_rating != null && ticket.csat_rating > 0) ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground text-xs">{t('analytics.support.rateLabel')}</span>
              {ticket?.csat_rating != null && ticket.csat_rating > 0 ? (
                <span className="text-sm font-medium">{ticket.csat_rating}/5</span>
              ) : (
                [1, 2, 3, 4, 5].map((n) => (
                  <Button
                    key={n}
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={patchCsat.isPending}
                    onClick={() => void patchCsat.mutateAsync(n)}
                  >
                    {n}
                  </Button>
                ))
              )}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-3">
        {(ticket?.replies ?? []).map((r) => (
          <Card key={r.id}>
            <CardContent className="space-y-1 p-4">
              <p className="text-sm font-medium">
                {r.is_staff ? t('account.ticketStaff') : r.author || t('account.ticketYou')}
              </p>
              <p className="text-sm whitespace-pre-wrap">{r.body}</p>
              <p className="text-muted-foreground text-xs">{formatDisplayDateTime(r.created_at, i18n.language)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {ticket && (!closed || staff) ? (
        <div className="mt-6 space-y-2">
          <Label>{t('account.ticketReply')}</Label>
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} />
          <Button
            type="button"
            disabled={reply.isPending || !body.trim()}
            onClick={() => void reply.mutateAsync()}
          >
            {t('account.ticketSend')}
          </Button>
        </div>
      ) : null}
    </PageShell>
  )
}

export default function AccountTicketDetailPage() {
  return <TicketDetailView staff={false} />
}
