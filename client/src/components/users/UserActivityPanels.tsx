import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { OrderSidebarPanel } from '@/components/orders/OrderSidebarPanel'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { formatDisplayDate } from '@/lib/date'
import { formatNumber } from '@/lib/formatNumber'

type CommentRow = {
  id: number
  excerpt: string
  status: string
  date: string
  post_id: number
  post_title: string
}

function commentStatusLabel(t: (k: string) => string, status: string) {
  if (status === 'approved' || status === 'approve') return t('comments.statusApproved')
  if (status === 'spam') return t('comments.statusSpam')
  if (status === 'trash') return t('comments.statusTrash')
  return t('comments.statusPending')
}

type UserCommentsPanelProps = {
  userId: number
  locale: string
}

export function UserCommentsPanel({ userId, locale }: UserCommentsPanelProps) {
  const { t } = useTranslation()
  const q = useQuery({
    queryKey: ['comments', 'user', userId],
    queryFn: () =>
      apiFetch<{ items: CommentRow[]; found: number }>(
        `comments?user_id=${userId}&status=all&per_page=10`,
      ),
    enabled: userId > 0,
  })
  useQueryErrorToast(q)

  const items = q.data?.items ?? []
  const found = q.data?.found ?? 0

  return (
    <OrderSidebarPanel title={t('users.sectionComments')}>
      {q.isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : items.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t('users.commentsEmpty')}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((c) => (
            <li key={c.id} className="rounded-md border px-3 py-2 text-sm">
              <p className="line-clamp-2">{c.excerpt || t('common.emptyValue')}</p>
              <p className="text-muted-foreground mt-1 text-xs">
                {commentStatusLabel(t, c.status)} · {formatDisplayDate(c.date, locale)}
                {c.post_title ? ` · ${c.post_title}` : ''}
              </p>
            </li>
          ))}
        </ul>
      )}
      {found > 0 ? (
        <p className="text-muted-foreground mt-2 text-xs">
          {t('users.commentsCount', { count: formatNumber(found, locale) })}
        </p>
      ) : null}
      <Button asChild variant="outline" size="sm" className="mt-3">
        <Link to="/users/comments">{t('users.viewAllComments')}</Link>
      </Button>
    </OrderSidebarPanel>
  )
}

type NoteRow = {
  id: string
  content: string
  author: string
  created_at: string
}

type UserNotesPanelProps = {
  userId: number
  locale: string
  initialNotes?: NoteRow[]
}

export function UserNotesPanel({ userId, locale, initialNotes }: UserNotesPanelProps) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [draft, setDraft] = useState('')

  const q = useQuery({
    queryKey: ['user-notes', userId],
    queryFn: () => apiFetch<{ items: NoteRow[] }>(`users/${userId}/notes`),
    enabled: userId > 0,
    initialData: initialNotes ? { items: initialNotes } : undefined,
  })
  useQueryErrorToast(q)

  const create = useMutation({
    mutationFn: () =>
      apiFetch<NoteRow>(`users/${userId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: draft }),
      }),
    onSuccess: () => {
      setDraft('')
      void qc.invalidateQueries({ queryKey: ['user-notes', userId] })
      void qc.invalidateQueries({ queryKey: ['user', userId] })
      toast.success(t('common.saved'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const del = useMutation({
    mutationFn: (noteId: string) =>
      apiFetch(`users/${userId}/notes/${encodeURIComponent(noteId)}`, { method: 'DELETE' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['user-notes', userId] })
      void qc.invalidateQueries({ queryKey: ['user', userId] })
      toast.success(t('common.deleted'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const items = [...(q.data?.items ?? [])].reverse()

  return (
    <OrderSidebarPanel title={t('users.sectionNotes')}>
      <textarea
        className="border-input bg-background min-h-[72px] w-full rounded-md border px-3 py-2 text-sm"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={t('users.notesPlaceholder')}
      />
      <Button
        type="button"
        size="sm"
        className="mt-2"
        disabled={!draft.trim() || create.isPending}
        onClick={() => void create.mutateAsync()}
      >
        {t('users.addNote')}
      </Button>
      {q.isLoading && !items.length ? (
        <Skeleton className="mt-3 h-20 w-full" />
      ) : items.length === 0 ? (
        <p className="text-muted-foreground mt-3 text-sm">{t('users.notesEmpty')}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((n) => (
            <li key={n.id} className="rounded-md border px-3 py-2 text-sm">
              <p className="whitespace-pre-wrap">{n.content}</p>
              <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                <p className="text-muted-foreground text-xs">
                  {n.author || '—'}
                  {n.created_at ? ` · ${formatDisplayDate(n.created_at, locale)}` : ''}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive h-7 px-2"
                  disabled={del.isPending}
                  onClick={() => void del.mutateAsync(n.id)}
                >
                  {t('common.delete')}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </OrderSidebarPanel>
  )
}
