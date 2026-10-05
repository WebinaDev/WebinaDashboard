import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { SmsServiceBanner, isSmsUnavailable } from '@/components/marketing/SmsServiceBanner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { toastApiError } from '@/lib/apiError'
import { fetchNewsletterSubscribers, fetchShopSmsSettings, sendNewsletterCampaign } from '@/lib/modirpayamak-api'

export default function SmsNewsletterPage() {
  const { t } = useTranslation()
  const [productId, setProductId] = useState('0')
  const [message, setMessage] = useState('')

  const shopQ = useQuery({ queryKey: ['shop-sms-settings'], queryFn: fetchShopSmsSettings })
  const subsQ = useQuery({
    queryKey: ['newsletter-subs', productId],
    queryFn: () => fetchNewsletterSubscribers(parseInt(productId, 10) || 0),
  })
  useQueryErrorToast(shopQ)
  useQueryErrorToast(subsQ)

  const unavailable = isSmsUnavailable(shopQ.data)
  const subscriberCount = subsQ.data?.subscribers?.length ?? 0
  const newsletter = shopQ.data?.settings?.newsletter ?? {}

  const send = useMutation({
    mutationFn: () =>
      sendNewsletterCampaign({
        product_id: parseInt(productId, 10) || 0,
        message: message.trim() || String(newsletter.message_template ?? ''),
      }),
    onSuccess: (res: { sent?: number }) => toast.success(t('marketing.sms.newsletterSent', { count: res.sent ?? 0 })),
    onError: (e: Error) => toastApiError(t, e),
  })

  const onSend = () => {
    const body = message.trim() || String(newsletter.message_template ?? '').trim()
    if (!body) {
      toast.error(t('marketing.sms.messageRequired'))
      return
    }
    if (subscriberCount <= 0) {
      toast.error(t('marketing.sms.newsletterNoSubscribers'))
      return
    }
    if (!newsletter.enabled) {
      toast.error(t('marketing.sms.newsletterDisabled'))
      return
    }
    send.mutate()
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-semibold">{t('marketing.sms.newsletterTitle')}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t('marketing.sms.newsletterHint')}</p>
      </div>
      {unavailable ? (
        <SmsServiceBanner message={shopQ.data?.message} onRetry={() => void shopQ.refetch()} />
      ) : null}
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>{t('marketing.sms.newsletterCampaign')}</CardTitle>
          <CardDescription>
            {newsletter.pattern_code
              ? t('marketing.sms.newsletterPatternBound', { code: newsletter.pattern_code })
              : t('marketing.sms.newsletterBindHint')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{t('marketing.sms.productId')}</Label>
            <Input className="mt-1" value={productId} onChange={(e) => setProductId(e.target.value)} placeholder="0" />
          </div>
          <div>
            <Label>{t('marketing.sms.message')}</Label>
            <Textarea
              className="mt-1"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={newsletter.message_template || undefined}
            />
          </div>
          <p className="text-muted-foreground text-sm">
            {t('marketing.sms.subscriberCount', { count: subscriberCount })}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" disabled={send.isPending || unavailable} onClick={onSend}>
              {t('marketing.sms.sendCampaign')}
            </Button>
            <Button variant="outline" asChild>
              <Link to="/settings/shop/sms">{t('settings.shopSms.title')}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
