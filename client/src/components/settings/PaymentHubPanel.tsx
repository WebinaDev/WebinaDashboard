import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { PaymentGatewaysPanel } from '@/components/settings/PaymentGatewaysPanel'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
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

export function PaymentHubPanel() {
  const { t } = useTranslation()
  const qc = useQueryClient()

  const hubQ = useQuery({
    queryKey: ['payments-hub'],
    queryFn: () => apiFetch<{ items: HubItem[]; curated_gateway_ids: string[] }>('payments/hub'),
  })
  useQueryErrorToast(hubQ)

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

  const items = hubQ.data?.items ?? []
  const curated = hubQ.data?.curated_gateway_ids ?? items.map((i) => i.gateway_id).filter(Boolean)

  return (
    <div className="space-y-6">
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
