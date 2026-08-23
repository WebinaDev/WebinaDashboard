import { MessageCircle, Phone } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { BaleIcon, EitaaIcon, TelegramIcon, WhatsAppIcon } from '@/components/orders/messenger-icons'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

type BotInfo = { connected?: boolean; username?: string }

type OrderCustomerContactBarProps = {
  phone?: string
  email?: string
  customerId?: number
  isGuest?: boolean
  bots?: { bale?: BotInfo; telegram?: BotInfo }
  onSms?: () => void
}

function whatsappDigits(phone: string): string {
  let digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0')) digits = `98${digits.slice(1)}`
  else if (!digits.startsWith('98')) digits = `98${digits}`
  return digits
}

function eitaaHref(phone: string): string {
  const digits = phone.replace(/\D/g, '').replace(/^0/, '98')
  return `https://eitaa.com/${digits}`
}

export function OrderCustomerContactBar({
  phone,
  email,
  customerId,
  isGuest,
  bots,
  onSms,
}: OrderCustomerContactBarProps) {
  const { t } = useTranslation()
  const hasPhone = Boolean(phone?.trim())
  const digits = hasPhone ? phone!.replace(/\s/g, '') : ''

  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-1.5">
        <IconLink tip={t('orders.contact.call')} href={hasPhone ? `tel:${digits}` : undefined} disabled={!hasPhone}>
          <Phone className="size-4" />
        </IconLink>
        <IconBtn tip={t('orders.contact.sms')} disabled={!hasPhone} onClick={onSms}>
          <MessageCircle className="size-4" />
        </IconBtn>
        <IconLink
          tip={t('orders.contact.whatsapp')}
          href={hasPhone ? `https://wa.me/${whatsappDigits(phone!)}` : undefined}
          disabled={!hasPhone}
          external
        >
          <WhatsAppIcon className="size-4" />
        </IconLink>
        <IconLink tip={t('orders.contact.eitaa')} href={hasPhone ? eitaaHref(phone!) : undefined} disabled={!hasPhone} external>
          <EitaaIcon className="size-4" />
        </IconLink>
        <IconLink
          tip={bots?.bale?.connected ? t('orders.contact.bale') : t('orders.contact.baleUnavailable')}
          href={bots?.bale?.username ? `https://ble.ir/${bots.bale.username}` : undefined}
          disabled={!bots?.bale?.connected || !bots?.bale?.username}
          external
        >
          <BaleIcon className="size-4" />
        </IconLink>
        <IconLink
          tip={bots?.telegram?.connected ? t('orders.contact.telegram') : t('orders.contact.telegramUnavailable')}
          href={bots?.telegram?.username ? `https://t.me/${bots.telegram.username}` : undefined}
          disabled={!bots?.telegram?.connected || !bots?.telegram?.username}
          external
        >
          <TelegramIcon className="size-4" />
        </IconLink>
        {!isGuest && customerId && customerId > 0 ? (
          <Button asChild variant="outline" size="sm" className="ms-1">
            <Link to={`/users/${customerId}`}>{t('orders.contact.openUser')}</Link>
          </Button>
        ) : null}
        {email ? (
          <a href={`mailto:${email}`} className="text-muted-foreground ms-1 text-xs hover:underline">
            {email}
          </a>
        ) : null}
      </div>
    </TooltipProvider>
  )
}

function IconLink({
  tip,
  href,
  disabled,
  external,
  children,
}: {
  tip: string
  href?: string
  disabled?: boolean
  external?: boolean
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {disabled || !href ? (
          <Button type="button" variant="outline" size="icon-sm" disabled>
            {children}
          </Button>
        ) : (
          <Button type="button" variant="outline" size="icon-sm" asChild>
            <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>
              {children}
            </a>
          </Button>
        )}
      </TooltipTrigger>
      <TooltipContent>{tip}</TooltipContent>
    </Tooltip>
  )
}

function IconBtn({
  tip,
  disabled,
  onClick,
  children,
}: {
  tip: string
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" variant="outline" size="icon-sm" disabled={disabled} onClick={onClick}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tip}</TooltipContent>
    </Tooltip>
  )
}
