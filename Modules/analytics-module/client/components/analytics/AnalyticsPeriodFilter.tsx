import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { DatePicker } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { presetToRange } from '@/hooks/useOrderReports'
import type { ReportPreset } from '@/types/orderReports'

export type AnalyticsPeriodPreset = Extract<
  ReportPreset,
  'thisMonth' | 'lastMonth' | 'last7' | 'last30' | 'custom'
>

const PRESETS: AnalyticsPeriodPreset[] = ['thisMonth', 'lastMonth', 'last7', 'last30', 'custom']

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function endOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

function toInputDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function toUnix(d: Date) {
  return Math.floor(d.getTime() / 1000)
}

type AnalyticsPeriodFilterProps = {
  preset: AnalyticsPeriodPreset
  fromDate: Date
  toDate: Date
  onPresetChange: (p: AnalyticsPeriodPreset) => void
  onFromChange: (iso: string) => void
  onToChange: (iso: string) => void
}

export function AnalyticsPeriodFilter({
  preset,
  fromDate,
  toDate,
  onPresetChange,
  onFromChange,
  onToChange,
}: AnalyticsPeriodFilterProps) {
  const { t } = useTranslation()

  return (
    <div className="mb-4 flex flex-wrap items-end gap-3">
      <div className="space-y-2">
        <Label>{t('analytics.period')}</Label>
        <Select value={preset} onValueChange={(v) => onPresetChange(v as AnalyticsPeriodPreset)}>
          <SelectTrigger className="w-[min(100%,200px)]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRESETS.map((p) => (
              <SelectItem key={p} value={p}>
                {t(`analytics.periodPreset.${p}`, { defaultValue: t(`reports.preset.${p}`) })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="analytics-from">{t('analytics.dateFrom', { defaultValue: t('reports.dateFrom') })}</Label>
        <DatePicker id="analytics-from" value={toInputDate(fromDate)} onChange={onFromChange} className="w-[min(100%,160px)]" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="analytics-to">{t('analytics.dateTo', { defaultValue: t('reports.dateTo') })}</Label>
        <DatePicker id="analytics-to" value={toInputDate(toDate)} onChange={onToChange} className="w-[min(100%,160px)]" />
      </div>
    </div>
  )
}

/**
 * Default: start of current Shamsi month (fa) / Gregorian month (en) → now.
 * Returns unix from/to for React Query keys.
 */
export function useAnalyticsPeriodRange(defaultPreset: AnalyticsPeriodPreset = 'thisMonth') {
  const initial = useMemo(() => presetToRange(defaultPreset), [defaultPreset])
  const [preset, setPreset] = useState<AnalyticsPeriodPreset>(defaultPreset)
  const [fromDate, setFromDate] = useState(initial.from)
  const [toDate, setToDate] = useState(initial.to)

  const from = toUnix(fromDate)
  const to = toUnix(toDate)

  function applyPreset(next: AnalyticsPeriodPreset) {
    setPreset(next)
    if (next !== 'custom') {
      const range = presetToRange(next)
      setFromDate(range.from)
      setToDate(range.to)
    }
  }

  function setCustomFrom(iso: string) {
    if (!iso) return
    setPreset('custom')
    setFromDate(startOfDay(new Date(iso)))
  }

  function setCustomTo(iso: string) {
    if (!iso) return
    setPreset('custom')
    setToDate(endOfDay(new Date(iso)))
  }

  return {
    preset,
    fromDate,
    toDate,
    from,
    to,
    setPreset: applyPreset,
    setFrom: setCustomFrom,
    setTo: setCustomTo,
  }
}

/** @deprecated Use useAnalyticsPeriodRange — kept for any stray imports during migration. */
export type AnalyticsPeriodDays = 7 | 30 | 90

/** @deprecated Use useAnalyticsPeriodRange */
export function useAnalyticsPeriod(_defaultDays: AnalyticsPeriodDays = 30) {
  return useAnalyticsPeriodRange('thisMonth')
}
