import { useTranslation } from 'react-i18next'

import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export type OrdersFilterOptions = {
  payments: { id: string; title: string }[]
  states: { code: string; label: string }[]
  shipping: { id: string; title: string }[]
  marketplaces: { id: string; title: string }[]
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
          <Label className="text-muted-foreground text-xs">{t('orders.dateFrom')}</Label>
          <DatePicker value={filters.after} onChange={(v) => onChange({ after: v })} className="w-full" />
        </div>
        <div className="space-y-1">
          <Label className="text-muted-foreground text-xs">{t('orders.dateTo')}</Label>
          <DatePicker value={filters.before} onChange={(v) => onChange({ before: v })} className="w-full" />
        </div>
        <div className="space-y-1">
          <Label className="text-muted-foreground text-xs">{t('orders.filterPayment')}</Label>
          <Select
            value={selectVal(filters.payment_method)}
            onValueChange={(v) => onChange({ payment_method: fromSelect(v) })}
          >
            <SelectTrigger>
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
          <Label className="text-muted-foreground text-xs">{t('orders.filterState')}</Label>
          <Select value={selectVal(filters.state)} onValueChange={(v) => onChange({ state: fromSelect(v) })}>
            <SelectTrigger>
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
          <Label className="text-muted-foreground text-xs">{t('orders.filterShipping')}</Label>
          <Select
            value={selectVal(filters.shipping_method)}
            onValueChange={(v) => onChange({ shipping_method: fromSelect(v) })}
          >
            <SelectTrigger>
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
          <Label className="text-muted-foreground text-xs">{t('orders.filterMarketplace')}</Label>
          <Select
            value={selectVal(filters.marketplace)}
            onValueChange={(v) => onChange({ marketplace: fromSelect(v) })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('orders.filterAll')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('orders.filterAll')}</SelectItem>
              {(options?.marketplaces ?? []).map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-muted-foreground text-xs">{t('orders.filterUtmSource')}</Label>
          <Input
            value={filters.utm_source}
            onChange={(e) => onChange({ utm_source: e.target.value })}
            placeholder={t('orders.filterUtmSource')}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-muted-foreground text-xs">{t('orders.filterUtmMedium')}</Label>
          <Input
            value={filters.utm_medium}
            onChange={(e) => onChange({ utm_medium: e.target.value })}
            placeholder={t('orders.filterUtmMedium')}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-muted-foreground text-xs">{t('orders.filterUtmCampaign')}</Label>
          <Input
            value={filters.utm_campaign}
            onChange={(e) => onChange({ utm_campaign: e.target.value })}
            placeholder={t('orders.filterUtmCampaign')}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-muted-foreground text-xs">{t('orders.filterCustomerRole')}</Label>
          <Select
            value={selectVal(filters.customer_role)}
            onValueChange={(v) => onChange({ customer_role: fromSelect(v) })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('orders.filterAll')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('orders.filterAll')}</SelectItem>
              <SelectItem value="webino_partner">{t('users.rolePartner')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-muted-foreground text-xs">{t('orders.filterCustomer')}</Label>
          <Input
            value={filters.customer}
            onChange={(e) => onChange({ customer: e.target.value })}
            placeholder={t('orders.filterCustomerHint')}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-muted-foreground text-xs">{t('orders.filterMinTotal')}</Label>
          <Input
            type="number"
            value={filters.min_total}
            onChange={(e) => onChange({ min_total: e.target.value })}
            inputMode="decimal"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-muted-foreground text-xs">{t('orders.filterMaxTotal')}</Label>
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
