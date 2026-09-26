import { useTranslation } from 'react-i18next'

import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { utmDisplayLabel } from '@/lib/utmLabel'

export type OrdersFilterOptions = {
  payments: { id: string; title: string }[]
  states: { code: string; label: string }[]
  shipping: { id: string; title: string }[]
  marketplaces: { id: string; title: string }[]
  utm_sources?: string[]
  utm_mediums?: string[]
  utm_campaigns?: string[]
}

export type OrdersListFilters = {
  after: string
  before: string
  payment_method: string
  utm_source: string
  utm_medium: string
  utm_campaign: string
  marketplace: string
  state: string
  shipping_method: string
  min_total: string
  max_total: string
  customer: string
  customer_role: string
}

type OrdersFiltersBarProps = {
  filters: OrdersListFilters
  options?: OrdersFilterOptions
  onChange: (patch: Partial<OrdersListFilters>) => void
}

const ALL = '__all__'
const FILTER_LABEL = 'text-muted-foreground min-h-4 truncate text-xs'

export function OrdersFiltersBar({ filters, options, onChange }: OrdersFiltersBarProps) {
  const { t } = useTranslation()

  function selectVal(v: string) {
    return v || ALL
  }
  function fromSelect(v: string) {
    return v === ALL ? '' : v
  }

  return (
    <div className="bg-transparent space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <div className="space-y-1">
          <Label className={FILTER_LABEL}>{t('orders.dateFrom')}</Label>
          <DatePicker value={filters.after} onChange={(v) => onChange({ after: v })} className="w-full" />
        </div>
        <div className="space-y-1">
          <Label className={FILTER_LABEL}>{t('orders.dateTo')}</Label>
          <DatePicker value={filters.before} onChange={(v) => onChange({ before: v })} className="w-full" />
        </div>
        <div className="space-y-1">
          <Label className={FILTER_LABEL}>{t('orders.filterPayment')}</Label>
          <Select
            value={selectVal(filters.payment_method)}
            onValueChange={(v) => onChange({ payment_method: fromSelect(v) })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('orders.filterAll')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('orders.filterAll')}</SelectItem>
              {(options?.payments ?? []).map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className={FILTER_LABEL}>{t('orders.filterState')}</Label>
          <Select value={selectVal(filters.state)} onValueChange={(v) => onChange({ state: fromSelect(v) })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('orders.filterAll')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('orders.filterAll')}</SelectItem>
              {(options?.states ?? []).map((s) => (
                <SelectItem key={s.code} value={s.code}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className={FILTER_LABEL}>{t('orders.filterShipping')}</Label>
          <Select
            value={selectVal(filters.shipping_method)}
            onValueChange={(v) => onChange({ shipping_method: fromSelect(v) })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('orders.filterAll')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('orders.filterAll')}</SelectItem>
              {(options?.shipping ?? []).map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className={FILTER_LABEL}>{t('orders.filterMarketplace')}</Label>
          <Select
            value={selectVal(filters.marketplace)}
            onValueChange={(v) => onChange({ marketplace: fromSelect(v) })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('orders.filterAll')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('orders.filterAll')}</SelectItem>
              {(options?.marketplaces ?? []).map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {t(`marketplace.badge.${m.id}`, m.title)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className={FILTER_LABEL}>{t('orders.filterUtmSource')}</Label>
          <Select
            value={selectVal(filters.utm_source)}
            onValueChange={(v) => onChange({ utm_source: fromSelect(v) })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('orders.filterAll')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('orders.filterAll')}</SelectItem>
              {(options?.utm_sources ?? []).map((v) => (
                <SelectItem key={v} value={v}>
                  {utmDisplayLabel(v, t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className={FILTER_LABEL}>{t('orders.filterUtmMedium')}</Label>
          <Select
            value={selectVal(filters.utm_medium)}
            onValueChange={(v) => onChange({ utm_medium: fromSelect(v) })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('orders.filterAll')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('orders.filterAll')}</SelectItem>
              {(options?.utm_mediums ?? []).map((v) => (
                <SelectItem key={v} value={v}>
                  {utmDisplayLabel(v, t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className={FILTER_LABEL}>{t('orders.filterUtmCampaign')}</Label>
          <Select
            value={selectVal(filters.utm_campaign)}
            onValueChange={(v) => onChange({ utm_campaign: fromSelect(v) })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('orders.filterAll')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('orders.filterAll')}</SelectItem>
              {(options?.utm_campaigns ?? []).map((v) => (
                <SelectItem key={v} value={v}>
                  {utmDisplayLabel(v, t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className={FILTER_LABEL}>{t('orders.filterCustomerRole')}</Label>
          <Select
            value={selectVal(filters.customer_role)}
            onValueChange={(v) => onChange({ customer_role: fromSelect(v) })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('orders.filterAll')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('orders.filterAll')}</SelectItem>
              <SelectItem value="customer">{t('users.roleCustomer')}</SelectItem>
              <SelectItem value="webino_partner">{t('users.rolePartner')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className={FILTER_LABEL}>{t('orders.filterCustomer')}</Label>
          <Input
            value={filters.customer}
            onChange={(e) => onChange({ customer: e.target.value })}
            placeholder={t('orders.filterCustomerHint')}
          />
        </div>
        <div className="space-y-1">
          <Label className={FILTER_LABEL}>{t('orders.filterMinTotal')}</Label>
          <Input
            type="number"
            value={filters.min_total}
            onChange={(e) => onChange({ min_total: e.target.value })}
            inputMode="decimal"
          />
        </div>
        <div className="space-y-1">
          <Label className={FILTER_LABEL}>{t('orders.filterMaxTotal')}</Label>
          <Input
            type="number"
            value={filters.max_total}
            onChange={(e) => onChange({ max_total: e.target.value })}
            inputMode="decimal"
          />
        </div>
      </div>
    </div>
  )
}
