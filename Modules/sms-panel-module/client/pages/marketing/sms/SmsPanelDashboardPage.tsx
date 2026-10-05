import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { SmsServiceBanner } from '@/components/marketing/SmsServiceBanner'
import { ScrollTable } from '@/components/ScrollTable'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  formatSmsDateTime,
  localMessagePreview,
  localRecipientsPreview,
} from '@/lib/sms-report'
import { translateSmsStatus } from '@/lib/sms-ui'
import {
  fetchSmsAds,
  fetchSmsDashboard,
  smsQueryOptions,
  type SmsAdCampaign,
  type SmsMessage,
} from '@/lib/modirpayamak-api'

function NavButton({
  to,
  label,
  disabled,
  variant = 'outline',
}: {
  to: string
  label: string
  disabled?: boolean
  variant?: 'default' | 'outline'
}) {
  if (disabled) {
    return (
      <Button
        variant={variant}
        disabled
        aria-disabled="true"
        className="pointer-events-none opacity-50"
      >
        {label}
      </Button>
    )
  }
  return (
    <Button variant={variant} size="sm" asChild>
      <Link to={to}>{label}</Link>
    </Button>
  )
}

const ALWAYS_ENABLED = new Set([
  '/marketing/sms',
  '/marketing/sms/ads/new',
  '/marketing/sms/patterns',
  '/marketing/sms/phonebook',
  '/marketing/sms/drafts',
  '/marketing/sms/secretaries',
  '/marketing/sms/lines',
])

export default function SmsPanelDashboardPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language

  const dashQ = useQuery({
    queryKey: ['sms', 'dashboard'],
    queryFn: () => fetchSmsDashboard(),
    ...smsQueryOptions,
  })
  useQueryErrorToast(dashQ)

  const adsQ = useQuery({
    queryKey: ['sms', 'ads'],
    queryFn: fetchSmsAds,
    ...smsQueryOptions,
  })

  const unavailable = dashQ.data?.unavailable === true
  const account = unavailable ? null : dashQ.data?.account ?? null
  const messages: SmsMessage[] = unavailable ? [] : (dashQ.data?.messages?.slice(0, 10) ?? [])
  const campaigns: SmsAdCampaign[] = adsQ.data?.items ?? []
  const balanceLoading = dashQ.isPending || dashQ.isFetching

  const retry = () => {
    void dashQ.refetch()
  }

  const fmt = (n: number) =>
    locale.startsWith('fa') ? toPersianDigits(n.toLocaleString('en-US')) : n.toLocaleString()

  const navLinks = [
    ['/marketing/sms', t('marketing.sms.home')],
    ['/marketing/sms/send', t('marketing.sms.send')],
    ['/marketing/sms/reports', t('marketing.sms.reports')],
    ['/marketing/sms/targeted', t('marketing.sms.targeted')],
    ['/marketing/sms/inbox', t('marketing.sms.inbox')],
    ['/marketing/sms/drafts', t('marketing.sms.drafts')],
    ['/marketing/sms/phonebook', t('marketing.sms.phonebook')],
    ['/marketing/sms/scheduled', t('marketing.sms.scheduled')],
    ['/marketing/sms/patterns', t('marketing.sms.patterns')],
    ['/marketing/sms/secretaries', t('marketing.sms.secretaries')],
    ['/marketing/sms/wallet', t('marketing.sms.wallet')],
    ['/marketing/sms/lines', t('marketing.sms.lines')],
    ['/marketing/sms/newsletter', t('marketing.sms.newsletter')],
    ['/marketing/sms/topup', t('marketing.sms.topup')],
  ] as const

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 p-4 pb-10">
      <section className="from-primary/10 via-background to-background relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 md:p-8">
        <h1 className="text-2xl font-semibold md:text-3xl">{t('marketing.smsAds.heroTitle')}</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed md:text-base">
          {t('marketing.smsAds.heroDesc')}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/marketing/sms/ads/new">{t('marketing.smsAds.createCta')}</Link>
          </Button>
          <NavButton
            to="/marketing/sms/topup"
            label={t('marketing.sms.topup')}
            disabled={unavailable}
            variant="outline"
          />
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            ['bannerVolume', 'bannerVolumeDesc'],
            ['bannerSegments', 'bannerSegmentsDesc'],
            ['bannerCopy', 'bannerCopyDesc'],
          ].map(([title, desc]) => (
            <div key={title} className="bg-background/70 rounded-xl p-3 text-sm shadow-sm">
              <p className="font-medium">{t(`marketing.smsAds.${title}`)}</p>
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                {t(`marketing.smsAds.${desc}`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {unavailable ? <SmsServiceBanner message={dashQ.data?.message} onRetry={retry} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('marketing.sms.balance')}</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {balanceLoading ? (
              <Skeleton className="h-9 w-40" />
            ) : (
              <>
                {fmt(account?.balance ?? 0)} {t('marketing.sms.toman')}
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('marketing.smsAds.campaignsTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            {adsQ.isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : campaigns.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t('marketing.smsAds.noCampaigns')}</p>
            ) : (
              <ul className="divide-border max-h-48 divide-y overflow-auto text-sm">
                {campaigns.slice(0, 8).map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-2 py-2">
                    <Link className="text-primary truncate hover:underline" to={`/marketing/sms/ads/${c.id}`}>
                      {c.name}
                    </Link>
                    <Badge variant="outline">
                      {t(`marketing.smsAds.status.${c.status}`, { defaultValue: c.status })}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        {navLinks.map(([to, label]) => (
          <NavButton
            key={to}
            to={to}
            label={label}
            disabled={unavailable && !ALWAYS_ENABLED.has(to)}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('marketing.sms.recentSends')}</CardTitle>
        </CardHeader>
        <CardContent>
          {balanceLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-3/4" />
            </div>
          ) : messages.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('marketing.sms.noMessages')}</p>
          ) : (
            <ScrollTable>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('marketing.sms.type')}</TableHead>
                    <TableHead>{t('marketing.sms.recipient')}</TableHead>
                    <TableHead>{t('marketing.sms.message')}</TableHead>
                    <TableHead>{t('marketing.sms.status')}</TableHead>
                    <TableHead>{t('marketing.sms.cost')}</TableHead>
                    <TableHead>{t('marketing.sms.sentAt')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((m) => {
                    const row = m as unknown as Record<string, unknown>
                    const cost = m.cost
                    return (
                      <TableRow key={m.id}>
                        <TableCell>
                          <Badge variant="outline">{m.sending_type || '—'}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[10rem] truncate font-mono text-xs" dir="ltr">
                          {localRecipientsPreview(row)}
                        </TableCell>
                        <TableCell className="max-w-[14rem] truncate">
                          {localMessagePreview(row)}
                        </TableCell>
                        <TableCell>{translateSmsStatus(t, m.status)}</TableCell>
                        <TableCell dir="ltr">
                          {cost != null ? fmt(cost) : '—'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatSmsDateTime(m.created_at, locale)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </ScrollTable>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
