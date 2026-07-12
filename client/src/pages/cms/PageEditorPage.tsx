import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMatch, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { PageParentPanel } from '@/components/cms/PageParentPanel'
import { QueryErrorState } from '@/components/QueryErrorState'
import { PostFeaturedImagePanel } from '@/components/magazine/PostFeaturedImagePanel'
import { PostPublishPanel, type PostVisibility } from '@/components/magazine/PostPublishPanel'
import { RichTextEditor } from '@/components/magazine/LazyRichTextEditor'
import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'

type Page = {
  id: number
  title: string
  content: string
  excerpt: string
  status: string
  parent: number
  featured_image_id: number
  featured_image_url: string
  comment_status: 'open' | 'closed'
  visibility: PostVisibility
  password: string
  date: string
}

function toDateTimeLocal(value?: string) {
  if (!value) return dayjs().format('YYYY-MM-DDTHH:mm')
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format('YYYY-MM-DDTHH:mm') : dayjs().format('YYYY-MM-DDTHH:mm')
}

function buildPagePayload(input: {
  title: string
  content: string
  excerpt: string
  status: string
  parent: number
  featuredImageId: number
  commentStatus: 'open' | 'closed'
  visibility: PostVisibility
  password: string
  publishImmediately: boolean
  publishDate: string
}) {
  const body: Record<string, unknown> = {
    title: input.title,
    content: input.content,
    excerpt: input.excerpt,
    status: input.status,
    parent: input.parent,
    featured_image_id: input.featuredImageId,
    comment_status: input.commentStatus,
    visibility: input.visibility,
  }

  if (input.visibility === 'password' && input.password.trim()) {
    body.password = input.password.trim()
  }

  if (!input.publishImmediately) {
    body.date = dayjs(input.publishDate).toISOString()
    if (dayjs(input.publishDate).isAfter(dayjs()) && input.visibility === 'public') {
      body.status = 'publish'
    }
  }

  return body
}

export default function PageEditorPage() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const qc = useQueryClient()
  const isNew = useMatch('/pages/new')
  const { pageId } = useParams<{ pageId: string }>()
  const id = isNew ? undefined : pageId ? parseInt(pageId, 10) : undefined

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [status, setStatus] = useState('draft')
  const [parent, setParent] = useState(0)
  const [featuredImageId, setFeaturedImageId] = useState(0)
  const [featuredImageUrl, setFeaturedImageUrl] = useState('')
  const [commentStatus, setCommentStatus] = useState<'open' | 'closed'>('closed')
  const [visibility, setVisibility] = useState<PostVisibility>('public')
  const [password, setPassword] = useState('')
  const [publishImmediately, setPublishImmediately] = useState(true)
  const [publishDate, setPublishDate] = useState(() => dayjs().format('YYYY-MM-DDTHH:mm'))

  const pageQ = useQuery({
    queryKey: ['page', id],
    queryFn: () => apiFetch<Page>(`content/pages/${id}`),
    enabled: Boolean(id),
  })
  useQueryErrorToast(pageQ)

  useEffect(() => {
    if (!pageQ.data) return
    const p = pageQ.data
    setTitle(p.title)
    setContent(p.content)
    setExcerpt(p.excerpt ?? '')
    setStatus(p.status)
    setParent(p.parent ?? 0)
    setFeaturedImageId(p.featured_image_id ?? 0)
    setFeaturedImageUrl(p.featured_image_url ?? '')
    setCommentStatus(p.comment_status === 'open' ? 'open' : 'closed')
    setVisibility(p.visibility ?? 'public')
    setPassword('')
    const dateLocal = toDateTimeLocal(p.date)
    setPublishDate(dateLocal)
    const isFuture = dayjs(p.date).isAfter(dayjs())
    setPublishImmediately(!isFuture && p.status !== 'future')
  }, [pageQ.data])

  const save = useMutation({
    mutationFn: async () => {
      const payload = buildPagePayload({
        title,
        content,
        excerpt,
        status,
        parent,
        featuredImageId,
        commentStatus,
        visibility,
        password,
        publishImmediately,
        publishDate,
      })

      if (id) {
        return apiFetch<Page>(`content/pages/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      return apiFetch<Page>('content/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    },
    onSuccess: (p) => {
      void qc.invalidateQueries({ queryKey: ['pages'] })
      if (id) void qc.invalidateQueries({ queryKey: ['page', id] })
      toast.success(t('common.saved'))
      if (!id && p.id) {
        nav(`/pages/${p.id}`, { replace: true })
      }
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const loading = Boolean(id) && pageQ.isLoading
  const loadFailed = Boolean(id) && pageQ.isError

  if (loadFailed) {
    return (
      <PageShell title={t('pages.editTitle')}>
        <QueryErrorState onRetry={() => void pageQ.refetch()} />
      </PageShell>
    )
  }

  return (
    <PageShell title={id ? t('pages.editTitle') : t('pages.newTitle')}>
      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" disabled={save.isPending || loading || loadFailed} onClick={() => void save.mutateAsync()}>
          {t('common.save')}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Card className="gap-4 py-4 shadow-sm">
            <CardHeader className="px-4 pb-0">
              <CardTitle className="text-sm font-semibold">{t('pages.fieldTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              {loading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Input
                  id="page-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('pages.titlePlaceholder')}
                  className="border-0 px-0 text-lg font-medium shadow-none focus-visible:ring-0"
                />
              )}
            </CardContent>
          </Card>

          <Card className="gap-4 py-4 shadow-sm">
            <CardHeader className="px-4 pb-0">
              <CardTitle className="text-sm font-semibold">{t('pages.fieldContent')}</CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              {loading ? (
                <Skeleton className="min-h-72 w-full" />
              ) : (
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  disabled={save.isPending}
                  placeholder={t('pages.contentPlaceholder')}
                />
              )}
            </CardContent>
          </Card>

          <Card className="gap-4 py-4 shadow-sm">
            <CardHeader className="px-4 pb-0">
              <CardTitle className="text-sm font-semibold">{t('pages.fieldExcerpt')}</CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              {loading ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <Textarea
                  id="page-excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                  placeholder={t('pages.excerptPlaceholder')}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          {loading ? (
            <>
              <Skeleton className="h-56 w-full rounded-xl" />
              <Skeleton className="h-36 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </>
          ) : (
            <>
              <PostPublishPanel
                status={status}
                onStatusChange={setStatus}
                visibility={visibility}
                onVisibilityChange={setVisibility}
                password={password}
                onPasswordChange={setPassword}
                commentStatus={commentStatus}
                onCommentStatusChange={setCommentStatus}
                publishImmediately={publishImmediately}
                onPublishImmediatelyChange={setPublishImmediately}
                publishDate={publishDate}
                onPublishDateChange={setPublishDate}
                onSave={() => void save.mutateAsync()}
                isSaving={save.isPending}
              />
              <PageParentPanel parent={parent} excludeId={id} onChange={setParent} />
              <PostFeaturedImagePanel
                imageId={featuredImageId}
                imageUrl={featuredImageUrl}
                onChange={(item) => {
                  setFeaturedImageId(item.id)
                  setFeaturedImageUrl(item.url)
                }}
                onRemove={() => {
                  setFeaturedImageId(0)
                  setFeaturedImageUrl('')
                }}
              />
            </>
          )}
        </aside>
      </div>
    </PageShell>
  )
}
