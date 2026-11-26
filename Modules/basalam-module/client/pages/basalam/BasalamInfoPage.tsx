import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { BasalamNav } from '../../components/BasalamNav'
import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type VendorInfo = {
  id?: number | string
  title?: string
  summary?: string
  status?: { name?: string } | string | number
  city?: { name?: string } | string
  user?: { name?: string } | string
  product_count?: number
}

function text(value: unknown): string {
  if (value == null) return '—'
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object') {
    const named = (value as { name?: unknown; title?: unknown }).name ??
      (value as { title?: unknown }).title
    if (named != null) return String(named)
  }
  return '—'
}

/**
 * Booth identity/account details, ported from the retired wp-admin "اطلاعات" page.
 * Same data source (basalam/vendor -> VendorInfoService::FetchVendorInfo()).
 */
export default function BasalamInfoPage() {
  const { t } = useTranslation()

  const vendorQ = useQuery({
    queryKey: ['basalam', 'vendor', 'info'],
    queryFn: () => apiFetch<{ vendor: VendorInfo | null }>('basalam/vendor'),
  })

  const statusQ = useQuery({
    queryKey: ['basalam', 'status'],
    queryFn: () => apiFetch<{ connected?: boolean }>('basalam/status'),
  })

  const disconnect = useMutation({
    mutationFn: () => apiFetch('basalam/oauth/disconnect', { method: 'POST', body: JSON.stringify({}) }),
    onSuccess: () => toast.success(t('basalam.disconnected')),
    onError: (e: Error) => toastApiError(t, e),
  })

  const vendor = vendorQ.data?.vendor ?? null
  const connected = Boolean(statusQ.data?.connected)

  const rows: Array<{ label: string; value: string }> = [
    { label: t('basalam.infoBoothName'), value: text(vendor?.title) },
    { label: t('basalam.infoBoothId'), value: text(vendor?.id) },
    { label: t('basalam.infoOwner'), value: text(vendor?.user) },
    { label: t('basalam.infoCity'), value: text(vendor?.city) },
    { label: t('basalam.infoStatus'), value: text(vendor?.status) },
    { label: t('basalam.infoProducts'), value: text(vendor?.product_count) },
  ]

  return (
    <PageShell title={t('basalam.infoTitle')} description={t('basalam.infoSubtitle')}>
      <BasalamNav />

      <div className="max-w-4xl space-y-3">
        <Card>
          <CardHeader>
            <CardTitle>{t('basalam.infoBoothCard')}</CardTitle>
            <CardDescription>
              {connected ? t('basalam.connected') : t('basalam.notConnected')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 sm:grid-cols-2">
              {rows.map((row) => (
                <div key={row.label} className="space-y-0.5">
                  <dt className="text-muted-foreground text-xs">{row.label}</dt>
                  <dd className="text-sm font-medium break-words">{row.value}</dd>
                </div>
              ))}
            </dl>
            {vendor?.summary ? (
              <p className="text-muted-foreground mt-4 text-sm leading-relaxed">{vendor.summary}</p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle>{t('basalam.infoDangerTitle')}</CardTitle>
            <CardDescription>{t('basalam.infoDangerHint')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button
              variant="destructive"
              disabled={!connected || disconnect.isPending}
              onClick={() => {
                if (window.confirm(t('basalam.infoDangerConfirm'))) disconnect.mutate()
              }}
            >
              {t('basalam.infoDangerButton')}
            </Button>
            <Button asChild variant="secondary">
              <a href="https://webina.dev" target="_blank" rel="noreferrer">
                {t('basalam.helpSupportLink')}
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
