import { Ban, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { translateOrderStatus } from '@/lib/enumLabels'
import { cn } from '@/lib/utils'

export type StatusOption = { slug: string; label: string }

export type OrderStatusStepId = 'processing' | 'packaged' | 'ready' | 'ship' | 'completed'

export type OrderStatusStep = {
  id: OrderStatusStepId
  /** WC status to apply; null means open ship dialog */
  status: string | null
  labelKey: string
}

const PACKAGED_ALIASES = new Set(['webino-packaged', 'packaged', 'webino-in-stock', 'pws-packaged'])
const READY_ALIASES = new Set(['webino-ready-to-ship', 'ready-to-ship'])
const SHIP_ALIASES = new Set([
  'post',
  'courier',
  'tipax',
  'chapar',
  'webino-post',
  'webino-courier',
  'webino-tipax',
  'webino-chapar',
  'webino-shipping',
  'bslm-shipping',
  'bslm-preparation',
])
const COMPLETED_ALIASES = new Set(['completed', 'bslm-completed'])
const PROCESSING_ALIASES = new Set(['processing', 'pending', 'on-hold', 'pending_on_create', 'pending_on_status'])
const CANCEL_HIDDEN_STATUSES = new Set(['cancelled', 'refunded', 'failed'])

const PIPELINE_STATUS_SLUGS = new Set([
  ...PROCESSING_ALIASES,
  ...PACKAGED_ALIASES,
  ...READY_ALIASES,
  ...SHIP_ALIASES,
  ...COMPLETED_ALIASES,
])

function resolveAvailableSlug(preferred: string[], available: Set<string>): string | null {
  for (const s of preferred) {
    if (available.has(s)) return s
  }
  return preferred[0] ?? null
}

export function buildOrderStatusSteps(availableStatuses: StatusOption[]): OrderStatusStep[] {
  const avail = new Set(availableStatuses.map((s) => s.slug))
  const packaged = resolveAvailableSlug(['webino-packaged', 'packaged'], avail) || 'webino-packaged'
  const ready = resolveAvailableSlug(['webino-ready-to-ship'], avail) || 'webino-ready-to-ship'
  return [
    { id: 'processing', status: 'processing', labelKey: 'orders.statusStep.processing' },
    { id: 'packaged', status: packaged, labelKey: 'orders.statusStep.packaged' },
    { id: 'ready', status: ready, labelKey: 'orders.statusStep.ready' },
    { id: 'ship', status: null, labelKey: 'orders.statusStep.ship' },
    { id: 'completed', status: 'completed', labelKey: 'orders.statusStep.completed' },
  ]
}

export function currentStepIndex(status: string): number {
  const s = status.replace(/^wc-/, '')
  if (COMPLETED_ALIASES.has(s)) return 4
  if (SHIP_ALIASES.has(s)) return 3
  if (READY_ALIASES.has(s)) return 2
  if (PACKAGED_ALIASES.has(s)) return 1
  if (PROCESSING_ALIASES.has(s)) return 0
  return -1
}

export function isShipStatus(status: string): boolean {
  return SHIP_ALIASES.has(status.replace(/^wc-/, ''))
}

/** Map tracking SMS provider kind → preferred WC status slug. */
export function statusForTrackingProvider(kind: string, availableStatuses: StatusOption[]): string {
  const avail = new Set(availableStatuses.map((s) => s.slug))
  const map: Record<string, string[]> = {
    post: ['webino-post', 'post'],
    courier: ['webino-courier', 'courier'],
    tipax: ['webino-tipax', 'tipax'],
    chapar: ['webino-chapar', 'chapar'],
    other: ['webino-shipping', 'webino-ready-to-ship', 'processing'],
  }
  const preferred = map[kind] || map.other
  return resolveAvailableSlug(preferred, avail) || preferred[0] || 'processing'
}

type OrderStatusStepperProps = {
  currentStatus: string
  availableStatuses: StatusOption[]
  disabled?: boolean
  onSelectStatus: (status: string) => void
  onShip: () => void
  onCancel?: () => void
}

export function OrderStatusStepper({
  currentStatus,
  availableStatuses,
  disabled,
  onSelectStatus,
  onShip,
  onCancel,
}: OrderStatusStepperProps) {
  const { t } = useTranslation()
  const steps = buildOrderStatusSteps(availableStatuses)
  const active = currentStepIndex(currentStatus)
  const otherStatuses = availableStatuses.filter((s) => !PIPELINE_STATUS_SLUGS.has(s.slug))
  const statusSlug = currentStatus.replace(/^wc-/, '')
  const showCancel = Boolean(onCancel) && !CANCEL_HIDDEN_STATUSES.has(statusSlug)

  return (
    <div className="space-y-3">
      <LabelRow label={t('orders.statusPipeline')} />
      <ol className="flex flex-wrap items-center gap-1 sm:gap-0">
        {steps.map((step, idx) => {
          const done = active > idx
          const current = active === idx
          const label = t(step.labelKey)
          return (
            <li key={step.id} className="flex items-center">
              {idx > 0 ? (
                <span
                  className={cn(
                    'mx-0.5 hidden h-px w-4 sm:mx-1 sm:block sm:w-6',
                    done || current ? 'bg-primary' : 'bg-border'
                  )}
                  aria-hidden
                />
              ) : null}
              <button
                type="button"
                disabled={disabled}
                onClick={() => {
                  if (step.id === 'ship') {
                    onShip()
                    return
                  }
                  if (step.status && step.status !== currentStatus) {
                    onSelectStatus(step.status)
                  }
                }}
                className={cn(
                  'inline-flex max-w-[7.5rem] flex-col items-center gap-1 rounded-lg px-1.5 py-1.5 text-center transition-colors sm:max-w-none sm:px-2',
                  'hover:bg-muted/60 focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                  disabled && 'pointer-events-none opacity-60'
                )}
              >
                <span
                  className={cn(
                    'flex size-7 items-center justify-center rounded-full border text-xs font-medium',
                    done && 'border-primary bg-primary text-primary-foreground',
                    current && !done && 'border-primary text-primary',
                    !done && !current && 'border-muted-foreground/30 text-muted-foreground'
                  )}
                >
                  {done ? <Check className="size-3.5" aria-hidden /> : idx + 1}
                </span>
                <span
                  className={cn(
                    'text-[10px] leading-tight sm:text-xs',
                    current || done ? 'text-foreground font-medium' : 'text-muted-foreground'
                  )}
                >
                  {label}
                </span>
              </button>
            </li>
          )
        })}
      </ol>

      {otherStatuses.length || showCancel ? (
        <div className="flex flex-wrap items-center gap-2">
          {otherStatuses.length ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="sm" disabled={disabled}>
                  {t('orders.otherStatuses')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-72 overflow-y-auto">
                {otherStatuses.map((s) => (
                  <DropdownMenuItem
                    key={s.slug}
                    disabled={s.slug === currentStatus}
                    onSelect={() => onSelectStatus(s.slug)}
                  >
                    {translateOrderStatus(t, s.slug, s.label)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
          {showCancel ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={disabled}
              onClick={() => onCancel?.()}
            >
              <Ban className="size-3.5" aria-hidden />
              {t('orders.cancelOrder')}
            </Button>
          ) : null}
          {active < 0 && otherStatuses.length ? (
            <span className="text-muted-foreground text-xs">
              {translateOrderStatus(t, currentStatus)}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function LabelRow({ label }: { label: string }) {
  return <p className="text-sm font-medium">{label}</p>
}
