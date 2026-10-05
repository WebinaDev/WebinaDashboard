import { MobileListCard } from '@/components/MobileListCard'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type Col = { key: string; label: string; className?: string }

export function AnalyticsDataTable({
  columns,
  rows,
  empty,
}: {
  columns: Col[]
  rows: Record<string, React.ReactNode>[]
  empty: string
}) {
  return (
    <Card className="min-w-0 overflow-hidden shadow-sm">
      <CardContent className="min-w-0 p-0">
        {rows.length === 0 ? (
          <p className="text-muted-foreground p-8 text-center text-sm">{empty}</p>
        ) : (
          <>
            <div className="space-y-3 p-3 md:hidden">
              {rows.map((row, i) => (
                <MobileListCard key={i} className="min-w-0">
                  <dl className="grid min-w-0 gap-2 text-sm">
                    {columns.map((c) => (
                      <div
                        key={c.key}
                        className="flex min-w-0 items-start justify-between gap-3 border-b border-border/50 pb-2 last:border-0 last:pb-0"
                      >
                        <dt className="text-muted-foreground shrink-0 text-xs">{c.label}</dt>
                        <dd className="min-w-0 break-all text-end">{row[c.key]}</dd>
                      </div>
                    ))}
                  </dl>
                </MobileListCard>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((c) => (
                      <TableHead key={c.key} className={c.className}>
                        {c.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, i) => (
                    <TableRow key={i}>
                      {columns.map((c) => (
                        <TableCell key={c.key} className={c.className}>
                          {row[c.key]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
