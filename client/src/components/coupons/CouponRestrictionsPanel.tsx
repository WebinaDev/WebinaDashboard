import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { ProductMultiSelect } from '@/components/coupons/ProductMultiSelect'
import { UserMultiSelect } from '@/components/coupons/UserMultiSelect'
import { CheckboxListSkeleton } from '@/components/skeletons/CheckboxListSkeleton'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { apiFetch } from '@/lib/api'

type Term = { id: number; name: string }
type LocItem = { id: string; code?: string; label: string }
type IdTitle = { id: string; title?: string; label?: string }

type LocationsPayload = {
  items: LocItem[]
  payments: IdTitle[]
  shipping: IdTitle[]
  purchase_types: { id: string; label: string }[]
}

type CouponRestrictionsPanelProps = {
  productIds: number[]
  onProductIdsChange: (ids: number[]) => void
  excludedProductIds: number[]
  onExcludedProductIdsChange: (ids: number[]) => void
  categoryIds: number[]
  onCategoryIdsChange: (ids: number[]) => void
  excludedCategoryIds: number[]
  onExcludedCategoryIdsChange: (ids: number[]) => void
  brandIds: number[]
  onBrandIdsChange: (ids: number[]) => void
  excludedBrandIds: number[]
  onExcludedBrandIdsChange: (ids: number[]) => void
  emailsText: string
  onEmailsTextChange: (value: string) => void
  allowedUserIds: number[]
  onAllowedUserIdsChange: (ids: number[]) => void
  allowedStates: string[]
  onAllowedStatesChange: (ids: string[]) => void
  allowedCities: string[]
  onAllowedCitiesChange: (ids: string[]) => void
  allowedPaymentMethods: string[]
  onAllowedPaymentMethodsChange: (ids: string[]) => void
  allowedPurchaseTypes: string[]
  onAllowedPurchaseTypesChange: (ids: string[]) => void
  allowedShippingMethods: string[]
  onAllowedShippingMethodsChange: (ids: string[]) => void
  allowedChannels: string[]
  onAllowedChannelsChange: (ids: string[]) => void
}

function toggleTax(ids: number[], tid: number, checked: boolean) {
  if (checked) return ids.includes(tid) ? ids : [...ids, tid]
  return ids.filter((x) => x !== tid)
}

function toggleStr(ids: string[], id: string, checked: boolean) {
  if (checked) return ids.includes(id) ? ids : [...ids, id]
  return ids.filter((x) => x !== id)
}

function TermCheckboxList({
  label,
  items,
  selected,
  onChange,
  loading,
  emptyKey,
}: {
  label: string
  items: Term[]
  selected: number[]
  onChange: (ids: number[]) => void
  loading: boolean
  emptyKey: string
}) {
  const { t } = useTranslation()

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="max-h-40 overflow-y-auto rounded-md border border-border p-2 text-sm">
        {loading ? (
          <CheckboxListSkeleton rows={5} />
        ) : items.length === 0 ? (
          <p className="text-muted-foreground">{t(emptyKey)}</p>
        ) : (
          items.map((c) => (
            <label key={c.id} className="flex cursor-pointer items-center gap-2 py-1">
              <Checkbox
                checked={selected.includes(c.id)}
                onCheckedChange={(v) => onChange(toggleTax(selected, c.id, v === true))}
              />
              <span>{c.name}</span>
            </label>
          ))
        )}
      </div>
    </div>
  )
}

