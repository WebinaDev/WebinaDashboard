import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ExternalLink, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMatch, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { BrandFormFields } from '@/components/brands/BrandFormFields'
import type { BrandFormState, BrandRow } from '@/components/brands/types'
import { PageShell } from '@/components/PageShell'
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

function emptyForm(): BrandFormState {
  return { name: '', slug: '', parent: 0, description: '', thumbnail_id: 0, thumbnail_url: '' }
}

function formFromBrand(brand: BrandRow): BrandFormState {
  return {
    name: brand.name,
    slug: brand.slug,
    parent: brand.parent || 0,
    description: brand.description ?? '',
    thumbnail_id: brand.thumbnail_id ?? 0,
    thumbnail_url: brand.thumbnail_url ?? '',
  }
}

function buildPayload(form: BrandFormState) {
  return {
    name: form.name.trim(),
    slug: form.slug.trim() || slugifyFromName(form.name),
    parent: form.parent,
    description: form.description,
    thumbnail_id: form.thumbnail_id > 0 ? form.thumbnail_id : 0,
  }
}

export default function BrandEditorPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const isNew = Boolean(useMatch('/shop/brands/new'))
  const { brandId } = useParams()
  const id = !isNew && brandId ? parseInt(brandId, 10) : undefined

  const [form, setForm] = useState<BrandFormState>(emptyForm)
  const [slugAuto, setSlugAuto] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const brandsQ = useQuery({
    queryKey: ['brands', 'all-options'],
    queryFn: () => apiFetch<{ items: BrandRow[] }>('shop/brands?sort=name_asc'),
  })

  const q = useQuery({
    queryKey: ['brands', id],
    queryFn: () => apiFetch<BrandRow>(`shop/brands/${id}`),
    enabled: !isNew && !!id,
  })
  useQueryErrorToast(q)

  useEffect(() => {
    if (q.data) {
      setForm(formFromBrand(q.data))
      setSlugAuto(false)
    }
  }, [q.data])

  const save = useMutation({
    mutationFn: async () => {
      const payload = buildPayload(form)
      if (isNew) {
        return apiFetch<{ id: number }>('shop/brands', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      return apiFetch<{ ok: boolean; item?: BrandRow }>(`shop/brands/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    },
    onSuccess: (data) => {
      toast.success(t('common.saved'))
      void qc.invalidateQueries({ queryKey: ['brands'] })
      if (isNew) {
        const created = data as { id?: number }
        if (created.id) navigate(`/shop/brands/${created.id}`, { replace: true })
      }
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const remove = useMutation({
    mutationFn: () => apiFetch(`shop/brands/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success(t('common.deleted'))
      void qc.invalidateQueries({ queryKey: ['brands'] })
      navigate('/shop/brands', { replace: true })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const title = isNew ? t('brands.newTitle') : t('brands.editTitle')
  const brandUrl = q.data?.url ?? ''

  return (
    <PageShell title={title}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => navigate('/shop/brands')}>
          {t('common.back')}
        </Button>
        <div className="flex flex-wrap gap-2">
          {!isNew && brandUrl ? (
            <Button asChild type="button" variant="outline" size="sm">
              <a href={brandUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="me-1 size-4" />
                {t('brands.actionView')}
              </a>
            </Button>
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
            <BrandFormFields
              form={form}
              brands={brandsQ.data?.items ?? []}
              excludeId={id}
              slugAuto={slugAuto}
              onSlugAutoChange={setSlugAuto}
              onChange={setForm}
            />
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('brands.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('brands.deleteConfirm', { name: form.name })}</AlertDialogDescription>
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

