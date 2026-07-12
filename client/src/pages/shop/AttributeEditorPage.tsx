import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMatch, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { AttributeFormFields } from '@/components/attributes/AttributeFormFields'
import { AttributeTermDialog } from '@/components/attributes/AttributeTermDialog'
import { AttributeTermsTable } from '@/components/attributes/AttributeTermsTable'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { slugifyFromName } from '@/lib/categoryTree'
import type { AttributeFormState, AttributeTerm, AttributeTermFormState, GlobalAttribute } from '@/types/attributes'

function emptyForm(): AttributeFormState {
  return { label: '', slug: '', type: 'select', order_by: 'menu_order', has_archives: false }
}

function formFromAttribute(attr: GlobalAttribute): AttributeFormState {
  return {
    label: attr.label,
    slug: attr.slug,
    type: attr.type,
    order_by: attr.order_by,
    has_archives: attr.has_archives,
  }
}

function emptyTermForm(): AttributeTermFormState {
  return { name: '', slug: '', description: '', menu_order: 0, color: '#000000', image_id: 0, image_url: '' }
}

function termFormFromTerm(term: AttributeTerm): AttributeTermFormState {
  return {
    name: term.name,
    slug: term.slug,
    description: term.description ?? '',
    menu_order: term.menu_order ?? 0,
    color: term.color ?? '#000000',
    image_id: term.image_id ?? 0,
    image_url: term.image_url ?? '',
  }
}

export default function AttributeEditorPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const isNew = Boolean(useMatch('/shop/attributes/new'))
  const { attributeId } = useParams()
  const id = !isNew && attributeId ? parseInt(attributeId, 10) : undefined

  const [form, setForm] = useState<AttributeFormState>(emptyForm)
  const [slugAuto, setSlugAuto] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [termDialogOpen, setTermDialogOpen] = useState(false)
  const [termForm, setTermForm] = useState<AttributeTermFormState>(emptyTermForm)
  const [editingTermId, setEditingTermId] = useState<number | null>(null)
  const [deleteTerm, setDeleteTerm] = useState<AttributeTerm | null>(null)

  const q = useQuery({
    queryKey: ['attributes', id],
    queryFn: () => apiFetch<GlobalAttribute>(`shop/global-attributes/${id}`),
    enabled: !isNew && !!id,
  })
  useQueryErrorToast(q)

  const termsQ = useQuery({
    queryKey: ['attributes', id, 'terms'],
    queryFn: () => apiFetch<{ items: AttributeTerm[] }>(`shop/global-attributes/${id}/terms`),
    enabled: !isNew && !!id,
  })
  useQueryErrorToast(termsQ)

  useEffect(() => {
    if (q.data) {
      setForm(formFromAttribute(q.data))
      setSlugAuto(false)
    }
  }, [q.data])

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.label.trim(),
        slug: form.slug.trim() || slugifyFromName(form.label),
        type: form.type,
        order_by: form.order_by,
        has_archives: form.has_archives,
      }
      if (isNew) {
        return apiFetch<GlobalAttribute>('shop/global-attributes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      return apiFetch<GlobalAttribute>(`shop/global-attributes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    },
    onSuccess: (data) => {
      toast.success(t('common.saved'))
      void qc.invalidateQueries({ queryKey: ['attributes'] })
      if (isNew && data.id) navigate(`/shop/attributes/${data.id}`, { replace: true })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const remove = useMutation({
    mutationFn: () => apiFetch(`shop/global-attributes/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success(t('common.deleted'))
      void qc.invalidateQueries({ queryKey: ['attributes'] })
      navigate('/shop/attributes', { replace: true })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const saveTerm = useMutation({
    mutationFn: async () => {
      const payload = {
        name: termForm.name.trim(),
        slug: termForm.slug.trim() || slugifyFromName(termForm.name),
        description: termForm.description,
        menu_order: termForm.menu_order,
        color: form.type === 'color' ? termForm.color : undefined,
        image_id: form.type === 'image' ? termForm.image_id : undefined,
      }
      if (editingTermId) {
        return apiFetch(`shop/global-attributes/${id}/terms/${editingTermId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      return apiFetch(`shop/global-attributes/${id}/terms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    },
    onSuccess: () => {
      toast.success(t('common.saved'))
      setTermDialogOpen(false)
      setEditingTermId(null)
      setTermForm(emptyTermForm())
      void qc.invalidateQueries({ queryKey: ['attributes', id, 'terms'] })
      void qc.invalidateQueries({ queryKey: ['attributes'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const removeTerm = useMutation({
    mutationFn: (termId: number) => apiFetch(`shop/global-attributes/${id}/terms/${termId}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success(t('common.deleted'))
      setDeleteTerm(null)
      void qc.invalidateQueries({ queryKey: ['attributes', id, 'terms'] })
      void qc.invalidateQueries({ queryKey: ['attributes'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const terms = termsQ.data?.items ?? []
  const typeLocked = !isNew && terms.length > 0

  return (
    <PageShell
      title={isNew ? t('attributes.newTitle') : t('attributes.editTitle')}
      description={isNew ? t('attributes.newDescription') : undefined}
    >
      {q.isLoading && !isNew ? (
        <Skeleton className="h-64 rounded-lg" />
      ) : (
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">{t('attributes.sectionDetails')}</CardTitle>
              {!isNew ? (
                <Button type="button" variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="me-1 size-3.5" />
                  {t('common.delete')}
                </Button>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-4">
              <AttributeFormFields
                form={form}
                onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
                slugAuto={slugAuto}
                onSlugAutoChange={setSlugAuto}
                typeLocked={typeLocked}
              />
              <Button type="button" disabled={save.isPending || !form.label.trim()} onClick={() => void save.mutateAsync()}>
                {t('common.save')}
              </Button>
            </CardContent>
          </Card>

          {!isNew && id ? (
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">{t('attributes.terms.title')}</CardTitle>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setEditingTermId(null)
                    setTermForm(emptyTermForm())
                    setTermDialogOpen(true)
                  }}
                >
                  {t('attributes.terms.add')}
                </Button>
              </CardHeader>
              <CardContent className="overflow-x-auto p-0 pt-2">
                {termsQ.isLoading ? (
                  <Skeleton className="m-4 h-32 rounded-lg" />
                ) : (
                  <AttributeTermsTable
                    terms={terms}
                    attributeType={form.type}
                    locale={i18n.language}
                    onEdit={(term) => {
                      setEditingTermId(term.id)
                      setTermForm(termFormFromTerm(term))
                      setTermDialogOpen(true)
                    }}
                    onDelete={setDeleteTerm}
                  />
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}

      <AttributeTermDialog
        open={termDialogOpen}
        onOpenChange={setTermDialogOpen}
        attributeType={form.type}
        form={termForm}
        onChange={(patch) => setTermForm((prev) => ({ ...prev, ...patch }))}
        onSave={() => void saveTerm.mutateAsync()}
        saving={saveTerm.isPending}
        isEdit={editingTermId !== null}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('attributes.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('attributes.deleteConfirmBody')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void remove.mutateAsync()}>{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteTerm !== null} onOpenChange={(open) => !open && setDeleteTerm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('attributes.terms.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('attributes.terms.deleteConfirmBody')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTerm && void removeTerm.mutateAsync(deleteTerm.id)}>
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  )
}
