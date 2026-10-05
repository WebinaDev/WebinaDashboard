import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { FormSettingsSkeleton } from '@/components/skeletons'
import { StatusBadge } from '@/components/data/DumpUi'
import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Textarea } from '@/components/ui/textarea'
import { apiFetch } from '@/lib/api'
import type { PaymentGatewayRow } from '@/components/settings/wc-settings-types'
import {
  isWfcpCompareChannel,
  resolveWfcpPricingTab,
  WFCP_MARKETPLACE_CHANNELS,
  WFCP_SEARCH_CHANNELS,
  WFCP_SETTINGS_TABS,
  type WfcpChannelSlug,
  type WfcpSettingsTab,
} from '@/pages/settings/shop/wfcpPricingTabs'

type WfcpSettings = Record<string, Record<string, unknown>>

type InstallmentPlan = { months: number; interest: number }

type WfcpStats = {
  total_products: number
  products_with_price: number
  products_locked: number
  sampled: number
  enabled: boolean
  exchange_rate: number
  currency: string
}

type CatOption = { id: number; name: string }

function SettingSwitchRow({
  id,
  label,
  hint,
  checked,
  onCheckedChange,
  disabled,
}: {
  id: string
  label: string
  hint?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
}) {
  return (
    <div className="flex max-w-sm items-center justify-between gap-3">
      <div className="min-w-0">
        <Label htmlFor={id} className="cursor-pointer font-normal">
          {label}
        </Label>
        {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  )
}

export default function WfcpSettingsPage() {
  const { tab: tabParam } = useParams()
  const resolved = resolveWfcpPricingTab(tabParam)
  const tab: WfcpSettingsTab = resolved
  const { t } = useTranslation()
  const qc = useQueryClient()
  const loc = useLocation()
  const embedded = loc.pathname.includes('/settings/shop/pricing')
  const tabBase = '/settings/shop/pricing'
  const needsRedirect = Boolean(tabParam && tabParam !== resolved)

  const q = useQuery({
    queryKey: ['wfcp', 'settings'],
    queryFn: () => apiFetch<WfcpSettings>('wfcp/settings'),
    enabled: !needsRedirect,
  })

  const statsQ = useQuery({
    queryKey: ['wfcp', 'stats'],
    queryFn: () => apiFetch<WfcpStats>('wfcp/stats'),
    enabled: !needsRedirect && tab === 'dashboard',
  })

  const [draft, setDraft] = useState<WfcpSettings>({})

  useEffect(() => {
    if (q.data) setDraft(JSON.parse(JSON.stringify(q.data)) as WfcpSettings)
  }, [q.data])

  const save = useMutation({
    mutationFn: async ({ section, data }: { section: string; data: Record<string, unknown> }) => {
      await apiFetch(`wfcp/settings/${section}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      })
    },
    onSuccess: async (_, v) => {
      await qc.invalidateQueries({ queryKey: ['wfcp', 'settings'] })
      await qc.invalidateQueries({ queryKey: ['wfcp', 'stats'] })
      toast.success(t('common.saved'))
      if (v.section === 'general' || v.section === 'exchange') {
        void qc.invalidateQueries({ queryKey: ['bootstrap'] })
      }
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const general = draft.general ?? {}
  const retail = draft.retail ?? {}
  const credit = draft.credit ?? {}
  const installment = draft.installment ?? {}
  const wholesale = draft.wholesale ?? {}
  const notifications = draft.notifications ?? {}
  const style = draft.style ?? {}

  const plans: InstallmentPlan[] = Array.isArray(installment.plans)
    ? (installment.plans as InstallmentPlan[])
    : [
        { months: 3, interest: 5 },
        { months: 6, interest: 10 },
      ]

  const tabLinks = useMemo(
    () =>
      WFCP_SETTINGS_TABS.map((id) => (
        <Link
          key={id}
          to={`${tabBase}/${id}`}
          className={`rounded-md px-2 py-1 text-sm ${tab === id ? 'bg-muted font-medium' : 'hover:bg-muted/60'}`}
        >
          {t(`wfcp.tab.${id}`)}
        </Link>
      )),
    [t, tab, tabBase],
  )

  if (needsRedirect) {
    return <Navigate to={`${tabBase}/${resolved}`} replace />
  }

  const content = (
    <div className={embedded ? 'space-y-4' : 'flex flex-col gap-4 lg:flex-row'}>
      {!embedded ? (
        <nav className="flex flex-wrap gap-1 border-b border-border pb-2 lg:w-48 lg:flex-col lg:border-b-0 lg:border-e lg:pb-0 lg:pe-3">
          {tabLinks}
        </nav>
      ) : null}
      <div className="min-w-0 flex-1 space-y-4">
        {q.isLoading ? <FormSettingsSkeleton cards={2} fieldsPerCard={4} /> : null}
        {q.isError && <p className="text-sm text-destructive">{(q.error as Error).message}</p>}

        {tab === 'dashboard' && (
          <DashboardTab
            general={general}
            creditEnabled={Boolean(credit.enabled)}
            installmentEnabled={Boolean(installment.enabled)}
            stats={statsQ.data}
            statsLoading={statsQ.isLoading}
            setGeneral={(g) => setDraft((d) => ({ ...d, general: { ...general, ...g } }))}
            onSave={() =>
              void save.mutateAsync({
                section: 'general',
                data: { ...(draft.general ?? {}) } as Record<string, unknown>,
              })
            }
            saving={save.isPending}
          />
        )}

        {tab === 'exchange' && (
          <ExchangeTab
            general={general}
            setGeneral={(g) => setDraft((d) => ({ ...d, general: { ...d.general, ...g } }))}
            onSave={(data) => void save.mutateAsync({ section: 'exchange', data })}
            saving={save.isPending}
          />
        )}

        {tab === 'retail' && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('wfcp.tab.retail')}</CardTitle>
              <CardDescription>{t('wfcp.formula.retail')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('wfcp.profitPercent')}</Label>
              <Input
                type="number"
                className="max-w-xs"
                value={Number(retail.profit_percent ?? 20)}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, retail: { ...retail, profit_percent: parseFloat(e.target.value) } }))
                }
              />
            </div>
            <SettingSwitchRow
              id="wfcp-retail-round"
              label={t('wfcp.roundEnabled')}
              checked={Boolean(retail.round_enabled ?? true)}
              onCheckedChange={(v) => setDraft((d) => ({ ...d, retail: { ...retail, round_enabled: v } }))}
            />
            <div className="space-y-2">
              <Label>{t('wfcp.roundTo')}</Label>
              <Input
                type="number"
                className="max-w-xs"
                value={Number(retail.round_to ?? 1000)}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, retail: { ...retail, round_to: parseInt(e.target.value, 10) } }))
                }
              />
            </div>
            <WfcpGatewayPicker
              selected={Array.isArray(retail.gateways) ? (retail.gateways as string[]) : []}
              onChange={(gateways) => setDraft((d) => ({ ...d, retail: { ...retail, gateways } }))}
            />
            <Button type="button" onClick={() => void save.mutateAsync({ section: 'retail', data: retail })} disabled={save.isPending}>
              {t('common.save')}
            </Button>
            </CardContent>
          </Card>
        )}

        {tab === 'credit' && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('wfcp.tab.credit')}</CardTitle>
              <CardDescription>{t('wfcp.formula.credit')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            <SettingSwitchRow
              id="wfcp-credit-en"
              label={t('wfcp.creditEnabled')}
              checked={Boolean(credit.enabled)}
              onCheckedChange={(v) => setDraft((d) => ({ ...d, credit: { ...credit, enabled: v } }))}
            />
            <div className="space-y-2">
              <Label>{t('wfcp.increasePercent')}</Label>
              <Input
                type="number"
                className="max-w-xs"
                value={Number(credit.increase_percent ?? 5)}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, credit: { ...credit, increase_percent: parseFloat(e.target.value) } }))
                }
              />
            </div>
            <WfcpGatewayPicker
              selected={Array.isArray(credit.gateways) ? (credit.gateways as string[]) : []}
              onChange={(gateways) => setDraft((d) => ({ ...d, credit: { ...credit, gateways } }))}
            />
            <Button type="button" onClick={() => void save.mutateAsync({ section: 'credit', data: credit })} disabled={save.isPending}>
              {t('common.save')}
            </Button>
            </CardContent>
          </Card>
        )}

        {tab === 'installment' && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('wfcp.tab.installment')}</CardTitle>
              <CardDescription>{t('wfcp.formula.installment')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            <SettingSwitchRow
              id="wfcp-inst-en"
              label={t('wfcp.installmentEnabled')}
              checked={Boolean(installment.enabled)}
              onCheckedChange={(v) => setDraft((d) => ({ ...d, installment: { ...installment, enabled: v } }))}
            />
            <SettingSwitchRow
              id="wfcp-inst-round"
              label={t('wfcp.roundEnabled')}
              checked={Boolean(installment.round_enabled ?? true)}
              onCheckedChange={(v) =>
                setDraft((d) => ({ ...d, installment: { ...installment, round_enabled: v } }))
              }
            />
            <div className="space-y-2">
              <Label>{t('wfcp.roundTo')}</Label>
              <Input
                type="number"
                className="max-w-xs"
                value={Number(installment.round_to ?? 1000)}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    installment: { ...installment, round_to: parseInt(e.target.value, 10) },
                  }))
                }
              />
            </div>
            <div className="space-y-2 max-w-xs">
              <Label>{t('wfcp.pdpTheme')}</Label>
              <Select
                value={String(installment.pdp_theme ?? 'classic') === 'timeline' ? 'timeline' : 'classic'}
                onValueChange={(v) =>
                  setDraft((d) => ({
                    ...d,
                    installment: { ...installment, pdp_theme: v },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classic">{t('wfcp.pdpThemeClassic')}</SelectItem>
                  <SelectItem value="timeline">{t('wfcp.pdpThemeTimeline')}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs">{t('wfcp.pdpThemeHint')}</p>
            </div>
            <SettingSwitchRow
              id="wfcp-inst-logos"
              label={t('wfcp.gatewayLogosOnly')}
              hint={t('wfcp.gatewayLogosOnlyHint')}
              checked={installment.gateway_logos_only !== false}
              onCheckedChange={(v) =>
                setDraft((d) => ({ ...d, installment: { ...installment, gateway_logos_only: v } }))
              }
            />
            <div className="space-y-2">
              <Label>{t('wfcp.installmentPlans')}</Label>
              {plans.map((plan, index) => (
                <div key={index} className="flex flex-wrap items-end gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">{t('wfcp.planMonths')}</Label>
                    <Input
                      type="number"
                      className="w-28"
                      value={Number(plan.months ?? 0)}
                      onChange={(e) => {
                        const next = [...plans]
                        next[index] = { ...next[index], months: parseInt(e.target.value, 10) || 0 }
                        setDraft((d) => ({ ...d, installment: { ...installment, plans: next } }))
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t('wfcp.planInterest')}</Label>
                    <Input
                      type="number"
                      className="w-28"
                      value={Number(plan.interest ?? 0)}
                      onChange={(e) => {
                        const next = [...plans]
                        next[index] = { ...next[index], interest: parseFloat(e.target.value) || 0 }
                        setDraft((d) => ({ ...d, installment: { ...installment, plans: next } }))
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      const next = plans.filter((_, i) => i !== index)
                      setDraft((d) => ({ ...d, installment: { ...installment, plans: next } }))
                    }}
                  >
                    {t('common.delete')}
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    installment: { ...installment, plans: [...plans, { months: 12, interest: 15 }] },
                  }))
                }
              >
                {t('wfcp.addPlan')}
              </Button>
            </div>
            <WfcpGatewayPicker
              selected={Array.isArray(installment.gateways) ? (installment.gateways as string[]) : []}
              onChange={(gateways) => setDraft((d) => ({ ...d, installment: { ...installment, gateways } }))}
            />
            <Button
              type="button"
              onClick={() =>
                void save.mutateAsync({
                  section: 'installment',
                  data: {
                    ...installment,
                    plans,
                    pdp_theme: String(installment.pdp_theme ?? 'classic') === 'timeline' ? 'timeline' : 'classic',
                    gateway_logos_only: installment.gateway_logos_only !== false,
                  },
                })
              }
              disabled={save.isPending}
            >
              {t('common.save')}
            </Button>
            </CardContent>
          </Card>
        )}

        {tab === 'wholesale' && (
          <WholesaleTab
            wholesale={wholesale}
            setWholesale={(next) => setDraft((d) => ({ ...d, wholesale: next }))}
            onSave={() => void save.mutateAsync({ section: 'wholesale', data: wholesale })}
            saving={save.isPending}
          />
        )}

        {tab === 'marketplaces' && (
          <ChannelsGrid
            channels={[...WFCP_MARKETPLACE_CHANNELS]}
            draft={draft}
            setDraft={setDraft}
            save={save}
            compare={false}
          />
        )}

        {tab === 'search-engines' && (
          <ChannelsGrid
            channels={[...WFCP_SEARCH_CHANNELS]}
            draft={draft}
            setDraft={setDraft}
            save={save}
            compare
          />
        )}

        {tab === 'notifications' && (
          <NotificationsTab
            notifications={notifications}
            setNotifications={(next) => setDraft((d) => ({ ...d, notifications: next }))}
            onSave={() => void save.mutateAsync({ section: 'notifications', data: notifications })}
            saving={save.isPending}
          />
        )}

        {tab === 'style' && (
          <StyleTab
            style={style}
            notifications={notifications}
            setStyle={(next) => setDraft((d) => ({ ...d, style: next }))}
            onSave={() => void save.mutateAsync({ section: 'style', data: { ...style, placement: style.placement ?? 'before_cart' } })}
            saving={save.isPending}
          />
        )}

        {tab === 'advanced' && <AdvancedTab />}
      </div>
    </div>
  )

  if (embedded) return content
  return (
    <PageShell title={t('wfcp.settingsTitle')} description={t('wfcp.settingsDescription')}>
      {content}
    </PageShell>
  )
}

function DashboardTab({
  general,
  creditEnabled,
  installmentEnabled,
  stats,
  statsLoading,
  setGeneral,
  onSave,
  saving,
}: {
  general: Record<string, unknown>
  creditEnabled: boolean
  installmentEnabled: boolean
  stats?: WfcpStats
  statsLoading: boolean
  setGeneral: (g: Record<string, unknown>) => void
  onSave: () => void
  saving: boolean
}) {
  const { t } = useTranslation()
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">{t('wfcp.formula.overview')}</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t('wfcp.stats.total')} value={stats?.total_products} loading={statsLoading} />
        <StatCard title={t('wfcp.stats.withPurchase')} value={stats?.products_with_price} loading={statsLoading} />
        <StatCard title={t('wfcp.stats.locked')} value={stats?.products_locked} loading={statsLoading} />
        <StatCard
          title={t('wfcp.stats.exchange')}
          value={stats ? `${stats.exchange_rate || '—'} ${stats.currency || ''}`.trim() : undefined}
          loading={statsLoading}
        />
      </div>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('wfcp.tab.dashboard')}</CardTitle>
          <CardDescription>{t('wfcp.defaultPurchaseTypeHint')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingSwitchRow
            id="wfcp-dash-enabled"
            label={t('wfcp.generalEnabled')}
            checked={Boolean(general.enabled ?? true)}
            onCheckedChange={(v) => setGeneral({ enabled: v })}
          />
          <div className="space-y-2">
            <Label htmlFor="wfcp-default-purchase-type">{t('wfcp.defaultPurchaseType')}</Label>
            <Select
              value={String(general.default_purchase_type ?? 'cash')}
              onValueChange={(v) => setGeneral({ default_purchase_type: v })}
            >
              <SelectTrigger id="wfcp-default-purchase-type" className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">{t('wfcp.purchaseTypeCash')}</SelectItem>
                {creditEnabled ? <SelectItem value="credit">{t('wfcp.purchaseTypeCredit')}</SelectItem> : null}
                {installmentEnabled ? (
                  <SelectItem value="installment">{t('wfcp.purchaseTypeInstallment')}</SelectItem>
                ) : null}
              </SelectContent>
            </Select>
          </div>
          <Button type="button" onClick={onSave} disabled={saving}>
            {t('common.save')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  title,
  value,
  loading,
}: {
  title: string
  value?: string | number
  loading?: boolean
}) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">
          {loading ? '…' : value != null ? value : '—'}
        </CardTitle>
      </CardHeader>
    </Card>
  )
}

function ChannelsGrid({
  channels,
  draft,
  setDraft,
  save,
  compare,
}: {
  channels: WfcpChannelSlug[]
  draft: WfcpSettings
  setDraft: Dispatch<SetStateAction<WfcpSettings>>
  save: {
    mutateAsync: (v: { section: string; data: Record<string, unknown> }) => Promise<unknown>
    isPending: boolean
  }
  compare: boolean
}) {
  const { t } = useTranslation()
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        {compare ? t('wfcp.formula.compare') : t('wfcp.formula.marketplace')}
      </p>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {channels.map((slug) => (
          <WfcpChannelCard
            key={slug}
            slug={slug}
            settings={(draft[slug] ?? {}) as Record<string, unknown>}
            onChange={(next) => setDraft((d) => ({ ...d, [slug]: next }))}
            onSave={() =>
              void save.mutateAsync({
                section: slug,
                data: (draft[slug] ?? {}) as Record<string, unknown>,
              })
            }
            saving={save.isPending}
          />
        ))}
      </div>
    </div>
  )
}

function WfcpChannelCard({
  slug,
  settings,
  onChange,
  onSave,
  saving,
}: {
  slug: WfcpChannelSlug
  settings: Record<string, unknown>
  onChange: (next: Record<string, unknown>) => void
  onSave: () => void
  saving: boolean
}) {
  const { t } = useTranslation()
  const defaultUnit = slug === 'digikala' ? 'rial' : 'toman'
  const isCompare = isWfcpCompareChannel(slug)
  const priceMode = String(settings.price_mode ?? (isCompare ? 'retail' : 'markup'))
  const showMarkupFields = !isCompare || priceMode === 'markup'

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t(`wfcp.tab.${slug}`)}</CardTitle>
        <CardDescription>
          {isCompare ? t('wfcp.formula.compare') : t('wfcp.formula.marketplace')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SettingSwitchRow
          id={`wfcp-mkt-${slug}-en`}
          label={t('wfcp.marketplaceEnabled')}
          checked={Boolean(settings.enabled)}
          onCheckedChange={(v) => onChange({ ...settings, enabled: v })}
        />
        {isCompare ? (
          <div className="space-y-2">
            <Label>{t('wfcp.priceMode')}</Label>
            <Select
              value={priceMode === 'markup' ? 'markup' : 'retail'}
              onValueChange={(v) => onChange({ ...settings, price_mode: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="retail">{t('wfcp.priceModeRetail')}</SelectItem>
                <SelectItem value="markup">{t('wfcp.priceModeMarkup')}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{t('wfcp.priceModeHint')}</p>
          </div>
        ) : null}
        {showMarkupFields ? (
          <>
            <div className="space-y-2">
              <Label>{t('wfcp.marketplaceProfit')}</Label>
              <Input
                type="number"
                className="max-w-xs"
                value={Number(settings.profit_percent ?? 20)}
                onChange={(e) => onChange({ ...settings, profit_percent: parseFloat(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('wfcp.marketplaceExtra')}</Label>
              <Input
                type="number"
                className="max-w-xs"
                value={Number(settings.extra_percent ?? 0)}
                onChange={(e) => onChange({ ...settings, extra_percent: parseFloat(e.target.value) })}
              />
            </div>
          </>
        ) : null}
        <SettingSwitchRow
          id={`wfcp-mkt-${slug}-round`}
          label={t('wfcp.roundEnabled')}
          checked={Boolean(settings.round_enabled ?? true)}
          onCheckedChange={(v) => onChange({ ...settings, round_enabled: v })}
          disabled={isCompare && priceMode !== 'markup'}
        />
        <div className="space-y-2">
          <Label>{t('wfcp.roundTo')}</Label>
          <Input
            type="number"
            className="max-w-xs"
            value={Number(settings.round_to ?? 1000)}
            onChange={(e) => onChange({ ...settings, round_to: parseInt(e.target.value, 10) })}
            disabled={isCompare && priceMode !== 'markup'}
          />
        </div>
        <div className="space-y-2">
          <Label>{t('wfcp.priceUnit')}</Label>
          <Select
            value={String(settings.price_unit ?? defaultUnit)}
            onValueChange={(v) => onChange({ ...settings, price_unit: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="toman">{t('wfcp.unitToman')}</SelectItem>
              <SelectItem value="rial">{t('wfcp.unitRial')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="button" onClick={onSave} disabled={saving} className="w-full">
          {t('common.save')}
        </Button>
      </CardContent>
    </Card>
  )
}

function WholesaleTab({
  wholesale,
  setWholesale,
  onSave,
  saving,
}: {
  wholesale: Record<string, unknown>
  setWholesale: (next: Record<string, unknown>) => void
  onSave: () => void
  saving: boolean
}) {
  const { t } = useTranslation()
  const rules = (wholesale.category_rules ?? {}) as Record<string, number>
  const varietyRules = (wholesale.category_variety_rules ?? {}) as Record<string, number>
  const defaults = (wholesale.defaults && typeof wholesale.defaults === 'object'
    ? (wholesale.defaults as Record<string, number>)
    : {}) as Record<string, number>
  const catsQ = useQuery({
    queryKey: ['product-categories', 'wfcp-wholesale'],
    queryFn: () => apiFetch<{ items: CatOption[] }>('shop/product-categories?sort=name_asc&per_page=200'),
  })

  function setDefault(key: string, value: number) {
    setWholesale({ ...wholesale, defaults: { ...defaults, [key]: value } })
  }

  return (
    <div className="space-y-4">
      <SettingSwitchRow
        id="wfcp-wholesale-en"
        label={t('wfcp.wholesaleEnabled')}
        checked={Boolean(wholesale.enabled)}
        onCheckedChange={(v) => setWholesale({ ...wholesale, enabled: v })}
      />
      <p className="text-muted-foreground text-xs">{t('wfcp.formula.wholesale')}</p>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('wfcp.wholesaleModeNormal')}</CardTitle>
          <CardDescription>{t('wfcp.wholesaleThresholdHint')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingSwitchRow
            id="wfcp-wholesale-threshold"
            label={t('wfcp.wholesaleThresholdEnabled')}
            checked={Boolean(wholesale.threshold_enabled)}
            onCheckedChange={(v) => setWholesale({ ...wholesale, threshold_enabled: v })}
            disabled={!wholesale.enabled}
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>{t('wfcp.wholesaleMinQty')}</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={Number(defaults.min_qty ?? 0)}
                onChange={(e) => setDefault('min_qty', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('wfcp.wholesaleMinWeight')}</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={Number(defaults.min_weight ?? 0)}
                onChange={(e) => setDefault('min_weight', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('wfcp.wholesaleQtyStep')}</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={Number(defaults.qty_step ?? 0)}
                onChange={(e) => setDefault('qty_step', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          <p className="text-muted-foreground text-xs">{t('wfcp.wholesaleMinsHint')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('wfcp.wholesaleModeAdvanced')}</CardTitle>
          <CardDescription>{t('wfcp.wholesalePartnerHint')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingSwitchRow
            id="wfcp-wholesale-partner"
            label={t('wfcp.wholesalePartnerEnabled')}
            checked={Boolean(wholesale.partner_enabled)}
            onCheckedChange={(v) => setWholesale({ ...wholesale, partner_enabled: v })}
            disabled={!wholesale.enabled}
          />
          <div className="space-y-2">
            <Label>{t('wfcp.discountPercent')}</Label>
            <Input
              type="number"
              className="max-w-xs"
              value={Number(wholesale.discount_percent ?? 10)}
              onChange={(e) =>
                setWholesale({ ...wholesale, discount_percent: parseFloat(e.target.value) })
              }
            />
          </div>
          <p className="text-muted-foreground text-xs">{t('wfcp.wholesaleDiscountCascadeHint')}</p>
          <div className="space-y-2">
            <Label>{t('wfcp.categoryRules')}</Label>
            {catsQ.isLoading ? <p className="text-sm text-muted-foreground">{t('common.loading')}</p> : null}
            <div className="max-h-72 space-y-2 overflow-y-auto rounded-md border border-border p-3">
              {(catsQ.data?.items ?? []).map((cat) => (
                <div key={cat.id} className="flex flex-wrap items-center gap-2">
                  <span className="min-w-0 flex-1 text-sm">{cat.name}</span>
                  <Input
                    type="number"
                    className="w-28"
                    value={Number(rules[String(cat.id)] ?? rules[cat.id] ?? 0)}
                    onChange={(e) => {
                      const next = { ...rules, [String(cat.id)]: parseFloat(e.target.value) || 0 }
                      setWholesale({ ...wholesale, category_rules: next })
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
          <p className="text-muted-foreground text-xs">{t('wfcp.wholesaleProductRuleHint')}</p>
          <p className="text-muted-foreground text-xs">
            <Link className="text-primary underline-offset-4 hover:underline" to="/users/list">
              {t('wfcp.wholesaleAssignPartnerHint')}
            </Link>
          </p>
          <div className="space-y-1.5 max-w-xs">
            <Label>{t('wfcp.wholesaleMinDistinct')}</Label>
            <Input
              type="number"
              min={0}
              step="1"
              value={Number(defaults.min_distinct_skus ?? 0)}
              onChange={(e) => setDefault('min_distinct_skus', parseInt(e.target.value, 10) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('wfcp.wholesaleCategoryVariety')}</Label>
            {catsQ.isLoading ? <p className="text-sm text-muted-foreground">{t('common.loading')}</p> : null}
            <div className="max-h-72 space-y-2 overflow-y-auto rounded-md border border-border p-3">
              {(catsQ.data?.items ?? []).map((cat) => (
                <div key={`v-${cat.id}`} className="flex flex-wrap items-center gap-2">
                  <span className="min-w-0 flex-1 text-sm">{cat.name}</span>
                  <Input
                    type="number"
                    min={0}
                    className="w-28"
                    value={Number(varietyRules[String(cat.id)] ?? varietyRules[cat.id] ?? 0)}
                    onChange={(e) => {
                      const next = { ...varietyRules, [String(cat.id)]: parseInt(e.target.value, 10) || 0 }
                      setWholesale({ ...wholesale, category_variety_rules: next })
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
          <WfcpGatewayPicker
            selected={Array.isArray(wholesale.gateways) ? (wholesale.gateways as string[]) : []}
            onChange={(gateways) => setWholesale({ ...wholesale, gateways })}
          />
          <WfcpShippingPicker
            selected={Array.isArray(wholesale.shipping_methods) ? (wholesale.shipping_methods as string[]) : []}
            onChange={(shipping_methods) => setWholesale({ ...wholesale, shipping_methods })}
          />
        </CardContent>
      </Card>

      <Button type="button" onClick={onSave} disabled={saving}>
        {t('common.save')}
      </Button>
    </div>
  )
}

function NotificationsTab({
  notifications,
  setNotifications,
  onSave,
  saving,
}: {
  notifications: Record<string, unknown>
  setNotifications: (next: Record<string, unknown>) => void
  onSave: () => void
  saving: boolean
}) {
  const { t } = useTranslation()
  const set = (key: string, value: unknown) => setNotifications({ ...notifications, [key]: value })

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
      {(['installment_text', 'credit_text', 'need_review'] as const).map((k) => (
        <div key={k} className="space-y-1">
          <Label>{t(`wfcp.field.${k}`)}</Label>
          <Input className="max-w-sm" value={String(notifications[k] ?? '')} onChange={(e) => set(k, e.target.value)} />
        </div>
      ))}
      {(
        ['cash_description', 'installment_description', 'credit_description', 'wholesale_description'] as const
      ).map((k) => (
        <div key={k} className="space-y-1">
          <Label>{t(`wfcp.field.${k}`, k)}</Label>
          <Textarea className="max-w-sm" value={String(notifications[k] ?? '')} onChange={(e) => set(k, e.target.value)} />
        </div>
      ))}

      <div className="space-y-3 border-t border-border pt-3">
        <h3 className="text-sm font-medium">{t('wfcp.badgesTitle')}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-3 rounded-md border border-border p-3">
            <SettingSwitchRow
              id="show_cash_badge"
              label={t('wfcp.field.show_cash_badge')}
              checked={Boolean(notifications.show_cash_badge ?? true)}
              onCheckedChange={(v) => set('show_cash_badge', v)}
            />
            <Input
              className="max-w-sm"
              placeholder={t('wfcp.purchaseTypeCash')}
              value={String(notifications.custom_cash_label ?? '')}
              onChange={(e) => set('custom_cash_label', e.target.value)}
            />
          </div>
          <div className="space-y-3 rounded-md border border-border p-3">
            <SettingSwitchRow
              id="show_install_badge"
              label={t('wfcp.field.show_install_badge')}
              checked={Boolean(notifications.show_install_badge ?? true)}
              onCheckedChange={(v) => set('show_install_badge', v)}
            />
            <Input
              className="max-w-sm"
              placeholder={t('wfcp.purchaseTypeInstallment')}
              value={String(notifications.custom_install_label ?? '')}
              onChange={(e) => set('custom_install_label', e.target.value)}
            />
          </div>
          <div className="space-y-3 rounded-md border border-border p-3">
            <SettingSwitchRow
              id="show_credit_badge"
              label={t('wfcp.field.show_credit_badge')}
              checked={Boolean(notifications.show_credit_badge ?? true)}
              onCheckedChange={(v) => set('show_credit_badge', v)}
            />
          </div>
          <div className="space-y-3 rounded-md border border-border p-3">
            <SettingSwitchRow
              id="show_guaranty_label"
              label={t('wfcp.field.show_guaranty_label')}
              checked={Boolean(notifications.show_guaranty_label ?? false)}
              onCheckedChange={(v) => set('show_guaranty_label', v)}
            />
            <Input
              className="max-w-sm"
              value={String(notifications.guaranty_text ?? 'گارانتی ۲۴ ماهه')}
              onChange={(e) => set('guaranty_text', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3 border-t border-border pt-3">
        <h3 className="text-sm font-medium">{t('wfcp.alertsTitle')}</h3>
        {(
          [
            ['product', 'alert_product_enabled', 'alert_product_text'],
            ['cart', 'alert_cart_enabled', 'alert_cart_text'],
            ['checkout', 'alert_checkout_enabled', 'alert_checkout_text'],
          ] as const
        ).map(([ctx, enKey, textKey]) => (
          <div key={ctx} className="space-y-3 rounded-md border border-border p-3">
            <SettingSwitchRow
              id={enKey}
              label={t(`wfcp.field.${textKey}`)}
              checked={Boolean(notifications[enKey] ?? true)}
              onCheckedChange={(v) => set(enKey, v)}
            />
            <Textarea
              className="max-w-sm"
              value={String(notifications[textKey] ?? '')}
              onChange={(e) => set(textKey, e.target.value)}
            />
          </div>
        ))}
      </div>

      <Button type="button" onClick={onSave} disabled={saving}>
        {t('common.save')}
      </Button>
      </CardContent>
    </Card>
  )
}

function StyleTab({
  style,
  notifications,
  setStyle,
  onSave,
  saving,
}: {
  style: Record<string, unknown>
  notifications: Record<string, unknown>
  setStyle: (next: Record<string, unknown>) => void
  onSave: () => void
  saving: boolean
}) {
  const { t } = useTranslation()
  const color = (key: string, fallback: string) => String(style[key] ?? fallback)
  const radius = Number(style.border_radius ?? 8)
  const placement = String(style.placement ?? 'before_cart')
  const set = (key: string, value: unknown) => setStyle({ ...style, [key]: value })

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('wfcp.placement')}</CardTitle>
          <CardDescription>
            <Link to="/settings/site/style" className="text-primary underline-offset-2 hover:underline">
              {t('settings.style.movedHint')}
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-w-md">
            <Label>{t('wfcp.placement')}</Label>
            <Select value={placement} onValueChange={(v) => set('placement', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">{t('wfcp.placementSummary')}</SelectItem>
                <SelectItem value="before_cart">{t('wfcp.placementBeforeCart')}</SelectItem>
                <SelectItem value="after_cart">{t('wfcp.placementAfterCart')}</SelectItem>
                <SelectItem value="before_tabs">{t('wfcp.placementBeforeTabs')}</SelectItem>
                <SelectItem value="after_tabs">{t('wfcp.placementAfterTabs')}</SelectItem>
                <SelectItem value="none">{t('wfcp.placementNone')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="button" className="mt-4" onClick={onSave} disabled={saving}>
            {t('common.save')}
          </Button>
        </CardContent>
      </Card>

      <div
        className="wfcp-pricing-box max-w-lg space-y-3 p-4"
        style={{
          background: color('box_background', '#ffffff'),
          border: `1px solid ${color('box_border_color', '#e0e0e0')}`,
          borderRadius: `${radius}px`,
        }}
      >
        <p className="text-sm font-medium">{t('wfcp.stylePreview')}</p>
        <div className="flex flex-wrap gap-2">
          <span
            className="wfcp-label-pill wfcp-gateway-badge rounded-full px-2 py-0.5 text-xs"
            style={{
              background: color('badge_cash_bg', '#ECFDF5'),
              color: color('badge_cash_text', '#047857'),
            }}
          >
            {String(notifications.custom_cash_label || t('wfcp.purchaseTypeCash'))}
          </span>
          <span
            className="wfcp-label-pill wfcp-gateway-badge rounded-full px-2 py-0.5 text-xs"
            style={{
              background: color('badge_credit_bg', '#EFF6FF'),
              color: color('badge_credit_text', '#1D4ED8'),
            }}
          >
            {t('wfcp.purchaseTypeCredit')}
          </span>
          <span
            className="wfcp-label-pill wfcp-gateway-badge rounded-full px-2 py-0.5 text-xs"
            style={{
              background: color('badge_installment_bg', '#FFFBEB'),
              color: color('badge_installment_text', '#B45309'),
            }}
          >
            {String(notifications.custom_install_label || t('wfcp.purchaseTypeInstallment'))}
          </span>
        </div>
        <p className="text-lg font-bold" style={{ color: color('price_color', '#2271b1') }}>
          ۱٬۲۵۰٬۰۰۰ {t('wfcp.unitToman')}
        </p>
        <button
          type="button"
          className="rounded-md px-3 py-2 text-sm"
          style={{
            background: color('button_background', '#2271b1'),
            color: color('button_text_color', '#ffffff'),
            borderRadius: `${Math.max(4, radius - 2)}px`,
          }}
        >
          {t('wfcp.previewAddToCart')}
        </button>
        <div
          className="rounded-md border p-2 text-xs"
          style={{
            background: color('alert_bg', '#ffffff'),
            color: color('alert_text_color', '#9A3412'),
            borderColor: color('alert_border_color', '#FDBA74'),
            borderInlineStart: `3px solid ${color('alert_accent', '#EA580C')}`,
          }}
        >
          {String(notifications.alert_product_text || t('wfcp.field.alert_product_text'))}
        </div>
      </div>
    </div>
  )
}

function WfcpGatewayPicker({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (gateways: string[]) => void
}) {
  const { t } = useTranslation()
  const q = useQuery({
    queryKey: ['payment-gateways'],
    queryFn: () => apiFetch<{ gateways: PaymentGatewayRow[] }>('shop/payment-gateways'),
  })

  const gateways = q.data?.gateways ?? []

  const toggle = (id: string, checked: boolean) => {
    if (checked) {
      onChange(Array.from(new Set([...selected, id])))
      return
    }
    onChange(selected.filter((g) => g !== id))
  }

  return (
    <div className="space-y-2">
      <Label>{t('wfcp.paymentGateways')}</Label>
      {q.isLoading ? <p className="text-sm text-muted-foreground">{t('common.loading')}</p> : null}
      {gateways.length === 0 && !q.isLoading ? (
        <p className="text-sm text-muted-foreground">{t('wfcp.noGateways')}</p>
      ) : (
        <div className="space-y-2 rounded-md border border-border p-3">
          {gateways.map((gateway) => (
            <div key={gateway.id} className="flex items-center gap-2">
              <Checkbox
                id={`wfcp-gw-${gateway.id}`}
                checked={selected.includes(gateway.id)}
                onCheckedChange={(v) => toggle(gateway.id, v === true)}
              />
              <Label htmlFor={`wfcp-gw-${gateway.id}`} className="cursor-pointer font-normal">
                {gateway.title}
                {!gateway.enabled ? ` (${t('common.disabled')})` : ''}
              </Label>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

type ShippingMethodRow = { id: string; title: string }

function WfcpShippingPicker({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (methods: string[]) => void
}) {
  const { t } = useTranslation()
  const q = useQuery({
    queryKey: ['wfcp', 'shipping-methods'],
    queryFn: () => apiFetch<{ methods: ShippingMethodRow[] }>('wfcp/shipping-methods'),
  })

  const methods = q.data?.methods ?? []

  const toggle = (id: string, checked: boolean) => {
    if (checked) {
      onChange(Array.from(new Set([...selected, id])))
      return
    }
    onChange(selected.filter((g) => g !== id))
  }

  return (
    <div className="space-y-2">
      <Label>{t('wfcp.shippingMethods')}</Label>
      <p className="text-muted-foreground text-xs">{t('wfcp.shippingMethodsHint')}</p>
      {q.isLoading ? <p className="text-sm text-muted-foreground">{t('common.loading')}</p> : null}
      {methods.length === 0 && !q.isLoading ? (
        <p className="text-sm text-muted-foreground">{t('wfcp.noShippingMethods')}</p>
      ) : (
        <div className="space-y-2 rounded-md border border-border p-3">
          {methods.map((method) => (
            <div key={method.id} className="flex items-center gap-2">
              <Checkbox
                id={`wfcp-ship-${method.id}`}
                checked={selected.includes(method.id)}
                onCheckedChange={(v) => toggle(method.id, v === true)}
              />
              <Label htmlFor={`wfcp-ship-${method.id}`} className="cursor-pointer font-normal">
                {method.title}
              </Label>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

type RecalcStatePayload = {
  params?: Record<string, unknown>
  state?: {
    total?: number
    pages?: number
    current_page?: number
    processed?: number
    success?: number
    failed?: number
    finished?: boolean
  }
  locked?: boolean
}

function WfcpRecalcStatus({ pollKey }: { pollKey: string[] }) {
  const { t } = useTranslation()
  const st = useQuery({
    queryKey: pollKey,
    queryFn: () => apiFetch<RecalcStatePayload>('wfcp/advanced/recalculate-state'),
    refetchInterval: (q) => (q.state.data?.locked ? 3000 : false),
  })

  const state = st.data?.state
  const locked = Boolean(st.data?.locked)
  const total = Number(state?.total ?? 0)
  const processed = Number(state?.processed ?? 0)
  const success = Number(state?.success ?? 0)
  const failed = Number(state?.failed ?? 0)
  const finished = Boolean(state?.finished)

  if (!locked && !finished && processed === 0) {
    return null
  }

  return (
    <div className="space-y-2 rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge
          status={locked ? 'running' : finished ? 'done' : 'idle'}
          tone={locked ? 'warning' : finished ? 'success' : 'secondary'}
        />
        <span className="text-muted-foreground text-xs">
          {locked
            ? t('wfcp.recalcRunning', { processed, total })
            : finished
              ? t('wfcp.recalcFinished', { ok: success, fail: failed })
              : t('wfcp.recalcIdle')}
        </span>
      </div>
    </div>
  )
}

function ExchangeTab({
  general,
  setGeneral,
  onSave,
  saving,
}: {
  general: Record<string, unknown>
  setGeneral: (p: Record<string, unknown>) => void
  onSave: (data: Record<string, unknown>) => void
  saving: boolean
}) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [testMsg, setTestMsg] = useState('')

  const applyAll = useMutation({
    mutationFn: () =>
      apiFetch<{ queued?: boolean; total?: number }>('wfcp/advanced/recalculate-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dry_run: false }),
      }),
    onSuccess: (r) => {
      void qc.invalidateQueries({ queryKey: ['wfcp', 'recalc', 'state'] })
      toast.success(t('wfcp.recalcQueued', { total: r.total ?? 0 }))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
      <div className="space-y-2">
        <Label>{t('wfcp.currencyCode')}</Label>
        <Input className="max-w-xs" value={String(general.currency ?? 'IRR')} readOnly disabled />
        <p className="text-sm text-muted-foreground">{t('wfcp.currencyWcOwned')}</p>
      </div>
      <div className="space-y-2">
        <Label>{t('wfcp.exchangeRate')}</Label>
        <Input
          type="number"
          className="max-w-xs"
          value={Number(general.exchange_rate ?? 42000)}
          onChange={(e) => setGeneral({ exchange_rate: parseFloat(e.target.value) })}
        />
      </div>
      <SettingSwitchRow
        id="wfcp-ex-rate-en"
        label={t('wfcp.exchangeRateEnabled')}
        checked={Boolean(general.exchange_rate_enabled ?? true)}
        onCheckedChange={(v) => setGeneral({ exchange_rate_enabled: v })}
      />
      <div className="space-y-2">
        <Label>{t('wfcp.purchaseCurrency')}</Label>
        <Select
          value={String(general.purchase_currency ?? 'base')}
          onValueChange={(v) => setGeneral({ purchase_currency: v })}
        >
          <SelectTrigger className="max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="base">{t('wfcp.purchaseCurrencyBase')}</SelectItem>
            <SelectItem value="display">{t('wfcp.purchaseCurrencyDisplay')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>{t('wfcp.apiKey')}</Label>
        <Input className="max-w-sm" value={String(general.api_key ?? '')} onChange={(e) => setGeneral({ api_key: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>{t('wfcp.apiSymbol')}</Label>
        <Input className="max-w-xs" value={String(general.api_symbol ?? 'USD')} onChange={(e) => setGeneral({ api_symbol: e.target.value })} />
      </div>
      <SettingSwitchRow
        id="wfcp-api-en"
        label={t('wfcp.apiEnabled')}
        checked={Boolean(general.api_enabled)}
        onCheckedChange={(v) => setGeneral({ api_enabled: v })}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={async () => {
            try {
              const r = await apiFetch<{ message?: string; price?: number }>('wfcp/exchange/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ api_key: general.api_key ?? '', api_symbol: general.api_symbol ?? 'USD' }),
              })
              setTestMsg(r.message ? `${r.message}` : String(r.price ?? ''))
            } catch (e) {
              setTestMsg((e as Error).message)
            }
          }}
        >
          {t('wfcp.testApi')}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={async () => {
            try {
              const r = await apiFetch<{ message?: string }>('wfcp/exchange/fetch', { method: 'POST', body: '{}' })
              setTestMsg(r.message ?? t('wfcp.fetchOk'))
            } catch (e) {
              setTestMsg((e as Error).message)
            }
          }}
        >
          {t('wfcp.fetchRate')}
        </Button>
        <Button type="button" onClick={() => onSave(general as Record<string, unknown>)} disabled={saving}>
          {t('common.save')}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={applyAll.isPending}
          onClick={() => void applyAll.mutateAsync()}
        >
          {t('wfcp.applyAllPrices')}
        </Button>
      </div>
      <p className="text-muted-foreground text-xs">{t('wfcp.applyAllPricesHint')}</p>
      <WfcpRecalcStatus pollKey={['wfcp', 'recalc', 'state']} />
      {testMsg && <p className="text-sm text-muted-foreground">{testMsg}</p>}
      </CardContent>
    </Card>
  )
}

function AdvancedTab() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [importJson, setImportJson] = useState('')
  const [dry, setDry] = useState(false)

  const recalc = useMutation({
    mutationFn: () =>
      apiFetch<{ queued?: boolean; total?: number }>('wfcp/advanced/recalculate-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dry_run: dry }),
      }),
    onSuccess: (r) => {
      void qc.invalidateQueries({ queryKey: ['wfcp', 'recalc', 'state'] })
      toast.success(t('wfcp.recalcQueued', { total: r.total ?? 0 }))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const delTrans = useMutation({
    mutationFn: () => apiFetch('wfcp/advanced/delete-transients', { method: 'POST', body: '{}' }),
    onSuccess: () => toast.success(t('wfcp.transientsCleared')),
    onError: (e: Error) => toastApiError(t, e),
  })

  const exportS = useMutation({
    mutationFn: () => apiFetch<{ json: string }>('wfcp/advanced/export-settings'),
    onSuccess: (r) => {
      void navigator.clipboard.writeText(r.json).catch(() => {})
      toast.success(t('wfcp.exportCopied'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const importS = useMutation({
    mutationFn: () =>
      apiFetch('wfcp/advanced/import-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ json: importJson }),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['wfcp', 'settings'] })
      toast.success(t('common.saved'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
      <div>
        <SettingSwitchRow
          id="wfcp-dry"
          label={t('wfcp.dryRun')}
          checked={dry}
          onCheckedChange={setDry}
        />
        <Button className="mt-2" type="button" variant="secondary" disabled={recalc.isPending} onClick={() => void recalc.mutateAsync()}>
          {t('wfcp.recalculateAll')}
        </Button>
        <WfcpRecalcStatus pollKey={['wfcp', 'recalc', 'state']} />
      </div>
      <Button type="button" variant="secondary" disabled={delTrans.isPending} onClick={() => void delTrans.mutateAsync()}>
        {t('wfcp.deleteTransients')}
      </Button>
      <div>
        <Button type="button" variant="secondary" disabled={exportS.isPending} onClick={() => void exportS.mutateAsync()}>
          {t('wfcp.exportSettings')}
        </Button>
      </div>
      <div className="space-y-2">
        <Label>{t('wfcp.importJson')}</Label>
        <Textarea className="min-h-24 max-w-sm" value={importJson} onChange={(e) => setImportJson(e.target.value)} />
        <Button className="mt-2" type="button" disabled={importS.isPending} onClick={() => void importS.mutateAsync()}>
          {t('wfcp.importSettings')}
        </Button>
      </div>
      </CardContent>
    </Card>
  )
}
