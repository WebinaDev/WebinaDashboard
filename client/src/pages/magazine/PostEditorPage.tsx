import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMatch, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { PostCategoriesPanel } from '@/components/magazine/PostCategoriesPanel'
import { QueryErrorState } from '@/components/QueryErrorState'
import { PostFeaturedImagePanel } from '@/components/magazine/PostFeaturedImagePanel'
import { PostPublishPanel, type PostVisibility } from '@/components/magazine/PostPublishPanel'
import { PostTagsPanel } from '@/components/magazine/PostTagsPanel'
import { RichTextEditor } from '@/components/magazine/LazyRichTextEditor'
import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'

type PostTag = { id: number; name: string }

type Post = {
  id: number
  title: string
  content: string
  status: string
  categories: number[]
  tags: PostTag[]
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

function buildPostPayload(input: {
  title: string
  content: string
  status: string
  categories: number[]
  tags: string[]
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
    status: input.status,
    categories: input.categories,
    tags: input.tags,
    featured_image_id: input.featuredImageId,
    comment_status: input.commentStatus,
    visibility: input.visibility,
  }

  if (input.visibility === 'password' && input.password.trim()) {
    body.password = input.password.trim()
  }

  if (input.visibility === 'private') {
    body.status = 'private'
  } else if (input.visibility === 'password') {
    body.status = 'publish'
  }

  if (!input.publishImmediately) {
    body.date = dayjs(input.publishDate).toISOString()
    if (dayjs(input.publishDate).isAfter(dayjs()) && input.visibility === 'public') {
      body.status = 'publish'
    }
  }

  return body
}

export default function PostEditorPage() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const qc = useQueryClient()
  const isNew = useMatch('/magazine/new')
  const { postId } = useParams<{ postId: string }>()
  const id = isNew ? undefined : postId ? parseInt(postId, 10) : undefined

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('draft')
  const [categories, setCategories] = useState<number[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [featuredImageId, setFeaturedImageId] = useState(0)
  const [featuredImageUrl, setFeaturedImageUrl] = useState('')
  const [commentStatus, setCommentStatus] = useState<'open' | 'closed'>('open')
  const [visibility, setVisibility] = useState<PostVisibility>('public')
  const [password, setPassword] = useState('')
  const [publishImmediately, setPublishImmediately] = useState(true)
  const [publishDate, setPublishDate] = useState(() => dayjs().format('YYYY-MM-DDTHH:mm'))

  const postQ = useQuery({
    queryKey: ['post', id],
    queryFn: () => apiFetch<Post>(`content/posts/${id}`),
    enabled: Boolean(id),
  })
  useQueryErrorToast(postQ)

  useEffect(() => {
    if (!postQ.data) return
    const p = postQ.data
    setTitle(p.title)
    setContent(p.content)
    setStatus(p.status)
    setCategories(p.categories ?? [])
    setTags((p.tags ?? []).map((tag) => tag.name))
    setFeaturedImageId(p.featured_image_id ?? 0)
    setFeaturedImageUrl(p.featured_image_url ?? '')
    setCommentStatus(p.comment_status === 'closed' ? 'closed' : 'open')
    setVisibility(p.visibility ?? 'public')
    setPassword('')
    const dateLocal = toDateTimeLocal(p.date)
    setPublishDate(dateLocal)
    const isFuture = dayjs(p.date).isAfter(dayjs())
    setPublishImmediately(!isFuture && p.status !== 'future')
  }, [postQ.data])

  const save = useMutation({
    mutationFn: async () => {
      const payload = buildPostPayload({
        title,
        content,
        status,
        categories,
        tags,
        featuredImageId,
        commentStatus,
        visibility,
        password,
        publishImmediately,
        publishDate,
      })

      if (id) {
        return apiFetch<Post>(`content/posts/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      return apiFetch<Post>('content/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    },
    onSuccess: (p) => {
      void qc.invalidateQueries({ queryKey: ['posts'] })
      if (id) void qc.invalidateQueries({ queryKey: ['post', id] })
      toast.success(t('common.saved'))
      if (!id && p.id) {
        nav(`/magazine/posts/${p.id}`, { replace: true })
      }
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const loading = Boolean(id) && postQ.isLoading
  const loadFailed = Boolean(id) && postQ.isError

  if (loadFailed) {
    return (
      <PageShell title={t('posts.editTitle')}>
        <QueryErrorState onRetry={() => void postQ.refetch()} />
      </PageShell>
    )
  }

  return (
    <PageShell title={id ? t('posts.editTitle') : t('posts.newTitle')}>
      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" disabled={save.isPending || loading || loadFailed} onClick={() => void save.mutateAsync()}>
          {t('common.save')}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Card className="gap-4 py-4 shadow-sm">
            <CardHeader className="px-4 pb-0">
              <CardTitle className="text-sm font-semibold">{t('posts.fieldTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              {loading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Input
                  id="post-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('posts.titlePlaceholder')}
                  className="border-0 px-0 text-lg font-medium shadow-none focus-visible:ring-0"
                />
              )}
            </CardContent>
          </Card>

          <Card className="gap-4 py-4 shadow-sm">
            <CardHeader className="px-4 pb-0">
              <CardTitle className="text-sm font-semibold">{t('posts.fieldContent')}</CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              {loading ? (
                <Skeleton className="min-h-72 w-full" />
              ) : (
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  disabled={save.isPending}
                  placeholder={t('posts.contentPlaceholder')}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          {loading ? (
            <>
              <Skeleton className="h-56 w-full rounded-xl" />
              <Skeleton className="h-44 w-full rounded-xl" />
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
              <PostCategoriesPanel selected={categories} onChange={setCategories} />
              <PostTagsPanel tags={tags} onChange={setTags} />
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
