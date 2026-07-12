import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMatch, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { CouponGeneralPanel } from '@/components/coupons/CouponGeneralPanel'
import { CouponPublishPanel, type CouponVisibility } from '@/components/coupons/CouponPublishPanel'
import { CouponRestrictionsPanel } from '@/components/coupons/CouponRestrictionsPanel'
import { CouponUsagePanel } from '@/components/coupons/CouponUsagePanel'
import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'

type Coupon = {
  id: number
  code: string
  amount: string
  type: string
  description?: string
  date_expires?: string | null
  minimum_amount?: string
  maximum_amount?: string
  usage_limit?: number | null
  usage_limit_per_user?: number | null
  individual_use?: boolean
  free_shipping?: boolean
  exclude_sale_items?: boolean
  product_ids?: number[]
  excluded_product_ids?: number[]
  product_categories?: number[]
  excluded_product_categories?: number[]
  brand_ids?: number[]
  excluded_brand_ids?: number[]
  email_restrictions?: string[]
  status?: string
  date?: string
  visibility?: CouponVisibility
}

function toDateTimeLocal(value?: string) {
  if (!value) return dayjs().format('YYYY-MM-DDTHH:mm')
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format('YYYY-MM-DDTHH:mm') : dayjs().format('YYYY-MM-DDTHH:mm')
}

