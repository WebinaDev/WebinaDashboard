import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMatch, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { PageShell } from '@/components/PageShell'
import { PostFeaturedImagePanel } from '@/components/magazine/PostFeaturedImagePanel'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { slugifyFromName } from '@/lib/categoryTree'

import { CoffeeFlag } from '../components/CoffeeFlag'
import type { CoffeeOrigin } from '../types'

type FormState = {
  name: string
  slug: string
  description: string
  iso_code: string
  thumbnail_id: number
  thumbnail_url: string
}

function emptyForm(): FormState {
  return { name: '', slug: '', description: '', iso_code: '', thumbnail_id: 0, thumbnail_url: '' }
}

export default function CoffeeOriginEditorPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const isNew = Boolean(useMatch('/shop/coffee-origins/new'))
  const { originId } = useParams()
  const id = !isNew && originId ? parseInt(originId, 10) : undefined

  const [form, setForm] = useState<FormState>(emptyForm)
  const [slugAuto, setSlugAuto] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const q = useQuery({
    queryKey: ['coffee-origins', id],
    queryFn: () => apiFetch<CoffeeOrigin>(`shop/coffee-origins/${id}`),
    enabled: !isNew && !!id,
  })
  useQueryErrorToast(q)

  useEffect(() => {
    if (q.data) {
      setForm({
        name: q.data.name,
        slug: q.data.slug,
        description: q.data.description ?? '',
        iso_code: q.data.iso_code ?? '',
        thumbnail_id: q.data.thumbnail_id ?? 0,
        thumbnail_url: q.data.thumbnail_url ?? '',
      })
      setSlugAuto(false)
    }
  }, [q.data])

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || slugifyFromName(form.name),
        description: form.description,
        iso_code: form.iso_code.trim(),
        thumbnail_id: form.thumbnail_id > 0 ? form.thumbnail_id : 0,
      }
      if (isNew) {
        return apiFetch<{ id: number }>('shop/coffee-origins', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      return apiFetch<{ ok: boolean }>(`shop/coffee-origins/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    },
    onSuccess: (data) => {
      toast.success(t('common.saved'))
      void qc.invalidateQueries({ queryKey: ['coffee-origins'] })
      if (isNew) {
        const created = data as { id?: number }
        if (created.id) navigate(`/shop/coffee-origins/${created.id}`, { replace: true })
      }
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const remove = useMutation({
    mutationFn: () => apiFetch(`shop/coffee-origins/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success(t('common.deleted'))
      void qc.invalidateQueries({ queryKey: ['coffee-origins'] })
      navigate('/shop/coffee-origins', { replace: true })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const previewOrigin: CoffeeOrigin = {
    id: id ?? 0,
    name: form.name,
    slug: form.slug,
    description: form.description,
    count: 0,
    iso_code: form.iso_code,
    flag_emoji: '',
    flag_url: '',
    thumbnail_id: form.thumbnail_id || null,
    thumbnail_url: form.thumbnail_url,
    url: '',
  }

  return (
    <PageShell title={isNew ? t('coffeeProfile.originNewTitle') : t('coffeeProfile.originEditTitle')}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => navigate('/shop/coffee-origins')}>
          {t('common.back')}
        </Button>
        <div className="flex flex-wrap gap-2">
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
        <CardContent className="space-y-6 pt-6">
          {!isNew && q.isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full max-w-md" />
              <Skeleton className="h-10 w-full max-w-md" />
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="origin-name">{t('coffeeProfile.fieldName')}</Label>
                  <Input
                    id="origin-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    onBlur={() => {
                      if (slugAuto && form.name.trim()) {
                        setForm((f) => ({ ...f, slug: slugifyFromName(f.name) }))
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="origin-slug">{t('coffeeProfile.fieldSlug')}</Label>
                  <Input
                    id="origin-slug"
                    value={form.slug}
                    onChange={(e) => {
                      setSlugAuto(false)
                      setForm({ ...form, slug: e.target.value })
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="origin-iso">{t('coffeeProfile.fieldIso')}</Label>
                  <Input
                    id="origin-iso"
                    maxLength={2}
                    value={form.iso_code}
                    onChange={(e) => setForm({ ...form, iso_code: e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2) })}
                    placeholder="ET"
                    className="max-w-[6rem] font-mono uppercase"
                  />
                  <p className="text-muted-foreground text-xs">{t('coffeeProfile.fieldIsoHint')}</p>
                </div>
                <div className="flex items-end gap-3 pb-1">
                  <CoffeeFlag origin={previewOrigin} />
                  <span className="text-muted-foreground text-sm">{t('coffeeProfile.flagPreview')}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="origin-desc">{t('coffeeProfile.fieldDescription')}</Label>
                <Textarea id="origin-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">{t('coffeeProfile.fieldFlagImage')}</p>
                <p className="text-muted-foreground mb-3 text-xs">{t('coffeeProfile.fieldFlagImageHint')}</p>
                <PostFeaturedImagePanel
                  imageId={form.thumbnail_id}
                  imageUrl={form.thumbnail_url}
                  onChange={(next) => setForm({ ...form, thumbnail_id: next.id, thumbnail_url: next.url })}
                  onRemove={() => setForm({ ...form, thumbnail_id: 0, thumbnail_url: '' })}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('coffeeProfile.originDeleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('coffeeProfile.originDeleteConfirm', { name: form.name })}</AlertDialogDescription>
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
