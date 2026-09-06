import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { toastApiError } from '@/lib/apiError'
import {
  deleteFirewallRule,
  fetchFirewallRules,
  patchFirewallRule,
  promoteLearningRule,
  saveFirewallRule,
  testFirewallRule,
} from '../lib/security-api'
import { SecurityShell } from './SecurityShell'

export default function SecurityFirewallRulesPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()

  const [name, setName] = useState('')
  const [pathContains, setPathContains] = useState('')
  const [action, setAction] = useState('block')
  const [learning, setLearning] = useState(false)
  const [testRuleJson, setTestRuleJson] = useState(
    '{"action":"block","conditions":[{"field":"path","op":"contains","value":"/wp-login.php"}]}'
  )
  const [testRequestJson, setTestRequestJson] = useState('{"path":"/wp-login.php","payload":""}')
  const [testResult, setTestResult] = useState<string | null>(null)

  const rulesQ = useQuery({
    queryKey: ['security', 'firewall', 'rules'],
    queryFn: fetchFirewallRules,
  })
  useQueryErrorToast(rulesQ)

  const create = useMutation({
    mutationFn: () =>
      saveFirewallRule({
        name: name || 'Custom rule',
        action,
        enabled: 1,
        learning: learning ? 1 : 0,
        priority: 100,
        conditions: pathContains
          ? [{ field: 'path', op: 'contains', value: pathContains }]
          : [],
      }),
    onSuccess: () => {
      toast.success(t('security.ruleCreated'))
      setName('')
      setPathContains('')
      void qc.invalidateQueries({ queryKey: ['security', 'firewall', 'rules'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const toggle = useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      patchFirewallRule({ id, enabled: enabled ? 1 : 0 }),
    onSuccess: () => {
      toast.success(t('security.ruleUpdated'))
      void qc.invalidateQueries({ queryKey: ['security', 'firewall', 'rules'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const remove = useMutation({
    mutationFn: (id: number) => deleteFirewallRule(id),
    onSuccess: () => {
      toast.success(t('security.ruleDeleted'))
      void qc.invalidateQueries({ queryKey: ['security', 'firewall', 'rules'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const promote = useMutation({
    mutationFn: (ruleId: string) => promoteLearningRule(ruleId),
    onSuccess: () => {
      toast.success(t('security.rulePromoted'))
      void qc.invalidateQueries({ queryKey: ['security', 'firewall', 'rules'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const test = useMutation({
    mutationFn: async () => {
      let rule: Record<string, unknown> = {}
      let request: Record<string, unknown> = {}
      try {
        rule = JSON.parse(testRuleJson) as Record<string, unknown>
        request = JSON.parse(testRequestJson) as Record<string, unknown>
      } catch {
        throw new Error(t('security.invalidJson'))
      }
      return testFirewallRule({ rule, request })
    },
    onSuccess: (data) => {
      setTestResult(JSON.stringify(data, null, 2))
      toast.success(t('security.ruleTestDone'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const items = rulesQ.data?.items ?? []

  return (
    <div className="space-y-4">
      <SecurityShell />

      <Card>
        <CardHeader>
          <CardTitle>{t('security.createRuleTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <Label htmlFor="rule-name">{t('security.col.name')}</Label>
            <Input id="rule-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="rule-path">{t('security.pathContains')}</Label>
            <Input
              id="rule-path"
              value={pathContains}
              onChange={(e) => setPathContains(e.target.value)}
              placeholder="/evil"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="rule-action">{t('security.col.action')}</Label>
            <Input id="rule-action" value={action} onChange={(e) => setAction(e.target.value)} />
          </div>
          <div className="flex items-end gap-3">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={learning} onCheckedChange={setLearning} />
              {t('security.learningMode')}
            </label>
            <Button
              disabled={create.isPending || !pathContains}
              onClick={() => void create.mutateAsync()}
            >
              {t('security.createRule')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('security.rulesTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0 sm:p-6">
          {rulesQ.isPending ? (
            <div className="p-6">
              <Skeleton className="h-48 w-full" />
            </div>
          ) : items.length === 0 ? (
            <div className="space-y-2 p-6">
              <p className="text-sm text-muted-foreground">{t('security.noRules')}</p>
              <p className="text-sm text-muted-foreground">{t('security.noRulesHint')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('security.col.name')}</TableHead>
                  <TableHead>{t('security.col.ruleId')}</TableHead>
                  <TableHead>{t('security.col.action')}</TableHead>
                  <TableHead>{t('security.col.priority')}</TableHead>
                  <TableHead>{t('security.col.enabled')}</TableHead>
                  <TableHead className="text-right">{t('security.col.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((rule) => {
                  const enabled = Boolean(rule.enabled)
                  const isLearning = Boolean(rule.learning)
                  return (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.name || rule.rule_id}</TableCell>
                      <TableCell className="font-mono text-xs">{rule.rule_id}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{rule.action}</Badge>
                      </TableCell>
                      <TableCell>{rule.priority}</TableCell>
                      <TableCell>
                        <Switch
                          checked={enabled}
                          disabled={toggle.isPending}
                          onCheckedChange={(checked) =>
                            void toggle.mutateAsync({ id: rule.id, enabled: checked })
                          }
                          aria-label={t('security.col.enabled')}
                        />
                      </TableCell>
                      <TableCell className="space-x-1 text-right">
                        {isLearning ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={promote.isPending}
                            onClick={() => void promote.mutateAsync(rule.rule_id)}
                          >
                            {t('security.promoteLearning')}
                          </Button>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={remove.isPending}
                          onClick={() => void remove.mutateAsync(rule.id)}
                        >
                          {t('security.delete')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('security.testRuleTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="test-rule">{t('security.testRuleJson')}</Label>
              <Textarea
                id="test-rule"
                rows={5}
                className="font-mono text-xs"
                value={testRuleJson}
                onChange={(e) => setTestRuleJson(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="test-req">{t('security.testRequestJson')}</Label>
              <Textarea
                id="test-req"
                rows={5}
                className="font-mono text-xs"
                value={testRequestJson}
                onChange={(e) => setTestRequestJson(e.target.value)}
              />
            </div>
          </div>
          <Button disabled={test.isPending} onClick={() => void test.mutateAsync()}>
            {t('security.runTest')}
          </Button>
          {testResult ? (
            <pre className="max-h-64 overflow-auto rounded-md border bg-muted/40 p-3 text-xs">{testResult}</pre>
          ) : null}
          <Button asChild variant="link" className="px-0">
            <Link to="/security/firewall/live">{t('security.navFirewall')}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
