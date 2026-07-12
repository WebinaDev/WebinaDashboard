import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

type QueryErrorStateProps = {
  message?: string
  onRetry?: () => void
  className?: string
}

export function QueryErrorState({ message, onRetry, className }: QueryErrorStateProps) {
  const { t } = useTranslation()
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = async () => {
    if (!onRetry || isRetrying) return
    setIsRetrying(true)
    try {
      await onRetry()
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <div
      className={
        className ??
        'space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center'
      }
    >
      <p className="text-sm text-destructive">{message ?? t('common.loadFailed')}</p>
      {onRetry ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isRetrying}
          aria-busy={isRetrying}
          onClick={() => void handleRetry()}
        >
          {t('license.retry')}
        </Button>
      ) : null}
    </div>
  )
}
