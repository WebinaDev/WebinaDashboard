import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { BasalamNav } from '../../components/BasalamNav'
import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type WooCat = { id: number; name: string; parent?: number }
type BslNode = { id: number; title?: string; name?: string; children?: BslNode[]; category?: BslNode[] }

function nodeLabel(n: BslNode) {
  return String(n.title ?? n.name ?? n.id)
}

function normalizeTree(raw: unknown): BslNode[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw as BslNode[]
  if (typeof raw === 'object') {
    const o = raw as Record<string, unknown>
    if (Array.isArray(o.data)) return o.data as BslNode[]
    if (Array.isArray(o.categories)) return o.categories as BslNode[]
    if (Array.isArray(o.children)) return o.children as BslNode[]
  }
  return []
}

function childrenOf(n: BslNode | undefined): BslNode[] {
  if (!n) return []
  if (Array.isArray(n.children) && n.children.length) return n.children
  if (Array.isArray(n.category) && n.category.length) return n.category
  return []
}

export default function BasalamCategoriesPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [wooId, setWooId] = useState('')
  const [l1, setL1] = useState('')
  const [l2, setL2] = useState('')
  const [l3, setL3] = useState('')
  const [optWoo, setOptWoo] = useState('')
  const [optBsl, setOptBsl] = useState('')

  const mapsQ = useQuery({
    queryKey: ['basalam', 'mappings'],
    queryFn: () => apiFetch<{ mappings: Array<Record<string, unknown>> }>('basalam/categories/mappings'),
  })

  const optsQ = useQuery({
    queryKey: ['basalam', 'option-maps'],
    queryFn: () => apiFetch<{ maps: Array<Record<string, unknown>> }>('basalam/categories/option-maps'),
  })

  const wooCatsQ = useQuery({
    queryKey: ['product-categories', 'basalam-map'],
    queryFn: () => apiFetch<{ items: WooCat[] }>('shop/product-categories?sort=name_asc&per_page=200'),
  })

  const bslCatsQ = useQuery({
    queryKey: ['basalam', 'categories-tree'],
    queryFn: () => apiFetch<{ categories: unknown }>('basalam/categories'),
  })

  const tree = useMemo(() => normalizeTree(bslCatsQ.data?.categories), [bslCatsQ.data])
  const l1Nodes = tree
  const l1Node = l1Nodes.find((n) => String(n.id) === l1)
  const l2Nodes = childrenOf(l1Node)
  const l2Node = l2Nodes.find((n) => String(n.id) === l2)
  const l3Nodes = childrenOf(l2Node)

  const selectedWoo = (wooCatsQ.data?.items ?? []).find((c) => String(c.id) === wooId)
  const bslName = [l1Node, l2Node, l3Nodes.find((n) => String(n.id) === l3)]
    .filter(Boolean)
    .map((n) => nodeLabel(n as BslNode))
    .join(' / ')

  const save = useMutation({
    mutationFn: () =>
      apiFetch('basalam/categories/mappings', {
        method: 'POST',
        body: JSON.stringify({
          woo_category_id: Number(wooId) || 0,
          woo_category_name: selectedWoo?.name || '',
          basalam_category_level1: Number(l1) || null,
          basalam_category_level2: Number(l2) || null,
          basalam_category_level3: Number(l3) || null,
          basalam_category_name: bslName,
        }),
      }),
    onSuccess: async () => {
      toast.success(t('basalam.mappingSaved'))
      await qc.invalidateQueries({ queryKey: ['basalam', 'mappings'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const del = useMutation({
    mutationFn: (id: number) =>
      apiFetch('basalam/categories/mappings/delete', {
        method: 'POST',
        body: JSON.stringify({ id }),
      }),
    onSuccess: async () => {
      toast.success(t('basalam.mappingDeleted'))
      await qc.invalidateQueries({ queryKey: ['basalam', 'mappings'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const detect = useMutation({
    mutationFn: () =>
      apiFetch<{ prediction?: unknown }>('basalam/categories/detect', {
        method: 'POST',
        body: JSON.stringify({ title: selectedWoo?.name || '' }),
      }),
    onSuccess: (data) => {
      toast.success(t('basalam.detectOk'))
      const pred = data.prediction as
        | {
            category_id?: number
            name?: string
            level1?: number
            level2?: number
            level3?: number
            parent?: { id?: number; parent?: { id?: number } }
          }
        | undefined
      if (!pred) return
      if (pred.level1) setL1(String(pred.level1))
      if (pred.level2) setL2(String(pred.level2))
      if (pred.level3 || pred.category_id) setL3(String(pred.level3 || pred.category_id))
      // Heuristic: leaf id only — try match in tree later by id scan
      if (!pred.level1 && pred.category_id) {
        for (const a of tree) {
          for (const b of childrenOf(a)) {
            for (const c of childrenOf(b)) {
              if (c.id === pred.category_id) {
                setL1(String(a.id))
                setL2(String(b.id))
                setL3(String(c.id))
                return
              }
            }
            if (b.id === pred.category_id) {
              setL1(String(a.id))
              setL2(String(b.id))
              setL3('')
              return
            }
          }
          if (a.id === pred.category_id) {
            setL1(String(a.id))
            setL2('')
            setL3('')
          }
        }
      }
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const saveOpt = useMutation({
    mutationFn: () =>
      apiFetch('basalam/categories/option-maps', {
        method: 'POST',
        body: JSON.stringify({ woo_attr_name: optWoo, basalam_attr_name: optBsl }),
      }),
    onSuccess: async () => {
      toast.success(t('basalam.optionMapSaved'))
      setOptWoo('')
      setOptBsl('')
      await qc.invalidateQueries({ queryKey: ['basalam', 'option-maps'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  return (
    <PageShell title={t('basalam.categoriesTitle')} description={t('basalam.categoriesSubtitle')}>
      <BasalamNav />
      <Card className="mb-4 max-w-3xl">
        <CardHeader>
          <CardTitle>{t('basalam.addMapping')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm md:col-span-2">
            <span>{t('basalam.wooCategory')}</span>
            <select
              className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
              value={wooId}
              onChange={(e) => setWooId(e.target.value)}
            >
              <option value="">{t('basalam.selectWooCategory')}</option>
              {(wooCatsQ.data?.items ?? []).map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span>{t('basalam.bslLevel1')}</span>
            <select
              className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
              value={l1}
              onChange={(e) => {
                setL1(e.target.value)
                setL2('')
                setL3('')
              }}
            >
              <option value="">{t('basalam.selectCategory')}</option>
              {l1Nodes.map((n) => (
                <option key={n.id} value={String(n.id)}>
                  {nodeLabel(n)}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span>{t('basalam.bslLevel2')}</span>
            <select
              className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
              value={l2}
              disabled={!l1}
              onChange={(e) => {
                setL2(e.target.value)
                setL3('')
              }}
            >
              <option value="">{t('basalam.selectCategory')}</option>
              {l2Nodes.map((n) => (
                <option key={n.id} value={String(n.id)}>
                  {nodeLabel(n)}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm md:col-span-2">
            <span>{t('basalam.bslLevel3')}</span>
            <select
              className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
              value={l3}
              disabled={!l2}
              onChange={(e) => setL3(e.target.value)}
            >
              <option value="">{t('basalam.selectCategory')}</option>
              {l3Nodes.map((n) => (
                <option key={n.id} value={String(n.id)}>
                  {nodeLabel(n)}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-2 md:col-span-2">
            <Button onClick={() => save.mutate()} disabled={save.isPending || !wooId || !l1}>
              {t('basalam.saveMapping')}
            </Button>
            <Button
              variant="secondary"
              onClick={() => detect.mutate()}
              disabled={detect.isPending || !wooId}
            >
              {t('basalam.autoSuggest')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4 max-w-3xl">
        <CardHeader>
          <CardTitle>{t('basalam.mappings')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(mapsQ.data?.mappings ?? []).map((m) => (
            <div key={String(m.id)} className="flex flex-wrap items-center justify-between gap-2 border-b py-2 text-sm">
              <span>
                {String(m.woo_category_name || m.woo_category_id)} →{' '}
                {String(m.basalam_category_name || '—')}
              </span>
              <Button size="sm" variant="destructive" onClick={() => del.mutate(Number(m.id))}>
                {t('basalam.delete')}
              </Button>
            </div>
          ))}
          {!mapsQ.data?.mappings?.length ? (
            <p className="text-muted-foreground text-sm">{t('common.empty')}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>{t('basalam.optionMaps')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Input value={optWoo} onChange={(e) => setOptWoo(e.target.value)} placeholder={t('basalam.wooAttrName')} />
          <Input value={optBsl} onChange={(e) => setOptBsl(e.target.value)} placeholder={t('basalam.basalamAttrName')} />
          <Button onClick={() => saveOpt.mutate()} disabled={saveOpt.isPending || !optWoo || !optBsl}>
            {t('basalam.saveOptionMap')}
          </Button>
          <div className="md:col-span-3 space-y-1 text-sm">
            {(optsQ.data?.maps ?? []).map((m, i) => (
              <div key={i} className="text-muted-foreground">
                {String(m.woo_name ?? m.woo_attr ?? '')} → {String(m.webino_basalam_name ?? m.basalam_attr ?? '')}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}
