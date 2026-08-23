import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { toastApiError } from '@/lib/apiError'
import {
  applyCategorySuggestions,
  fetchAiCostEstimate,
  fillTermsBatch,
  getCategorySuggestions,
  suggestCategories,
} from '../lib/ai-content-api'
import { AiToman } from '../components/AiToman'

export default function AiTaxonomiesPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const [kind, setKind] = useState<'blog' | 'product'>('blog')

  const suggestQ = useQuery({
    queryKey: ['ai-content', 'suggest', kind],
    queryFn: () => getCategorySuggestions(kind),
  })
  useQueryErrorToast(suggestQ)

  const costQ = useQuery({
    queryKey: ['ai-content', 'cost-estimate'],
    queryFn: () => fetchAiCostEstimate(),
  })
  useQueryErrorToast(costQ)

  const suggest = useMutation({
    mutationFn: () => suggestCategories(kind),
    onSuccess: () => {
      toast.success(t('aiContent.jobQueued'))
      setTimeout(() => void qc.invalidateQueries({ queryKey: ['ai-content', 'suggest'] }), 2500)
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const apply = useMutation({
    mutationFn: () => applyCategorySuggestions(kind),
    onSuccess: (res) => toast.success(t('aiContent.catsApplied', { count: res.count })),
    onError: (e: Error) => toastApiError(t, e),
  })

  const fillCats = useMutation({
    mutationFn: () => fillTermsBatch('product_cat'),
    onSuccess: (res) => toast.success(t('aiContent.batchQueued', { count: res.count })),
    onError: (e: Error) => toastApiError(t, e),
  })

  const fillBrands = useMutation({
    mutationFn: () => fillTermsBatch('product_brand'),
    onSuccess: (res) => toast.success(t('aiContent.batchQueued', { count: res.count })),
    onError: (e: Error) => toastApiError(t, e),
  })

  const fillBlogCats = useMutation({
    mutationFn: () => fillTermsBatch('category'),
    onSuccess: (res) => toast.success(t('aiContent.batchQueued', { count: res.count })),
    onError: (e: Error) => toastApiError(t, e),
  })

  const cats = (suggestQ.data?.suggestions?.categories ?? []) as {
    name?: string
    description?: string
    children?: string[]
  }[]

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('aiContent.suggestCats')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <select
              className="flex h-9 rounded-md border bg-background px-3 text-sm"
              value={kind}
              onChange={(e) => setKind(e.target.value as 'blog' | 'product')}
            >
              <option value="blog">{t('aiContent.typeBlog')}</option>
              <option value="product">{t('aiContent.typeProduct')}</option>
            </select>
            <Button size="sm" onClick={() => void suggest.mutateAsync()} disabled={suggest.isPending}>
              {t('aiContent.suggest')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void apply.mutateAsync()}
              disabled={apply.isPending || !cats.length}
            >
              {t('aiContent.applySuggestions')}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => void suggestQ.refetch()}>
              {t('common.refresh')}
            </Button>
          </div>
          <div className="space-y-2">
            {cats.map((c, i) => (
              <div key={`${c.name}-${i}`} className="rounded-md border p-2 text-sm">
                <div className="font-medium">{c.name}</div>
                <div className="text-muted-foreground">{c.description}</div>
                {c.children?.length ? (
                  <div className="mt-1 text-xs">{c.children.join(' · ')}</div>
                ) : null}
              </div>
            ))}
            {!cats.length ? <p className="text-sm text-muted-foreground">{t('aiContent.noSuggestions')}</p> : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('aiContent.fillTerms')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-sm">
            {t('aiContent.costPerTerm')}{' '}
            <AiToman amount={costQ.data?.entities.product_cat?.cost_toman.mid ?? 0} locale={i18n.language} />
            {' · '}
            {t('aiContent.settingsBrand')}{' '}
            <AiToman amount={costQ.data?.entities.product_brand?.cost_toman.mid ?? 0} locale={i18n.language} />
            {' · '}
            {t('aiContent.settingsBlogCat')}{' '}
            <AiToman amount={costQ.data?.entities.blog_cat?.cost_toman.mid ?? 0} locale={i18n.language} />
          </p>
          <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => void fillCats.mutateAsync()} disabled={fillCats.isPending}>
            {t('aiContent.fillProductCats')}
          </Button>
          <Button size="sm" variant="outline" onClick={() => void fillBrands.mutateAsync()} disabled={fillBrands.isPending}>
            {t('aiContent.fillBrands')}
          </Button>
          <Button size="sm" variant="outline" onClick={() => void fillBlogCats.mutateAsync()} disabled={fillBlogCats.isPending}>
            {t('aiContent.fillBlogCats')}
          </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
