import { AlertTriangle, Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDisplayDate } from '@/lib/date'
import type { DashboardOverviewAlert } from '@/types/dashboardOverview'

type HomeAlertsPanelProps = {
  alerts: DashboardOverviewAlert[]
  locale: string
}

function AlertIcon({ level }: { level: DashboardOverviewAlert['level'] }) {
  if (level === 'error') {
    return <AlertTriangle className="size-4 shrink-0 text-destructive" />
  }
  if (level === 'warning') {
    return <AlertTriangle className="size-4 shrink-0 text-amber-600" />
  }
  return <Info className="text-muted-foreground size-4 shrink-0" />
}

export function HomeAlertsPanel({ alerts, locale }: HomeAlertsPanelProps) {
  const { t } = useTranslation()
  if (alerts.length === 0) return null

  return (
    <Card className="border-destructive/20 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{t('home.sections.alerts')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {alerts.map((alert, idx) => (
            <li key={`${alert.source}-${alert.at}-${idx}`} className="flex gap-2 text-sm">
              <AlertIcon level={alert.level} />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{t(`home.alerts.source.${alert.source}`, alert.source)}</p>
                <p className="text-muted-foreground">{alert.message}</p>
                <p className="text-muted-foreground text-xs">{formatDisplayDate(alert.at, locale)}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
