import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type Settings = {
  company_name: string
  economic_code: string
  national_id: string
  postal_code: string
  address: string
  province: string
  city: string
  phone: string
  fiscal_id: string
  private_key?: string
  certificate_pem?: string
  has_private_key?: boolean
  has_certificate?: boolean
  moadian_sandbox: boolean
  moadian_proxy?: string
  auto_send_moadian: boolean
  default_invoice_type: number
  default_vat_rate: number
  snapshot_cogs: boolean
  sync_order_statuses: string[]
  account_map: Record<string, string>
  hesabfa_enabled?: boolean
  hesabfa_api_key?: string
  hesabfa_api_key_masked?: string
  hesabfa_login_token?: string
  hesabfa_user_id?: string
  hesabfa_password?: string
  has_hesabfa_login_token?: boolean
  has_hesabfa_password?: boolean
  hesabfa_year_id?: number
  hesabfa_currency?: string
  hesabfa_default_bank_code?: string
  hesabfa_default_warehouse_code?: string
  hesabfa_hook_password?: string
  has_hesabfa_hook_password?: boolean
  hesabfa_link_wc_only?: boolean
  hesabfa_sync_entities?: Record<string, boolean>
  hesabfa_last_change_id?: number
  employee_insurance_pct?: number
  employer_insurance_pct?: number
  unemployment_insurance_pct?: number
  payroll_min_daily_wage?: number
  payroll_ceiling_multiplier?: number
  payroll_tax_exemption?: number
  payroll_legal_food?: number
  payroll_legal_housing?: number
  payroll_legal_marriage?: number
  payroll_legal_seniority?: number
  payroll_overtime_rate?: number
  payroll_night_ot_rate?: number
  payroll_holiday_ot_rate?: number
  payroll_child_benefit_each?: number
  payroll_volume_insurable?: boolean
  payroll_sick_counts_worked?: boolean
  payroll_tax_brackets?: { up_to: number; rate: number }[]
  default_workshop_id?: number
}

const ENTITY_KEYS = [
  'contacts',
  'items',
  'invoices',
  'receipts',
  'warehouses',
  'cash_accounts',
  'journals',
  'bank_transfers',
  'categories',
  'projects',
  'accounts',
] as const

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

