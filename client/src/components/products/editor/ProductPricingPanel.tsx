import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { MoneyDisplay } from '@/components/currency/MoneyDisplay'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { FormattedNumberInput } from '@/components/ui/formatted-number-input'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  WFCP_MARKETPLACE_CHANNELS,
  WFCP_SEARCH_CHANNELS,
} from '@/pages/settings/shop/wfcpPricingTabs'
import type { WfcpPrices, WholesaleRuleForm } from '@/types/product'

function formatPrice(v: number | null | undefined, currency: string | undefined, locale: string) {
  if (v == null || v <= 0) return '—'
  return <MoneyDisplay amount={Number(v)} currency={currency || 'IRT'} locale={locale} />
}

type ProductPricingPanelProps = {
  productId?: number
  productType: 'simple' | 'variable'
  purchase: string
  lockPrice: boolean
  wfcpPrices?: WfcpPrices
  regular: string
  sale: string
  savingWfcp?: boolean
  platformLocks?: Record<string, boolean>
  platformPrices?: Record<string, string>
  wholesaleDiscount?: string
  wholesaleRule?: WholesaleRuleForm
  productWeight?: string
  referenceUrl?: string
  referenceSource?: string
  referenceLastSync?: string
  fetchingReference?: boolean
  onPurchaseChange: (v: string) => void
  onLockPriceChange: (v: boolean) => void
  onRegularChange: (v: string) => void
  onSaleChange: (v: string) => void
  onPurchaseBlur?: () => void
  onPlatformLockChange?: (slug: string, locked: boolean) => void
  onPlatformPriceChange?: (slug: string, price: string) => void
  onWholesaleDiscountChange?: (v: string) => void
  onWholesaleRuleChange?: (next: WholesaleRuleForm) => void
  onReferenceUrlChange?: (v: string) => void
  onReferenceFetch?: () => void
}

