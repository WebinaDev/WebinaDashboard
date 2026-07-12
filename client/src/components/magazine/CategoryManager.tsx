import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ExternalLink, Pencil, Trash2, Zap } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useBootstrapQuery } from '@/hooks/useBootstrapQuery'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import {
  buildCategoryTree,
  parentSelectOptions,
  slugifyFromName,
  type Category,
} from '@/lib/categoryTree'
import { cn } from '@/lib/utils'

type CategoryFormState = {
  name: string
  slug: string
  parent: number
  description: string
}

type CategoryManagerProps = {
  selectable?: boolean
  compact?: boolean
  selected?: number[]
  onSelectionChange?: (ids: number[]) => void
  listTitle?: string
}

function emptyForm(): CategoryFormState {
  return { name: '', slug: '', parent: 0, description: '' }
}

function formFromCategory(cat: Category): CategoryFormState {
  return {
    name: cat.name,
    slug: cat.slug,
    parent: cat.parent || 0,
    description: cat.description ?? '',
  }
}

function CategoryFormFields({
  form,
  onChange,
  items,
  excludeId,
  slugAuto,
  onSlugAutoChange,
  idPrefix,
}: {
  form: CategoryFormState
  onChange: (next: CategoryFormState) => void
  items: Category[]
  excludeId?: number
  slugAuto: boolean
  onSlugAutoChange: (auto: boolean) => void
  idPrefix: string
}) {
  const { t } = useTranslation()
  const parentOptions = useMemo(() => parentSelectOptions(items, excludeId), [items, excludeId])

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-name`}>{t('categories.fieldName')}</Label>
        <Input
          id={`${idPrefix}-name`}
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
          onBlur={() => {
            if (slugAuto && form.name.trim()) {
              onChange({ ...form, slug: slugifyFromName(form.name) })
            }
          }}
        />
        <p className="text-xs text-muted-foreground">{t('categories.fieldNameHint')}</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-slug`}>{t('categories.fieldSlug')}</Label>
        <Input
          id={`${idPrefix}-slug`}
          value={form.slug}
          onChange={(e) => {
            onSlugAutoChange(false)
            onChange({ ...form, slug: e.target.value })
          }}
        />
        <p className="text-xs text-muted-foreground">{t('categories.fieldSlugHint')}</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-parent`}>{t('categories.fieldParent')}</Label>
        <Select
          value={String(form.parent)}
          onValueChange={(v) => onChange({ ...form, parent: parseInt(v, 10) || 0 })}
        >
          <SelectTrigger id={`${idPrefix}-parent`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">{t('categories.fieldParentNone')}</SelectItem>
            {parentOptions.map(({ node, depth }) => (
              <SelectItem key={node.id} value={String(node.id)}>
                {`${'— '.repeat(depth)}${node.name}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">{t('categories.fieldParentHint')}</p>
        <p className="text-xs text-muted-foreground">{t('categories.hierarchyHint')}</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-description`}>{t('categories.fieldDescription')}</Label>
        <Textarea
          id={`${idPrefix}-description`}
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
          rows={3}
        />
        <p className="text-xs text-muted-foreground">{t('categories.fieldDescriptionHint')}</p>
      </div>
    </div>
  )
}

function CategoryListSection({
  selectable,
  compact,
  canManage,
  items,
  tree,
  selected,
  onToggle,
  quickEditId,
  quickForm,
  onQuickFormChange,
  onQuickSave,
  onQuickCancel,
  onQuickEdit,
  onEdit,
  onDelete,
  isLoading,
  isQuickSaving,
}: {
  selectable: boolean
  compact: boolean
  canManage: boolean
  items: Category[]
  tree: ReturnType<typeof buildCategoryTree>
  selected: number[]
  onToggle: (id: number) => void
  quickEditId: number | null
  quickForm: CategoryFormState
  onQuickFormChange: (next: CategoryFormState) => void
  onQuickSave: () => void
  onQuickCancel: () => void
  onQuickEdit: (cat: Category) => void
  onEdit: (cat: Category) => void
  onDelete: (cat: Category) => void
  isLoading: boolean
  isQuickSaving: boolean
}) {
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: compact ? 4 : 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return <p className="py-4 text-center text-sm text-muted-foreground">{t('categories.emptyHint')}</p>
  }

  return (
    <div className={cn('space-y-1', compact ? 'max-h-48 overflow-y-auto' : 'max-h-[32rem] overflow-y-auto')}>
      {tree.map(({ node, depth }) => (
        <div key={node.id} className="rounded-md border border-transparent hover:border-border/60">
          <div className="flex items-center gap-1 py-1 pe-1">
            {selectable ? (
              <Checkbox checked={selected.includes(node.id)} onCheckedChange={() => onToggle(node.id)} />
            ) : null}
            <span
              className="min-w-0 flex-1 truncate text-sm"
              style={{ paddingInlineStart: `${depth * 0.875}rem` }}
            >
              {node.name}
              {!compact && node.count > 0 ? (
                <span className="ms-1 text-xs text-muted-foreground">({node.count})</span>
              ) : null}
            </span>
            {canManage ? (
              <div className="flex shrink-0 items-center gap-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="size-7"
                  title={t('categories.actionEdit')}
                  onClick={() => onEdit(node)}
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="size-7"
                  title={t('categories.actionQuickEdit')}
                  onClick={() => onQuickEdit(node)}
                >
                  <Zap className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="size-7 text-destructive hover:text-destructive"
                  title={t('categories.actionDelete')}
                  onClick={() => onDelete(node)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="size-7"
                  title={t('categories.actionView')}
                  disabled={!node.url}
                  onClick={() => {
                    if (node.url) window.open(node.url, '_blank', 'noopener,noreferrer')
                  }}
                >
                  <ExternalLink className="size-3.5" />
                </Button>
              </div>
            ) : null}
          </div>
          {quickEditId === node.id ? (
            <div className="space-y-2 border-t border-border bg-muted/20 p-2">
              <div className="space-y-1">
                <Label htmlFor={`quick-name-${node.id}`}>{t('categories.fieldName')}</Label>
                <Input
                  id={`quick-name-${node.id}`}
                  value={quickForm.name}
                  onChange={(e) => onQuickFormChange({ ...quickForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`quick-slug-${node.id}`}>{t('categories.fieldSlug')}</Label>
                <Input
                  id={`quick-slug-${node.id}`}
                  value={quickForm.slug}
                  onChange={(e) => onQuickFormChange({ ...quickForm, slug: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" size="sm" disabled={isQuickSaving} onClick={onQuickSave}>
                  {t('categories.quickEditSave')}
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={onQuickCancel}>
                  {t('categories.quickEditCancel')}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}

export function CategoryManager({
  selectable = false,
  compact = false,
  selected = [],
  onSelectionChange,
  listTitle,
}: CategoryManagerProps) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const boot = useBootstrapQuery()
  const canManage = Boolean(boot.data?.capabilities?.includes('manage_categories'))

  const [addForm, setAddForm] = useState<CategoryFormState>(emptyForm)
  const [addSlugAuto, setAddSlugAuto] = useState(true)
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [editForm, setEditForm] = useState<CategoryFormState>(emptyForm)
  const [editSlugAuto, setEditSlugAuto] = useState(false)
  const [quickEditId, setQuickEditId] = useState<number | null>(null)
  const [quickForm, setQuickForm] = useState<CategoryFormState>(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

  const catsQ = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiFetch<{ items: Category[] }>('content/categories'),
  })
  useQueryErrorToast(catsQ)

  const items = catsQ.data?.items ?? []
  const tree = useMemo(() => buildCategoryTree(items), [items])

  const invalidate = () => void qc.invalidateQueries({ queryKey: ['categories'] })

  const create = useMutation({
    mutationFn: () =>
      apiFetch<{ id: number }>('content/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: addForm.name.trim(),
          slug: addForm.slug.trim() || slugifyFromName(addForm.name),
          parent: addForm.parent,
          description: addForm.description,
        }),
      }),
    onSuccess: (res) => {
      setAddForm(emptyForm())
      setAddSlugAuto(true)
      invalidate()
      if (selectable && onSelectionChange) {
        onSelectionChange(selected.includes(res.id) ? selected : [...selected, res.id])
      }
      toast.success(t('common.saved'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const patch = useMutation({
    mutationFn: (payload: { id: number; body: CategoryFormState }) =>
      apiFetch(`content/categories/${payload.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: payload.body.name.trim(),
          slug: payload.body.slug.trim() || slugifyFromName(payload.body.name),
          parent: payload.body.parent,
          description: payload.body.description,
        }),
      }),
    onSuccess: () => {
      invalidate()
      toast.success(t('common.saved'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const del = useMutation({
    mutationFn: (id: number) => apiFetch(`content/categories/${id}`, { method: 'DELETE' }),
    onSuccess: (_data, id) => {
      invalidate()
      if (selectable && onSelectionChange) {
        onSelectionChange(selected.filter((x) => x !== id))
      }
      setDeleteTarget(null)
      toast.success(t('common.deleted'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  function toggle(id: number) {
    if (!onSelectionChange) return
    onSelectionChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id])
  }

  function openEdit(cat: Category) {
    setEditCategory(cat)
    setEditForm(formFromCategory(cat))
    setEditSlugAuto(false)
  }

  function openQuickEdit(cat: Category) {
    setQuickEditId(cat.id)
    setQuickForm({ ...formFromCategory(cat) })
  }

  async function saveEdit() {
    if (!editCategory) return
    await patch.mutateAsync({ id: editCategory.id, body: editForm })
    setEditCategory(null)
  }

  async function saveQuickEdit() {
    if (quickEditId == null) return
    await patch.mutateAsync({ id: quickEditId, body: quickForm })
    setQuickEditId(null)
  }

  const listSection = (
    <CategoryListSection
      selectable={selectable}
      compact={compact}
      canManage={canManage}
      items={items}
      tree={tree}
      selected={selected}
      onToggle={toggle}
      quickEditId={quickEditId}
      quickForm={quickForm}
      onQuickFormChange={setQuickForm}
      onQuickSave={() => void saveQuickEdit()}
      onQuickCancel={() => setQuickEditId(null)}
      onQuickEdit={openQuickEdit}
      onEdit={openEdit}
      onDelete={setDeleteTarget}
      isLoading={catsQ.isLoading}
      isQuickSaving={patch.isPending}
    />
  )

  const addSection = canManage ? (
    <div className="space-y-4">
      <CategoryFormFields
        form={addForm}
        onChange={setAddForm}
        items={items}
        slugAuto={addSlugAuto}
        onSlugAutoChange={setAddSlugAuto}
        idPrefix="add-category"
      />
      <Button
        type="button"
        disabled={!addForm.name.trim() || create.isPending}
        onClick={() => void create.mutateAsync()}
      >
        {t('categories.add')}
      </Button>
    </div>
  ) : null

  const resolvedListTitle = listTitle ?? (compact ? t('posts.panelCategories') : t('categories.listSectionTitle'))

  const content = compact ? (
    <Card className="gap-4 py-4 shadow-sm">
      <CardHeader className="px-4 pb-0">
        <CardTitle className="text-sm font-semibold">{resolvedListTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4">
        {listSection}
        {canManage ? (
          <div className="space-y-4 border-t border-border pt-4">
            <p className="text-sm font-semibold">{t('categories.addSectionTitle')}</p>
            {addSection}
          </div>
        ) : null}
      </CardContent>
    </Card>
  ) : (
    <div className="grid gap-6 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]">
      {canManage ? (
        <Card className="gap-4 py-4 shadow-sm lg:sticky lg:top-4 lg:self-start">
          <CardHeader className="px-4 pb-0">
            <CardTitle className="text-base">{t('categories.addSectionTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="px-4">{addSection}</CardContent>
        </Card>
      ) : null}
      <Card className="gap-4 py-4 shadow-sm">
        <CardHeader className="px-4 pb-0">
          <CardTitle className="text-base">{resolvedListTitle}</CardTitle>
        </CardHeader>
        <CardContent className="px-4">{listSection}</CardContent>
      </Card>
    </div>
  )

  return (
    <>
      {content}

      <Dialog open={editCategory != null} onOpenChange={(open) => !open && setEditCategory(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('categories.actionEdit')}</DialogTitle>
          </DialogHeader>
          {editCategory ? (
            <CategoryFormFields
              form={editForm}
              onChange={setEditForm}
              items={items}
              excludeId={editCategory.id}
              slugAuto={editSlugAuto}
              onSlugAutoChange={setEditSlugAuto}
              idPrefix="edit-category"
            />
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditCategory(null)}>
              {t('categories.quickEditCancel')}
            </Button>
            <Button type="button" disabled={patch.isPending} onClick={() => void saveEdit()}>
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteTarget != null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('categories.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('categories.deleteConfirmBody', { name: deleteTarget?.name ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('categories.quickEditCancel')}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (deleteTarget) void del.mutateAsync(deleteTarget.id)
              }}
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
