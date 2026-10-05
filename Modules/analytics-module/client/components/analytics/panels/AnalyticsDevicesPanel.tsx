import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AnalyticsDataTable } from '@module-analytics/components/analytics/AnalyticsDataTable'
import { AnalyticsPanelQueryGate } from '@module-analytics/components/analytics/AnalyticsPanelQueryGate'
import { AnalyticsPeriodFilter, useAnalyticsPeriodRange } from '@module-analytics/components/analytics/AnalyticsPeriodFilter'
import { AnalyticsSourceBadge } from '@module-analytics/components/analytics/AnalyticsSourceBadge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { formatNumber } from '@/lib/formatNumber'

type DevicesData = { items: Array<{ label: string; views: number }>; source?: 'native' | 'wp-statistics' }

export function AnalyticsDevicesPanel() {
  const { t, i18n } = useTranslation()
  const period = useAnalyticsPeriodRange()
  const { from, to } = period
  const [dim, setDim] = useState<'browser' | 'os' | 'device'>('browser')

  const q = useQuery({
    queryKey: ['analytics', 'devices', from, to, dim],
    queryFn: () => apiFetch<DevicesData>(`analytics/devices?from=${from}&to=${to}&dim=${dim}`),
    retry: false,
  })
  useQueryErrorToast(q)

  const dimLabel =
    dim === 'browser' ? t('analytics.deviceBrowser') : dim === 'os' ? t('analytics.deviceOs') : t('analytics.deviceType')

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <AnalyticsPeriodFilter
          preset={period.preset}
          fromDate={period.fromDate}
          toDate={period.toDate}
          onPresetChange={period.setPreset}
          onFromChange={period.setFrom}
          onToChange={period.setTo}
        />
        <AnalyticsSourceBadge source={q.data?.source} />
      </div>
      <div className="space-y-2">
          <Label>{t('analytics.deviceDim')}</Label>
          <Select value={dim} onValueChange={(v) => setDim(v as 'browser' | 'os' | 'device')}>
            <SelectTrigger className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="browser">{t('analytics.deviceBrowser')}</SelectItem>
              <SelectItem value="os">{t('analytics.deviceOs')}</SelectItem>
              <SelectItem value="device">{t('analytics.deviceType')}</SelectItem>
            </SelectContent>
          </Select>
      </div>
      <AnalyticsPanelQueryGate query={q} variant="table" skeletonRows={8} skeletonColumns={2}>
        <AnalyticsDataTable
          columns={[
            { key: 'label', label: dimLabel },
            { key: 'views', label: t('analytics.col.views') },
          ]}
          rows={(q.data?.items ?? []).map((r) => ({
            label: r.label || t('analytics.unknown'),
            views: formatNumber(r.views, i18n.language),
          }))}
          empty={t('analytics.empty')}
        />
      </AnalyticsPanelQueryGate>
    </div>
  )
}
