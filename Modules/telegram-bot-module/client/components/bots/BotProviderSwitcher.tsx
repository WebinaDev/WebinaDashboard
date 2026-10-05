import { useTranslation } from 'react-i18next'

import type { BotProvider } from '@/types/bots'
import { cn } from '@/lib/utils'

type BotProviderSwitcherProps = {
  provider: BotProvider
  onChange: (provider: BotProvider) => void
  className?: string
}

export function BotProviderSwitcher({ provider, onChange, className }: BotProviderSwitcherProps) {
  const { t } = useTranslation()

  return (
    <div className={cn('inline-flex rounded-lg border border-border p-1', className)} role="tablist">
      {(['bale', 'telegram'] as const).map((id) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={provider === id}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            provider === id
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground',
          )}
          onClick={() => onChange(id)}
        >
          {id === 'bale' ? t('bots.baleTitle') : t('bots.telegramTitle')}
        </button>
      ))}
    </div>
  )
}
