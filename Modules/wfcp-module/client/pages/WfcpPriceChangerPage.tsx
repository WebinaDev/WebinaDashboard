import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { KeyValueList, StatusBadge } from '@/components/data/DumpUi'
import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
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
import { Textarea } from '@/components/ui/textarea'
import { translateEnum } from '@/lib/enumLabels'
import { apiFetch } from '@/lib/api'

type BpcState = {
  params?: Record<string, unknown>
  state?: Record<string, unknown>
  locked?: boolean
  last?: { run?: string; url?: string }
}

export default function WfcpPriceChangerPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [type, setType] = useState<'fixed' | 'percent'>('fixed')
  const [value, setValue] = useState('0')
  const [applySale, setApplySale] = useState(false)
  const [cats, setCats] = useState('')
  const [rules, setRules] = useState('')
  const [rulesCombine, setRulesCombine] = useState(false)
  const [rounding, setRounding] = useState(false)
  const [roundTh, setRoundTh] = useState('50000')
  const [roundVal, setRoundVal] = useState('1000')

  const st = useQuery({
    queryKey: ['wfcp', 'bpc', 'state'],
    queryFn: () => apiFetch<BpcState>('wfcp/bulk-price-change/state'),
    refetchInterval: (q) => (q.state.data?.locked ? 2500 : 5000),
  })

  const locked = Boolean(st.data?.locked)

  const cancel = useMutation({
    mutationFn: () =>
      apiFetch<{ success?: boolean }>('wfcp/bulk-price-change/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['wfcp', 'bpc', 'state'] })
      toast.success(t('wfcp.bpcCanceled', { defaultValue: 'Bulk price job canceled' }))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const start = useMutation({
    mutationFn: () =>
      apiFetch<{ success?: boolean }>('wfcp/bulk-price-change/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          value: parseFloat(value) || 0,
          apply_sale: applySale,
          category_slugs: cats,
          range_rules: rules,
          rules_combine: rulesCombine,
          enable_rounding: rounding,
          rounding_threshold: parseFloat(roundTh) || 50000,
          rounding_value: parseInt(roundVal, 10) || 1000,
        }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['wfcp', 'bpc', 'state'] })
      toast.success(t('wfcp.bpcQueued'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  return (
    <PageShell title={t('wfcp.bpcTitle')} description={t('wfcp.bpcDescription')}>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded-lg border border-border p-4">
          <div className="space-y-2">
            <Label>{t('wfcp.bpcType')}</Label>
            <Select value={type} onValueChange={(v) => setType(v as 'fixed' | 'percent')} disabled={locked}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">{translateEnum(t, "wfcp.priceMode", "fixed")}</SelectItem>
                <SelectItem value="percent">{translateEnum(t, "wfcp.priceMode", "percent")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('wfcp.bpcValue')}</Label>
            <Input value={value} onChange={(e) => setValue(e.target.value)} disabled={locked} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="bpc-apply-sale" checked={applySale} disabled={locked} onCheckedChange={(v) => setApplySale(v === true)} />
            <Label htmlFor="bpc-apply-sale" className="cursor-pointer font-normal">
              {t('wfcp.bpcApplySale')}
            </Label>
          </div>
          <div className="space-y-2">
            <Label>{t('wfcp.bpcCategories')}</Label>
            <Input value={cats} onChange={(e) => setCats(e.target.value)} disabled={locked} />
            <p className="text-xs text-muted-foreground">{t('wfcp.bpcCategoriesHint')}</p>
          </div>
          <div className="space-y-2">
            <Label>{t('wfcp.bpcRangeRules')}</Label>
            <Textarea className="min-h-20" value={rules} onChange={(e) => setRules(e.target.value)} disabled={locked} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="bpc-rules-combine" checked={rulesCombine} disabled={locked} onCheckedChange={(v) => setRulesCombine(v === true)} />
            <Label htmlFor="bpc-rules-combine" className="cursor-pointer font-normal">
              {t('wfcp.bpcRulesCombine')}
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="bpc-rounding" checked={rounding} disabled={locked} onCheckedChange={(v) => setRounding(v === true)} />
            <Label htmlFor="bpc-rounding" className="cursor-pointer font-normal">
              {t('wfcp.bpcRounding')}
            </Label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>{t('wfcp.bpcRoundTh')}</Label>
              <Input value={roundTh} onChange={(e) => setRoundTh(e.target.value)} disabled={locked} />
            </div>
            <div className="space-y-2">
              <Label>{t('wfcp.bpcRoundVal')}</Label>
              <Input value={roundVal} onChange={(e) => setRoundVal(e.target.value)} disabled={locked} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" disabled={start.isPending || locked} onClick={() => void start.mutateAsync()}>
              {t('wfcp.bpcStart')}
            </Button>
            {locked ? (
              <Button type="button" variant="outline" disabled={cancel.isPending} onClick={() => void cancel.mutateAsync()}>
                {t('wfcp.bpcCancel', { defaultValue: 'Cancel job' })}
              </Button>
            ) : null}
          </div>
        </div>
        <div className="rounded-lg border border-border p-4">
          <h3 className="text-sm font-medium">{t('wfcp.bpcStateTitle')}</h3>
          <div className="mt-2 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge
                status={locked ? 'locked' : 'idle'}
                tone={locked ? 'warning' : 'secondary'}
              />
              {st.data?.last?.run ? (
                <span className="text-muted-foreground text-xs">{String(st.data.last.run)}</span>
              ) : null}
            </div>
            <KeyValueList
              emptyLabel={t('common.empty')}
              rows={[
                ...Object.entries(st.data?.state ?? {}).map(([k, v]) => ({
                  label: k,
                  value: String(v ?? '—'),
                })),
                ...Object.entries(st.data?.params ?? {})
                  .slice(0, 8)
                  .map(([k, v]) => ({
                    label: `param.${k}`,
                    value: typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v ?? '—'),
                  })),
              ]}
            />
          </div>
        </div>
      </div>
    </PageShell>
  )
}