export default function AccountingSettingsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const path = useLocation().pathname
  const tab = path.endsWith('/company')
    ? 'company'
    : path.endsWith('/sync')
      ? 'sync'
      : path.endsWith('/tax')
        ? 'tax'
        : path.endsWith('/hesabfa')
          ? 'hesabfa'
          : path.endsWith('/payroll')
            ? 'payroll'
            : 'moadian'

  const settingsQ = useQuery({
    queryKey: ['accounting', 'settings'],
    queryFn: async () => apiFetch<{ settings: Settings }>('accounting/settings'),
  })

  const metaQ = useQuery({
    queryKey: ['accounting', 'hesabfa-meta'],
    queryFn: async () => apiFetch<{ hook_url: string; steps: string[]; enabled: boolean }>('accounting/hesabfa/meta'),
    enabled: tab === 'hesabfa',
  })

  const [draft, setDraft] = useState<Settings | null>(null)
  const settings = useMemo(() => {
    const incoming = settingsQ.data?.settings
    if (!incoming) return draft
    if (!draft) {
      setDraft({
        ...incoming,
        private_key: '',
        certificate_pem: incoming.has_certificate ? '' : '',
        hesabfa_api_key: '',
        hesabfa_login_token: '',
        hesabfa_password: '',
        hesabfa_hook_password: '',
      })
      return { ...incoming, private_key: '' }
    }
    return draft
  }, [settingsQ.data?.settings, draft])

  const save = useMutation({
    mutationFn: async () =>
      apiFetch<{ settings: Settings }>('accounting/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      }),
    onSuccess: async (res) => {
      toast.success(t('common.saved'))
      setDraft({
        ...res.settings,
        private_key: '',
        hesabfa_api_key: '',
        hesabfa_login_token: '',
        hesabfa_password: '',
        hesabfa_hook_password: '',
      })
      await qc.invalidateQueries({ queryKey: ['accounting', 'settings'] })
    },
    onError: (err: Error) => toastApiError(t, err),
  })

  const test = useMutation({
    mutationFn: async () => apiFetch<{ ok: boolean }>('accounting/test-connection', { method: 'POST' }),
    onSuccess: () => toast.success(t('accounting.testSuccess')),
    onError: (err: Error) => toastApiError(t, err),
  })

  const testHesabfa = useMutation({
    mutationFn: async () => apiFetch<{ ok: boolean }>('accounting/hesabfa/test', { method: 'POST' }),
    onSuccess: () => toast.success(t('accounting.hesabfa.testSuccess')),
    onError: (err: Error) => toastApiError(t, err),
  })

  const registerHook = useMutation({
    mutationFn: async () => apiFetch<{ ok: boolean; hook_url: string }>('accounting/hesabfa/register-hook', { method: 'POST' }),
    onSuccess: async () => {
      toast.success(t('accounting.hesabfa.hookRegistered'))
      await qc.invalidateQueries({ queryKey: ['accounting', 'hesabfa-meta'] })
      await qc.invalidateQueries({ queryKey: ['accounting', 'settings'] })
    },
    onError: (err: Error) => toastApiError(t, err),
  })

  const migrate = useMutation({
    mutationFn: async () =>
      apiFetch<{ queued: number }>('accounting/hesabfa/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }),
    onSuccess: (res) => toast.success(t('accounting.hesabfa.migrateQueued', { count: res.queued })),
    onError: (err: Error) => toastApiError(t, err),
  })

  const syncNow = useMutation({
    mutationFn: async () => apiFetch<{ pulled: number }>('accounting/hesabfa/sync-now', { method: 'POST' }),
    onSuccess: (res) => toast.success(t('accounting.hesabfa.synced', { count: res.pulled ?? 0 })),
    onError: (err: Error) => toastApiError(t, err),
  })

  const title =
    tab === 'company'
      ? t('accounting.settings.company')
      : tab === 'sync'
        ? t('accounting.settings.sync')
        : tab === 'tax'
          ? t('accounting.settings.tax')
          : tab === 'hesabfa'
            ? t('accounting.settings.hesabfa')
            : tab === 'payroll'
              ? t('accounting.settings.payroll')
              : t('accounting.settings.moadian')

  if (!settings) {
    return (
      <PageShell title={title}>
        <div>{t('common.loading')}</div>
      </PageShell>
    )
  }

  const entities = settings.hesabfa_sync_entities ?? {}

  return (
    <PageShell title={title} description={t('accounting.settingsSubtitle')}>
      <section className="space-y-4 rounded-lg border border-border p-4">
        {tab === 'moadian' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={t('accounting.fiscalId')} value={settings.fiscal_id} onChange={(v) => setDraft((p) => ({ ...(p as Settings), fiscal_id: v }))} />
            <div className="space-y-2">
              <Label>{t('accounting.defaultInvoiceType')}</Label>
              <Select
                value={String(settings.default_invoice_type)}
                onValueChange={(v) => setDraft((p) => ({ ...(p as Settings), default_invoice_type: Number(v) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{t('accounting.invoiceType1')}</SelectItem>
                  <SelectItem value="2">{t('accounting.invoiceType2')}</SelectItem>
                  <SelectItem value="3">{t('accounting.invoiceType3')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Field
              label={t('accounting.privateKey')}
              type="password"
              value={settings.private_key ?? ''}
              placeholder={settings.has_private_key ? '••••••••' : ''}
              onChange={(v) => setDraft((p) => ({ ...(p as Settings), private_key: v }))}
            />
            <div className="space-y-2 md:col-span-2">
              <Label>{t('accounting.certificate')}</Label>
              <textarea
                className="border-input bg-background flex min-h-[100px] w-full rounded-md border px-3 py-2 text-sm"
                value={settings.certificate_pem ?? ''}
                placeholder={settings.has_certificate ? '••••••••' : ''}
                onChange={(e) => setDraft((p) => ({ ...(p as Settings), certificate_pem: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="acc-auto"
                checked={settings.auto_send_moadian}
                onCheckedChange={(v) => setDraft((p) => ({ ...(p as Settings), auto_send_moadian: v === true }))}
              />
              <Label htmlFor="acc-auto">{t('accounting.autoSend')}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="acc-sandbox"
                checked={settings.moadian_sandbox}
                onCheckedChange={(v) => setDraft((p) => ({ ...(p as Settings), moadian_sandbox: v === true }))}
              />
              <Label htmlFor="acc-sandbox">{t('accounting.sandbox')}</Label>
            </div>
            <Field
              label={t('accounting.moadianProxy')}
              value={settings.moadian_proxy ?? ''}
              placeholder="http://user:pass@host:port"
              onChange={(v) => setDraft((p) => ({ ...(p as Settings), moadian_proxy: v }))}
            />
            <p className="text-muted-foreground md:col-span-2 text-xs">{t('accounting.moadianHelp')}</p>
          </div>
        ) : null}

        {tab === 'company' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={t('accounting.companyName')} value={settings.company_name} onChange={(v) => setDraft((p) => ({ ...(p as Settings), company_name: v }))} />
            <Field label={t('accounting.economicCode')} value={settings.economic_code} onChange={(v) => setDraft((p) => ({ ...(p as Settings), economic_code: v }))} />
            <Field label={t('accounting.nationalId')} value={settings.national_id} onChange={(v) => setDraft((p) => ({ ...(p as Settings), national_id: v }))} />
            <Field label={t('accounting.postalCode')} value={settings.postal_code} onChange={(v) => setDraft((p) => ({ ...(p as Settings), postal_code: v }))} />
            <Field label={t('accounting.province')} value={settings.province} onChange={(v) => setDraft((p) => ({ ...(p as Settings), province: v }))} />
            <Field label={t('accounting.city')} value={settings.city} onChange={(v) => setDraft((p) => ({ ...(p as Settings), city: v }))} />
            <Field label={t('accounting.phone')} value={settings.phone} onChange={(v) => setDraft((p) => ({ ...(p as Settings), phone: v }))} />
            <div className="space-y-2 md:col-span-2">
              <Label>{t('accounting.address')}</Label>
              <textarea
                className="border-input bg-background flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm"
                value={settings.address}
                onChange={(e) => setDraft((p) => ({ ...(p as Settings), address: e.target.value }))}
              />
            </div>
          </div>
        ) : null}

        {tab === 'sync' ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="acc-cogs"
                checked={settings.snapshot_cogs}
                onCheckedChange={(v) => setDraft((p) => ({ ...(p as Settings), snapshot_cogs: v === true }))}
              />
              <Label htmlFor="acc-cogs">{t('accounting.snapshotCogs')}</Label>
            </div>
            <Field
              label={t('accounting.syncStatuses')}
              value={(settings.sync_order_statuses ?? []).join(',')}
              onChange={(v) =>
                setDraft((p) => ({
                  ...(p as Settings),
                  sync_order_statuses: v.split(',').map((s) => s.trim()).filter(Boolean),
                }))
              }
            />
            <p className="text-muted-foreground text-xs">{t('accounting.syncHelp')}</p>
          </div>
        ) : null}

        {tab === 'tax' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label={t('accounting.defaultVat')}
              type="number"
              value={String(settings.default_vat_rate)}
              onChange={(v) => setDraft((p) => ({ ...(p as Settings), default_vat_rate: Number(v) || 0 }))}
            />
            {Object.entries(settings.account_map ?? {}).map(([k, v]) => (
              <Field
                key={k}
                label={t(`accounting.map.${k}`, k)}
                value={v}
                onChange={(nv) =>
                  setDraft((p) => ({
                    ...(p as Settings),
                    account_map: { ...(p as Settings).account_map, [k]: nv },
                  }))
                }
              />
            ))}
          </div>
        ) : null}

        {tab === 'hesabfa' ? (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="hesabfa-on"
                checked={!!settings.hesabfa_enabled}
                onCheckedChange={(v) => setDraft((p) => ({ ...(p as Settings), hesabfa_enabled: v === true }))}
              />
              <Label htmlFor="hesabfa-on">{t('accounting.hesabfa.enabled')}</Label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label={t('accounting.hesabfa.apiKey')}
                type="password"
                value={settings.hesabfa_api_key ?? ''}
                placeholder={settings.hesabfa_api_key_masked || ''}
                onChange={(v) => setDraft((p) => ({ ...(p as Settings), hesabfa_api_key: v }))}
              />
              <Field
                label={t('accounting.hesabfa.loginToken')}
                type="password"
                value={settings.hesabfa_login_token ?? ''}
                placeholder={settings.has_hesabfa_login_token ? '••••••••' : ''}
                onChange={(v) => setDraft((p) => ({ ...(p as Settings), hesabfa_login_token: v }))}
              />
              <Field
                label={t('accounting.hesabfa.userId')}
                value={settings.hesabfa_user_id ?? ''}
                onChange={(v) => setDraft((p) => ({ ...(p as Settings), hesabfa_user_id: v }))}
              />
              <Field
                label={t('accounting.hesabfa.password')}
                type="password"
                value={settings.hesabfa_password ?? ''}
                placeholder={settings.has_hesabfa_password ? '••••••••' : ''}
                onChange={(v) => setDraft((p) => ({ ...(p as Settings), hesabfa_password: v }))}
              />
              <Field
                label={t('accounting.hesabfa.yearId')}
                type="number"
                value={String(settings.hesabfa_year_id ?? 0)}
                onChange={(v) => setDraft((p) => ({ ...(p as Settings), hesabfa_year_id: Number(v) || 0 }))}
              />
              <div className="space-y-2">
                <Label>{t('accounting.hesabfa.currency')}</Label>
                <Select
                  value={settings.hesabfa_currency ?? 'IRT'}
                  onValueChange={(v) => setDraft((p) => ({ ...(p as Settings), hesabfa_currency: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IRT">IRT (تومان)</SelectItem>
                    <SelectItem value="IRR">IRR (ریال)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Field
                label={t('accounting.hesabfa.defaultBank')}
                value={settings.hesabfa_default_bank_code ?? ''}
                onChange={(v) => setDraft((p) => ({ ...(p as Settings), hesabfa_default_bank_code: v }))}
              />
              <Field
                label={t('accounting.hesabfa.defaultWarehouse')}
                value={settings.hesabfa_default_warehouse_code ?? ''}
                onChange={(v) => setDraft((p) => ({ ...(p as Settings), hesabfa_default_warehouse_code: v }))}
              />
              <Field
                label={t('accounting.hesabfa.hookPassword')}
                type="password"
                value={settings.hesabfa_hook_password ?? ''}
                placeholder={settings.has_hesabfa_hook_password ? '••••••••' : ''}
                onChange={(v) => setDraft((p) => ({ ...(p as Settings), hesabfa_hook_password: v }))}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="hesabfa-link"
                checked={settings.hesabfa_link_wc_only !== false}
                onCheckedChange={(v) => setDraft((p) => ({ ...(p as Settings), hesabfa_link_wc_only: v === true }))}
              />
              <Label htmlFor="hesabfa-link">{t('accounting.hesabfa.linkWcOnly')}</Label>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">{t('accounting.hesabfa.entities')}</p>
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                {ENTITY_KEYS.map((key) => (
                  <label key={key} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={entities[key] !== false}
                      onCheckedChange={(v) =>
                        setDraft((p) => ({
                          ...(p as Settings),
                          hesabfa_sync_entities: {
                            ...((p as Settings).hesabfa_sync_entities ?? {}),
                            [key]: v === true,
                          },
                        }))
                      }
                    />
                    {t(`accounting.hesabfa.entity.${key}`)}
                  </label>
                ))}
              </div>
            </div>
            {metaQ.data?.hook_url ? (
              <p className="text-muted-foreground break-all text-xs">
                {t('accounting.hesabfa.hookUrl')}: {metaQ.data.hook_url}
              </p>
            ) : null}
            <p className="text-muted-foreground text-xs">
              {t('accounting.hesabfa.lastChangeId')}: {settings.hesabfa_last_change_id ?? 0}
            </p>
            <p className="text-muted-foreground text-xs">{t('accounting.hesabfa.help')}</p>
          </div>
        ) : null}

        {tab === 'payroll' ? (
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">{t('accounting.payroll.settingsHelp')}</p>
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label={t('accounting.payroll.employeeInsPct')}
                type="number"
                value={String(settings.employee_insurance_pct ?? 7)}
                onChange={(v) => setDraft((p) => ({ ...(p as Settings), employee_insurance_pct: Number(v) || 0 }))}
              />
              <Field
                label={t('accounting.payroll.employerInsPct')}
                type="number"
                value={String(settings.employer_insurance_pct ?? 20)}
                onChange={(v) => setDraft((p) => ({ ...(p as Settings), employer_insurance_pct: Number(v) || 0 }))}
              />
              <Field
                label={t('accounting.payroll.unemploymentPct')}
                type="number"
                value={String(settings.unemployment_insurance_pct ?? 3)}
                onChange={(v) => setDraft((p) => ({ ...(p as Settings), unemployment_insurance_pct: Number(v) || 0 }))}
              />
              <Field
                label={t('accounting.payroll.minDailyWage')}
                type="number"
                value={String(settings.payroll_min_daily_wage ?? 0)}
                onChange={(v) => setDraft((p) => ({ ...(p as Settings), payroll_min_daily_wage: Number(v) || 0 }))}
              />
              <Field
                label={t('accounting.payroll.ceilingMultiplier')}
                type="number"
                value={String(settings.payroll_ceiling_multiplier ?? 7)}
                onChange={(v) => setDraft((p) => ({ ...(p as Settings), payroll_ceiling_multiplier: Number(v) || 0 }))}
              />
              <Field
                label={t('accounting.payroll.taxExemption')}
                type="number"
                value={String(settings.payroll_tax_exemption ?? 0)}
                onChange={(v) => setDraft((p) => ({ ...(p as Settings), payroll_tax_exemption: Number(v) || 0 }))}
              />
              <Field
                label={t('accounting.payroll.legalFood')}
                type="number"
                value={String(settings.payroll_legal_food ?? 0)}
                onChange={(v) => setDraft((p) => ({ ...(p as Settings), payroll_legal_food: Number(v) || 0 }))}
              />
              <Field
                label={t('accounting.payroll.legalHousing')}
                type="number"
                value={String(settings.payroll_legal_housing ?? 0)}
                onChange={(v) => setDraft((p) => ({ ...(p as Settings), payroll_legal_housing: Number(v) || 0 }))}
              />
              <Field
                label={t('accounting.payroll.legalMarriage')}
                type="number"
                value={String(settings.payroll_legal_marriage ?? 0)}
                onChange={(v) => setDraft((p) => ({ ...(p as Settings), payroll_legal_marriage: Number(v) || 0 }))}
              />
              <Field
                label={t('accounting.payroll.legalSeniority')}
                type="number"
                value={String(settings.payroll_legal_seniority ?? 0)}
                onChange={(v) => setDraft((p) => ({ ...(p as Settings), payroll_legal_seniority: Number(v) || 0 }))}
              />
              <Field
                label={t('accounting.payroll.overtimeRate')}
                type="number"
                value={String(settings.payroll_overtime_rate ?? 1.4)}
                onChange={(v) => setDraft((p) => ({ ...(p as Settings), payroll_overtime_rate: Number(v) || 0 }))}
              />
              <Field
                label={t('accounting.payroll.nightOtRate')}
                type="number"
                value={String(settings.payroll_night_ot_rate ?? 1.35)}
                onChange={(v) => setDraft((p) => ({ ...(p as Settings), payroll_night_ot_rate: Number(v) || 0 }))}
              />
              <Field
                label={t('accounting.payroll.holidayOtRate')}
                type="number"
                value={String(settings.payroll_holiday_ot_rate ?? 1.4)}
                onChange={(v) => setDraft((p) => ({ ...(p as Settings), payroll_holiday_ot_rate: Number(v) || 0 }))}
              />
              <Field
                label={t('accounting.payroll.childBenefitEach')}
                type="number"
                value={String(settings.payroll_child_benefit_each ?? 0)}
                onChange={(v) => setDraft((p) => ({ ...(p as Settings), payroll_child_benefit_each: Number(v) || 0 }))}
              />
              <Field
                label={t('accounting.payroll.defaultWorkshopId')}
                type="number"
                value={String(settings.default_workshop_id ?? 0)}
                onChange={(v) => setDraft((p) => ({ ...(p as Settings), default_workshop_id: Number(v) || 0 }))}
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={settings.payroll_volume_insurable !== false}
                  onCheckedChange={(v) => setDraft((p) => ({ ...(p as Settings), payroll_volume_insurable: v === true }))}
                />
                {t('accounting.payroll.volumeInsurable')}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={settings.payroll_sick_counts_worked !== false}
                  onCheckedChange={(v) => setDraft((p) => ({ ...(p as Settings), payroll_sick_counts_worked: v === true }))}
                />
                {t('accounting.payroll.sickCountsWorked')}
              </label>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">{t('accounting.payroll.taxBrackets')}</p>
              {(settings.payroll_tax_brackets ?? []).map((b, i) => (
                <div key={i} className="flex flex-wrap gap-2">
                  <Input
                    className="max-w-[10rem]"
                    type="number"
                    value={String(b.up_to)}
                    onChange={(e) =>
                      setDraft((p) => {
                        const brackets = [...((p as Settings).payroll_tax_brackets ?? [])]
                        brackets[i] = { ...brackets[i], up_to: Number(e.target.value) || 0 }
                        return { ...(p as Settings), payroll_tax_brackets: brackets }
                      })
                    }
                    placeholder={t('accounting.payroll.bracketUpTo')}
                  />
                  <Input
                    className="max-w-[6rem]"
                    type="number"
                    value={String(b.rate)}
                    onChange={(e) =>
                      setDraft((p) => {
                        const brackets = [...((p as Settings).payroll_tax_brackets ?? [])]
                        brackets[i] = { ...brackets[i], rate: Number(e.target.value) || 0 }
                        return { ...(p as Settings), payroll_tax_brackets: brackets }
                      })
                    }
                    placeholder={t('accounting.payroll.bracketRate')}
                  />
                </div>
              ))}
            </div>
            <p className="text-muted-foreground text-xs">{t('accounting.payroll.taminGuide')}</p>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => void save.mutate()} disabled={save.isPending}>
            {t('common.save')}
          </Button>
          {tab === 'moadian' ? (
            <Button variant="outline" onClick={() => void test.mutate()} disabled={test.isPending}>
              {t('accounting.testConnection')}
            </Button>
          ) : null}
          {tab === 'hesabfa' ? (
            <>
              <Button variant="outline" onClick={() => void testHesabfa.mutate()} disabled={testHesabfa.isPending}>
                {t('accounting.hesabfa.test')}
              </Button>
              <Button variant="outline" onClick={() => void registerHook.mutate()} disabled={registerHook.isPending}>
                {t('accounting.hesabfa.registerHook')}
              </Button>
              <Button variant="outline" onClick={() => void syncNow.mutate()} disabled={syncNow.isPending}>
                {t('accounting.hesabfa.syncNow')}
              </Button>
              <Button variant="secondary" onClick={() => void migrate.mutate()} disabled={migrate.isPending}>
                {t('accounting.hesabfa.migrate')}
              </Button>
            </>
          ) : null}
        </div>
      </section>
    </PageShell>
  )
}