function StringCheckboxList({
  label,
  hint,
  items,
  selected,
  onChange,
  loading,
  emptyKey,
}: {
  label: string
  hint?: string
  items: { id: string; label: string }[]
  selected: string[]
  onChange: (ids: string[]) => void
  loading?: boolean
  emptyKey?: string
}) {
  const { t } = useTranslation()

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
      <div className="max-h-40 overflow-y-auto rounded-md border border-border p-2 text-sm">
        {loading ? (
          <CheckboxListSkeleton rows={4} />
        ) : items.length === 0 ? (
          <p className="text-muted-foreground">{t(emptyKey ?? 'common.empty')}</p>
        ) : (
          items.map((c) => (
            <label key={c.id} className="flex cursor-pointer items-center gap-2 py-1">
              <Checkbox
                checked={selected.includes(c.id)}
                onCheckedChange={(v) => onChange(toggleStr(selected, c.id, v === true))}
              />
              <span>{c.label}</span>
            </label>
          ))
        )}
      </div>
    </div>
  )
}

export function CouponRestrictionsPanel({
  productIds,
  onProductIdsChange,
  excludedProductIds,
  onExcludedProductIdsChange,
  categoryIds,
  onCategoryIdsChange,
  excludedCategoryIds,
  onExcludedCategoryIdsChange,
  brandIds,
  onBrandIdsChange,
  excludedBrandIds,
  onExcludedBrandIdsChange,
  emailsText,
  onEmailsTextChange,
  allowedUserIds,
  onAllowedUserIdsChange,
  allowedStates,
  onAllowedStatesChange,
  allowedCities,
  onAllowedCitiesChange,
  allowedPaymentMethods,
  onAllowedPaymentMethodsChange,
  allowedPurchaseTypes,
  onAllowedPurchaseTypesChange,
  allowedShippingMethods,
  onAllowedShippingMethodsChange,
  allowedChannels,
  onAllowedChannelsChange,
}: CouponRestrictionsPanelProps) {
  const { t } = useTranslation()

  const catsQ = useQuery({
    queryKey: ['product-categories'],
    queryFn: () => apiFetch<{ items: Term[] }>('shop/product-categories'),
  })

  const brandsQ = useQuery({
    queryKey: ['brands'],
    queryFn: () => apiFetch<{ items: Term[] }>('shop/brands'),
  })

  const locQ = useQuery({
    queryKey: ['shop-locations-states'],
    queryFn: () => apiFetch<LocationsPayload>('shop/locations/states'),
  })

  const citiesQ = useQuery({
    queryKey: ['shop-locations-cities', allowedStates.join(',')],
    queryFn: async () => {
      const all: LocItem[] = []
      const seen = new Set<string>()
      for (const state of allowedStates) {
        const res = await apiFetch<{ items: LocItem[] }>(
          `shop/locations/cities?state=${encodeURIComponent(state)}`,
        )
        for (const c of res.items ?? []) {
          if (seen.has(c.id)) continue
          seen.add(c.id)
          all.push(c)
        }
      }
      return all
    },
    enabled: allowedStates.length > 0,
  })

  const cats = catsQ.data?.items ?? []
  const brands = brandsQ.data?.items ?? []
  const states = locQ.data?.items ?? []
  const payments = (locQ.data?.payments ?? []).map((p) => ({
    id: p.id,
    label: p.title || p.label || p.id,
  }))
  const shipping = (locQ.data?.shipping ?? []).map((p) => ({
    id: p.id,
    label: p.title || p.label || p.id,
  }))
  const purchaseTypes = (locQ.data?.purchase_types ?? []).map((p) => ({
    id: p.id,
    label: p.label || p.id,
  }))
  const cities = useMemo(
    () => (citiesQ.data ?? []).map((c) => ({ id: c.id, label: c.label })),
    [citiesQ.data],
  )

  const channelItems = [
    { id: 'site', label: t('coupons.restrict.channelSite') },
    { id: 'bale', label: t('coupons.restrict.channelBale') },
    { id: 'telegram', label: t('coupons.restrict.channelTelegram') },
  ]

  return (
    <div className="space-y-6">
      <UserMultiSelect
        id="coupon-allowed-users"
        label={t('coupons.restrict.allowedUsers')}
        hint={t('coupons.restrict.allowedUsersHint')}
        value={allowedUserIds}
        onChange={onAllowedUserIdsChange}
      />

      <ProductMultiSelect
        id="coupon-products-include"
        label={t('coupons.productsInclude')}
        value={productIds}
        onChange={onProductIdsChange}
      />
      <ProductMultiSelect
        id="coupon-products-exclude"
        label={t('coupons.productsExclude')}
        value={excludedProductIds}
        onChange={onExcludedProductIdsChange}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <TermCheckboxList
          label={t('coupons.categoriesInclude')}
          items={cats}
          selected={categoryIds}
          onChange={onCategoryIdsChange}
          loading={catsQ.isLoading}
          emptyKey="products.noCategories"
        />
        <TermCheckboxList
          label={t('coupons.categoriesExclude')}
          items={cats}
          selected={excludedCategoryIds}
          onChange={onExcludedCategoryIdsChange}
          loading={catsQ.isLoading}
          emptyKey="products.noCategories"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TermCheckboxList
          label={t('coupons.brandsInclude')}
          items={brands}
          selected={brandIds}
          onChange={onBrandIdsChange}
          loading={brandsQ.isLoading}
          emptyKey="products.noBrands"
        />
        <TermCheckboxList
          label={t('coupons.brandsExclude')}
          items={brands}
          selected={excludedBrandIds}
          onChange={onExcludedBrandIdsChange}
          loading={brandsQ.isLoading}
          emptyKey="products.noBrands"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StringCheckboxList
          label={t('coupons.restrict.states')}
          hint={t('coupons.restrict.statesHint')}
          items={states.map((s) => ({ id: s.id, label: s.label }))}
          selected={allowedStates}
          onChange={(ids) => {
            onAllowedStatesChange(ids)
            // Drop cities that no longer belong when states change — full refresh via query.
            if (ids.length === 0) onAllowedCitiesChange([])
          }}
          loading={locQ.isLoading}
          emptyKey="coupons.restrict.noStates"
        />
        <StringCheckboxList
          label={t('coupons.restrict.cities')}
          hint={t('coupons.restrict.citiesHint')}
          items={cities}
          selected={allowedCities}
          onChange={onAllowedCitiesChange}
          loading={citiesQ.isFetching}
          emptyKey="coupons.restrict.noCities"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StringCheckboxList
          label={t('coupons.restrict.paymentMethods')}
          hint={t('coupons.restrict.paymentMethodsHint')}
          items={payments}
          selected={allowedPaymentMethods}
          onChange={onAllowedPaymentMethodsChange}
          loading={locQ.isLoading}
          emptyKey="coupons.restrict.noPayments"
        />
        <StringCheckboxList
          label={t('coupons.restrict.purchaseTypes')}
          hint={t('coupons.restrict.purchaseTypesHint')}
          items={purchaseTypes}
          selected={allowedPurchaseTypes}
          onChange={onAllowedPurchaseTypesChange}
          loading={locQ.isLoading}
          emptyKey="coupons.restrict.noPurchaseTypes"
        />
      </div>

      <StringCheckboxList
        label={t('coupons.restrict.shippingMethods')}
        hint={t('coupons.restrict.shippingMethodsHint')}
        items={shipping}
        selected={allowedShippingMethods}
        onChange={onAllowedShippingMethodsChange}
        loading={locQ.isLoading}
        emptyKey="coupons.restrict.noShipping"
      />

      <StringCheckboxList
        label={t('coupons.restrict.channels')}
        hint={t('coupons.restrict.channelsHint')}
        items={channelItems}
        selected={allowedChannels}
        onChange={onAllowedChannelsChange}
      />

      <div className="space-y-2">
        <Label htmlFor="coupon-emails">{t('coupons.allowedEmails')}</Label>
        <Textarea
          id="coupon-emails"
          value={emailsText}
          onChange={(e) => onEmailsTextChange(e.target.value)}
          rows={3}
          placeholder={t('coupons.allowedEmailsHint')}
        />
      </div>
    </div>
  )
}
