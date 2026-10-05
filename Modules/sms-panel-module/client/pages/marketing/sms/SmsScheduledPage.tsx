import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

import { SmsServiceBanner, isSmsUnavailable } from '@/components/marketing/SmsServiceBanner'
import { ScrollTable } from '@/components/ScrollTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { toastApiError } from '@/lib/apiError'
import { toPersianDigits } from '@/lib/date'
import {
  formatSmsDateTime,
  isUnixFuture,
  outboxId,
  outboxMessage,
  outboxSender,
  outboxTime,
  outboxType,
  resolveOutboxStatus,
  smsNum,
  unwrapSmsList,
} from '@/lib/sms-report'
import { cancelScheduledSms, fetchSmsOutbox, smsQueryOptions } from '@/lib/modirpayamak-api'

const PAGE_SIZE = 50

export default function SmsScheduledPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const outboxQ = useQuery({
    queryKey: ['sms', 'outbox', 'scheduled', page],
    queryFn: () => fetchSmsOutbox(page, PAGE_SIZE),
    ...smsQueryOptions,
  })
  useQueryErrorToast(outboxQ)

  const unavailable = isSmsUnavailable(outboxQ.data)
  const allItems = useMemo(
    () => (unavailable ? [] : unwrapSmsList(outboxQ.data?.data)),
    [unavailable, outboxQ.data],
  )

  const scheduled = useMemo(
    () =>
      allItems.filter((m) => {
        const stateId = smsNum(m, 'state_id')
        // Queued / send-queue / creating can still be scheduled; prefer future send time.
        if (isUnixFuture(outboxTime(m))) return true
        if (stateId != null && [0, 1, 5].includes(stateId) && isUnixFuture(m.time_send ?? m.time)) {
          return true
        }
        return false
      }),
    [allItems],
  )

  const loading = outboxQ.isPending

  const cancel = async (id: string) => {
    setCancellingId(id)
    try {
      const res = await cancelScheduledSms(id)
      if (res.ok) {
        toast.success(t('marketing.sms.cancelled'))
        void qc.invalidateQueries({ queryKey: ['sms', 'outbox'] })
      } else {
        toast.error(t('marketing.sms.cancelFailed'))
      }
    } catch (e) {
      toastApiError(t, e as Error)
    }
    setCancellingId(null)
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 p-4 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{t('marketing.sms.scheduledTitle')}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t('marketing.sms.scheduledHint')}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void outboxQ.refetch()}>
          <RefreshCw className="me-2 h-4 w-4" />
          {t('marketing.sms.refresh')}
        </Button>
      </div>

      {unavailable ? (
        <SmsServiceBanner message={outboxQ.data?.message} onRetry={() => void outboxQ.refetch()} />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t('marketing.sms.scheduledTitle')}</CardTitle>
          <CardDescription>{t('marketing.sms.scheduledHint')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollTable>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('marketing.sms.outboxId')}</TableHead>
                  <TableHead>{t('marketing.sms.senderLine')}</TableHead>
                  <TableHead>{t('marketing.sms.type')}</TableHead>
                  <TableHead>{t('marketing.sms.message')}</TableHead>
                  <TableHead>{t('marketing.sms.scheduledFor')}</TableHead>
                  <TableHead>{t('marketing.sms.status')}</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 5 }, (_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={7}>
                          <Skeleton className="h-7 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  : scheduled.length === 0
                    ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-muted-foreground text-sm">
                            {t('marketing.sms.noScheduled')}
                          </TableCell>
                        </TableRow>
                      )
                    : scheduled.map((m, i) => {
                        const id = outboxId(m)
                        return (
                          <TableRow key={`${id}-${i}`}>
                            <TableCell className="font-mono text-xs" dir="ltr">
                              {locale.startsWith('fa') ? toPersianDigits(id) : id}
                            </TableCell>
                            <TableCell className="font-mono text-xs" dir="ltr">
                              {outboxSender(m)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{outboxType(m)}</Badge>
                            </TableCell>
                            <TableCell className="max-w-[16rem] truncate" title={outboxMessage(m)}>
                              {outboxMessage(m)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {formatSmsDateTime(outboxTime(m), locale)}
                            </TableCell>
                            <TableCell>{resolveOutboxStatus(t, m)}</TableCell>
                            <TableCell>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={cancellingId === id || unavailable || id === '—'}
                                onClick={() => void cancel(id)}
                              >
                                {cancellingId === id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  t('marketing.sms.cancelSend')
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
              </TableBody>
            </Table>
          </ScrollTable>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="text-muted-foreground text-sm">
              {locale.startsWith('fa')
                ? toPersianDigits(t('marketing.sms.pageOf', { page: String(page) }))
                : t('marketing.sms.pageOf', { page: String(page) })}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={loading || allItems.length < PAGE_SIZE}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
