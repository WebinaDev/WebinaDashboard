import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMatch, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { apiFetch } from '@/lib/api'
import type {
  AttributeRow,
  GalleryImage,
  Product,
  ProductIshop,
  ProductLookup,
  ProductSeo,
  WholesaleRule,
  WholesaleRuleForm,
} from '@/types/product'
import { emptyProductIshop, emptyProductSeo } from '@/types/product'

function emptyWholesaleRule(): WholesaleRuleForm {
  return {
    custom: false,
    wholesale_enabled: true,
    discount_percent: '',
    sell_by: 'unit',
    min_qty: '',
    min_weight: '',
    qty_step: '',
  }
}

function hydrateWholesaleRule(raw: unknown): WholesaleRuleForm {
  if (!raw || typeof raw !== 'object') return emptyWholesaleRule()
  const rule = raw as WholesaleRule
  const hasOverride =
    rule.discount_percent != null ||
    rule.min_qty != null ||
    rule.min_weight != null ||
    rule.qty_step != null ||
    rule.sell_by != null ||
    rule.wholesale_enabled != null
  if (!hasOverride) return emptyWholesaleRule()
  return {
    custom: true,
    wholesale_enabled: rule.wholesale_enabled !== false,
    discount_percent: rule.discount_percent != null ? String(rule.discount_percent) : '',
    sell_by: rule.sell_by === 'weight' ? 'weight' : 'unit',
    min_qty: rule.min_qty != null ? String(rule.min_qty) : '',
    min_weight: rule.min_weight != null ? String(rule.min_weight) : '',
    qty_step: rule.qty_step != null ? String(rule.qty_step) : '',
  }
}

