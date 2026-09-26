import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Loader2, Search } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { LazyImage } from '@/components/ui/lazy-image'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type CatalogCategory = 'food' | 'beauty' | 'pet' | 'general' | 'books' | 'merchandise'

type CatalogItem = {
  id: string
  category: string
  barcode?: string
  title: string
  brand?: string
  description?: string
  image_url?: string
  source?: string
}

const CATEGORIES: CatalogCategory[] = ['food', 'beauty', 'pet', 'general', 'books', 'merchandise']

export default function ProductCatalogPage() {
  const { t } = useTranslation()
  const [category, setCategory] = useState<CatalogCategory>('food')
  const [q, setQ] = useState('')
  const [barcode, setBarcode] = useState('')
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<CatalogItem[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [searched, setSearched] = useState(false)

  const [importingId, setImportingId] = useState<string | null>(null)
  const [lastImport, setLastImport] = useState<{ itemId: string; productId: number } | null>(null)

  const searchMut = useMutation({
    mutationFn: (opts: { page: number; append: boolean }) =>
      apiFetch<{
        ok: boolean
        items: CatalogItem[]
        has_more: boolean
        errors?: string[]
      }>('catalog/search', {
        method: 'POST',
        body: JSON.stringify({
          category,
          q: q.trim(),
          barcode: barcode.trim(),
          page: opts.page,
        }),
      }),
    onSuccess: (res, vars) => {
      setSearched(true)
      setHasMore(!!res.has_more)
      setItems((prev) => (vars.append ? [...prev, ...(res.items ?? [])] : res.items ?? []))
      if (res.errors?.length) {
        toast.message(res.errors[0])
      }
      if (!(res.items ?? []).length && !vars.append) {
        toast.message(t('catalog.empty'))
      }
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const importMut = useMutation({
    mutationFn: (item: CatalogItem) => {
      setImportingId(item.id)
      return apiFetch<{ ok: boolean; product_id: number; edit_url: string }>('catalog/import', {
        method: 'POST',
        body: JSON.stringify({ payload: item }),
      })
    },
    onSuccess: (res, item) => {
      toast.success(t('catalog.imported'))
      setLastImport({ itemId: item.id, productId: res.product_id })
      setImportingId(null)
    },
    onError: (e: Error) => {
      setImportingId(null)
      toastApiError(t, e)
    },
  })

  function runSearch() {
    setPage(1)
    searchMut.mutate({ page: 1, append: false })
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 p-4 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{t('catalog.pageTitle')}</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
            {t('catalog.pageDesc')}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/settings/shop/product-catalog">{t('catalog.settingsLink')}</Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((key) => (
          <Button
            key={key}
            type="button"
            size="sm"
            variant={category === key ? 'default' : 'outline'}
            onClick={() => {
              setCategory(key)
              setItems([])
              setSearched(false)
              setPage(1)
            }}
          >
            {t(`catalog.cat.${key}`)}
          </Button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_12rem_auto]">
        <div className="space-y-1.5">
          <Label htmlFor="catalog-q">{t('catalog.searchLabel')}</Label>
          <Input
            id="catalog-q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('catalog.searchPlaceholder')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') runSearch()
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="catalog-bc">{t('catalog.barcodeLabel')}</Label>
          <Input
            id="catalog-bc"
            dir="ltr"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value.replace(/\D/g, '').slice(0, 14))}
            placeholder="EAN / UPC"
            onKeyDown={(e) => {
              if (e.key === 'Enter') runSearch()
            }}
          />
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            className="w-full md:w-auto"
            disabled={searchMut.isPending || (!q.trim() && !barcode.trim())}
            onClick={runSearch}
          >
            {searchMut.isPending ? (
              <Loader2 className="me-2 size-4 animate-spin" />
            ) : (
              <Search className="me-2 size-4" />
            )}
            {t('catalog.search')}
          </Button>
        </div>
      </div>

      {searchMut.isPending && !items.length ? (
        <p className="text-muted-foreground text-sm">{t('catalog.searching')}</p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="flex gap-3 p-3">
              <div className="bg-muted size-20 shrink-0 overflow-hidden rounded-md">
                {item.image_url ? (
                  <LazyImage src={item.image_url} alt="" className="size-full object-cover" />
                ) : (
                  <div className="text-muted-foreground flex size-full items-center justify-center text-xs">
                    —
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="line-clamp-2 text-sm font-medium leading-snug">{item.title}</p>
                {item.brand ? (
                  <p className="text-muted-foreground truncate text-xs">{item.brand}</p>
                ) : null}
                {item.barcode ? (
                  <p className="text-muted-foreground font-mono text-[11px]" dir="ltr">
                    {item.barcode}
                  </p>
                ) : null}
                <Button
                  type="button"
                  size="sm"
                  className="mt-1"
                  disabled={importMut.isPending && importingId === item.id}
                  onClick={() => importMut.mutate(item)}
                >
                  {t('catalog.addDraft')}
                </Button>
                {lastImport?.itemId === item.id ? (
                  <Link
                    className="text-primary ms-2 text-xs hover:underline"
                    to={`/shop/products/${lastImport.productId}`}
                  >
                    {t('catalog.openProduct')}
                  </Link>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {searched && !searchMut.isPending && items.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t('catalog.empty')}</p>
      ) : null}

      {hasMore ? (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            disabled={searchMut.isPending}
            onClick={() => {
              const next = page + 1
              setPage(next)
              searchMut.mutate({ page: next, append: true })
            }}
          >
            {t('catalog.loadMore')}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
