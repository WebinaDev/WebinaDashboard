import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type Cond = { type: string; value: string | number }
type Action = { type: string; method_id: string; value: string | number }
type Rule = {
  id: string
  enabled: boolean
  priority: number
  title: string
  conditions: Cond[]
  actions: Action[]
}

const COND_TYPES = [
  'state',
  'city',
  'district',
  'product',
  'category',
  'shipping_class',
  'role',
  'payment_method',
  'weight_min',
  'weight_max',
  'cart_total_min',
  'cart_total_max',
  'item_count_min',
] as const

const ACTION_TYPES = ['hide_method', 'force_method', 'set_cost', 'free', 'set_title'] as const

function newRule(): Rule {
  return {
    id: `r_${Date.now()}`,
    enabled: true,
    priority: 10,
    title: '',
    conditions: [{ type: 'cart_total_min', value: 0 }],
    actions: [{ type: 'free', method_id: '', value: 0 }],
  }
}

function patchRule(rules: Rule[], idx: number, patch: Partial<Rule>): Rule[] {
  const next = rules.slice()
  next[idx] = { ...rules[idx], ...patch }
  return next
}

export default function RulesSettingsPage() {
  const { t } = useTranslation()
  const [rules, setRules] = useState<Rule[]>([])
  const q = useQuery({
    queryKey: ['shipping-rules'],
    queryFn: () => apiFetch<{ rules: Rule[] }>('shipping/rules'),
  })
  useQueryErrorToast(q)
  useEffect(() => {
    if (q.data?.rules) setRules(q.data.rules)
  }, [q.data])

  const save = useMutation({
    mutationFn: (next: Rule[]) =>
      apiFetch('shipping/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules: next }),
      }),
    onSuccess: () => toast.success(t('common.saved')),
    onError: (e: Error) => toastApiError(t, e),
  })

  return (
    <PageShell title={t('shipping.rulesTitle')} description={t('shipping.rulesHint')}>
      <div className="mb-4 flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={() => setRules((r) => [...r, newRule()])}>
          {t('shipping.addRule')}
        </Button>
        <Button type="button" disabled={save.isPending} onClick={() => save.mutate(rules)}>
          {t('common.save')}
        </Button>
      </div>
      <div className="space-y-4">
        {rules.map((rule, idx) => (
          <Card key={rule.id} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-base">{rule.title || t('shipping.ruleN', { n: idx + 1 })}</CardTitle>
              <div className="flex items-center gap-2">
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={(v) => setRules(patchRule(rules, idx, { enabled: v }))}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setRules(rules.filter((_, i) => i !== idx))}
                >
                  {t('common.delete')}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{t('shipping.ruleTitle')}</Label>
                  <Input
                    value={rule.title}
                    onChange={(e) => setRules(patchRule(rules, idx, { title: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('shipping.rulePriority')}</Label>
                  <Input
                    type="number"
                    dir="ltr"
                    value={rule.priority}
                    onChange={(e) =>
                      setRules(patchRule(rules, idx, { priority: parseInt(e.target.value, 10) || 0 }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label>{t('shipping.conditions')}</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setRules(
                        patchRule(rules, idx, {
                          conditions: [...rule.conditions, { type: 'cart_total_min', value: 0 }],
                        })
                      )
                    }
                  >
                    {t('shipping.addCondition')}
                  </Button>
                </div>
                {(rule.conditions.length ? rule.conditions : [{ type: 'cart_total_min', value: '' }]).map(
                  (cond, cIdx) => (
                    <div key={`${rule.id}-c-${cIdx}`} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                      <Select
                        value={cond.type || 'cart_total_min'}
                        onValueChange={(v) => {
                          const conditions = rule.conditions.slice()
                          conditions[cIdx] = { ...cond, type: v }
                          setRules(patchRule(rules, idx, { conditions }))
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COND_TYPES.map((x) => (
                            <SelectItem key={x} value={x}>
                              {x}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        dir="ltr"
                        value={String(cond.value ?? '')}
                        onChange={(e) => {
                          const conditions = rule.conditions.slice()
                          conditions[cIdx] = { ...cond, value: e.target.value }
                          setRules(patchRule(rules, idx, { conditions }))
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={rule.conditions.length <= 1}
                        onClick={() =>
                          setRules(
                            patchRule(rules, idx, {
                              conditions: rule.conditions.filter((_, i) => i !== cIdx),
                            })
                          )
                        }
                      >
                        {t('common.delete')}
                      </Button>
                    </div>
                  )
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label>{t('shipping.actions')}</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setRules(
                        patchRule(rules, idx, {
                          actions: [...rule.actions, { type: 'free', method_id: '', value: 0 }],
                        })
                      )
                    }
                  >
                    {t('shipping.addAction')}
                  </Button>
                </div>
                {(rule.actions.length ? rule.actions : [{ type: 'free', method_id: '', value: '' }]).map(
                  (act, aIdx) => (
                    <div key={`${rule.id}-a-${aIdx}`} className="grid gap-2 sm:grid-cols-4">
                      <Select
                        value={act.type || 'free'}
                        onValueChange={(v) => {
                          const actions = rule.actions.slice()
                          actions[aIdx] = { ...act, type: v }
                          setRules(patchRule(rules, idx, { actions }))
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ACTION_TYPES.map((x) => (
                            <SelectItem key={x} value={x}>
                              {x}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        dir="ltr"
                        placeholder="webino_tapin_pishtaz"
                        value={act.method_id || ''}
                        onChange={(e) => {
                          const actions = rule.actions.slice()
                          actions[aIdx] = { ...act, method_id: e.target.value }
                          setRules(patchRule(rules, idx, { actions }))
                        }}
                      />
                      <Input
                        dir="ltr"
                        value={String(act.value ?? '')}
                        onChange={(e) => {
                          const actions = rule.actions.slice()
                          actions[aIdx] = { ...act, value: e.target.value }
                          setRules(patchRule(rules, idx, { actions }))
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={rule.actions.length <= 1}
                        onClick={() =>
                          setRules(
                            patchRule(rules, idx, {
                              actions: rule.actions.filter((_, i) => i !== aIdx),
                            })
                          )
                        }
                      >
                        {t('common.delete')}
                      </Button>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  )
}
