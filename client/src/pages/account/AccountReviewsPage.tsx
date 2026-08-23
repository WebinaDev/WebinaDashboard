import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'
import { formatDisplayDate } from '@/lib/date'

type PendingItem = {
  product_id: number
  name: string
  thumbnail?: string
  order_id: number
  permalink?: string
}

type ReviewItem = {
  id: number
  product_id: number
  product: string
  rating: number
  content: string
  status: string
  created_at: string
  permalink?: string
}

type QuestionItem = {
  id: number
  product_id: number
  product: string
  content: string
  status: string
  created_at: string
  permalink?: string
}

export default function AccountReviewsPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const [tab, setTab] = useState('pending')
  const [drafts, setDrafts] = useState<Record<number, { rating: string; content: string }>>({})
  const [qProduct, setQProduct] = useState('')
  const [qBody, setQBody] = useState('')

  const pendingQ = useQuery({
    queryKey: ['account', 'reviews', 'pending'],
    queryFn: () => apiFetch<{ items: PendingItem[] }>('account/reviews/pending'),
  })
  const reviewsQ = useQuery({
    queryKey: ['account', 'reviews'],
    queryFn: () => apiFetch<{ items: ReviewItem[] }>('account/reviews'),
  })
  const questionsQ = useQuery({
    queryKey: ['account', 'questions'],
    queryFn: () => apiFetch<{ items: QuestionItem[] }>('account/questions'),
  })
  useQueryErrorToast(pendingQ)
  useQueryErrorToast(reviewsQ)
  useQueryErrorToast(questionsQ)

  const submitReview = useMutation({
    mutationFn: (payload: { product_id: number; rating: number; content: string }) =>
      apiFetch('account/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      toast.success(t('common.saved'))
      void qc.invalidateQueries({ queryKey: ['account', 'reviews'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const submitQuestion = useMutation({
    mutationFn: () =>
      apiFetch('account/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: Number(qProduct), content: qBody }),
      }),
    onSuccess: () => {
      toast.success(t('common.saved'))
      setQProduct('')
      setQBody('')
      void qc.invalidateQueries({ queryKey: ['account', 'questions'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  return (
    <PageShell title={t('account.reviewsTitle')} description={t('account.reviewsSubtitle')}>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList variant="line" className="mb-4 w-full justify-start overflow-x-auto">
          <TabsTrigger value="pending">{t('account.tabPendingReviews')}</TabsTrigger>
          <TabsTrigger value="mine">{t('account.tabMyReviews')}</TabsTrigger>
          <TabsTrigger value="questions">{t('account.tabMyQuestions')}</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-3">
          {(pendingQ.data?.items ?? []).length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('common.empty')}</p>
          ) : (
            (pendingQ.data?.items ?? []).map((item) => {
              const draft = drafts[item.product_id] ?? { rating: '5', content: '' }
              return (
                <Card key={item.product_id}>
                  <CardContent className="space-y-3 p-4">
                    {item.permalink ? (
                      <a href={item.permalink} className="text-primary font-medium hover:underline" target="_blank" rel="noopener noreferrer">
                        {item.name}
                      </a>
                    ) : (
                      <p className="font-medium">{item.name}</p>
                    )}
                    <div>
                      <Label className="text-xs">{t('account.rating')}</Label>
                      <select
                        className="border-input bg-background mt-1 h-9 w-full rounded-md border px-2 text-sm"
                        value={draft.rating}
                        onChange={(e) =>
                          setDrafts((d) => ({ ...d, [item.product_id]: { ...draft, rating: e.target.value } }))
                        }
                      >
                        {[5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs">{t('account.reviewBody')}</Label>
                      <Textarea
                        className="mt-1"
                        value={draft.content}
                        onChange={(e) =>
                          setDrafts((d) => ({ ...d, [item.product_id]: { ...draft, content: e.target.value } }))
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      disabled={submitReview.isPending}
                      onClick={() =>
                        void submitReview.mutateAsync({
                          product_id: item.product_id,
                          rating: Number(draft.rating),
                          content: draft.content,
                        })
                      }
                    >
                      {t('account.submitReview')}
                    </Button>
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>

        <TabsContent value="mine" className="space-y-3">
          {(reviewsQ.data?.items ?? []).length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('common.empty')}</p>
          ) : (
            (reviewsQ.data?.items ?? []).map((row) => (
              <Card key={row.id}>
                <CardContent className="space-y-1 p-4">
                  <p className="font-medium">{row.product}</p>
                  <p className="text-sm">{t('account.ratingValue', { rating: row.rating })}</p>
                  <p className="text-muted-foreground text-sm">{row.content}</p>
                  <p className="text-muted-foreground text-xs">{formatDisplayDate(row.created_at, i18n.language)}</p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <Card>
            <CardContent className="space-y-3 p-4">
              <div>
                <Label className="text-xs">{t('account.productId')}</Label>
                <input
                  className="border-input bg-background mt-1 h-9 w-full rounded-md border px-3 text-sm"
                  value={qProduct}
                  onChange={(e) => setQProduct(e.target.value)}
                  inputMode="numeric"
                />
              </div>
              <div>
                <Label className="text-xs">{t('account.questionBody')}</Label>
                <Textarea className="mt-1" value={qBody} onChange={(e) => setQBody(e.target.value)} />
              </div>
              <Button
                type="button"
                size="sm"
                disabled={submitQuestion.isPending || !qProduct || !qBody.trim()}
                onClick={() => void submitQuestion.mutateAsync()}
              >
                {t('account.submitQuestion')}
              </Button>
            </CardContent>
          </Card>
          {(questionsQ.data?.items ?? []).map((row) => (
            <Card key={row.id}>
              <CardContent className="space-y-1 p-4">
                <p className="font-medium">{row.product}</p>
                <p className="text-muted-foreground text-sm">{row.content}</p>
                <p className="text-muted-foreground text-xs">{formatDisplayDate(row.created_at, i18n.language)}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </PageShell>
  )
}