function wholesaleRulePayload(rule: WholesaleRuleForm): WholesaleRule | null {
  if (!rule.custom) return null
  return {
    discount_percent: parseFloat(rule.discount_percent) || 0,
    min_qty: parseFloat(rule.min_qty) || 0,
    min_weight: parseFloat(rule.min_weight) || 0,
    qty_step: parseFloat(rule.qty_step) || 0,
    sell_by: rule.sell_by,
    wholesale_enabled: rule.wholesale_enabled,
  }
}
function slugifyName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u0600-\u06FF-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function useProductEditorForm() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const qc = useQueryClient()
  const isNew = Boolean(useMatch('/shop/products/new'))
  const { productId } = useParams<{ productId: string }>()
  const id = isNew ? undefined : productId ? parseInt(productId, 10) : undefined

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [productType, setProductType] = useState<'simple' | 'variable'>('simple')
  const [sku, setSku] = useState('')
  const [status, setStatus] = useState('draft')
  const [catalogVisibility, setCatalogVisibility] = useState('visible')
  const [featured, setFeatured] = useState(false)
  const [regular, setRegular] = useState('')
  const [sale, setSale] = useState('')
  const [stock, setStock] = useState('')
  const [manageStock, setManageStock] = useState(true)
  const [backorders, setBackorders] = useState('no')
  const [description, setDescription] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [purchase, setPurchase] = useState('')
  const [lockPrice, setLockPrice] = useState(false)
  const [wfcpPrices, setWfcpPrices] = useState<Product['wfcp_prices']>()
  const [platformLocks, setPlatformLocks] = useState<Record<string, boolean>>({})
  const [platformPrices, setPlatformPrices] = useState<Record<string, string>>({})
  const [wholesaleDiscount, setWholesaleDiscount] = useState('')
  const [wholesaleRule, setWholesaleRule] = useState<WholesaleRuleForm>(() => emptyWholesaleRule())
  const [referenceUrl, setReferenceUrl] = useState('')
  const [referenceSource, setReferenceSource] = useState('')
  const [referenceLastSync, setReferenceLastSync] = useState('')
  const [imageId, setImageId] = useState(0)
  const [imageUrl, setImageUrl] = useState('')
  const [gallery, setGallery] = useState<GalleryImage[]>([])
  const [categoryIds, setCategoryIds] = useState<number[]>([])
  const [brandIds, setBrandIds] = useState<number[]>([])
  const [tagIds, setTagIds] = useState<number[]>([])
  const [attributes, setAttributes] = useState<AttributeRow[]>([])
  const [weight, setWeight] = useState('')
  const [length, setLength] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [upsellIds, setUpsellIds] = useState<number[]>([])
  const [crossSellIds, setCrossSellIds] = useState<number[]>([])
  const [variationCount, setVariationCount] = useState(0)
  const [seo, setSeo] = useState<ProductSeo>(() => emptyProductSeo())
  const [ishop, setIshop] = useState<ProductIshop>(() => emptyProductIshop())
  const [permalink, setPermalink] = useState('')
  const [permalinkBase, setPermalinkBase] = useState('')

  const productQ = useQuery({
    queryKey: ['product', id],
    queryFn: () => apiFetch<Product>(`shop/products/${id}`),
    enabled: Boolean(id),
  })

  const lookupQ = useQuery({
    queryKey: ['product-lookup'],
    queryFn: () => apiFetch<ProductLookup>('shop/products/lookup'),
  })

  const hydrate = useCallback((p: Product) => {
    setName(p.name)
    setSlug(p.slug ?? '')
    setSlugTouched(Boolean(p.slug))
    setProductType(p.type === 'variable' ? 'variable' : 'simple')
    setSku(p.sku ?? '')
    setStatus(p.status || 'draft')
    setCatalogVisibility(p.catalog_visibility ?? 'visible')
    setFeatured(Boolean(p.featured))
    setRegular(p.regular ?? '')
    setSale(p.sale ?? '')
    setStock(p.stock != null ? String(p.stock) : '')
    setManageStock(Boolean(p.manage_stock))
    setBackorders(p.backorders ?? 'no')
    setDescription(p.description ?? '')
    setShortDescription(p.short_description ?? '')
    setPurchase(String(p.wfcp?.purchase_price ?? p.wfcp_prices?.purchase_price ?? ''))
    setLockPrice(Boolean(p.wfcp?.lock_price ?? p.wfcp_prices?.lock_price))
    setWfcpPrices(p.wfcp_prices)
    const platforms = p.wfcp_prices?.platforms ?? {}
    const locks: Record<string, boolean> = {}
    const prices: Record<string, string> = {}
    Object.entries(platforms).forEach(([slug, row]) => {
      locks[slug] = Boolean(row?.lock)
      prices[slug] = row?.manual_price != null && row.manual_price !== '' ? String(row.manual_price) : ''
    })
    setPlatformLocks(locks)
    setPlatformPrices(prices)
    const rule = p.wfcp?.wholesale_rule ?? p.wfcp_prices?.wholesale_rule
    setWholesaleRule(hydrateWholesaleRule(rule))
    setWholesaleDiscount(
      rule && typeof rule === 'object' && 'discount_percent' in rule && rule.discount_percent != null
        ? String(rule.discount_percent)
        : '',
    )
    setReferenceUrl(String(p.wfcp?.reference_url ?? ''))
    setReferenceSource(String(p.wfcp?.reference_source ?? ''))
    const last = p.wfcp?.reference_last_sync
    if (last && typeof last === 'object') {
      setReferenceLastSync(String(last.time ?? last.message ?? last.status ?? ''))
    } else {
      setReferenceLastSync(typeof last === 'string' ? last : '')
    }
    setImageId(p.image_id ?? 0)
    setImageUrl(p.image_url ?? '')
    const urls = p.gallery_urls ?? []
    const ids = p.gallery_ids ?? []
    if (urls.length) {
      setGallery(urls)
    } else {
      setGallery(ids.map((gid) => ({ id: gid, url: '' })))
    }
    setCategoryIds([...(p.category_ids ?? [])])
    setBrandIds([...(p.brand_ids ?? [])])
    setTagIds([...(p.tag_ids ?? [])])
    const pa = p.product_attributes ?? []
    setAttributes(
      pa.length
        ? pa.map((a) => ({
            name: a.name,
            options: (a.options ?? []).map(String).join(', '),
            variation: Boolean(a.variation),
            visible: a.visible !== false,
            attribute_id: a.attribute_id,
            taxonomy: a.taxonomy,
          }))
        : [],
    )
    setWeight(p.weight ?? '')
    setLength(p.length ?? '')
    setWidth(p.width ?? '')
    setHeight(p.height ?? '')
    setUpsellIds([...(p.upsell_ids ?? [])])
    setCrossSellIds([...(p.cross_sell_ids ?? [])])
    setVariationCount((p.variation_ids ?? []).length)
    setSeo({ ...emptyProductSeo(), ...(p.seo ?? {}) })
    setIshop({
      ...emptyProductIshop(),
      ...(p.ishop ?? {}),
      labels: { ...(p.ishop?.labels ?? {}) },
      custom_labels: [...(p.ishop?.custom_labels ?? [])],
      faqs: [...(p.ishop?.faqs ?? [])],
    })
    setPermalink(p.permalink ?? '')
    setPermalinkBase(p.permalink_base ?? '')
  }, [])

  useEffect(() => {
    if (productQ.data) hydrate(productQ.data)
  }, [productQ.data, hydrate])

  useEffect(() => {
    if (!slugTouched && name.trim() && isNew) {
      setSlug(slugifyName(name))
    }
  }, [name, slugTouched, isNew])

  useEffect(() => {
    if (lookupQ.data?.permalink_base && !permalinkBase) {
      setPermalinkBase(lookupQ.data.permalink_base)
    }
  }, [lookupQ.data?.permalink_base, permalinkBase])

  const productAttributesPayload = attributes
    .filter((row) => row.name.trim() && row.options.trim())
    .map((row) => ({
      name: row.name.trim(),
      options: row.options
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      variation: row.variation,
      visible: row.visible,
      ...(row.attribute_id ? { attribute_id: row.attribute_id } : {}),
    }))

  function buildPayload() {
    const body: Record<string, unknown> = {
      name: name || t('products.untitled'),
      slug: slug.trim() || undefined,
      sku,
      status,
      catalog_visibility: catalogVisibility,
      featured,
      description,
      short_description: shortDescription,
      image_id: imageId,
      gallery_ids: gallery.map((g) => g.id),
      category_ids: categoryIds,
      brand_ids: brandIds,
      tag_ids: tagIds,
      product_attributes: productAttributesPayload,
      weight: weight.trim(),
      length: length.trim(),
      width: width.trim(),
      height: height.trim(),
      upsell_ids: upsellIds,
      cross_sell_ids: crossSellIds,
      backorders,
      seo,
      ishop,
      wfcp: {
        purchase_price: purchase,
        lock_price: lockPrice,
        reference_url: referenceUrl,
        wholesale_rule: wholesaleRulePayload(wholesaleRule),
        platforms: Object.fromEntries(
          Object.keys({ ...platformLocks, ...platformPrices }).map((slug) => [
            slug,
            {
              lock: Boolean(platformLocks[slug]),
              manual_price: platformPrices[slug] ?? '',
            },
          ]),
        ),
      },
    }

    if (productType === 'simple') {
      body.regular_price = regular
      body.sale_price = sale
      if (stock === '') {
        body.stock_quantity = null
      } else {
        const stockNum = parseInt(stock, 10)
        body.stock_quantity = Number.isNaN(stockNum) ? null : stockNum
      }
      body.manage_stock = manageStock
    }

    if (isNew) {
      body.type = productType
    }

    return body
  }

  const save = useMutation({
    mutationFn: async () => {
      const payload = buildPayload()
      if (id) {
        return apiFetch<Product>(`shop/products/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      return apiFetch<Product>('shop/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    },
    onSuccess: (p) => {
      void qc.invalidateQueries({ queryKey: ['products'] })
      toast.success(t('common.saved'))
      if (!id && p.id) {
        void qc.setQueryData(['product', p.id], p)
        nav(`/shop/products/${p.id}`, { replace: true })
      } else if (id) {
        void qc.invalidateQueries({ queryKey: ['product', id] })
        hydrate(p)
      }
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const patchWfcp = useMutation({
    mutationFn: async () => {
      if (!id) return null
      await apiFetch(`shop/products/${id}/wfcp`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wfcp: {
            purchase_price: purchase,
            lock_price: lockPrice,
            reference_url: referenceUrl,
            wholesale_rule: wholesaleRulePayload(wholesaleRule),
            platforms: Object.fromEntries(
              ['digikala', 'basalam', 'technolife', 'snappshop', 'tapsishop', 'zarehbin', 'emalls', 'snapppay-search', 'torob'].map(
                (slug) => [
                  slug,
                  {
                    lock: Boolean(platformLocks[slug]),
                    manual_price: platformPrices[slug] ?? '',
                  },
                ],
              ),
            ),
          },
        }),
      })
      return apiFetch<Product>(`shop/products/${id}`)
    },
    onSuccess: (p) => {
      if (p) {
        hydrate(p)
      }
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const fetchReference = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('missing product')
      return apiFetch<{
        purchase_price?: number
        last_sync?: { time?: string; message?: string; status?: string }
        source?: string
        url?: string
      }>(`wfcp/products/${id}/reference-fetch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: referenceUrl }),
      })
    },
    onSuccess: async (r) => {
      if (r.url) setReferenceUrl(r.url)
      if (r.source) setReferenceSource(r.source)
      const last = r.last_sync
      if (last && typeof last === 'object') {
        setReferenceLastSync(String(last.time ?? last.message ?? last.status ?? ''))
      }
      if (r.purchase_price != null) setPurchase(String(r.purchase_price))
      toast.success(t('common.saved'))
      if (id) {
        const p = await apiFetch<Product>(`shop/products/${id}`)
        hydrate(p)
      }
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const typeChangeDisabled = Boolean(id && variationCount > 0)
  const loadFailed = Boolean(id) && (productQ.isError || lookupQ.isError)

  return {
    id,
    isNew,
    loading: Boolean(id) && productQ.isLoading,
    loadFailed,
    productQ,
    lookupQ,
    name,
    setName,
    slug,
    setSlug,
    setSlugTouched,
    productType,
    setProductType,
    typeChangeDisabled,
    sku,
    setSku,
    status,
    setStatus,
    catalogVisibility,
    setCatalogVisibility,
    featured,
    setFeatured,
    regular,
    setRegular,
    sale,
    setSale,
    stock,
    setStock,
    manageStock,
    setManageStock,
    backorders,
    setBackorders,
    description,
    setDescription,
    shortDescription,
    setShortDescription,
    purchase,
    setPurchase,
    lockPrice,
    setLockPrice,
    wfcpPrices,
    platformLocks,
    setPlatformLocks,
    platformPrices,
    setPlatformPrices,
    wholesaleDiscount,
    setWholesaleDiscount,
    wholesaleRule,
    setWholesaleRule,
    referenceUrl,
    setReferenceUrl,
    referenceSource,
    referenceLastSync,
    imageId,
    imageUrl,
    setCover: (item: { id: number; url: string }) => {
      setImageId(item.id)
      setImageUrl(item.url)
    },
    clearCover: () => {
      setImageId(0)
      setImageUrl('')
    },
    gallery,
    setGallery,
    categoryIds,
    setCategoryIds,
    brandIds,
    setBrandIds,
    tagIds,
    setTagIds,
    attributes,
    setAttributes,
    weight,
    setWeight,
    length,
    setLength,
    width,
    setWidth,
    height,
    setHeight,
    upsellIds,
    setUpsellIds,
    crossSellIds,
    setCrossSellIds,
    seo,
    setSeo,
    ishop,
    setIshop,
    permalink,
    permalinkBase,
    save,
    patchWfcp,
    fetchReference,
  }
}
