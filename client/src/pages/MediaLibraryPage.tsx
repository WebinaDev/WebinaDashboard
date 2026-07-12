import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Upload } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { MediaItemCard, type MediaItem } from '@/components/media/MediaItemCard'
import type { MediaTerm } from '@/components/media/MediaTermManager'
import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch, apiUploadFile } from '@/lib/api'
import { buildCategoryTree } from '@/lib/categoryTree'
import { formatNumber } from '@/lib/formatNumber'

type TermsPayload = {
  folders: MediaTerm[]
  categories: MediaTerm[]
  tags: MediaTerm[]
}

function buildMediaQuery(folder: number, category: number, search: string, page: number, perPage: number): string {
  const p = new URLSearchParams({ page: String(page), per_page: String(perPage) })
  if (folder > 0) p.set('folder', String(folder))
  if (category > 0) p.set('category', String(category))
  if (search.trim()) p.set('search', search.trim())
  return `content/media?${p.toString()}`
}

function toCategory(term: MediaTerm) {
  return { ...term, url: '' }
}

export default function MediaLibraryPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [folderFilter, setFolderFilter] = useState(0)
  const [categoryFilter, setCategoryFilter] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(40)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    setPage(1)
  }, [folderFilter, categoryFilter])

  const termsQ = useQuery({
    queryKey: ['media-terms'],
    queryFn: () => apiFetch<TermsPayload>('content/media/terms'),
  })

  const q = useQuery({
    queryKey: ['media', folderFilter, categoryFilter, search, page, perPage],
    queryFn: () =>
      apiFetch<{ items: MediaItem[]; page: number; total: number }>(
        buildMediaQuery(folderFilter, categoryFilter, search, page, perPage),
      ),
  })
  useQueryErrorToast(termsQ)
  useQueryErrorToast(q)

  const upload = useMutation({
    mutationFn: (file: File) => {
      const fields: Record<string, string> = {}
      if (folderFilter > 0) fields.folder_id = String(folderFilter)
      if (categoryFilter > 0) fields.category_ids = JSON.stringify([categoryFilter])
      return apiUploadFile('content/media', file, Object.keys(fields).length ? fields : undefined)
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['media'] })
      toast.success(t('media.uploaded'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const folderTree = useMemo(
    () => buildCategoryTree((termsQ.data?.folders ?? []).map(toCategory)),
    [termsQ.data?.folders],
  )
  const categoryTree = useMemo(
    () => buildCategoryTree((termsQ.data?.categories ?? []).map(toCategory)),
    [termsQ.data?.categories],
  )

  const total = q.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const locale = i18n.language

  function invalidateMedia() {
    void qc.invalidateQueries({ queryKey: ['media'] })
    void qc.invalidateQueries({ queryKey: ['media-terms'] })
  }

  return (
    <PageShell title={t('media.title')} description={t('media.description')}>
      <Card className="mb-6 flex flex-col gap-4 p-4 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="min-w-[10rem] flex-1 space-y-1">
            <Label>{t('media.filterFolder')}</Label>
            <Select value={String(folderFilter)} onValueChange={(v) => setFolderFilter(parseInt(v, 10) || 0)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">{t('media.allFolders')}</SelectItem>
                {folderTree.map(({ node, depth }) => (
                  <SelectItem key={node.id} value={String(node.id)}>
                    {`${'— '.repeat(depth)}${node.name}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[10rem] flex-1 space-y-1">
            <Label>{t('media.filterCategory')}</Label>
            <Select value={String(categoryFilter)} onValueChange={(v) => setCategoryFilter(parseInt(v, 10) || 0)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">{t('media.allCategories')}</SelectItem>
                {categoryTree.map(({ node, depth }) => (
                  <SelectItem key={node.id} value={String(node.id)}>
                    {`${'— '.repeat(depth)}${node.name}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[12rem] flex-[2] space-y-1">
            <Label htmlFor="media-search">{t('media.searchPlaceholder')}</Label>
            <Input
              id="media-search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('media.searchPlaceholder')}
            />
          </div>
          <div className="flex items-end">
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void upload.mutateAsync(f)
                e.target.value = ''
              }}
            />
            <Button type="button" disabled={upload.isPending} onClick={() => fileRef.current?.click()}>
              <Upload className="size-4" />
              {t('media.upload')}
            </Button>
          </div>
        </div>
      </Card>

      {q.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-video w-full rounded-lg" />
          ))}
        </div>
      ) : (q.data?.items ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('media.empty')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(q.data?.items ?? []).map((m) => (
            <MediaItemCard
              key={m.id}
              item={m}
              folders={termsQ.data?.folders ?? []}
              categories={termsQ.data?.categories ?? []}
              tags={termsQ.data?.tags ?? []}
              onUpdated={invalidateMedia}
              onDeleted={invalidateMedia}
            />
          ))}
        </div>
      )}

      {!q.isLoading && total > 0 ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            {t('media.totalItems', { count: formatNumber(total, locale) })}
          </p>
          <div className="flex items-center gap-2">
            <Label htmlFor="media-per-page" className="text-sm text-muted-foreground">
              {t('media.perPage')}
            </Label>
            <Select value={String(perPage)} onValueChange={(v) => { setPerPage(parseInt(v, 10) || 40); setPage(1) }}>
              <SelectTrigger id="media-per-page" className="h-8 w-[5.5rem]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[20, 40, 60].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {formatNumber(n, locale)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('media.pageOf', {
              page: formatNumber(page, locale),
              total: formatNumber(totalPages, locale),
            })}
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              {t('common.prevPage')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              {t('common.nextPage')}
            </Button>
          </div>
        </div>
      ) : null}
    </PageShell>
  )
}
