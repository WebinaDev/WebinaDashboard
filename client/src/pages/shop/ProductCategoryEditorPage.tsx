import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ExternalLink, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMatch, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { AiGenerateButton } from '@/components/AiGenerateButton'
import { ProductCategoryFormFields } from '@/components/product-categories/ProductCategoryFormFields'
import type { ProductCategoryFormState, ProductCategoryRow } from '@/components/product-categories/types'
import { PageShell } from '@/components/PageShell'
import { SimpleSeoFields } from '@/components/seo/SimpleSeoFields'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { slugifyFromName } from '@/lib/categoryTree'

function emptyForm(): ProductCategoryFormState {
  return {
    name: '',
    slug: '',
    parent: 0,
    description: '',
    thumbnail_id: 0,
    thumbnail_url: '',
    seo: { title: '', description: '', focus_keyword: '' },
  }
}

function formFromCategory(category: ProductCategoryRow): ProductCategoryFormState {
  return {
    name: category.name,
    slug: category.slug,
    parent: category.parent || 0,
    description: category.description ?? '',
    thumbnail_id: category.thumbnail_id ?? 0,
    thumbnail_url: category.thumbnail_url ?? '',
    seo: {
      title: category.seo?.title ?? '',
      description: category.seo?.description ?? '',
      focus_keyword: category.seo?.focus_keyword ?? '',
    },
  }
}

function buildPayload(form: ProductCategoryFormState) {
  return {
    name: form.name.trim(),
    slug: form.slug.trim() || slugifyFromName(form.name),
    parent: form.parent,
    description: form.description,
    thumbnail_id: form.thumbnail_id > 0 ? form.thumbnail_id : 0,
    seo: form.seo,
  }
}

export default function ProductCategoryEditorPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const isNew = Boolean(useMatch('/shop/product-categories/new'))
  const { categoryId } = useParams()
  const id = !isNew && categoryId ? parseInt(categoryId, 10) : undefined

  const [form, setForm] = useState<ProductCategoryFormState>(emptyForm)
  const [slugAuto, setSlugAuto] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const categoriesQ = useQuery({
    queryKey: ['product-categories', 'all-options'],
    queryFn: () => apiFetch<{ items: ProductCategoryRow[] }>('shop/product-categories?sort=name_asc'),
  })

  const q = useQuery({
    queryKey: ['product-categories', id],
    queryFn: () => apiFetch<ProductCategoryRow>(`shop/product-categories/${id}`),
    enabled: !isNew && !!id,
  })
  useQueryErrorToast(q)

  useEffect(() => {
    if (q.data) {
      setForm(formFromCategory(q.data))
      setSlugAuto(false)
    }
  }, [q.data])

  const save = useMutation({
    mutationFn: async () => {
      const payload = buildPayload(form)
      if (isNew) {
        return apiFetch<{ id: number }>('shop/product-categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      return apiFetch<{ ok: boolean; item?: ProductCategoryRow }>(`shop/product-categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    },
    onSuccess: (data) => {
      toast.success(t('common.saved'))
      void qc.invalidateQueries({ queryKey: ['product-categories'] })
      if (isNew) {
        const created = data as { id?: number }
        if (created.id) navigate(`/shop/product-categories/${created.id}`, { replace: true })
      }
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const remove = useMutation({
    mutationFn: () => apiFetch(`shop/product-categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success(t('common.deleted'))
      void qc.invalidateQueries({ queryKey: ['product-categories'] })
      navigate('/shop/product-categories', { replace: true })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const title = isNew ? t('productCats.newTitle') : t('productCats.editTitle')
  const categoryUrl = q.data?.url ?? ''

  return (
    <PageShell title={title}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => navigate('/shop/product-categories')}>
          {t('common.back')}
        </Button>
        <div className="flex flex-wrap gap-2">
          {!isNew && categoryUrl ? (
            <Button asChild type="button" variant="outline" size="sm">
              <a href={categoryUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="me-1 size-4" />
                {t('productCats.actionView')}
              </a>
            </Button>
          ) : null}
          {!isNew ? (
            <AiGenerateButton type="product_cat" id={id} onDone={() => void q.refetch()} />
          ) : null}
          {!isNew ? (
            <Button type="button" variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="me-1 size-4" />
              {t('common.delete')}
            </Button>
          ) : null}
          <Button type="button" size="sm" disabled={!form.name.trim() || save.isPending} onClick={() => void save.mutateAsync()}>
            {t('common.save')}
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="pt-6">
          {!isNew && q.isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full max-w-md" />
              <Skeleton className="h-10 w-full max-w-md" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : (
            <ProductCategoryFormFields
              form={form}
              categories={categoriesQ.data?.items ?? []}
              excludeId={id}
              slugAuto={slugAuto}
              onSlugAutoChange={setSlugAuto}
              onChange={setForm}
            />
          )}
          {!isNew && !q.isLoading ? (
            <div className="mt-6">
              <SimpleSeoFields
                seo={form.seo}
                onChange={(seo) => setForm((f) => ({ ...f, seo: { ...f.seo, ...seo } }))}
              />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('productCats.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('productCats.deleteConfirm', { name: form.name })}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction disabled={remove.isPending} onClick={() => void remove.mutateAsync()}>
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  )
}

