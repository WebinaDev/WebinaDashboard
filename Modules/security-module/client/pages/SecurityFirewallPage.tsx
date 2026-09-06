import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { fetchFirewallStatus, fetchSecurityOverview } from '../lib/security-api'
import { SecurityShell } from './SecurityShell'

export default function SecurityFirewallPage() {
  const { t } = useTranslation()

  const statusQ = useQuery({
    queryKey: ['security', 'firewall', 'status'],
    queryFn: fetchFirewallStatus,
  })
  useQueryErrorToast(statusQ)

  const overviewQ = useQuery({
    queryKey: ['security', 'overview'],
    queryFn: fetchSecurityOverview,
  })
  useQueryErrorToast(overviewQ)

  const s = statusQ.data
  const layers = Object.entries(s?.layers ?? {})

  return (
    <div className="space-y-4">
      <SecurityShell />

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link to="/security/firewall/live">{t('security.liveTrafficTitle')}</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/security/firewall/rules">{t('security.rulesTitle')}</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/security/firewall/blocking">{t('security.blockingTitle')}</Link>
        </Button>
      </div>

      {statusQ.isPending ? (
        <Skeleton className="h-40 w-full rounded-xl" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('security.firewall.enabled')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={s?.enabled ? 'default' : 'secondary'}>
                {s?.enabled ? t('security.yes') : t('security.no')}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('security.kpi.wafMode')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="capitalize">
                {t(`security.wafMode.${s?.mode ?? 'learning'}`, { defaultValue: s?.mode ?? '—' })}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('security.kpi.blocks24h')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tabular-nums">{overviewQ.data?.blocks_24h ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('security.firewall.bypass')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={s?.disabled ? 'destructive' : 'secondary'}>
                {s?.disabled ? t('security.firewall.bypassActive') : t('security.firewall.bypassOff')}
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('security.firewall.layers')}</CardTitle>
        </CardHeader>
        <CardContent>
          {statusQ.isPending ? (
            <Skeleton className="h-24 w-full" />
          ) : layers.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('security.firewall.noLayers')}</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {layers.map(([key, val]) => (
                <li key={key} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <span className="font-mono text-xs">{key}</span>
                  <Badge variant={val ? 'default' : 'outline'}>
                    {typeof val === 'boolean' ? (val ? t('security.active') : t('security.inactive')) : String(val)}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