export function ProductPricingPanel({
  productId,
  productType,
  purchase,
  lockPrice,
  wfcpPrices,
  regular,
  sale,
  savingWfcp,
  platformLocks = {},
  platformPrices = {},
  wholesaleDiscount = '',
  wholesaleRule,
  productWeight = '',
  referenceUrl = '',
  referenceSource = '',
  referenceLastSync = '',
  fetchingReference,
  onPurchaseChange,
  onLockPriceChange,
  onRegularChange,
  onSaleChange,
  onPurchaseBlur,
  onPlatformLockChange,
  onPlatformPriceChange,
  onWholesaleDiscountChange,
  onWholesaleRuleChange,
  onReferenceUrlChange,
  onReferenceFetch,
}: ProductPricingPanelProps) {
  const { t, i18n } = useTranslation()
  const currency = wfcpPrices?.settings_currency
  const [marketsOpen, setMarketsOpen] = useState(true)
  const [searchOpen, setSearchOpen] = useState(false)

  if (productType === 'variable') {
    return (
      <Card className="gap-2 py-3 shadow-sm">
        <CardHeader className="px-3 pb-0">
          <CardTitle className="text-sm font-semibold">{t('products.editor.pricingPanel')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-3">
          <p className="text-muted-foreground text-xs">{t('products.editor.variablePricingHint')}</p>
          {onReferenceUrlChange ? (
            <ReferenceUrlFields
              referenceUrl={referenceUrl}
              referenceSource={referenceSource}
              referenceLastSync={referenceLastSync}
              fetchingReference={fetchingReference}
              canFetch={Boolean(productId && onReferenceFetch)}
              onReferenceUrlChange={onReferenceUrlChange}
              onReferenceFetch={onReferenceFetch}
            />
          ) : null}
          {onWholesaleRuleChange && wholesaleRule ? (
            <WholesaleRuleFields
              rule={wholesaleRule}
              onChange={onWholesaleRuleChange}
              productWeight={productWeight}
            />
          ) : null}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="gap-2 py-3 shadow-sm">
      <CardHeader className="px-3 pb-0">
        <CardTitle className="text-sm font-semibold">{t('products.editor.pricingPanel')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="product-purchase">{t('products.editor.purchasePrice')}</Label>
            <FormattedNumberInput
              id="product-purchase"
              value={purchase}
              onChange={onPurchaseChange}
              onBlur={onPurchaseBlur}
              disabled={savingWfcp || lockPrice}
            />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex cursor-pointer items-center gap-2">
              <Switch checked={lockPrice} onCheckedChange={onLockPriceChange} />
              <span className="text-sm">{t('products.fieldLockPrice')}</span>
            </label>
          </div>
        </div>
        {lockPrice ? (
          <p className="text-muted-foreground text-xs">{t('products.editor.lockPriceHint', 'Locked products skip auto retail sync and storefront pricing box overrides.')}</p>
        ) : null}

        {onReferenceUrlChange ? (
          <ReferenceUrlFields
            referenceUrl={referenceUrl}
            referenceSource={referenceSource}
            referenceLastSync={referenceLastSync}
            fetchingReference={fetchingReference}
            canFetch={Boolean(productId && onReferenceFetch)}
            onReferenceUrlChange={onReferenceUrlChange}
            onReferenceFetch={onReferenceFetch}
          />
        ) : null}

        <dl className="grid gap-2 rounded-md border border-border bg-muted/20 p-2.5 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground text-xs">{t('products.editor.retailPrice')}</dt>
            <dd className="font-medium">{formatPrice(wfcpPrices?.retail, currency, i18n.language)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">{t('products.editor.wholesalePrice')}</dt>
            <dd className="font-medium">{formatPrice(wfcpPrices?.wholesale, currency, i18n.language)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">{t('products.editor.installmentPrice')}</dt>
            <dd className="font-medium">{formatPrice(wfcpPrices?.installment, currency, i18n.language)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">{t('products.editor.creditPrice')}</dt>
            <dd className="font-medium">{formatPrice(wfcpPrices?.credit, currency, i18n.language)}</dd>
          </div>
        </dl>

        {onWholesaleRuleChange && wholesaleRule ? (
          <WholesaleRuleFields
            rule={wholesaleRule}
            onChange={onWholesaleRuleChange}
            productWeight={productWeight}
          />
        ) : onWholesaleDiscountChange ? (
          <div className="space-y-1.5">
            <Label htmlFor="product-wholesale-rule">{t('products.editor.wholesaleRule')}</Label>
            <FormattedNumberInput
              id="product-wholesale-rule"
              value={wholesaleDiscount}
              onChange={onWholesaleDiscountChange}
            />
          </div>
        ) : null}

        <ChannelGroup
          open={marketsOpen}
          onOpenChange={setMarketsOpen}
          title={t('products.editor.marketplaceGroup')}
          slugs={[...WFCP_MARKETPLACE_CHANNELS]}
          wfcpPrices={wfcpPrices}
          platformLocks={platformLocks}
          platformPrices={platformPrices}
          currency={currency}
          locale={i18n.language}
          onPlatformLockChange={onPlatformLockChange}
          onPlatformPriceChange={onPlatformPriceChange}
        />
        <ChannelGroup
          open={searchOpen}
          onOpenChange={setSearchOpen}
          title={t('products.editor.searchEngineGroup')}
          slugs={[...WFCP_SEARCH_CHANNELS]}
          wfcpPrices={wfcpPrices}
          platformLocks={platformLocks}
          platformPrices={platformPrices}
          currency={currency}
          locale={i18n.language}
          onPlatformLockChange={onPlatformLockChange}
          onPlatformPriceChange={onPlatformPriceChange}
        />

        <div className="grid gap-3 border-t border-border pt-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="product-regular">{t('products.fieldRegular')}</Label>
            <FormattedNumberInput
              id="product-regular"
              value={regular}
              onChange={onRegularChange}
              disabled={lockPrice}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="product-sale">{t('products.fieldSale')}</Label>
            <FormattedNumberInput
              id="product-sale"
              value={sale}
              onChange={onSaleChange}
              placeholder={t('products.salePlaceholder')}
              disabled={lockPrice}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function WholesaleRuleFields({
  rule,
  onChange,
  productWeight,
}: {
  rule: WholesaleRuleForm
  onChange: (next: WholesaleRuleForm) => void
  productWeight?: string
}) {
  const { t } = useTranslation()
  const weightMissing = rule.custom && rule.sell_by === 'weight' && !(Number(productWeight) > 0)

  return (
    <div className="space-y-3 rounded-md border border-border p-2.5">
      <label className="flex cursor-pointer items-center gap-2">
        <Switch checked={rule.custom} onCheckedChange={(v) => onChange({ ...rule, custom: v })} />
        <span className="text-sm font-medium">{t('products.editor.wholesaleCustom')}</span>
      </label>
      {rule.custom ? (
        <>
          <label className="flex cursor-pointer items-center gap-2">
            <Switch
              checked={rule.wholesale_enabled}
              onCheckedChange={(v) => onChange({ ...rule, wholesale_enabled: v })}
            />
            <span className="text-sm">{t('products.editor.wholesaleProductEnabled')}</span>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t('products.editor.wholesaleRule')}</Label>
              <FormattedNumberInput
                value={rule.discount_percent}
                onChange={(v) => onChange({ ...rule, discount_percent: v })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('products.editor.wholesaleSellBy')}</Label>
              <Select
                value={rule.sell_by}
                onValueChange={(v) => onChange({ ...rule, sell_by: v === 'weight' ? 'weight' : 'unit' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unit">{t('products.editor.wholesaleSellByUnit')}</SelectItem>
                  <SelectItem value="weight">{t('products.editor.wholesaleSellByWeight')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t('products.editor.wholesaleMinQty')}</Label>
              <FormattedNumberInput value={rule.min_qty} onChange={(v) => onChange({ ...rule, min_qty: v })} />
            </div>
            <div className="space-y-1.5">
              <Label>{t('products.editor.wholesaleMinWeight')}</Label>
              <FormattedNumberInput
                value={rule.min_weight}
                onChange={(v) => onChange({ ...rule, min_weight: v })}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>{t('products.editor.wholesaleQtyStep')}</Label>
              <FormattedNumberInput value={rule.qty_step} onChange={(v) => onChange({ ...rule, qty_step: v })} />
            </div>
          </div>
          {weightMissing ? (
            <p className="text-destructive text-xs">{t('products.editor.wholesaleWeightRequired')}</p>
          ) : null}
        </>
      ) : (
        <p className="text-muted-foreground text-xs">{t('products.editor.wholesaleUsesGlobal')}</p>
      )}
    </div>
  )
}

function ReferenceUrlFields({
  referenceUrl,
  referenceSource,
  referenceLastSync,
  fetchingReference,
  canFetch,
  onReferenceUrlChange,
  onReferenceFetch,
}: {
  referenceUrl: string
  referenceSource?: string
  referenceLastSync?: string
  fetchingReference?: boolean
  canFetch: boolean
  onReferenceUrlChange: (v: string) => void
  onReferenceFetch?: () => void
}) {
  const { t } = useTranslation()
  return (
    <div className="space-y-1.5 rounded-md border border-border p-2.5">
      <Label htmlFor="product-reference-url">{t('products.editor.referenceUrl')}</Label>
      <div className="flex flex-wrap gap-2">
        <Input
          id="product-reference-url"
          dir="ltr"
          className="min-w-0 flex-1"
          value={referenceUrl}
          onChange={(e) => onReferenceUrlChange(e.target.value)}
          placeholder="https://"
        />
        {canFetch && onReferenceFetch ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={fetchingReference || !referenceUrl.trim()}
            onClick={onReferenceFetch}
          >
            {t('products.editor.referenceFetch')}
          </Button>
        ) : null}
      </div>
      {referenceSource || referenceLastSync ? (
        <p className="text-muted-foreground text-xs">
          {referenceSource ? `${referenceSource} · ` : ''}
          {referenceLastSync
            ? `${t('products.editor.referenceLastSync')}: ${referenceLastSync}`
            : null}
        </p>
      ) : null}
    </div>
  )
}

function ChannelGroup({
  open,
  onOpenChange,
  title,
  slugs,
  wfcpPrices,
  platformLocks,
  platformPrices,
  currency,
  locale,
  onPlatformLockChange,
  onPlatformPriceChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  slugs: string[]
  wfcpPrices?: WfcpPrices
  platformLocks: Record<string, boolean>
  platformPrices: Record<string, string>
  currency?: string
  locale: string
  onPlatformLockChange?: (slug: string, locked: boolean) => void
  onPlatformPriceChange?: (slug: string, price: string) => void
}) {
  const { t } = useTranslation()
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <CollapsibleTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="h-8 w-full justify-between gap-2">
          <span>{title}</span>
          <ChevronDown className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3">
        <div className="grid gap-2 sm:grid-cols-2">
          {slugs.map((slug) => {
            const calc = wfcpPrices?.marketplace?.[slug] ?? wfcpPrices?.platforms?.[slug]?.price
            const locked = platformLocks[slug] ?? Boolean(wfcpPrices?.platforms?.[slug]?.lock)
            const manual = platformPrices[slug] ?? String(wfcpPrices?.platforms?.[slug]?.manual_price ?? '')
            return (
              <div key={slug} className="space-y-2 rounded-md border border-border p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{t(`wfcp.tab.${slug}`)}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatPrice(calc, currency, locale)}
                  </span>
                </div>
                {onPlatformLockChange ? (
                  <label className="flex cursor-pointer items-center gap-2">
                    <Checkbox checked={locked} onCheckedChange={(v) => onPlatformLockChange(slug, v === true)} />
                    <span className="text-xs">
                      {t('products.editor.platformLock', { platform: t(`wfcp.tab.${slug}`) })}
                    </span>
                  </label>
                ) : null}
                {onPlatformPriceChange ? (
                  <FormattedNumberInput
                    value={manual}
                    disabled={!locked}
                    placeholder={t('products.editor.platformPrice', { platform: t(`wfcp.tab.${slug}`) })}
                    onChange={(v) => onPlatformPriceChange(slug, v)}
                  />
                ) : null}
              </div>
            )
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
