import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { MediaTerm } from '@/components/media/MediaTermManager'
import { Button } from '@/components/ui/button'
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
import { apiFetch } from '@/lib/api'
import { buildCategoryTree } from '@/lib/categoryTree'

type MediaItem = {
  id: number
  title: string
  url: string | null
  mime: string
}

type TermsPayload = {
  folders: MediaTerm[]
  categories: MediaTerm[]
}

type MediaPickerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (item: { id: number; url: string }) => void
}

function buildMediaQuery(folder: number, category: number, search: string): string {
  const p = new URLSearchParams({ page: '1', per_page: '60' })
  if (folder > 0) p.set('folder', String(folder))
  if (category > 0) p.set('category', String(category))
  if (search.trim()) p.set('search', search.trim())
  return `content/media?${p.toString()}`
}

function toCategory(term: MediaTerm) {
  return { ...term, url: '' }
}

export function MediaPickerDialog({ open, onOpenChange, onSelect }: MediaPickerDialogProps) {
  const { t } = useTranslation()
  const [folderFilter, setFolderFilter] = useState(0)
  const [categoryFilter, setCategoryFilter] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => setSearch(searchInput), 300)
    return () => window.clearTimeout(timer)
  }, [open, searchInput])

  const termsQ = useQuery({
    queryKey: ['media-terms'],
    queryFn: () => apiFetch<TermsPayload>('content/media/terms'),
    enabled: open,
  })

  const q = useQuery({
    queryKey: ['media', 'picker', folderFilter, categoryFilter, search],
    queryFn: () => apiFetch<{ items: MediaItem[] }>(buildMediaQuery(folderFilter, categoryFilter, search)),
    enabled: open,
  })

  const folderTree = useMemo(
    () => buildCategoryTree((termsQ.data?.folders ?? []).map(toCategory)),
    [termsQ.data?.folders],
  )
  const categoryTree = useMemo(
    () => buildCategoryTree((termsQ.data?.categories ?? []).map(toCategory)),
    [termsQ.data?.categories],
  )

  const items = (q.data?.items ?? []).filter((item) => item.mime.startsWith('image/'))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('posts.selectFeaturedImage')}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
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
          <div className="space-y-1">
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
          <div className="space-y-1">
            <Label htmlFor="media-picker-search">{t('media.searchPlaceholder')}</Label>
            <Input
              id="media-picker-search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('media.searchPlaceholder')}
            />
          </div>
        </div>
        <div className="max-h-[50vh] overflow-y-auto">
          {q.isLoading ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-md" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{t('media.empty')}</p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="group overflow-hidden rounded-md border border-border bg-muted/30 transition hover:border-primary hover:ring-2 hover:ring-primary/30"
                  onClick={() => {
                    if (item.url) {
                      onSelect({ id: item.id, url: item.url })
                      onOpenChange(false)
                    }
                  }}
                >
                  {item.url ? (
                    <img
                      src={item.url}
                      alt={item.title}
                      className="aspect-square w-full object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex aspect-square items-center justify-center text-xs text-muted-foreground">
                      {item.title}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('posts.dialogClose')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
