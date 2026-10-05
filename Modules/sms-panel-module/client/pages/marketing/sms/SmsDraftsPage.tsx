import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Send } from 'lucide-react'
import { toast } from 'sonner'

import { SmsServiceBanner, isSmsUnavailable } from '@/components/marketing/SmsServiceBanner'
import { ScrollTable } from '@/components/ScrollTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { toastApiError } from '@/lib/apiError'
import { createSmsDraft, deleteSmsDraft, fetchSmsDrafts, smsQueryOptions } from '@/lib/modirpayamak-api'

function asRows(data: unknown): Array<Record<string, unknown>> {
  if (!data) return []
  if (Array.isArray(data)) return data as Array<Record<string, unknown>>
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>
    if (Array.isArray(obj.data)) return obj.data as Array<Record<string, unknown>>
    if (Array.isArray(obj.drafts)) return obj.drafts as Array<Record<string, unknown>>
    if (Array.isArray(obj.items)) return obj.items as Array<Record<string, unknown>>
  }
  return []
}

function draftMessage(row: Record<string, unknown>): string {
  return String(row.message ?? row.text ?? row.body ?? '')
}

export default function SmsDraftsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)

  const q = useQuery({
    queryKey: ['sms', 'drafts'],
    queryFn: () => fetchSmsDrafts(1),
    ...smsQueryOptions,
  })
  useQueryErrorToast(q)
  const unavailable = isSmsUnavailable(q.data)
  const rows = useMemo(() => (unavailable ? [] : asRows(q.data?.data)), [unavailable, q.data])

  const saveM = useMutation({
    mutationFn: async () => {
      const oldId = editingId
      await createSmsDraft({ title, message, text: message })
      if (oldId) {
        await deleteSmsDraft(oldId)
      }
    },
    onSuccess: async () => {
      toast.success(t('marketing.sms.draftSaved'))
      setTitle('')
      setMessage('')
      setEditingId(null)
      await qc.invalidateQueries({ queryKey: ['sms', 'drafts'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const deleteM = useMutation({
    mutationFn: (id: number) => deleteSmsDraft(id),
    onSuccess: async () => {
      toast.success(t('marketing.sms.draftDeleted'))
      if (editingId) {
        setEditingId(null)
        setTitle('')
        setMessage('')
      }
      await qc.invalidateQueries({ queryKey: ['sms', 'drafts'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const startEdit = (row: Record<string, unknown>) => {
    const id = Number(row.id ?? 0)
    setEditingId(id || null)
    setTitle(String(row.title ?? row.name ?? ''))
    setMessage(draftMessage(row))
  }

  const cancelEdit = () => {
    setEditingId(null)
    setTitle('')
    setMessage('')
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-semibold">{t('marketing.sms.draftsTitle')}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t('marketing.sms.draftsHint')}</p>
      </div>

      {unavailable ? (
        <SmsServiceBanner message={q.data?.message} onRetry={() => void q.refetch()} />
      ) : null}

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>
            {editingId ? t('marketing.sms.editDraft') : t('marketing.sms.newDraft')}
          </CardTitle>
          <CardDescription>{t('marketing.sms.draftsHint')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <fieldset disabled={unavailable} className="space-y-3">
            <div>
              <Label>{t('marketing.sms.name')}</Label>
              <Input className="mt-1" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label>{t('marketing.sms.message')}</Label>
              <Textarea className="mt-1" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={saveM.isPending || !message.trim()}
                onClick={() => saveM.mutate()}
              >
                {t('common.save')}
              </Button>
              {editingId ? (
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  {t('common.cancel')}
                </Button>
              ) : null}
            </div>
          </fieldset>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('marketing.sms.draftsTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollTable>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('marketing.sms.name')}</TableHead>
                  <TableHead>{t('marketing.sms.message')}</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {q.isPending
                  ? Array.from({ length: 3 }, (_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={3}>
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  : rows.length === 0
                    ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-muted-foreground text-sm">
                            {t('marketing.sms.noDrafts')}
                          </TableCell>
                        </TableRow>
                      )
                    : rows.map((r, i) => {
                        const id = Number(r.id ?? 0)
                        const body = draftMessage(r)
                        return (
                          <TableRow key={id || i}>
                            <TableCell className="font-medium">
                              {String(r.title ?? r.name ?? `#${id || i + 1}`)}
                            </TableCell>
                            <TableCell className="max-w-md whitespace-pre-wrap text-sm">{body}</TableCell>
                            <TableCell className="space-x-2 text-end">
                              <Button type="button" size="sm" variant="outline" onClick={() => startEdit(r)}>
                                {t('common.edit')}
                              </Button>
                              <Button type="button" size="sm" variant="secondary" asChild disabled={!body.trim()}>
                                <Link
                                  to="/marketing/sms/send"
                                  state={{ message: body, draftTitle: String(r.title ?? r.name ?? '') }}
                                >
                                  <Send className="me-1 h-3.5 w-3.5" />
                                  {t('marketing.sms.sendFromDraft')}
                                </Link>
                              </Button>
                              {id ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  disabled={deleteM.isPending}
                                  onClick={() => deleteM.mutate(id)}
                                >
                                  {t('marketing.sms.deleteDraft')}
                                </Button>
                              ) : null}
                            </TableCell>
                          </TableRow>
                        )
                      })}
              </TableBody>
            </Table>
          </ScrollTable>
        </CardContent>
      </Card>
    </div>
  )
}
