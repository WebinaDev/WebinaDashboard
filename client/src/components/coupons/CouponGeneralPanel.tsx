import { useTranslation } from 'react-i18next'

import { ProductMultiSelect } from '@/components/coupons/ProductMultiSelect'
import { DatePicker } from '@/components/ui/date-picker'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { translateCouponType } from '@/lib/enumLabels'

const COUPON_TYPES = ['fixed_cart', 'percent', 'fixed_product', 'webino_gift'] as const

type CouponGeneralPanelProps = {
  type: string
  onTypeChange: (type: string) => void
  amount: string
  onAmountChange: (amount: string) => void
  freeShipping: boolean
  onFreeShippingChange: (value: boolean) => void
  expires: string
  onExpiresChange: (value: string) => void
  minAmount: string
  onMinAmountChange: (value: string) => void
  maxAmount: string
  onMaxAmountChange: (value: string) => void
  individualUse: boolean
  onIndividualUseChange: (value: boolean) => void
  excludeSale: boolean
  onExcludeSaleChange: (value: boolean) => void
  giftProductId?: number
  onGiftProductIdChange?: (id: number) => void
}

export function CouponGeneralPanel({
  type,
  onTypeChange,
  amount,
  onAmountChange,
  freeShipping,
  onFreeShippingChange,
  expires,
  onExpiresChange,
  minAmount,
  onMinAmountChange,
  maxAmount,
  onMaxAmountChange,
  individualUse,
  onIndividualUseChange,
  excludeSale,
  onExcludeSaleChange,
  giftProductId = 0,
  onGiftProductIdChange,
}: CouponGeneralPanelProps) {
  const { t } = useTranslation()
  const isGift = type === 'webino_gift'

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t('coupons.fieldDiscountType')}</Label>
        <Select value={type} onValueChange={onTypeChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COUPON_TYPES.map((ct) => (
              <SelectItem key={ct} value={ct}>
                {translateCouponType(t, ct)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {isGift ? (
        <div className="space-y-2 rounded-md border border-dashed p-3">
          <p className="text-muted-foreground text-xs">
            {t('coupons.giftHint', {
              defaultValue:
                'مشتری با رسیدن سبد به حداقل مبلغ، محصول هدیه را رایگان می‌گیرد. پیام سبد: «سبد خریدتون رو به مبلغ n برسونید فلان محصول رو هدیه بگیرید.»',
            })}
          </p>
          <ProductMultiSelect
            id="coupon-gift-product"
            label={t('coupons.giftProduct', { defaultValue: 'محصول هدیه' })}
            value={giftProductId > 0 ? [giftProductId] : []}
            onChange={(ids) => onGiftProductIdChange?.(ids.length ? ids[ids.length - 1] : 0)}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label>{t('coupons.colAmount')}</Label>
          <Input value={amount} onChange={(e) => onAmountChange(e.target.value)} inputMode="decimal" />
        </div>
      )}
      {!isGift ? (
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={freeShipping} onCheckedChange={(v) => onFreeShippingChange(v === true)} />
          {t('coupons.freeShipping')}
        </label>
      ) : null}
      <div className="space-y-2">
        <Label>{t('coupons.fieldExpires')}</Label>
        <DatePicker id="coupon-expires-edit" value={expires} onChange={onExpiresChange} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>
            {isGift
              ? t('coupons.giftMinAmount', { defaultValue: 'حداقل مبلغ سبد برای هدیه' })
              : t('coupons.fieldMinAmount')}
          </Label>
          <Input value={minAmount} onChange={(e) => onMinAmountChange(e.target.value)} inputMode="decimal" />
        </div>
        {!isGift ? (
          <div className="space-y-2">
            <Label>{t('coupons.fieldMaxAmount')}</Label>
            <Input value={maxAmount} onChange={(e) => onMaxAmountChange(e.target.value)} inputMode="decimal" />
          </div>
        ) : null}
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={individualUse} onCheckedChange={(v) => onIndividualUseChange(v === true)} />
        {t('coupons.individualUse')}
      </label>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={excludeSale} onCheckedChange={(v) => onExcludeSaleChange(v === true)} />
        {t('coupons.excludeSale')}
      </label>
    </div>
  )
}
