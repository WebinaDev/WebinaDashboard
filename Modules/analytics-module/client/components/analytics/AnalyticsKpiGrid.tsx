import type { ReactNode } from 'react'

import { Card, CardContent } from '@/components/ui/card'

type Kpi = { label: string; value: ReactNode }

export function AnalyticsKpiGrid({ items }: { items: Kpi[] }) {
  return (
    <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((k) => (
        <Card key={k.label} className="shadow-sm">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">{k.label}</p>
            <p className="text-2xl font-semibold tabular-nums">{k.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
