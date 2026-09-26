import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type Settings = Record<string, unknown> & {
  taxpayer_type?: string
  tax_file_tracking_code?: string
  inta_code?: string
  inta_profit_ratio?: number
  inta_vat_liable?: boolean
  corporate_tax_rate?: number
  vat_regime?: string
  company_name?: string
  economic_code?: string
  national_id?: string
  postal_code?: string
  fiscal_id?: string
  has_private_key?: boolean
  moadian_transport?: string
  tsp_base_url?: string
  default_vat_rate?: number
  wizard_done?: boolean
  setup_wizard_step?: number
}

type IntaRow = {
  code: string
  title: string
  profit_ratio: number | string
  vat_liable: number | string
}

const STEPS = 6

export default function TaxSetupWizardPage() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const qc = useQueryClient()
  const [step, setStep] = useState(1)
  const [intaQ, setIntaQ] = useState('')
  const [form, setForm] = useState<Partial<Settings>>({})
  const [privateKey, setPrivateKey] = useState('')
  const [tspKey, setTspKey] = useState('')

  const settingsQ = useQuery({
    queryKey: ['accounting', 'settings'],
    queryFn: () => apiFetch<Settings>('accounting/settings'),
  })

  const ratesQ = useQuery({
    queryKey: ['accounting', 'tax', 'rates'],
    queryFn: () => apiFetch<{ rate: { vat_general?: number; label?: string } | null }>('accounting/tax/rates'),
  })

  const intaSearch = useQuery({
    queryKey: ['accounting', 'tax', 'intacodes', intaQ],
    queryFn: () => apiFetch<{ items: IntaRow[] }>(`accounting/tax/intacodes?q=${encodeURIComponent(intaQ)}`),
    enabled: step === 4,
  })

  const merged = useMemo(() => ({ ...(settingsQ.data ?? {}), ...form }), [settingsQ.data, form])

  const saveMut = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch<Settings>('accounting/settings', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['accounting', 'settings'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const testMut = useMutation({
    mutationFn: () => apiFetch<{ ok?: boolean }>('accounting/test-connection', { method: 'POST', body: '{}' }),
    onSuccess: () => toast.success(t('accounting.testSuccess')),
    onError: (e: Error) => toastApiError(t, e),
  })

  function patch(p: Partial<Settings>) {
    setForm((f) => ({ ...f, ...p }))
  }

  async function persistPartial(extra: Record<string, unknown> = {}) {
    const body: Record<string, unknown> = {
      taxpayer_type: merged.taxpayer_type,
      tax_file_tracking_code: merged.tax_file_tracking_code,
      inta_code: merged.inta_code,
      inta_profit_ratio: merged.inta_profit_ratio,
      inta_vat_liable: merged.inta_vat_liable,
      corporate_tax_rate: merged.corporate_tax_rate,
      vat_regime: merged.vat_regime,
      company_name: merged.company_name,
      economic_code: merged.economic_code,
      national_id: merged.national_id,
      postal_code: merged.postal_code,
      fiscal_id: merged.fiscal_id,
      moadian_transport: merged.moadian_transport ?? 'direct',
      tsp_base_url: merged.tsp_base_url,
      default_vat_rate: merged.default_vat_rate,
      setup_wizard_step: step,
      ...extra,
    }
    if (privateKey.trim()) body.private_key = privateKey
    if (tspKey.trim()) body.tsp_api_key = tspKey
    await saveMut.mutateAsync(body)
  }

  async function next() {
    try {
      if (step === STEPS) {
        const vat =
          ratesQ.data?.rate?.vat_general ??
          Number(merged.default_vat_rate ?? 10)
        await persistPartial({ wizard_done: true, default_vat_rate: vat, setup_wizard_step: STEPS })
        toast.success(t('accounting.taxWizard.done'))
        nav('/accounting/tax')
        return
      }
      await persistPartial({ setup_wizard_step: step + 1 })
      setStep((s) => s + 1)
    } catch {
      /* toasted */
    }
  }

  return (
    <PageShell title={t('accounting.taxWizard.title')}>
      <p className="text-muted-foreground mb-4 text-sm">{t('accounting.taxWizard.subtitle')}</p>
      <p className="mb-4 text-xs text-muted-foreground">
        {t('accounting.taxWizard.stepOf', { step, total: STEPS })}
      </p>

      {step === 1 ? (
        <div className="max-w-md space-y-3">
          <Label>{t('accounting.taxWizard.taxpayerType')}</Label>
          <Select
            value={(merged.taxpayer_type as string) || undefined}
            onValueChange={(v) => patch({ taxpayer_type: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('accounting.taxWizard.taxpayerType')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">{t('accounting.taxWizard.individual')}</SelectItem>
              <SelectItem value="corporate">{t('accounting.taxWizard.corporate')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="grid max-w-xl gap-3 sm:grid-cols-2">
          {(
            [
              ['company_name', 'accounting.taxWizard.company'],
              ['economic_code', 'accounting.taxWizard.economic'],
              ['national_id', 'accounting.taxWizard.nationalId'],
              ['postal_code', 'accounting.taxWizard.postal'],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="space-y-1.5">
              <Label>{t(label)}</Label>
              <Input
                dir="ltr"
                value={String(merged[key] ?? '')}
                onChange={(e) => patch({ [key]: e.target.value })}
              />
            </div>
          ))}
        </div>
      ) : null}

      {step === 3 ? (
        <div className="max-w-md space-y-1.5">
          <Label>{t('accounting.taxWizard.tracking')}</Label>
          <Input
            dir="ltr"
            value={String(merged.tax_file_tracking_code ?? '')}
            onChange={(e) => patch({ tax_file_tracking_code: e.target.value })}
          />
        </div>
      ) : null}

      {step === 4 ? (
        <div className="max-w-xl space-y-3">
          <div className="space-y-1.5">
            <Label>{t('accounting.taxWizard.intaSearch')}</Label>
            <Input value={intaQ} onChange={(e) => setIntaQ(e.target.value)} placeholder="…" />
          </div>
          <div className="max-h-48 overflow-auto rounded-md border text-sm">
            {(intaSearch.data?.items ?? []).map((row) => (
              <button
                key={row.code}
                type="button"
                className="hover:bg-muted block w-full border-b px-3 py-2 text-start last:border-0"
                onClick={() =>
                  patch({
                    inta_code: row.code,
                    inta_profit_ratio: Number(row.profit_ratio),
                    inta_vat_liable: Boolean(Number(row.vat_liable)),
                    vat_regime: Number(row.vat_liable) ? 'standard' : 'exempt',
                  })
                }
              >
                <span className="font-mono" dir="ltr">
                  {row.code}
                </span>{' '}
                — {row.title}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>{t('accounting.taxWizard.intaCode')}</Label>
              <Input
                dir="ltr"
                value={String(merged.inta_code ?? '')}
                onChange={(e) => patch({ inta_code: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('accounting.taxWizard.profitRatio')}</Label>
              <Input
                type="number"
                dir="ltr"
                value={String(merged.inta_profit_ratio ?? '')}
                onChange={(e) => patch({ inta_profit_ratio: Number(e.target.value) })}
              />
            </div>
            {merged.taxpayer_type === 'corporate' ? (
              <div className="space-y-1.5">
                <Label>{t('accounting.taxWizard.corporateRate')}</Label>
                <Input
                  type="number"
                  dir="ltr"
                  value={String(merged.corporate_tax_rate ?? 25)}
                  onChange={(e) => patch({ corporate_tax_rate: Number(e.target.value) })}
                />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {step === 5 ? (
        <div className="max-w-xl space-y-3">
          <div className="space-y-1.5">
            <Label>{t('accounting.taxWizard.transport')}</Label>
            <Select
              value={(merged.moadian_transport as string) || 'direct'}
              onValueChange={(v) => patch({ moadian_transport: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct">{t('accounting.taxWizard.transportDirect')}</SelectItem>
                <SelectItem value="tsp">{t('accounting.taxWizard.transportTsp')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t('accounting.fiscalId')}</Label>
            <Input
              dir="ltr"
              value={String(merged.fiscal_id ?? '')}
              onChange={(e) => patch({ fiscal_id: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t('accounting.privateKey')}</Label>
            <textarea
              className="border-input bg-background min-h-28 w-full rounded-md border px-3 py-2 font-mono text-xs"
              dir="ltr"
              placeholder={merged.has_private_key ? '•••• (set to replace)' : '-----BEGIN PRIVATE KEY-----'}
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
            />
          </div>
          {merged.moadian_transport === 'tsp' ? (
            <>
              <div className="space-y-1.5">
                <Label>{t('accounting.taxWizard.tspUrl')}</Label>
                <Input
                  dir="ltr"
                  value={String(merged.tsp_base_url ?? '')}
                  onChange={(e) => patch({ tsp_base_url: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t('accounting.taxWizard.tspKey')}</Label>
                <Input
                  type="password"
                  dir="ltr"
                  value={tspKey}
                  onChange={(e) => setTspKey(e.target.value)}
                />
              </div>
            </>
          ) : null}
          <Button type="button" variant="outline" disabled={testMut.isPending} onClick={() => testMut.mutate()}>
            {t('accounting.testConnection')}
          </Button>
        </div>
      ) : null}

      {step === 6 ? (
        <div className="max-w-lg space-y-2 text-sm">
          <p>
            {t('accounting.taxWizard.summaryVat')}:{' '}
            <strong dir="ltr">{ratesQ.data?.rate?.vat_general ?? merged.default_vat_rate ?? 10}%</strong>
            {ratesQ.data?.rate?.label ? ` (${ratesQ.data.rate.label})` : null}
          </p>
          <p>
            {t('accounting.taxWizard.taxpayerType')}:{' '}
            {merged.taxpayer_type === 'corporate'
              ? t('accounting.taxWizard.corporate')
              : t('accounting.taxWizard.individual')}
          </p>
          <p>
            {t('accounting.taxWizard.intaCode')}: <span dir="ltr">{String(merged.inta_code || '—')}</span>
          </p>
          <p className="text-muted-foreground text-xs">{t('accounting.taxWizard.disclaimer')}</p>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2">
        {step > 1 ? (
          <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>
            {t('common.back')}
          </Button>
        ) : (
          <Button type="button" variant="ghost" asChild>
            <Link to="/accounting/overview">{t('common.cancel')}</Link>
          </Button>
        )}
        <Button type="button" disabled={saveMut.isPending} onClick={() => void next()}>
          {step === STEPS ? t('accounting.taxWizard.finish') : t('common.next')}
        </Button>
      </div>
    </PageShell>
  )
}
