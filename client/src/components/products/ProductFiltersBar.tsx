import { useTranslation } from 'react-i18next'

import type { ProductFilters, ProductLookup } from '@/components/products/types'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type ProductFiltersBarProps = {
  draft: ProductFilters
  lookup?: ProductLookup
  onChange: (next: ProductFilters) => void
  onApply: () => void
  onReset: () => void
}

export function ProductFiltersBar({ draft, lookup, onChange, onApply, onReset }: ProductFiltersBarProps) {
  const { t } = useTranslation()

  const set = <K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) => {
    onChange({ ...draft, [key]: value })
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <div className="space-y-1 xl:col-span-2">
        <Label>{t('products.searchPlaceholder')}</Label>
        <Input value={draft.search} onChange={(e) => set('search', e.target.value)} placeholder={t('products.searchPlaceholder')} />
      </div>
      <div className="space-y-1">
        <Label>{t('products.filterCategory')}</Label>
        <Select value={draft.category || '_all'} onValueChange={(v) => set('category', v === '_all' ? '' : v)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">{t('products.filterAll')}</SelectItem>
            {(lookup?.categories ?? []).map((c) => (
              <SelectItem key={c.slug} value={c.slug}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>{t('products.filterBrand')}</Label>
        <Select value={draft.brand || '_all'} onValueChange={(v) => set('brand', v === '_all' ? '' : v)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">{t('products.filterAll')}</SelectItem>
            {(lookup?.brands ?? []).map((b) => (
              <SelectItem key={b.slug} value={b.slug}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>{t('products.filterTag')}</Label>
        <Select value={draft.tag || '_all'} onValueChange={(v) => set('tag', v === '_all' ? '' : v)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">{t('products.filterAll')}</SelectItem>
            {(lookup?.tags ?? []).map((tag) => (
              <SelectItem key={tag.slug} value={tag.slug}>
                {tag.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>{t('products.filterType')}</Label>
        <Select value={draft.type || '_all'} onValueChange={(v) => set('type', v === '_all' ? '' : v)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">{t('products.filterAll')}</SelectItem>
            <SelectItem value="simple">{t('products.typeSimple')}</SelectItem>
            <SelectItem value="variable">{t('products.typeVariable')}</SelectItem>
            <SelectItem value="grouped">{t('products.typeGrouped')}</SelectItem>
            <SelectItem value="external">{t('products.typeExternal')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>{t('products.filterStock')}</Label>
        <Select value={draft.stock_status || '_all'} onValueChange={(v) => set('stock_status', v === '_all' ? '' : v)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">{t('products.filterAll')}</SelectItem>
            <SelectItem value="instock">{t('products.stockIn')}</SelectItem>
            <SelectItem value="outofstock">{t('products.stockOut')}</SelectItem>
            <SelectItem value="onbackorder">{t('products.stockBackorder')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>{t('products.filterStatus')}</Label>
        <Select value={draft.status || '_all'} onValueChange={(v) => set('status', v === '_all' ? '' : v)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">{t('products.filterAll')}</SelectItem>
            <SelectItem value="publish">{t('products.statusPublish')}</SelectItem>
            <SelectItem value="draft">{t('products.statusDraft')}</SelectItem>
            <SelectItem value="pending">{t('products.statusPending')}</SelectItem>
            <SelectItem value="private">{t('products.statusPrivate')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>{t('products.filterCatalogVisibility')}</Label>
        <Select
          value={draft.catalog_visibility || '_all'}
          onValueChange={(v) => set('catalog_visibility', v === '_all' ? '' : v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">{t('products.filterAll')}</SelectItem>
            <SelectItem value="visible">{t('products.catalogVisibility.visible')}</SelectItem>
            <SelectItem value="catalog">{t('products.catalogVisibility.catalog')}</SelectItem>
            <SelectItem value="search">{t('products.catalogVisibility.search')}</SelectItem>
            <SelectItem value="hidden">{t('products.catalogVisibility.hidden')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>{t('products.filterSort')}</Label>
        <Select value={draft.sort} onValueChange={(v) => set('sort', v)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date_desc">{t('products.sortDateDesc')}</SelectItem>
            <SelectItem value="date_asc">{t('products.sortDateAsc')}</SelectItem>
            <SelectItem value="name_asc">{t('products.sortNameAsc')}</SelectItem>
            <SelectItem value="name_desc">{t('products.sortNameDesc')}</SelectItem>
            <SelectItem value="price_asc">{t('products.sortPriceAsc')}</SelectItem>
            <SelectItem value="price_desc">{t('products.sortPriceDesc')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>{t('products.filterDateFrom')}</Label>
        <DatePicker value={draft.date_from} onChange={(v) => set('date_from', v)} />
      </div>
      <div className="space-y-1">
        <Label>{t('products.filterDateTo')}</Label>
        <DatePicker value={draft.date_to} onChange={(v) => set('date_to', v)} />
      </div>
      <div className="flex flex-wrap items-end gap-2 xl:col-span-4">
        <Button type="button" size="sm" onClick={onApply}>
          {t('products.applyFilters')}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onReset}>
          {t('products.resetFilters')}
        </Button>
      </div>
    </div>
  )
}