function parseEmailsText(text: string): string[] {
  return text
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function formatEmailsText(emails: string[] | undefined): string {
  return (emails ?? []).join('\n')
}

function buildCouponPayload(input: {
  code: string
  amount: string
  type: string
  description: string
  expires: string
  minAmount: string
  maxAmount: string
  usageLimit: string
  usageLimitPerUser: string
  individualUse: boolean
  freeShipping: boolean
  excludeSale: boolean
  productIds: number[]
  excludedProductIds: number[]
  categoryIds: number[]
  excludedCategoryIds: number[]
  brandIds: number[]
  excludedBrandIds: number[]
  emailsText: string
  status: string
  visibility: CouponVisibility
  password: string
  publishImmediately: boolean
  publishDate: string
}) {
  const usageRaw = input.usageLimit.trim()
  const usagePerUserRaw = input.usageLimitPerUser.trim()

  const body: Record<string, unknown> = {
    code: input.code,
    amount: input.amount,
    type: input.type,
    description: input.description,
    minimum_amount: input.minAmount.trim(),
    maximum_amount: input.maxAmount.trim(),
    individual_use: input.individualUse,
    free_shipping: input.freeShipping,
    exclude_sale_items: input.excludeSale,
    product_ids: input.productIds,
    excluded_product_ids: input.excludedProductIds,
    product_categories: input.categoryIds,
    excluded_product_categories: input.excludedCategoryIds,
    brand_ids: input.brandIds,
    excluded_brand_ids: input.excludedBrandIds,
    email_restrictions: parseEmailsText(input.emailsText),
    status: input.status,
    visibility: input.visibility,
    date_expires: input.expires.trim() === '' ? '' : input.expires.trim(),
    usage_limit: usageRaw === '' ? null : parseInt(usageRaw, 10),
    usage_limit_per_user: usagePerUserRaw === '' ? null : parseInt(usagePerUserRaw, 10),
  }

  if (input.visibility === 'password' && input.password.trim()) {
    body.password = input.password.trim()
  }

  if (!input.publishImmediately) {
    body.date = dayjs(input.publishDate).toISOString()
  }

  return body
}

export default function CouponEditorPage() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const qc = useQueryClient()
  const isNew = useMatch('/marketing/coupons/new')
  const { couponId } = useParams<{ couponId: string }>()
  const id = isNew ? undefined : couponId ? parseInt(couponId, 10) : undefined

  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('fixed_cart')
  const [expires, setExpires] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [usageLimit, setUsageLimit] = useState('')
  const [usageLimitPerUser, setUsageLimitPerUser] = useState('')
  const [individualUse, setIndividualUse] = useState(false)
  const [freeShipping, setFreeShipping] = useState(false)
  const [excludeSale, setExcludeSale] = useState(false)
  const [productIds, setProductIds] = useState<number[]>([])
  const [excludedProductIds, setExcludedProductIds] = useState<number[]>([])
  const [categoryIds, setCategoryIds] = useState<number[]>([])
  const [excludedCategoryIds, setExcludedCategoryIds] = useState<number[]>([])
  const [brandIds, setBrandIds] = useState<number[]>([])
  const [excludedBrandIds, setExcludedBrandIds] = useState<number[]>([])
  const [emailsText, setEmailsText] = useState('')
  const [status, setStatus] = useState('draft')
  const [visibility, setVisibility] = useState<CouponVisibility>('public')
  const [password, setPassword] = useState('')
  const [publishImmediately, setPublishImmediately] = useState(true)
  const [publishDate, setPublishDate] = useState(() => dayjs().format('YYYY-MM-DDTHH:mm'))

  const couponQ = useQuery({
    queryKey: ['coupon', id],
    queryFn: () => apiFetch<Coupon>(`marketing/coupons/${id}`),
    enabled: Boolean(id),
  })
  useQueryErrorToast(couponQ)

  useEffect(() => {
    if (!couponQ.data) return
    const c = couponQ.data
    setCode(c.code)
    setDescription(c.description ?? '')
    setAmount(String(c.amount ?? ''))
    setType(c.type || 'fixed_cart')
    setExpires(c.date_expires ? c.date_expires.slice(0, 10) : '')
    setMinAmount(c.minimum_amount != null ? String(c.minimum_amount) : '')
    setMaxAmount(c.maximum_amount != null ? String(c.maximum_amount) : '')
    setUsageLimit(c.usage_limit != null && c.usage_limit > 0 ? String(c.usage_limit) : '')
    setUsageLimitPerUser(
      c.usage_limit_per_user != null && c.usage_limit_per_user > 0 ? String(c.usage_limit_per_user) : '',
    )
    setIndividualUse(Boolean(c.individual_use))
    setFreeShipping(Boolean(c.free_shipping))
    setExcludeSale(Boolean(c.exclude_sale_items))
    setProductIds([...(c.product_ids ?? [])])
    setExcludedProductIds([...(c.excluded_product_ids ?? [])])
    setCategoryIds([...(c.product_categories ?? [])])
    setExcludedCategoryIds([...(c.excluded_product_categories ?? [])])
    setBrandIds([...(c.brand_ids ?? [])])
    setExcludedBrandIds([...(c.excluded_brand_ids ?? [])])
    setEmailsText(formatEmailsText(c.email_restrictions))
    setStatus(c.status === 'private' ? 'draft' : c.status ?? 'draft')
    setVisibility(c.visibility ?? 'public')
    setPassword('')
    const dateLocal = toDateTimeLocal(c.date)
    setPublishDate(dateLocal)
    const isFuture = c.date ? dayjs(c.date).isAfter(dayjs()) : false
    setPublishImmediately(!isFuture && c.status !== 'future')
  }, [couponQ.data])

  const generateCode = useMutation({
    mutationFn: () => apiFetch<{ code: string }>('marketing/coupons/generate-code'),
    onSuccess: (res) => setCode(res.code),
    onError: (e: Error) => toastApiError(t, e),
  })

  const save = useMutation({
    mutationFn: async () => {
      const payload = buildCouponPayload({
        code,
        amount,
        type,
        description,
        expires,
        minAmount,
        maxAmount,
        usageLimit,
        usageLimitPerUser,
        individualUse,
        freeShipping,
        excludeSale,
        productIds,
        excludedProductIds,
        categoryIds,
        excludedCategoryIds,
        brandIds,
        excludedBrandIds,
        emailsText,
        status,
        visibility,
        password,
        publishImmediately,
        publishDate,
      })

      if (id) {
        return apiFetch<Coupon>(`marketing/coupons/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      return apiFetch<Coupon>('marketing/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    },
    onSuccess: (c) => {
      void qc.invalidateQueries({ queryKey: ['coupons'] })
      if (id) void qc.invalidateQueries({ queryKey: ['coupon', id] })
      toast.success(t('common.saved'))
      if (!id && c.id) {
        nav(`/marketing/coupons/${c.id}`, { replace: true })
      }
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const loading = Boolean(id) && couponQ.isLoading

  return (
    <PageShell title={id ? t('coupons.editTitle') : t('coupons.newTitle')}>
      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" disabled={save.isPending || loading} onClick={() => void save.mutateAsync()}>
          {t('common.save')}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">{t('coupons.sectionCode')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <Skeleton className="h-9 w-full" />
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    <div className="min-w-[12rem] flex-1 space-y-2">
                      <Label htmlFor="coupon-code">{t('coupons.colCode')}</Label>
                      <Input id="coupon-code" value={code} onChange={(e) => setCode(e.target.value)} />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={generateCode.isPending}
                        onClick={() => void generateCode.mutateAsync()}
                      >
                        {t('coupons.generateCode')}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coupon-description">{t('coupons.fieldDescription')}</Label>
                    <Textarea
                      id="coupon-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">{t('coupons.sectionGeneral')}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-32 w-full" /> : (
                <CouponGeneralPanel
                  type={type}
                  onTypeChange={setType}
                  amount={amount}
                  onAmountChange={setAmount}
                  freeShipping={freeShipping}
                  onFreeShippingChange={setFreeShipping}
                  expires={expires}
                  onExpiresChange={setExpires}
                  minAmount={minAmount}
                  onMinAmountChange={setMinAmount}
                  maxAmount={maxAmount}
                  onMaxAmountChange={setMaxAmount}
                  individualUse={individualUse}
                  onIndividualUseChange={setIndividualUse}
                  excludeSale={excludeSale}
                  onExcludeSaleChange={setExcludeSale}
                />
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">{t('coupons.sectionUsage')}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-20 w-full" /> : (
                <CouponUsagePanel
                  usageLimit={usageLimit}
                  onUsageLimitChange={setUsageLimit}
                  usageLimitPerUser={usageLimitPerUser}
                  onUsageLimitPerUserChange={setUsageLimitPerUser}
                />
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">{t('coupons.sectionRestrictions')}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-40 w-full" /> : (
                <CouponRestrictionsPanel
                  productIds={productIds}
                  onProductIdsChange={setProductIds}
                  excludedProductIds={excludedProductIds}
                  onExcludedProductIdsChange={setExcludedProductIds}
                  categoryIds={categoryIds}
                  onCategoryIdsChange={setCategoryIds}
                  excludedCategoryIds={excludedCategoryIds}
                  onExcludedCategoryIdsChange={setExcludedCategoryIds}
                  brandIds={brandIds}
                  onBrandIdsChange={setBrandIds}
                  excludedBrandIds={excludedBrandIds}
                  onExcludedBrandIdsChange={setExcludedBrandIds}
                  emailsText={emailsText}
                  onEmailsTextChange={setEmailsText}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <CouponPublishPanel
            status={status}
            onStatusChange={setStatus}
            visibility={visibility}
            onVisibilityChange={setVisibility}
            password={password}
            onPasswordChange={setPassword}
            publishImmediately={publishImmediately}
            onPublishImmediatelyChange={setPublishImmediately}
            publishDate={publishDate}
            onPublishDateChange={setPublishDate}
            onSave={() => void save.mutateAsync()}
            isSaving={save.isPending || loading}
          />
        </div>
      </div>
    </PageShell>
  )
}
