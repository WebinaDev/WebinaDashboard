import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { OrderSidebarPanel } from '@/components/orders/OrderSidebarPanel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { BotConnectionInfo } from '@/components/users/SendMessageDialog'
import { apiFetch } from '@/lib/api'

type UserBotConnectionsPanelProps = {
  userId: number
  bots: BotConnectionInfo
  onChanged: () => void
}

export function UserBotConnectionsPanel({ userId, bots, onChanged }: UserBotConnectionsPanelProps) {
  const { t } = useTranslation()
  const qc = useQueryClient()

  const disconnect = useMutation({
    mutationFn: (provider: 'telegram' | 'bale') =>
      apiFetch(`users/${userId}/disconnect-bot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['user', userId] })
      toast.success(t('common.saved'))
      onChanged()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const block = useMutation({
    mutationFn: (blocked: boolean) =>
      apiFetch(`bots/bale/users/${userId}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocked }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['user', userId] })
      toast.success(t('common.saved'))
      onChanged()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const anyConnected = Boolean(bots.telegram?.connected || bots.bale?.connected)

  return (
    <OrderSidebarPanel title={t('users.sectionBots')} defaultOpen>
      <div className="space-y-4 text-start text-sm">
        {typeof bots.loyalty_points === 'number' ? (
          <p className="text-muted-foreground">
            {t('users.loyaltyPoints')}: <span className="font-medium text-foreground">{bots.loyalty_points}</span>
          </p>
        ) : null}
        <div>
          <p className="font-medium">{t('users.botTelegram')}</p>
          <p className="text-muted-foreground mt-1">
            {bots.telegram?.connected ? (
              <>
                <Badge variant="secondary">{t('users.connected')}</Badge>
                <span className="ms-2 font-mono text-xs">{bots.telegram.chat_id}</span>
              </>
            ) : (
              t('users.disconnected')
            )}
          </p>
          {bots.telegram?.connected ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-2"
              disabled={disconnect.isPending}
              onClick={() => void disconnect.mutateAsync('telegram')}
            >
              {t('users.disconnectBot')}
            </Button>
          ) : null}
        </div>
        <div>
          <p className="font-medium">{t('users.botBale')}</p>
          <p className="text-muted-foreground mt-1">
            {bots.bale?.connected ? (
              <>
                <Badge variant="secondary">{t('users.connected')}</Badge>
                <span className="ms-2 font-mono text-xs">{bots.bale.chat_id}</span>
              </>
            ) : (
              t('users.disconnected')
            )}
          </p>
          {bots.bale?.connected ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-2"
              disabled={disconnect.isPending}
              onClick={() => void disconnect.mutateAsync('bale')}
            >
              {t('users.disconnectBot')}
            </Button>
          ) : null}
        </div>
        {anyConnected ? (
          <Button
            type="button"
            size="sm"
            variant={bots.blocked ? 'secondary' : 'destructive'}
            disabled={block.isPending}
            onClick={() => void block.mutateAsync(!bots.blocked)}
          >
            {bots.blocked ? t('users.unblockBot') : t('users.blockBot')}
          </Button>
        ) : null}
      </div>
    </OrderSidebarPanel>
  )
}
