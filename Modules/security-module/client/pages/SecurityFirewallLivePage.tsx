import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { fetchFirewallLive } from '../lib/security-api'
import { SecurityShell } from './SecurityShell'

const ACTIONS = ['all', 'block', 'challenge', 'log', 'allow'] as const

export default function SecurityFirewallLivePage() {
  const { t, i18n } = useTranslation()
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [pathFilter, setPathFilter] = useState('')

  const liveQ = useQuery({
    queryKey: ['security', 'firewall', 'live'],
    queryFn: () => fetchFirewallLive({ seconds: 300 }),
    refetchInterval: 3000,
  })
  useQueryErrorToast(liveQ)

  const filtered = useMemo(() => {
    let rows = liveQ.data?.events ?? []
    if (actionFilter !== 'all') {
      rows = rows.filter((e) => e.action === actionFilter)
    }
    if (pathFilter.trim()) {
      const q = pathFilter.trim().toLowerCase()
      rows = rows.filter((e) => e.path.toLowerCase().includes(q))
    }
    return rows
  }, [liveQ.data?.events, actionFilter, pathFilter])

  const fmtTime = (iso: string) => {
    try {
      return new Intl.DateTimeFormat(i18n.language, { timeStyle: 'medium' }).format(new Date(iso))
    } catch {
      return iso
    }
  }

  return (
    <div className="space-y-4">
      <SecurityShell />

      <Card>
        <CardHeader>
          <CardTitle>{t('security.liveTrafficTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 overflow-x-auto">
          <div className="flex flex-wrap gap-4">
            <div className="space-y-1">
              <Label>{t('security.filterAction')}</Label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTIONS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a === 'all' ? t('security.filterAll') : t(`security.action.${a}`, { defaultValue: a })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[200px] flex-1 space-y-1">
              <Label htmlFor="path-filter">{t('security.filterPath')}</Label>
              <Input
                id="path-filter"
                value={pathFilter}
                onChange={(e) => setPathFilter(e.target.value)}
                placeholder="/wp-login.php"
              />
            </div>
          </div>

          {liveQ.isPending ? (
            <Skeleton className="h-64 w-full" />
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('security.noLiveEvents')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('security.col.time')}</TableHead>
                  <TableHead>{t('security.col.action')}</TableHead>
                  <TableHead>{t('security.col.method')}</TableHead>
                  <TableHead>{t('security.col.path')}</TableHead>
                  <TableHead>{t('security.col.rule')}</TableHead>
                  <TableHead>{t('security.col.country')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((ev) => (
                  <TableRow key={ev.id}>
                    <TableCell className="whitespace-nowrap text-xs">{fmtTime(ev.created_at)}</TableCell>
                    <TableCell>
                      <Badge variant={ev.action === 'block' ? 'destructive' : 'secondary'} className="text-xs">
                        {t(`security.action.${ev.action}`, { defaultValue: ev.action })}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{ev.method}</TableCell>
                    <TableCell className="max-w-[240px] truncate font-mono text-xs" title={ev.path}>
                      {ev.path}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{ev.rule_id || '—'}</TableCell>
                    <TableCell>{ev.country || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
