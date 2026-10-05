import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { SmsServiceBanner, isSmsUnavailable } from '@/components/marketing/SmsServiceBanner'
import { ScrollTable } from '@/components/ScrollTable'
import { Button } from '@/components/ui/button'
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
import { toPersianDigits } from '@/lib/date'
import { formatSmsDateTime } from '@/lib/sms-report'
import { fetchSmsAccount, fetchSmsLedger, smsQueryOptions } from '@/lib/modirpayamak-api'

const LEDGER_PAGE_SIZE = 30

export default function SmsWalletPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const [page, setPage] = useState(1)

  const accountQ = useQuery({
    queryKey: ['sms', 'account'],
    queryFn: fetchSmsAccount,
    ...smsQueryOptions,
  })
  useQueryErrorToast(accountQ)

  const ledgerQ = useQuery({
    queryKey: ['sms', 'ledger', page],
    queryFn: () => fetchSmsLedger(page, LEDGER_PAGE_SIZE),
    ...smsQueryOptions,
  })
  useQueryErrorToast(ledgerQ)

  const unavailable = isSmsUnavailable(accountQ.data) || isSmsUnavailable(ledgerQ.data)
  const account = isSmsUnavailable(accountQ.data) ? null : (accountQ.data?.account ?? null)
  const ledger = isSmsUnavailable(ledgerQ.data) ? [] : (ledgerQ.data?.ledger ?? [])
  const balanceLoading = accountQ.isPending

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-semibold">{t('marketing.sms.walletTitle')}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t('marketing.sms.walletHint')}</p>
      </div>

      {unavailable ? (
        <SmsServiceBanner
          message={accountQ.data?.message ?? ledgerQ.data?.message}
          onRetry={() => {
            void accountQ.refetch()
            void ledgerQ.refetch()
          }}
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('marketing.sms.balance')}</CardTitle>
          </CardHeader>
          <CardContent>
            {balanceLoading ? (
              <Skeleton className="h-9 w-40" />
            ) : (
              <p className="text-3xl font-bold">
                {(account?.balance ?? 0).toLocaleString()}{' '}
                <span className="text-base font-normal">{t('marketing.sms.toman')}</span>
              </p>
            )}
            <Button asChild className="mt-4" variant="outline" disabled={unavailable}>
              <Link to="/marketing/sms/topup">{t('marketing.sms.topup')}</Link>
            </Button>
          </CardContent>
        </Card>

        {account ? (
          <Card>
            <CardHeader>
              <CardTitle>{t('marketing.sms.walletAccount')}</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-1 text-sm">
                {account.domain ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{t('marketing.sms.walletDomain')}</dt>
                    <dd>{account.domain}</dd>
                  </div>
                ) : null}
                {account.default_from ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{t('marketing.sms.fromNumber')}</dt>
                    <dd dir="ltr">{account.default_from}</dd>
                  </div>
                ) : null}
                {account.status ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{t('marketing.sms.status')}</dt>
                    <dd>{account.status}</dd>
                  </div>
                ) : null}
                {account.price_per_unit != null ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{t('home.panels.smsUnitPrice')}</dt>
                    <dd>{account.price_per_unit}</dd>
                  </div>
                ) : null}
              </dl>
            </CardContent>
          </Card>
        ) : balanceLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('marketing.sms.ledger')}</CardTitle>
          <CardDescription>{t('marketing.sms.ledgerTitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollTable>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>{t('marketing.sms.ledgerDate')}</TableHead>
                  <TableHead>{t('marketing.sms.ledgerDescription')}</TableHead>
                  <TableHead>{t('marketing.sms.ledgerAmount')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledgerQ.isPending
                  ? Array.from({ length: 6 }, (_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={4}>
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  : ledger.length === 0
                    ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-muted-foreground text-sm">
                            {t('marketing.sms.ledgerEmpty')}
                          </TableCell>
                        </TableRow>
                      )
                    : ledger.map((row, i) => (
                        <TableRow key={String(row.id ?? i)}>
                          <TableCell>
                            {locale.startsWith('fa')
                              ? toPersianDigits(String(row.id ?? i + 1))
                              : String(row.id ?? i + 1)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {formatSmsDateTime(row.date ?? row.created_at ?? row.time, locale)}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {String(row.description ?? row.title ?? row.type ?? '—')}
                          </TableCell>
                          <TableCell>
                            {typeof row.amount === 'number'
                              ? row.amount.toLocaleString()
                              : String(row.amount ?? '—')}
                          </TableCell>
                        </TableRow>
                      ))}
              </TableBody>
            </Table>
          </ScrollTable>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || ledgerQ.isPending}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">{page}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={ledgerQ.isPending || ledger.length < LEDGER_PAGE_SIZE}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
