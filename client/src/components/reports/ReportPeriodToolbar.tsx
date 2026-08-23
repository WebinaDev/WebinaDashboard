import { Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { ReportFilters } from '@/components/orders/reports/ReportFilters'
import { Button } from '@/components/ui/button'
import { buildShopReportExportPath, downloadReportCsv, useOrderReportsFilters } from '@/hooks/useOrderReports'

type ReportPeriodToolbarProps = {
  filterState: ReturnType<typeof useOrderReportsFilters>
  exportSection?: string
}

export function ReportPeriodToolbar({ filterState, exportSection }: ReportPeriodToolbarProps) {
  const { t } = useTranslation()
  const { filters } = filterState

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {exportSection ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              void downloadReportCsv(
                buildShopReportExportPath(exportSection, filters),
                `shop-report-${exportSection}-${new Date().toISOString().slice(0, 10)}.csv`,
              )
            }
          >
            <Download className="me-1.5 size-4" />
            {t('reports.exportCsv')}
          </Button>
        ) : (
          <span />
        )}
      </div>
      <ReportFilters
        preset={filterState.preset}
        from={filterState.from}
        to={filterState.to}
        interval={filterState.interval}
        compare={filterState.compare}
        statuses={filterState.statuses}
        onPresetChange={filterState.applyPreset}
        onFromChange={filterState.setCustomFrom}
        onToChange={filterState.setCustomTo}
        onIntervalChange={filterState.setInterval}
        onCompareChange={filterState.setCompare}
        onStatusesChange={filterState.setStatuses}
      />
    </div>
  )
}
