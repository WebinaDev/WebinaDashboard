import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { toastApiError } from '@/lib/apiError'
import {
  approveAiBlogTopic,
  approveAiBlogTopicsMany,
  fetchAiBlogTopics,
  regenerateAiBlogImage,
  skipAiBlogTopic,
  suggestAiBlogTopics,
  type AiBlogTopic,
} from '../lib/ai-content-api'

type EditRow = { topic: string; focus_keyword: string }

export default function AiBlogPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [count, setCount] = useState(8)
  const [edits, setEdits] = useState<Record<string, EditRow>>({})
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [filter, setFilter] = useState<'all' | 'pending' | 'queued' | 'done'>('all')

  const listQ = useQuery({
    queryKey: ['ai-content', 'blog-topics'],
    queryFn: () => fetchAiBlogTopics('all'),
    refetchInterval: (q) => {
      const items = q.state.data?.items ?? []
      return items.some((i) => i.status === 'queued' || i.status === 'pending') ? 4000 : false
    },
  })
  useQueryErrorToast(listQ)

  useEffect(() => {
    const next: Record<string, EditRow> = {}
    for (const row of listQ.data?.items ?? []) {
      next[row.id] = {
        topic: row.topic,
        focus_keyword: row.focus_keyword,
      }
    }
    setEdits((prev) => {
      const merged = { ...next }
      for (const id of Object.keys(prev)) {
        if (merged[id] && prev[id]) {
          if (prev[id].topic !== next[id]?.topic || prev[id].focus_keyword !== next[id]?.focus_keyword) {
            // Keep local edits while pending.
            const server = (listQ.data?.items ?? []).find((r) => r.id === id)
            if (server?.status === 'pending') {
              merged[id] = prev[id]
            }
          }
        }
      }
      return merged
    })
  }, [listQ.data?.items])

  const items = useMemo(() => {
    const all = listQ.data?.items ?? []
    if (filter === 'all') return all.filter((r) => r.status !== 'skipped')
    return all.filter((r) => r.status === filter)
  }, [listQ.data?.items, filter])

  const pendingIds = useMemo(
    () => items.filter((r) => r.status === 'pending').map((r) => r.id),
    [items],
  )

  const selectedPending = useMemo(
    () => pendingIds.filter((id) => selected[id]),
    [pendingIds, selected],
  )

  const invalidate = () => void qc.invalidateQueries({ queryKey: ['ai-content'] })

  const suggest = useMutation({
    mutationFn: () => suggestAiBlogTopics(count),
    onSuccess: () => {
      toast.success(t('aiContent.jobQueued'))
      invalidate()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const approve = useMutation({
    mutationFn: (row: AiBlogTopic) =>
      approveAiBlogTopic(row.id, {
        topic: edits[row.id]?.topic ?? row.topic,
        focus_keyword: edits[row.id]?.focus_keyword ?? row.focus_keyword,
        category_id: row.category_id,
        category_name: row.category_name,
      }),
    onSuccess: () => {
      toast.success(t('aiContent.blogTopicApproved'))
      invalidate()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const approveMany = useMutation({
    mutationFn: () => {
      const editsPayload: Record<string, { topic?: string; focus_keyword?: string }> = {}
      for (const id of selectedPending) {
        editsPayload[id] = edits[id] ?? {}
      }
      return approveAiBlogTopicsMany(selectedPending, editsPayload)
    },
    onSuccess: (res) => {
      toast.success(t('aiContent.blogTopicsApproved', { count: res.approved }))
      setSelected({})
      invalidate()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const skip = useMutation({
    mutationFn: (id: string) => skipAiBlogTopic(id),
    onSuccess: () => {
      toast.success(t('aiContent.blogTopicSkipped'))
      invalidate()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const regenImage = useMutation({
    mutationFn: (row: AiBlogTopic) =>
      regenerateAiBlogImage(row.post_id, {
        topic: edits[row.id]?.topic ?? row.topic,
        focus_keyword: edits[row.id]?.focus_keyword ?? row.focus_keyword,
      }),
    onSuccess: () => {
      toast.success(t('aiContent.blogImageQueued'))
      invalidate()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const statusLabel = (status: string) =>
    t(`aiContent.blogTopicStatus.${status}`, { defaultValue: status })

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('aiContent.blogPageTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-sm">{t('aiContent.blogPageHint')}</p>
          <div className="flex flex-wrap items-end gap-2">
            <div className="space-y-1">
              <Label htmlFor="blog-topic-count">{t('aiContent.blogSuggestCount')}</Label>
              <Input
                id="blog-topic-count"
                type="number"
                min={1}
                max={20}
                className="w-24"
                value={count}
                onChange={(e) => setCount(Math.min(20, Math.max(1, Number(e.target.value) || 8)))}
              />
            </div>
            <Button size="sm" onClick={() => void suggest.mutateAsync()} disabled={suggest.isPending}>
              {t('aiContent.blogSuggest')}
            </Button>
            {selectedPending.length > 0 ? (
              <Button
                size="sm"
                variant="secondary"
                disabled={approveMany.isPending}
                onClick={() => void approveMany.mutateAsync()}
              >
                {t('aiContent.blogApproveSelected', { count: selectedPending.length })}
              </Button>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'pending', 'queued', 'done'] as const).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? 'default' : 'outline'}
                onClick={() => setFilter(f)}
              >
                {t(`aiContent.blogFilter.${f}`)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('aiContent.blogTopicsList')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((row) => {
            const pending = row.status === 'pending'
            return (
              <div key={row.id} className="space-y-2 border-b py-3 last:border-0">
                <div className="flex flex-wrap items-center gap-2">
                  {pending ? (
                    <Checkbox
                      checked={!!selected[row.id]}
                      onCheckedChange={(v) =>
                        setSelected((s) => ({ ...s, [row.id]: v === true }))
                      }
                      aria-label={t('aiContent.blogSelectTopic')}
                    />
                  ) : null}
                  <span className="rounded-md bg-muted px-2 py-0.5 text-xs">{statusLabel(row.status)}</span>
                  {row.category_name ? (
                    <span className="text-muted-foreground text-xs">{row.category_name}</span>
                  ) : null}
                  {row.post_id > 0 && row.edit_url ? (
                    <a
                      className="text-xs underline-offset-2 hover:underline"
                      href={row.edit_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t('aiContent.blogOpenPost')}
                    </a>
                  ) : null}
                  {row.post_id > 0 && row.status === 'done' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={regenImage.isPending}
                      onClick={() => void regenImage.mutateAsync(row)}
                    >
                      {t('aiContent.blogRegenImage')}
                    </Button>
                  ) : null}
                </div>
                {row.angle ? <p className="text-muted-foreground text-sm">{row.angle}</p> : null}
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label>{t('aiContent.fieldTopic')}</Label>
                    <Input
                      value={edits[row.id]?.topic ?? row.topic}
                      disabled={!pending}
                      onChange={(e) =>
                        setEdits((s) => ({
                          ...s,
                          [row.id]: {
                            topic: e.target.value,
                            focus_keyword: s[row.id]?.focus_keyword ?? row.focus_keyword,
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>{t('aiContent.fieldFocus')}</Label>
                    <Input
                      value={edits[row.id]?.focus_keyword ?? row.focus_keyword}
                      disabled={!pending}
                      onChange={(e) =>
                        setEdits((s) => ({
                          ...s,
                          [row.id]: {
                            topic: s[row.id]?.topic ?? row.topic,
                            focus_keyword: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                </div>
                {pending ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      disabled={approve.isPending}
                      onClick={() => void approve.mutateAsync(row)}
                    >
                      {t('aiContent.blogApproveWrite')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={skip.isPending}
                      onClick={() => void skip.mutateAsync(row.id)}
                    >
                      {t('aiContent.proposalSkip')}
                    </Button>
                  </div>
                ) : null}
              </div>
            )
          })}
          {!items.length ? (
            <p className="text-sm text-muted-foreground">{t('aiContent.noBlogTopics')}</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
