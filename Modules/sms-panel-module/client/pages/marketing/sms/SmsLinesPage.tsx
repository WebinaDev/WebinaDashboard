import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { SmsServiceBanner, isSmsUnavailable } from '@/components/marketing/SmsServiceBanner'
import { ScrollTable } from '@/components/ScrollTable'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { fetchSmsNumbers, smsQueryOptions, type SmsAttachedNumber } from '@/lib/modirpayamak-api'

function unwrapNumbers(
  payload: { data?: SmsAttachedNumber[]; numbers?: SmsAttachedNumber[] } | undefined
): SmsAttachedNumber[] {
  const list = payload?.numbers ?? payload?.data
  return Array.isArray(list) ? list : []
}

export default function SmsLinesPage() {
  const { t } = useTranslation()

  const numbersQ = useQuery({
    queryKey: ['sms-numbers'],
    queryFn: fetchSmsNumbers,
    ...smsQueryOptions,
  })
  useQueryErrorToast(numbersQ)

  const unavailable = isSmsUnavailable(numbersQ.data)
  const numbers = unavailable ? [] : unwrapNumbers(numbersQ.data)
  const loading = numbersQ.isPending

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-semibold">{t('marketing.sms.linesTitle')}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t('marketing.sms.linesHint')}</p>
      </div>

      {unavailable ? (
        <SmsServiceBanner
          message={numbersQ.data?.message}
          onRetry={() => void numbersQ.refetch()}
        />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t('marketing.sms.linesTitle')}</CardTitle>
          <CardDescription>{t('marketing.sms.linesHint')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollTable>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('marketing.sms.lineNumber')}</TableHead>
                  <TableHead>{t('marketing.sms.lineRole')}</TableHead>
                  <TableHead>{t('marketing.sms.lineLabel')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 3 }, (_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={3}>
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  : numbers.length === 0
                    ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-muted-foreground text-sm">
                            {t('marketing.sms.noLines')}
                          </TableCell>
                        </TableRow>
                      )
                    : numbers.map((n) => {
                        const roleKey =
                          n.role === 'service'
                            ? 'marketing.sms.roleService'
                            : n.role === 'personal' || n.role === 'marketing'
                              ? 'marketing.sms.rolePersonal'
                              : ''
                        return (
                        <TableRow key={`${n.role}-${n.number}`}>
                          <TableCell className="font-mono" dir="ltr">
                            {n.number}
                          </TableCell>
                          <TableCell>{roleKey ? t(roleKey) : n.role}</TableCell>
                          <TableCell>{n.label ?? '—'}</TableCell>
                        </TableRow>
                        )
                      })}
              </TableBody>
            </Table>
          </ScrollTable>
        </CardContent>
      </Card>
    </div>
  )
}
