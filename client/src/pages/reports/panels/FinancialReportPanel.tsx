import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { MoneyDisplay } from '@/components/currency/MoneyDisplay'
import { PaymentBarChart } from '@/components/orders/reports/PaymentBarChart'
import { PaymentProfitBarChart } from '@/components/orders/reports/PaymentProfitBarChart'
import { PriceTierChart } from '@/components/orders/reports/PriceTierChart'
import { ProfitChart } from '@/components/orders/reports/ProfitChart'
import { ReportKpiGrid } from '@/components/orders/reports/ReportKpiGrid'
import { StatusPieChart } from '@/components/orders/reports/StatusPieChart'
import { UtmBarChart } from '@/components/orders/reports/UtmBarChart'
import { ReportDataTable, type ReportColumn } from '@/components/reports/ReportDataTable'
import { ReportPeriodToolbar } from '@/components/reports/ReportPeriodToolbar'
import { QueryErrorState } from '@/components/QueryErrorState'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReportsDashboardSkeleton } from '@/components/skeletons'
import { buildShopReportQuery, useOrderReportsFilters } from '@/hooks/useOrderReports'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { useStoreCurrency } from '@/hooks/useStoreCurrency'
import { apiFetch } from '@/lib/api'
import { formatNumber } from '@/lib/formatNumber'
import type {
  FinancialReportResponse,
  OrderReportOrderLite,
  OrderReportPaymentRow,
  OrderReportUtmComboRow,
  OrderReportUtmDimRow,
} from '@/types/orderReports'

const UTM_NONE = '(direct/none)'

function utmLabel(value: string | undefined, t: (k: string) => string) {
  if (!value || value === UTM_NONE) return t('reports.financial.directNone')
  return value
}

