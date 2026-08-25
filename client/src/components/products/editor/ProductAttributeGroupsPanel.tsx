import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

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
import { apiFetch } from '@/lib/api'
import type { AttributeGroup, GlobalAttribute } from '@/types/attributes'
import type { AttributeRow } from '@/types/product'

type ProductAttributeGroupsPanelProps = {
  attributes: AttributeRow[]
  globalItems: GlobalAttribute[]
  onChange: (rows: AttributeRow[]) => void
  productType?: 'simple' | 'variable'
}

type EditorState = {
  id?: string
  name: string
  attributeIds: number[]
}

function emptyEditor(): EditorState {
  return { name: '', attributeIds: [] }
}

export function ProductAttributeGroupsPanel({
  attributes,
  globalItems,
  onChange,
  productType = 'simple',
}: ProductAttributeGroupsPanelProps) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [selectedId, setSelectedId] = useState('')
  const [saveName, setSaveName] = useState('')
  const [editor, setEditor] = useState<EditorState | null>(null)

  const groupsQ = useQuery({
    queryKey: ['attribute-groups'],
    queryFn: () => apiFetch<{ items: AttributeGroup[] }>('shop/attribute-groups'),
  })
  const groups = groupsQ.data?.items ?? []
  const selected = groups.find((g) => g.id === selectedId)

  const byId = useMemo(() => {
    const map = new Map<number, GlobalAttribute>()
    globalItems.forEach((ga) => map.set(ga.id, ga))
    return map
  }, [globalItems])

  const createGroup = useMutation({
    mutationFn: (body: { name: string; attribute_ids: number[] }) =>
      apiFetch<AttributeGroup>('shop/attribute-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    onSuccess: (row) => {
      toast.success(t('products.editor.attributeGroupSaved'))
      setSaveName('')
      setEditor(null)
      setSelectedId(row.id)
      void qc.invalidateQueries({ queryKey: ['attribute-groups'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const patchGroup = useMutation({
    mutationFn: (body: { id: string; name: string; attribute_ids: number[] }) =>
      apiFetch<AttributeGroup>(`shop/attribute-groups/${body.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: body.name, attribute_ids: body.attribute_ids }),
      }),
    onSuccess: () => {
      toast.success(t('products.editor.attributeGroupSaved'))
      setEditor(null)
      void qc.invalidateQueries({ queryKey: ['attribute-groups'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const deleteGroup = useMutation({
    mutationFn: (id: string) => apiFetch(`shop/attribute-groups/${id}`, { method: 'DELETE' }),
    onSuccess: (_, id) => {
      toast.success(t('common.deleted'))
      if (selectedId === id) setSelectedId('')
      void qc.invalidateQueries({ queryKey: ['attribute-groups'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  function currentAttributeIds(): number[] {
    return attributes.map((r) => r.attribute_id).filter((id): id is number => Boolean(id && id > 0))
  }

  function applyGroup(group: AttributeGroup) {
    const next = [...attributes]
    let added = 0
    for (const id of group.attribute_ids) {
      const ga = byId.get(id)
      if (!ga) continue
      const name = ga.slug ? `pa_${ga.slug}` : ga.label
      if (next.some((r) => r.attribute_id === ga.id || r.name === name)) continue
      next.push({
        name,
        options: '',
        variation: productType === 'variable',
        visible: true,
        attribute_id: ga.id,
        taxonomy: true,
      })
      added += 1
    }
    if (added === 0) {
      toast.message(t('products.editor.attributeGroupNothingToAdd'))
      return
    }
    onChange(next)
    toast.success(t('products.editor.attributeGroupImported', { count: added }))
  }

  function toggleEditorId(id: number) {
    if (!editor) return
    const has = editor.attributeIds.includes(id)
    setEditor({
      ...editor,
      attributeIds: has ? editor.attributeIds.filter((x) => x !== id) : [...editor.attributeIds, id],
    })
  }

  function submitEditor() {
    if (!editor) return
    const name = editor.name.trim()
    if (!name) return
    if (editor.id) {
      patchGroup.mutate({ id: editor.id, name, attribute_ids: editor.attributeIds })
      return
    }
    createGroup.mutate({ name, attribute_ids: editor.attributeIds })
  }

  const editorBusy = createGroup.isPending || patchGroup.isPending
  const currentIds = currentAttributeIds()

  return (
    <Card className="gap-4 py-4 shadow-sm">
      <CardHeader className="px-4 pb-0">
        <CardTitle className="text-sm font-semibold">{t('products.editor.attributeGroupImport')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4">
        <p className="text-muted-foreground text-xs">{t('products.editor.attributeGroupHint')}</p>

        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[12rem] flex-1 space-y-1">
            <Label className="text-xs">{t('products.editor.attributeGroupSelect')}</Label>
            <Select value={selectedId || undefined} onValueChange={setSelectedId}>
              <SelectTrigger>
                <SelectValue placeholder={t('products.editor.attributeGroupSelectPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {groups.length === 0 ? (
                  <SelectItem value="__empty" disabled>
                    {t('products.editor.attributeGroupEmpty')}
                  </SelectItem>
                ) : (
                  groups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            size="sm"
            disabled={!selected}
            onClick={() => selected && applyGroup(selected)}
          >
            {t('products.editor.attributeGroupApply')}
          </Button>
        </div>

        {selected ? (
          <p className="text-muted-foreground text-xs">
            {selected.attribute_ids
              .map((id) => byId.get(id)?.label)
              .filter(Boolean)
              .join('، ') || t('products.editor.attributeGroupNoAttrs')}
          </p>
        ) : null}

        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[12rem] flex-1 space-y-1">
            <Label className="text-xs">{t('products.editor.attributeGroupSaveCurrent')}</Label>
            <Input
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder={t('products.editor.attributeGroupName')}
            />
          </div>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={!saveName.trim() || currentIds.length === 0 || createGroup.isPending}
            onClick={() => createGroup.mutate({ name: saveName.trim(), attribute_ids: currentIds })}
          >
            {t('products.editor.attributeGroupSave')}
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-xs">{t('products.editor.attributeGroupManage')}</Label>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 px-2"
              onClick={() => setEditor(emptyEditor())}
            >
              <Plus className="me-1 size-3.5" />
              {t('products.editor.attributeGroupNew')}
            </Button>
          </div>
          {groups.length === 0 ? (
            <p className="text-muted-foreground text-xs">{t('products.editor.attributeGroupEmpty')}</p>
          ) : (
            <ul className="divide-y divide-border rounded-md border border-border">
              {groups.map((g) => (
                <li key={g.id} className="flex items-center gap-2 px-3 py-2 text-sm">
                  <span className="min-w-0 flex-1 truncate">{g.name}</span>
                  <span className="text-muted-foreground text-xs">{g.attribute_ids.length}</span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-8"
                    onClick={() =>
                      setEditor({
                        id: g.id,
                        name: g.name,
                        attributeIds: [...g.attribute_ids],
                      })
                    }
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-8"
                    disabled={deleteGroup.isPending}
                    onClick={() => deleteGroup.mutate(g.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>

      <Dialog open={Boolean(editor)} onOpenChange={(open) => !open && setEditor(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editor?.id ? t('products.editor.attributeGroupEdit') : t('products.editor.attributeGroupNew')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>{t('products.editor.attributeGroupName')}</Label>
              <Input
                value={editor?.name ?? ''}
                onChange={(e) => editor && setEditor({ ...editor, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('products.editor.attributeGroupPick')}</Label>
              {globalItems.length === 0 ? (
                <p className="text-muted-foreground text-xs">{t('attributes.emptyHint')}</p>
              ) : (
                <div className="max-h-56 space-y-1 overflow-y-auto rounded-md border border-border p-2">
                  {globalItems.map((ga) => {
                    const checked = Boolean(editor?.attributeIds.includes(ga.id))
                    return (
                      <label key={ga.id} className="flex cursor-pointer items-center gap-2 rounded-sm px-1 py-1 text-sm">
                        <Checkbox checked={checked} onCheckedChange={() => toggleEditorId(ga.id)} />
                        {ga.label}
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditor(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              disabled={!editor?.name.trim() || editorBusy}
              onClick={submitEditor}
            >
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
