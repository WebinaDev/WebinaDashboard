import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, Settings } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { PaymentGatewaysPanel } from '@/components/settings/PaymentGatewaysPanel'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type HubItem = {
  id: string
  title_key: string
  module_slug: string
  module_active: boolean
  gateway_id: string
  enabled: boolean
  available: boolean
  settings_path: string
}

type GeoServices = {
  cloudflare: boolean
  woocommerce: boolean
  analytics: boolean
  ip_api: boolean
  ipwho: boolean
  geojs: boolean
  country_is: boolean
}

type GeoNotice = {
  enabled: boolean
  services: GeoServices
}

type HubPayload = {
  items: HubItem[]
  curated_gateway_ids: string[]
  geo_notice?: GeoNotice & { colors?: Record<string, string> }
  geo_notice_enabled?: boolean
}

const SERVICE_KEYS: (keyof GeoServices)[] = [
  'cloudflare',
  'woocommerce',
  'analytics',
  'ip_api',
  'ipwho',
  'geojs',
  'country_is',
]

const DEFAULT_GEO: GeoNotice = {
  enabled: true,
  services: {
    cloudflare: true,
    woocommerce: true,
    analytics: true,
    ip_api: true,
    ipwho: true,
    geojs: true,
    country_is: true,
  },
}

function normalizeGeo(raw?: HubPayload['geo_notice'] | null, legacyEnabled?: boolean): GeoNotice {
  const base: GeoNotice = {
    enabled: DEFAULT_GEO.enabled,
    services: { ...DEFAULT_GEO.services },
  }
  if (!raw || typeof raw !== 'object') {
    if (typeof legacyEnabled === 'boolean') base.enabled = legacyEnabled
    return base
  }
  base.enabled = raw.enabled !== false
  if (raw.services && typeof raw.services === 'object') {
    for (const key of SERVICE_KEYS) {
      if (key in raw.services) base.services[key] = Boolean(raw.services[key])
    }
  }
  return base
}

export function PaymentHubPanel() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [geoDraft, setGeoDraft] = useState<GeoNotice>(DEFAULT_GEO)

  const hubQ = useQuery({
    queryKey: ['payments-hub'],
    queryFn: () => apiFetch<HubPayload>('payments/hub'),
  })
  useQueryErrorToast(hubQ)

  useEffect(() => {
    if (!hubQ.data) return
    setGeoDraft(normalizeGeo(hubQ.data.geo_notice, hubQ.data.geo_notice_enabled))
  }, [hubQ.data])

  const toggle = useMutation({
    mutationFn: async (item: HubItem) => {
      if (!item.gateway_id) throw new Error(t('paymentsHub.unavailable'))
      return apiFetch('shop/payment-gateways/' + item.gateway_id, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !item.enabled }),
      })
    },
    onSuccess: async () => {
      toast.success(t('common.saved'))
      await qc.invalidateQueries({ queryKey: ['payments-hub'] })
      await qc.invalidateQueries({ queryKey: ['payment-gateways'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const geoSave = useMutation({
    mutationFn: (geo_notice: GeoNotice) =>
      apiFetch<HubPayload>('payments/hub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geo_notice }),
      }),
    onSuccess: (data) => {
      qc.setQueryData(['payments-hub'], data)
      setGeoDraft(normalizeGeo(data.geo_notice, data.geo_notice_enabled))
      toast.success(t('common.saved'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const items = hubQ.data?.items ?? []
  const curated = hubQ.data?.curated_gateway_ids ?? items.map((i) => i.gateway_id).filter(Boolean)

  const serverGeo = useMemo(
    () => normalizeGeo(hubQ.data?.geo_notice, hubQ.data?.geo_notice_enabled),
    [hubQ.data]
  )
  const geoDirty = useMemo(() => JSON.stringify(geoDraft) !== JSON.stringify(serverGeo), [geoDraft, serverGeo])

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-xl border border-border bg-background/60 px-3 py-3">
        <div className="flex items-center gap-3">
          <Switch
            id="geo-notice-enabled"
            checked={geoDraft.enabled}
            disabled={hubQ.isLoading || geoSave.isPending}
            onCheckedChange={(v) => setGeoDraft((prev) => ({ ...prev, enabled: v }))}
            aria-label={t('paymentsHub.geoNotice')}
          />
          <div className="min-w-0 flex-1">
            <Label htmlFor="geo-notice-enabled" className="text-sm font-medium">
              {t('paymentsHub.geoNotice')}
            </Label>
            <p className="text-muted-foreground text-xs">{t('paymentsHub.geoNoticeHint')}</p>
            <p className="text-muted-foreground mt-1 text-xs">
              <Link to="/settings/site/style" className="text-primary underline-offset-2 hover:underline">
                {t('settings.style.movedHint')}
              </Link>
            </p>
          </div>
        </div>

        <div className={geoDraft.enabled ? 'space-y-4' : 'pointer-events-none space-y-4 opacity-50'}>
          <div>
            <p className="mb-2 text-sm font-medium">{t('paymentsHub.geoServicesTitle')}</p>
            <p className="text-muted-foreground mb-3 text-xs">{t('paymentsHub.geoServicesHint')}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {SERVICE_KEYS.map((key) => (
                <label
                  key={key}
                  htmlFor={`geo-svc-${key}`}
                  className="bg-muted/30 flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                >
                  <span className="text-sm">{t(`paymentsHub.geoService.${key}`)}</span>
                  <Switch
                    id={`geo-svc-${key}`}
                    checked={geoDraft.services[key]}
                    disabled={!geoDraft.enabled || geoSave.isPending}
                    onCheckedChange={(v) =>
                      setGeoDraft((prev) => ({
                        ...prev,
                        services: { ...prev.services, [key]: v },
                      }))
                    }
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            disabled={hubQ.isLoading || geoSave.isPending || !geoDirty}
            onClick={() => void geoSave.mutateAsync(geoDraft)}
          >
            {geoSave.isPending ? t('common.saving') : t('common.save')}
          </Button>
        </div>
      </div>

      <div className="grid gap-2">
        {hubQ.isLoading ? (
          <p className="text-muted-foreground text-sm">{t('common.loading')}</p>
        ) : (
          items.map((item) => {
            const warning = !item.module_active
              ? t('paymentsHub.warnModule')
              : !item.gateway_id
                ? t('paymentsHub.warnGateway')
                : ''
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-background/60 px-3 py-3"
              >
                <Switch
                  checked={item.enabled}
                  disabled={!item.available || toggle.isPending}
                  onCheckedChange={() => void toggle.mutateAsync(item)}
                  aria-label={t(item.title_key)}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{t(item.title_key)}</p>
                  {warning ? <p className="text-muted-foreground text-xs">{warning}</p> : null}
                </div>
                <Button type="button" variant="ghost" size="icon" asChild>
                  <Link to={item.settings_path} aria-label={t('paymentsHub.openSettings')}>
                    <Settings className="size-4" />
                  </Link>
                </Button>
              </div>
            )
          })
        )}
      </div>

      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button type="button" variant="outline" className="w-full justify-between">
            {t('paymentsHub.otherGateways')}
            <ChevronDown className="size-4" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <PaymentGatewaysPanel
            excludeIds={
              curated.length
                ? curated
                : [
                    'zarinpal_gateway',
                    'digipay_ipg',
                    'webino_bale_pay',
                    'webino_wallet',
                    'webino_bots_c2c',
                    'snapppay',
                    'snapp_pay',
                    'wc_snapppay',
                    'torobpay',
                    'torob_pay',
                    'wc_gateway_torobpay',
                  ]
            }
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