export function FinancialReportPanel() {
  const { t, i18n } = useTranslation()
  const store = useStoreCurrency()
  const filterState = useOrderReportsFilters()
  const { filters } = filterState

  const [tab, setTab] = useState('summary')
  const [utmSub, setUtmSub] = useState<'source' | 'medium' | 'campaign' | 'combo'>('source')
  const [selectedPayment, setSelectedPayment] = useState<string>('')
  const [selectedUtmSource, setSelectedUtmSource] = useState<string>('')
  const [selectedUtmMedium, setSelectedUtmMedium] = useState<string>('')
  const [selectedUtmCampaign, setSelectedUtmCampaign] = useState<string>('')
  const [orderSearch, setOrderSearch] = useState('')
  const [orderPage, setOrderPage] = useState(1)
  const [orderOrderby, setOrderOrderby] = useState('date')
  const [orderOrder, setOrderOrder] = useState<'asc' | 'desc'>('desc')

  const drillPayment = tab === 'gateways' || tab === 'orders' ? selectedPayment : ''
  const drillUtmSource = tab === 'utm' || tab === 'orders' ? selectedUtmSource : ''
  const drillUtmMedium = tab === 'utm' || tab === 'orders' ? selectedUtmMedium : ''
  const drillUtmCampaign = tab === 'utm' || tab === 'orders' ? selectedUtmCampaign : ''

  const q = useQuery({
    queryKey: [
      'shop-reports',
      'financial',
      filters,
      drillPayment,
      drillUtmSource,
      drillUtmMedium,
      drillUtmCampaign,
      orderSearch,
      orderPage,
    ],
    queryFn: () =>
      apiFetch<FinancialReportResponse>(
        buildShopReportQuery('shop/reports/financial', filters, {
          payment_method: drillPayment || undefined,
          utm_source: drillUtmSource || undefined,
          utm_medium: drillUtmMedium || undefined,
          utm_campaign: drillUtmCampaign || undefined,
          search: orderSearch || undefined,
          page: orderPage,
          per_page: 25,
        }),
      ),
    retry: false,
  })
  useQueryErrorToast(q)
  const data = q.data
  const currency = data?.currency || store.currency

  const paymentColumns: ReportColumn<OrderReportPaymentRow>[] = useMemo(
    () => [
      {
        id: 'title',
        header: t('reports.table.gateway'),
        sortable: true,
        cell: (r) => r.title || r.method,
        sortValue: (r) => r.title || r.method,
      },
      {
        id: 'count',
        header: t('reports.orders'),
        align: 'end',
        sortable: true,
        cell: (r) => formatNumber(r.count, i18n.language),
      },
      {
        id: 'revenue',
        header: t('reports.revenue'),
        align: 'end',
        sortable: true,
        cell: (r) => (
          <MoneyDisplay amount={r.revenue} currency={currency} currencySymbol={store.currencySymbol} locale={i18n.language} />
        ),
      },
      {
        id: 'cogs',
        header: t('reports.table.cogs'),
        align: 'end',
        sortable: true,
        cell: (r) => (
          <MoneyDisplay
            amount={r.cogs ?? 0}
            currency={currency}
            currencySymbol={store.currencySymbol}
            locale={i18n.language}
          />
        ),
      },
      {
        id: 'profit',
        header: t('reports.table.profit'),
        align: 'end',
        sortable: true,
        cell: (r) => (
          <MoneyDisplay
            amount={r.profit ?? 0}
            currency={currency}
            currencySymbol={store.currencySymbol}
            locale={i18n.language}
          />
        ),
      },
      {
        id: 'margin_pct',
        header: t('reports.table.margin'),
        align: 'end',
        sortable: true,
        cell: (r) => `${(r.margin_pct ?? 0).toFixed(1)}%`,
      },
      {
        id: 'avg_order_value',
        header: t('reports.table.aov'),
        align: 'end',
        sortable: true,
        cell: (r) => (
          <MoneyDisplay
            amount={r.avg_order_value ?? 0}
            currency={currency}
            currencySymbol={store.currencySymbol}
            locale={i18n.language}
          />
        ),
      },
    ],
    [currency, i18n.language, store.currencySymbol, t],
  )

  const utmDimColumns: ReportColumn<OrderReportUtmDimRow>[] = useMemo(
    () => [
      {
        id: 'label',
        header:
          utmSub === 'medium'
            ? t('reports.table.utmMedium')
            : utmSub === 'campaign'
              ? t('reports.table.utmCampaign')
              : t('reports.table.utmSource'),
        sortable: true,
        cell: (r) =>
          utmLabel(
            utmSub === 'medium' ? r.medium : utmSub === 'campaign' ? r.campaign : r.source,
            t,
          ),
        sortValue: (r) =>
          utmSub === 'medium' ? r.medium || '' : utmSub === 'campaign' ? r.campaign || '' : r.source || '',
      },
      {
        id: 'count',
        header: t('reports.orders'),
        align: 'end',
        sortable: true,
        cell: (r) => formatNumber(r.count, i18n.language),
      },
      {
        id: 'revenue',
        header: t('reports.revenue'),
        align: 'end',
        sortable: true,
        cell: (r) => (
          <MoneyDisplay amount={r.revenue} currency={currency} currencySymbol={store.currencySymbol} locale={i18n.language} />
        ),
      },
      {
        id: 'profit',
        header: t('reports.table.profit'),
        align: 'end',
        sortable: true,
        cell: (r) => (
          <MoneyDisplay amount={r.profit} currency={currency} currencySymbol={store.currencySymbol} locale={i18n.language} />
        ),
      },
      {
        id: 'margin_pct',
        header: t('reports.table.margin'),
        align: 'end',
        sortable: true,
        cell: (r) => `${r.margin_pct.toFixed(1)}%`,
      },
      {
        id: 'avg_order_value',
        header: t('reports.table.aov'),
        align: 'end',
        sortable: true,
        cell: (r) => (
          <MoneyDisplay
            amount={r.avg_order_value}
            currency={currency}
            currencySymbol={store.currencySymbol}
            locale={i18n.language}
          />
        ),
      },
    ],
    [currency, i18n.language, store.currencySymbol, t, utmSub],
  )

  const utmComboColumns: ReportColumn<OrderReportUtmComboRow>[] = useMemo(
    () => [
      {
        id: 'source',
        header: t('reports.table.utmSource'),
        sortable: true,
        cell: (r) => utmLabel(r.source, t),
      },
      {
        id: 'medium',
        header: t('reports.table.utmMedium'),
        sortable: true,
        cell: (r) => utmLabel(r.medium, t),
      },
      {
        id: 'campaign',
        header: t('reports.table.utmCampaign'),
        sortable: true,
        cell: (r) => utmLabel(r.campaign, t),
      },
      {
        id: 'count',
        header: t('reports.orders'),
        align: 'end',
        sortable: true,
        cell: (r) => formatNumber(r.count, i18n.language),
      },
      {
        id: 'revenue',
        header: t('reports.revenue'),
        align: 'end',
        sortable: true,
        cell: (r) => (
          <MoneyDisplay amount={r.revenue} currency={currency} currencySymbol={store.currencySymbol} locale={i18n.language} />
        ),
      },
      {
        id: 'profit',
        header: t('reports.table.profit'),
        align: 'end',
        sortable: true,
        cell: (r) => (
          <MoneyDisplay amount={r.profit} currency={currency} currencySymbol={store.currencySymbol} locale={i18n.language} />
        ),
      },
      {
        id: 'margin_pct',
        header: t('reports.table.margin'),
        align: 'end',
        sortable: true,
        cell: (r) => `${r.margin_pct.toFixed(1)}%`,
      },
    ],
    [currency, i18n.language, store.currencySymbol, t],
  )

  const orderColumns: ReportColumn<OrderReportOrderLite>[] = useMemo(
    () => [
      {
        id: 'number',
        header: t('reports.table.orderNumber'),
        sortable: true,
        cell: (r) => (
          <Link className="text-primary font-medium underline-offset-2 hover:underline" to={`/orders/list/${r.id}`}>
            #{r.number || r.id}
          </Link>
        ),
      },
      {
        id: 'date',
        header: t('reports.table.date'),
        sortable: true,
        cell: (r) => (r.date ? new Date(r.date).toLocaleString(i18n.language) : '—'),
        sortValue: (r) => r.date || '',
      },
      {
        id: 'customer_name',
        header: t('reports.table.customer'),
        sortable: true,
        cell: (r) => r.customer_name || '—',
      },
      {
        id: 'status',
        header: t('reports.table.status'),
        cell: (r) => r.status_label || r.status,
      },
      {
        id: 'payment_title',
        header: t('reports.table.payment'),
        cell: (r) => r.payment_title || r.payment_method,
      },
      {
        id: 'utm_source',
        header: t('reports.table.utmSource'),
        cell: (r) => utmLabel(r.utm_source, t),
      },
      {
        id: 'total',
        header: t('reports.revenue'),
        align: 'end',
        sortable: true,
        cell: (r) => (
          <MoneyDisplay amount={r.total} currency={currency} currencySymbol={store.currencySymbol} locale={i18n.language} />
        ),
      },
    ],
    [currency, i18n.language, store.currencySymbol, t],
  )

  const [paySearch, setPaySearch] = useState('')
  const [payPage, setPayPage] = useState(1)
  const [payOrderby, setPayOrderby] = useState('revenue')
  const [payOrder, setPayOrder] = useState<'asc' | 'desc'>('desc')

  const [utmSearch, setUtmSearch] = useState('')
  const [utmPage, setUtmPage] = useState(1)
  const [utmOrderby, setUtmOrderby] = useState('revenue')
  const [utmOrder, setUtmOrder] = useState<'asc' | 'desc'>('desc')

  const paymentRows = useMemo(() => {
    let rows = [...(data?.by_payment ?? [])]
    if (paySearch.trim()) {
      const q = paySearch.trim().toLowerCase()
      rows = rows.filter((r) => `${r.title} ${r.method}`.toLowerCase().includes(q))
    }
    rows.sort((a, b) => {
      const av = (a as Record<string, unknown>)[payOrderby]
      const bv = (b as Record<string, unknown>)[payOrderby]
      const an = typeof av === 'number' ? av : String(av ?? '')
      const bn = typeof bv === 'number' ? bv : String(bv ?? '')
      if (typeof an === 'number' && typeof bn === 'number') return payOrder === 'asc' ? an - bn : bn - an
      return payOrder === 'asc' ? String(an).localeCompare(String(bn)) : String(bn).localeCompare(String(an))
    })
    return rows
  }, [data?.by_payment, payOrder, payOrderby, paySearch])

  const payPaged = paymentRows.slice((payPage - 1) * 25, payPage * 25)

  const utmDimRows = useMemo(() => {
    const raw =
      utmSub === 'medium'
        ? data?.by_utm_medium ?? []
        : utmSub === 'campaign'
          ? data?.by_utm_campaign ?? []
          : data?.by_utm_source ?? []
    let rows = [...raw]
    if (utmSearch.trim()) {
      const q = utmSearch.trim().toLowerCase()
      rows = rows.filter((r) =>
        `${r.source ?? ''} ${r.medium ?? ''} ${r.campaign ?? ''}`.toLowerCase().includes(q),
      )
    }
    rows.sort((a, b) => {
      const av = (a as Record<string, unknown>)[utmOrderby]
      const bv = (b as Record<string, unknown>)[utmOrderby]
      const an = typeof av === 'number' ? av : String(av ?? '')
      const bn = typeof bv === 'number' ? bv : String(bv ?? '')
      if (typeof an === 'number' && typeof bn === 'number') return utmOrder === 'asc' ? an - bn : bn - an
      return utmOrder === 'asc' ? String(an).localeCompare(String(bn)) : String(bn).localeCompare(String(an))
    })
    return rows
  }, [data?.by_utm_campaign, data?.by_utm_medium, data?.by_utm_source, utmOrder, utmOrderby, utmSearch, utmSub])

  const utmDimPaged = utmDimRows.slice((utmPage - 1) * 25, utmPage * 25)

  const utmComboRows = useMemo(() => {
    let rows = [...(data?.by_utm ?? [])]
    if (utmSearch.trim()) {
      const q = utmSearch.trim().toLowerCase()
      rows = rows.filter((r) => `${r.source} ${r.medium} ${r.campaign}`.toLowerCase().includes(q))
    }
    rows.sort((a, b) => {
      const av = (a as Record<string, unknown>)[utmOrderby]
      const bv = (b as Record<string, unknown>)[utmOrderby]
      const an = typeof av === 'number' ? av : String(av ?? '')
      const bn = typeof bv === 'number' ? bv : String(bv ?? '')
      if (typeof an === 'number' && typeof bn === 'number') return utmOrder === 'asc' ? an - bn : bn - an
      return utmOrder === 'asc' ? String(an).localeCompare(String(bn)) : String(bn).localeCompare(String(an))
    })
    return rows
  }, [data?.by_utm, utmOrder, utmOrderby, utmSearch])

  const utmComboPaged = utmComboRows.slice((utmPage - 1) * 25, utmPage * 25)

  const gatewaySample = selectedPayment ? data?.orders_by_payment?.[selectedPayment] ?? [] : []
  const utmSample = selectedUtmSource ? data?.orders_by_utm_source?.[selectedUtmSource] ?? [] : []

  const filteredOrders = data?.orders_filtered

  function clearOrderFilters() {
    setSelectedPayment('')
    setSelectedUtmSource('')
    setSelectedUtmMedium('')
    setSelectedUtmCampaign('')
    setOrderSearch('')
    setOrderPage(1)
  }

  return (
    <div className="space-y-6">
      <ReportPeriodToolbar filterState={filterState} exportSection="financial" />
      {q.isLoading ? (
        <ReportsDashboardSkeleton showPageHeader={false} />
      ) : q.isError ? (
        <QueryErrorState message={q.error?.message} onRetry={() => void q.refetch()} />
      ) : data?.summary ? (
        <Tabs
          value={tab}
          onValueChange={(v) => {
            setTab(v)
            setOrderPage(1)
          }}
          className="gap-4"
        >
          <TabsList variant="line" className="w-full max-w-full justify-start overflow-x-auto">
            <TabsTrigger value="summary">{t('reports.financial.tabs.summary')}</TabsTrigger>
            <TabsTrigger value="gateways">{t('reports.financial.tabs.gateways')}</TabsTrigger>
            <TabsTrigger value="utm">{t('reports.financial.tabs.utm')}</TabsTrigger>
            <TabsTrigger value="orders">{t('reports.financial.tabs.orders')}</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4 outline-none">
            <ReportKpiGrid
              summary={data.summary}
              compareSummary={data.compare?.summary}
              currency={currency}
              currencySymbol={store.currencySymbol}
              locale={i18n.language}
            />
            <div className="grid min-h-0 gap-4 xl:grid-cols-2">
              <ProfitChart series={data.series ?? []} compareSeries={data.compare?.series} locale={i18n.language} />
              <PriceTierChart rows={data.by_price_tier ?? []} locale={i18n.language} />
            </div>
            <div className="grid min-h-0 gap-4 lg:grid-cols-2">
              <PaymentBarChart rows={data.by_payment ?? []} locale={i18n.language} />
              <UtmBarChart
                rows={(data.by_utm_source ?? []).map((r) => ({
                  label: utmLabel(r.source, t),
                  revenue: r.revenue,
                  count: r.count,
                  profit: r.profit,
                }))}
                locale={i18n.language}
              />
              <StatusPieChart rows={data.by_status ?? []} />
              <PaymentProfitBarChart rows={data.by_payment ?? []} locale={i18n.language} />
            </div>
          </TabsContent>

          <TabsContent value="gateways" className="space-y-4 outline-none">
            <PaymentProfitBarChart rows={data.by_payment ?? []} locale={i18n.language} />
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">{t('reports.chart.byPayment')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <ReportDataTable
                  rows={payPaged}
                  columns={paymentColumns}
                  total={paymentRows.length}
                  page={payPage}
                  perPage={25}
                  search={paySearch}
                  orderby={payOrderby}
                  order={payOrder}
                  locale={i18n.language}
                  onSearchChange={(v) => {
                    setPaySearch(v)
                    setPayPage(1)
                  }}
                  onPageChange={setPayPage}
                  onSortChange={(next) => {
                    if (payOrderby === next) setPayOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
                    else {
                      setPayOrderby(next)
                      setPayOrder('desc')
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  {(data.by_payment ?? []).map((r) => (
                    <Button
                      key={r.method}
                      type="button"
                      size="sm"
                      variant={selectedPayment === r.method ? 'default' : 'outline'}
                      onClick={() => {
                        setSelectedPayment((prev) => (prev === r.method ? '' : r.method))
                        setOrderPage(1)
                      }}
                    >
                      {r.title || r.method} ({formatNumber(r.count, i18n.language)})
                    </Button>
                  ))}
                </div>
                {selectedPayment ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      {t('reports.financial.ordersFor', {
                        label: data.by_payment?.find((p) => p.method === selectedPayment)?.title || selectedPayment,
                      })}
                    </p>
                    <OrdersMiniTable
                      rows={filteredOrders?.items?.length && drillPayment === selectedPayment ? filteredOrders.items : gatewaySample}
                      columns={orderColumns}
                      locale={i18n.language}
                    />
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">{t('reports.financial.selectGateway')}</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="utm" className="space-y-4 outline-none">
            <div className="flex flex-wrap gap-2">
              {(['source', 'medium', 'campaign', 'combo'] as const).map((key) => (
                <Button
                  key={key}
                  type="button"
                  size="sm"
                  variant={utmSub === key ? 'default' : 'outline'}
                  onClick={() => {
                    setUtmSub(key)
                    setUtmPage(1)
                    setSelectedUtmSource('')
                    setSelectedUtmMedium('')
                    setSelectedUtmCampaign('')
                  }}
                >
                  {t(`reports.financial.utmSub.${key}`)}
                </Button>
              ))}
            </div>
            <UtmBarChart
              rows={(
                utmSub === 'medium'
                  ? data.by_utm_medium ?? []
                  : utmSub === 'campaign'
                    ? data.by_utm_campaign ?? []
                    : data.by_utm_source ?? []
              ).map((r) => ({
                label: utmLabel(
                  utmSub === 'medium' ? r.medium : utmSub === 'campaign' ? r.campaign : r.source,
                  t,
                ),
                revenue: r.revenue,
                count: r.count,
                profit: r.profit,
              }))}
              locale={i18n.language}
            />
            <Card className="shadow-sm">
              <CardContent className="space-y-3 pt-6">
                {utmSub === 'combo' ? (
                  <ReportDataTable
                    rows={utmComboPaged}
                    columns={utmComboColumns}
                    total={utmComboRows.length}
                    page={utmPage}
                    perPage={25}
                    search={utmSearch}
                    orderby={utmOrderby}
                    order={utmOrder}
                    locale={i18n.language}
                    onSearchChange={(v) => {
                      setUtmSearch(v)
                      setUtmPage(1)
                    }}
                    onPageChange={setUtmPage}
                    onSortChange={(next) => {
                      if (utmOrderby === next) setUtmOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
                      else {
                        setUtmOrderby(next)
                        setUtmOrder('desc')
                      }
                    }}
                  />
                ) : (
                  <>
                    <ReportDataTable
                      rows={utmDimPaged}
                      columns={utmDimColumns}
                      total={utmDimRows.length}
                      page={utmPage}
                      perPage={25}
                      search={utmSearch}
                      orderby={utmOrderby}
                      order={utmOrder}
                      locale={i18n.language}
                      onSearchChange={(v) => {
                        setUtmSearch(v)
                        setUtmPage(1)
                      }}
                      onPageChange={setUtmPage}
                      onSortChange={(next) => {
                        if (utmOrderby === next) setUtmOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
                        else {
                          setUtmOrderby(next)
                          setUtmOrder('desc')
                        }
                      }}
                    />
                    <div className="flex flex-wrap gap-2">
                      {utmDimRows.slice(0, 16).map((r) => {
                        const value =
                          utmSub === 'medium' ? r.medium || '' : utmSub === 'campaign' ? r.campaign || '' : r.source || ''
                        const active =
                          utmSub === 'medium'
                            ? selectedUtmMedium === value
                            : utmSub === 'campaign'
                              ? selectedUtmCampaign === value
                              : selectedUtmSource === value
                        return (
                          <Button
                            key={`${utmSub}-${value}`}
                            type="button"
                            size="sm"
                            variant={active ? 'default' : 'outline'}
                            onClick={() => {
                              if (utmSub === 'medium') setSelectedUtmMedium((p) => (p === value ? '' : value))
                              else if (utmSub === 'campaign') setSelectedUtmCampaign((p) => (p === value ? '' : value))
                              else setSelectedUtmSource((p) => (p === value ? '' : value))
                              setOrderPage(1)
                            }}
                          >
                            {utmLabel(value, t)} ({formatNumber(r.count, i18n.language)})
                          </Button>
                        )
                      })}
                    </div>
                    {utmSub === 'source' && selectedUtmSource ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">
                          {t('reports.financial.ordersFor', { label: utmLabel(selectedUtmSource, t) })}
                        </p>
                        <OrdersMiniTable
                          rows={
                            filteredOrders?.items?.length && drillUtmSource === selectedUtmSource
                              ? filteredOrders.items
                              : utmSample
                          }
                          columns={orderColumns}
                          locale={i18n.language}
                        />
                      </div>
                    ) : utmSub !== 'source' && (selectedUtmMedium || selectedUtmCampaign || selectedUtmSource) ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">
                          {t('reports.financial.ordersFor', {
                            label: utmLabel(selectedUtmMedium || selectedUtmCampaign || selectedUtmSource, t),
                          })}
                        </p>
                        <OrdersMiniTable
                          rows={filteredOrders?.items ?? []}
                          columns={orderColumns}
                          locale={i18n.language}
                        />
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">{t('reports.financial.selectUtm')}</p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4 outline-none">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">{t('reports.financial.filterPayment')}</p>
                <Select
                  value={selectedPayment || '__all__'}
                  onValueChange={(v) => {
                    setSelectedPayment(v === '__all__' ? '' : v)
                    setOrderPage(1)
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder={t('reports.financial.allPayments')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">{t('reports.financial.allPayments')}</SelectItem>
                    {(data.by_payment ?? []).map((r) => (
                      <SelectItem key={r.method} value={r.method}>
                        {r.title || r.method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">{t('reports.financial.filterUtmSource')}</p>
                <Select
                  value={selectedUtmSource || '__all__'}
                  onValueChange={(v) => {
                    setSelectedUtmSource(v === '__all__' ? '' : v)
                    setOrderPage(1)
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t('reports.financial.allUtm')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">{t('reports.financial.allUtm')}</SelectItem>
                    {(data.by_utm_source ?? []).map((r) => (
                      <SelectItem key={r.source || 'none'} value={r.source || UTM_NONE}>
                        {utmLabel(r.source, t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">{t('reports.financial.filterUtmMedium')}</p>
                <Select
                  value={selectedUtmMedium || '__all__'}
                  onValueChange={(v) => {
                    setSelectedUtmMedium(v === '__all__' ? '' : v)
                    setOrderPage(1)
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t('reports.financial.allUtm')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">{t('reports.financial.allUtm')}</SelectItem>
                    {(data.by_utm_medium ?? []).map((r) => (
                      <SelectItem key={r.medium || 'none'} value={r.medium || UTM_NONE}>
                        {utmLabel(r.medium, t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">{t('reports.financial.filterUtmCampaign')}</p>
                <Select
                  value={selectedUtmCampaign || '__all__'}
                  onValueChange={(v) => {
                    setSelectedUtmCampaign(v === '__all__' ? '' : v)
                    setOrderPage(1)
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t('reports.financial.allUtm')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">{t('reports.financial.allUtm')}</SelectItem>
                    {(data.by_utm_campaign ?? []).map((r) => (
                      <SelectItem key={r.campaign || 'none'} value={r.campaign || UTM_NONE}>
                        {utmLabel(r.campaign, t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={clearOrderFilters}>
                {t('reports.financial.clearFilters')}
              </Button>
            </div>
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <ReportDataTable
                  rows={filteredOrders?.items ?? []}
                  columns={orderColumns}
                  total={filteredOrders?.total ?? 0}
                  page={filteredOrders?.page ?? orderPage}
                  perPage={filteredOrders?.per_page ?? 25}
                  search={orderSearch}
                  orderby={orderOrderby}
                  order={orderOrder}
                  locale={i18n.language}
                  onSearchChange={(v) => {
                    setOrderSearch(v)
                    setOrderPage(1)
                  }}
                  onPageChange={setOrderPage}
                  onSortChange={(next) => {
                    if (orderOrderby === next) setOrderOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
                    else {
                      setOrderOrderby(next)
                      setOrderOrder('desc')
                    }
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : null}
    </div>
  )
}

function OrdersMiniTable({
  rows,
  columns,
  locale,
}: {
  rows: OrderReportOrderLite[]
  columns: ReportColumn<OrderReportOrderLite>[]
  locale: string
}) {
  if (!rows.length) {
    return null
  }
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-start">
            {columns.map((c) => (
              <th key={c.id} className={`px-3 py-2 font-medium ${c.align === 'end' ? 'text-end' : 'text-start'}`}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b last:border-0">
              {columns.map((c) => (
                <td key={c.id} className={`px-3 py-2 ${c.align === 'end' ? 'text-end' : 'text-start'}`} dir={locale === 'fa' ? 'rtl' : undefined}>
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
