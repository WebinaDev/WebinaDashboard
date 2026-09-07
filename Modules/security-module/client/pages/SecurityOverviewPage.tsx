import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import {
  fetchAuditLog,
  fetchFeeds,
  fetchFindings,
  fetchIncidents,
  fetchSecurityDiagnostics,
  fetchSecurityOverview,
} from '../lib/security-api'
import { SecurityShell } from './SecurityShell'

const SEVERITIES = ['critical', 'high', 'medium', 'low', 'info'] as const

function scoreTone(score: number) {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-amber-600'
  return 'text-red-600'
}

export default function SecurityOverviewPage() {
  const { t, i18n } = useTranslation()

  const overviewQ = useQuery({
    queryKey: ['security', 'overview'],
    queryFn: fetchSecurityOverview,
    refetchInterval: 30_000,
  })
  useQueryErrorToast(overviewQ)

  const findingsQ = useQuery({
    queryKey: ['security', 'findings', 'open'],
    queryFn: () => fetchFindings({ status: 'open' }),
  })
  useQueryErrorToast(findingsQ)

  const feedsQ = useQuery({
    queryKey: ['security', 'feeds'],
    queryFn: fetchFeeds,
  })
  useQueryErrorToast(feedsQ)

  const diagQ = useQuery({
    queryKey: ['security', 'diagnostics'],
    queryFn: fetchSecurityDiagnostics,
  })
  useQueryErrorToast(diagQ)

  const incidentsQ = useQuery({
    queryKey: ['security', 'incidents'],
    queryFn: fetchIncidents,
    refetchInterval: 60_000,
  })
  useQueryErrorToast(incidentsQ)

  const auditQ = useQuery({
    queryKey: ['security', 'audit'],
    queryFn: fetchAuditLog,
  })
  useQueryErrorToast(auditQ)

  const o = overviewQ.data

  // Incidents: prefer overview field, fall back to full incidents list count.
  const openIncidents: number =
    (o as any)?.open_incidents ??
    (incidentsQ.data?.items ?? []).filter((i: any) => i.status === 'open').length

  // Suggested actions: prefer overview field, fall back to derived list.
  const suggestedActions: string[] = (o as any)?.suggested_actions ?? []

  const severityCounts = SEVERITIES.reduce(
    (acc, sev) => {
      acc[sev] = (findingsQ.data?.items ?? []).filter((f) => f.severity === sev).length
      return acc
    },
    {} as Record<string, number>,
  )

  const staleFeeds = (feedsQ.data?.feeds ?? []).filter((f) => f.last_error).length
  const showWizard = diagQ.data?.wizard === true

  const fmtDate = (iso: string | null | undefined) => {
    if (!iso) return t('security.never')
    try {
      return new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeStyle: 'short' }).format(
        new Date(iso),
      )
    } catch {
      return iso
    }
  }

  return (
    <div className="space-y-4">
      <SecurityShell />

      {showWizard ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('security.wizardTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">{t('security.wizardHint')}</p>
            <Button asChild size="sm">
              <Link to="/security/settings">{t('security.wizardCta')}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {overviewQ.isPending ? (
        <Skeleton className="h-32 w-full rounded-xl" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('security.kpi.score')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-semibold tabular-nums ${scoreTone(o?.score ?? 0)}`}>
                {o?.score ?? 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('security.kpi.blocks24h')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tabular-nums">{o?.blocks_24h ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('security.kpi.openFindings')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tabular-nums">{o?.open_findings ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('security.kpi.wafMode')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="text-sm capitalize">
                {t(`security.wafMode.${o?.waf_mode ?? 'learning'}`, { defaultValue: o?.waf_mode ?? '—' })}
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('security.lastScanTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {overviewQ.isPending ? (
              <Skeleton className="h-16 w-full" />
            ) : o?.last_scan ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{o.last_scan.profile}</Badge>
                  <Badge variant="outline">
                    {t(`security.scanStatus.${o.last_scan.status}`, { defaultValue: o.last_scan.status })}
                  </Badge>
                  <span className="text-muted-foreground">
                    {t('security.findingsCount', { count: o.last_scan.findings_count })}
                  </span>
                </div>
                <p className="text-muted-foreground">{fmtDate(o.last_scan.finished_at ?? o.last_scan.created_at)}</p>
                <Button asChild variant="link" className="h-auto p-0">
                  <Link to={`/security/scan/${o.last_scan.id}`}>{t('security.viewScan')}</Link>
                </Button>
              </>
            ) : (
              <div className="space-y-2">
                <p className="text-muted-foreground">{t('security.noScanYet')}</p>
                <Button asChild size="sm">
                  <Link to="/security/scan">{t('security.startFirstScan', { defaultValue: 'Run your first scan' })}</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('security.findingsBySeverity')}</CardTitle>
          </CardHeader>
          <CardContent>
            {findingsQ.isPending ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="flex flex-wrap gap-2">
                {SEVERITIES.map((sev) => (
                  <Link key={sev} to="/security/scan" className="block">
                    <Badge
                      variant={severityCounts[sev] > 0 ? 'destructive' : 'secondary'}
                      className="cursor-pointer capitalize"
                    >
                      {t(`security.severity.${sev}`)}: {severityCounts[sev]}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>{t('security.feedFreshness')}</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link to="/security/settings">{t('security.manageFeeds')}</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {feedsQ.isPending ? (
            <Skeleton className="h-12 w-full" />
          ) : (feedsQ.data?.feeds ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('security.noFeeds')}</p>
          ) : (
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                {t('security.feedSummary', {
                  total: feedsQ.data?.feeds.length ?? 0,
                  stale: staleFeeds,
                })}
              </p>
              <ul className="grid gap-1 sm:grid-cols-2">
                {(feedsQ.data?.feeds ?? []).slice(0, 6).map((feed) => (
                  <li key={feed.feed_id} className="flex items-center justify-between gap-2 rounded-md border px-2 py-1">
                    <span className="truncate font-mono text-xs">{feed.feed_id}</span>
                    {feed.last_error ? (
                      <Badge variant="destructive" className="shrink-0 text-xs">
                        {t('security.feedStale')}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        {t('security.feedOk')}
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Incidents card */}
      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>{t('security.incidentsTitle', { defaultValue: 'Open Incidents' })}</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/security/tools/incident">{t('security.viewIncidents', { defaultValue: 'View all' })}</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {incidentsQ.isPending ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <div className="flex items-center gap-3">
                <span
                  className={`text-3xl font-semibold tabular-nums ${
                    openIncidents > 0 ? 'text-red-600' : 'text-emerald-600'
                  }`}
                >
                  {openIncidents}
                </span>
                <span className="text-sm text-muted-foreground">
                  {openIncidents === 1
                    ? t('security.incidentOpen', { defaultValue: 'open incident' })
                    : t('security.incidentsOpen', { defaultValue: 'open incidents' })}
                </span>
              </div>
            )}
            {(incidentsQ.data?.items ?? []).slice(0, 3).map((inc: any) => (
              <div
                key={inc.id}
                className="mt-2 flex items-center justify-between gap-2 rounded-md border px-2 py-1 text-sm"
              >
                <span className="truncate">{inc.title ?? `Incident #${inc.id}`}</span>
                <Badge
                  variant={inc.severity === 'critical' ? 'destructive' : 'secondary'}
                  className="shrink-0 text-xs capitalize"
                >
                  {inc.severity ?? 'unknown'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Suggested heal actions card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>{t('security.suggestedActions', { defaultValue: 'Suggested Actions' })}</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/security/tools/heal-wizard">{t('security.healWizard', { defaultValue: 'Heal Wizard' })}</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {overviewQ.isPending ? (
              <Skeleton className="h-12 w-full" />
            ) : suggestedActions.length === 0 ? (
              <p className="text-sm text-emerald-600">
                {t('security.noActions', { defaultValue: 'No immediate actions required.' })}
              </p>
            ) : (
              <ul className="space-y-1">
                {suggestedActions.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Audit log card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>{t('security.auditTitle', { defaultValue: 'Audit log' })}</CardTitle>
        </CardHeader>
        <CardContent>
          {auditQ.isPending ? (
            <Skeleton className="h-24 w-full" />
          ) : (auditQ.data?.items ?? []).length === 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t('security.auditEmpty', { defaultValue: 'No audit events yet.' })}</p>
              <Button asChild size="sm" variant="outline">
                <Link to="/security/settings">{t('security.auditEmptyCta', { defaultValue: 'Configure security settings' })}</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('security.col.time')}</TableHead>
                    <TableHead>{t('security.col.action')}</TableHead>
                    <TableHead>{t('security.col.path')}</TableHead>
                    <TableHead>{t('security.col.user', { defaultValue: 'User' })}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(auditQ.data?.items ?? []).slice(0, 10).map((entry, idx) => (
                    <TableRow key={String((entry as Record<string, unknown>).id ?? idx)}>
                      <TableCell className="text-xs">{String((entry as Record<string, unknown>).created_at ?? '—')}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {String((entry as Record<string, unknown>).action ?? (entry as Record<string, unknown>).event ?? '—')}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate font-mono text-xs">
                        {String((entry as Record<string, unknown>).object_id ?? (entry as Record<string, unknown>).path ?? '—')}
                      </TableCell>
                      <TableCell className="text-xs">
                        {String((entry as Record<string, unknown>).user_login ?? (entry as Record<string, unknown>).user_id ?? '—')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link to="/security/firewall">{t('security.navFirewall')}</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/security/scan">{t('security.navScan')}</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/security/reports">{t('security.navReports')}</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/security/settings">{t('security.navSettings')}</Link>
        </Button>
      </div>
    </div>
  )
}
