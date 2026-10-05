import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { BasalamNav } from '../../components/BasalamNav'
import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type Status = {
  connected?: boolean
  vendor_id?: string | number | null
  vendor_title?: string | null
  webhook_url?: string
  webhook_id?: string | number | null
}

export default function BasalamHomePage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [params, setParams] = useSearchParams()
  const [pullDays, setPullDays] = useState('90')
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [callbackUrl, setCallbackUrl] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [refreshToken, setRefreshToken] = useState('')
  const [vendorId, setVendorId] = useState('')

  const statusQ = useQuery({
    queryKey: ['basalam', 'status'],
    queryFn: () => apiFetch<Status>('basalam/status'),
    refetchInterval: 15000,
  })

  const vendorQ = useQuery({
    queryKey: ['basalam', 'vendor'],
    queryFn: () => apiFetch<{ vendor: { title?: string; id?: number } | null }>('basalam/vendor'),
    enabled: Boolean(statusQ.data?.connected),
  })

  useEffect(() => {
    const flag = params.get('oauth')
    if (flag === 'error') {
      const reason = params.get('reason')
      toast.error(reason === 'vendor' ? t('basalam.oauthVendorError') : t('basalam.oauthError'))
      const next = new URLSearchParams(params)
      next.delete('oauth')
      next.delete('reason')
      setParams(next, { replace: true })
      return
    }
    // Never toast success from a bare oauth=connected flag (can appear without SSO).
    if (flag === 'connected' || flag === 'success') {
      void qc.invalidateQueries({ queryKey: ['basalam'] })
      const next = new URLSearchParams(params)
      next.delete('oauth')
      setParams(next, { replace: true })
    }
  }, [params, qc, setParams, t])

  useEffect(() => {
    const access = params.get('access_token')
    const oauthFlag = params.get('oauth')
    if (!access || (oauthFlag !== 'handoff' && !params.get('webino_sig'))) return
    let cancelled = false
    const run = async () => {
      try {
        await apiFetch<{ ok?: boolean }>('basalam/oauth/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callback_url: window.location.href }),
        })
        if (cancelled) return
        toast.success(t('basalam.oauthConnected'))
        await qc.invalidateQueries({ queryKey: ['basalam'] })
        const returnUrl = params.get('return_url')
        const stripKeys = [
          'access_token',
          'refresh_token',
          'expires_in',
          'vendor_id',
          'is_vendor',
          'webino_sig',
          'webino_ts',
          'webino_hk',
          'oauth',
          'return_url',
          'page',
          'reason',
        ]
        if (returnUrl) {
          try {
            const dest = new URL(returnUrl, window.location.origin)
            if (dest.origin === window.location.origin) {
              window.location.replace(dest.toString())
              return
            }
          } catch {
            /* ignore */
          }
        }
        const next = new URLSearchParams(params)
        for (const k of stripKeys) next.delete(k)
        setParams(next, { replace: true })
      } catch (e) {
        if (!cancelled) toastApiError(t, e as Error)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const oauth = useMutation({
    mutationFn: () => {
      const clean = `${window.location.origin}${window.location.pathname}`
      return apiFetch<{ url: string }>('basalam/oauth/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ return_url: clean }),
      })
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url
        return
      }
      toast.error(t('basalam.oauthMissingUrl'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const oauthPaste = useMutation({
    mutationFn: (url: string) =>
      apiFetch('basalam/oauth/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_url: url }),
      }),
    onSuccess: async () => {
      toast.success(t('basalam.oauthConnected'))
      setCallbackUrl('')
      await qc.invalidateQueries({ queryKey: ['basalam'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const oauthManual = useMutation({
    mutationFn: () =>
      apiFetch('basalam/oauth/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: accessToken.trim(),
          refresh_token: refreshToken.trim(),
          vendor_id: vendorId.trim() || undefined,
        }),
      }),
    onSuccess: async () => {
      toast.success(t('basalam.oauthConnected'))
      setAccessToken('')
      setRefreshToken('')
      setVendorId('')
      await qc.invalidateQueries({ queryKey: ['basalam'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const disconnect = useMutation({
    mutationFn: () => apiFetch('basalam/oauth/disconnect', { method: 'POST' }),
    onSuccess: async () => {
      toast.success(t('basalam.disconnected'))
      await qc.invalidateQueries({ queryKey: ['basalam'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const setupWebhook = useMutation({
    mutationFn: () => apiFetch('basalam/webhook/setup', { method: 'POST' }),
    onSuccess: async () => {
      toast.success(t('basalam.webhookConfigured'))
      await qc.invalidateQueries({ queryKey: ['basalam'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const pullOrders = useMutation({
    mutationFn: () =>
      apiFetch('basalam/sync/orders/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: Number(pullDays) || 90 }),
      }),
    onSuccess: async () => {
      toast.success(t('basalam.ordersPullQueued', { days: pullDays }))
      await qc.invalidateQueries({ queryKey: ['basalam'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const syncProducts = useMutation({
    mutationFn: () => apiFetch('basalam/sync/products/sync-now', { method: 'POST' }),
    onSuccess: () => toast.success(t('basalam.productsSyncQueued')),
    onError: (e: Error) => toastApiError(t, e),
  })

  const s = statusQ.data
  const connected = Boolean(s?.connected)
  const boothName =
    vendorQ.data?.vendor?.title ||
    (s?.vendor_title ? String(s.vendor_title) : '') ||
    (s?.vendor_id ? t('basalam.boothNamed', { id: String(s.vendor_id) }) : '')

  return (
    <PageShell title={t('basalam.title')} description={t('basalam.subtitle')}>
      <BasalamNav />

      <div className="grid max-w-3xl gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('basalam.connection')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              {connected ? (
                <span className="text-emerald-700 dark:text-emerald-400">{t('basalam.connected')}</span>
              ) : (
                <span>{t('basalam.notConnected')}</span>
              )}
              {connected && boothName ? <span className="text-muted-foreground"> — {boothName}</span> : null}
            </p>
            <div className="flex flex-wrap gap-2">
              {!connected ? (
                <Button onClick={() => oauth.mutate()} disabled={oauth.isPending}>
                  {t('basalam.connectOAuth')}
                </Button>
              ) : (
                <Button variant="outline" onClick={() => disconnect.mutate()} disabled={disconnect.isPending}>
                  {t('basalam.disconnect')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {connected ? (
          <Card>
            <CardHeader>
              <CardTitle>{t('basalam.operations')}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-end gap-2">
              <div className="flex flex-col gap-1">
                <label htmlFor="basalam-pull-days" className="text-muted-foreground text-xs font-medium">
                  {t('basalam.pullOrdersDays')}
                </label>
                <select
                  id="basalam-pull-days"
                  className="border-input bg-background h-9 min-w-[9rem] rounded-md border px-3 text-sm"
                  value={pullDays}
                  onChange={(e) => setPullDays(e.target.value)}
                >
                  <option value="7">{t('basalam.pullDays.7')}</option>
                  <option value="30">{t('basalam.pullDays.30')}</option>
                  <option value="90">{t('basalam.pullDays.90')}</option>
                  <option value="180">{t('basalam.pullDays.180')}</option>
                  <option value="365">{t('basalam.pullDays.365')}</option>
                </select>
              </div>
              <Button onClick={() => pullOrders.mutate()} disabled={pullOrders.isPending}>
                {t('basalam.pullOrders')}
              </Button>
              <Button variant="secondary" onClick={() => syncProducts.mutate()} disabled={syncProducts.isPending}>
                {t('basalam.syncProductsNow')}
              </Button>
              <Button variant="secondary" onClick={() => setupWebhook.mutate()} disabled={setupWebhook.isPending}>
                {t('basalam.setupWebhook')}
              </Button>
              <Button asChild variant="outline">
                <Link to="/settings/shop/basalam/products">{t('basalam.nav.products')}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/settings/shop/pricing/marketplaces">{t('basalam.openPricing')}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/settings/shop/basalam/settings">{t('basalam.nav.settings')}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <Card>
            <CardHeader className="pb-3">
              <CollapsibleTrigger asChild>
                <button type="button" className="flex w-full items-center justify-between text-start">
                  <CardTitle className="text-base">{t('basalam.advanced')}</CardTitle>
                  <ChevronDown className={`size-4 transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
                </button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="space-y-5 border-t pt-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t('basalam.oauthPasteTitle')}</p>
                  <Textarea
                    value={callbackUrl}
                    onChange={(e) => setCallbackUrl(e.target.value)}
                    placeholder={t('basalam.oauthPastePlaceholder')}
                    rows={2}
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={oauthPaste.isPending || !callbackUrl.trim()}
                    onClick={() => oauthPaste.mutate(callbackUrl.trim())}
                  >
                    {t('basalam.oauthPasteSave')}
                  </Button>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t('basalam.manualTokenTitle')}</p>
                  <Input
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    placeholder={t('basalam.fieldAccess')}
                  />
                  <Input
                    value={refreshToken}
                    onChange={(e) => setRefreshToken(e.target.value)}
                    placeholder={t('basalam.fieldRefresh')}
                  />
                  <Input
                    value={vendorId}
                    onChange={(e) => setVendorId(e.target.value)}
                    placeholder={t('basalam.fieldVendorOptional')}
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={oauthManual.isPending || !accessToken.trim()}
                    onClick={() => oauthManual.mutate()}
                  >
                    {t('basalam.manualTokenSave')}
                  </Button>
                </div>
                {s?.webhook_url ? (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{t('basalam.webhook')}</p>
                    <code className="bg-muted block overflow-x-auto rounded-md p-2 text-xs">{s.webhook_url}</code>
                    <p className="text-muted-foreground text-xs">
                      {s.webhook_id ? t('basalam.webhookConfigured') : t('basalam.webhookPending')}
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>
    </PageShell>
  )
}
