import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

type SmsServiceBannerProps = {
  message?: string
  onRetry?: () => void
}

export function SmsServiceBanner({ message, onRetry }: SmsServiceBannerProps) {
  const { t } = useTranslation()

  return (
    <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
      <p className="text-sm text-amber-900 dark:text-amber-100">
        {message ?? t('marketing.sms.serviceUnavailable')}
      </p>
      {onRetry ? (
        <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => void onRetry()}>
          {t('license.retry')}
        </Button>
      ) : null}
    </div>
  )
}

export function isSmsUnavailable(payload: { unavailable?: boolean; ok?: boolean } | undefined): boolean {
  if (!payload) return false
  return payload.unavailable === true || payload.ok === false
}
