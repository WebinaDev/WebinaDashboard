import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { verifySmsTopup } from '@/lib/modirpayamak-api'

type CallbackState = 'verifying' | 'success' | 'error'

export default function SmsPaymentCallbackPage() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const [state, setState] = useState<CallbackState>('verifying')
  const [message, setMessage] = useState(t('marketing.sms.paymentVerifying'))

  useEffect(() => {
    const authority = params.get('Authority') ?? params.get('authority') ?? ''
    const status = params.get('Status') ?? params.get('status') ?? ''
    const orderId = params.get('order_id')

    verifySmsTopup({
      authority,
      status,
      order_id: orderId ? Number(orderId) : undefined,
    })
      .then((res) => {
        if (res.ok || res.credited) {
          setState('success')
          setMessage(t('marketing.sms.paymentSuccess'))
        } else {
          setState('error')
          setMessage(res.message ?? t('marketing.sms.paymentFailed'))
        }
      })
      .catch(() => {
        setState('error')
        setMessage(t('marketing.sms.paymentFailed'))
      })
  }, [params, t])

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      <div className="flex min-h-[40vh] items-center justify-center">
        <Card
          className={cn(
            'w-full max-w-md',
            state === 'success' && 'border-emerald-500/40',
            state === 'error' && 'border-destructive/40'
          )}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {state === 'verifying' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : state === 'success' ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <XCircle className="text-destructive h-5 w-5" />
              )}
              {t('marketing.sms.paymentCallback')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={cn(
                'text-sm',
                state === 'success' && 'text-emerald-700 dark:text-emerald-300',
                state === 'error' && 'text-destructive'
              )}
            >
              {message}
            </p>
          </CardContent>
          {state !== 'verifying' ? (
            <CardFooter>
              <Button asChild>
                <Link to="/marketing/sms/wallet">{t('marketing.sms.goToWallet')}</Link>
              </Button>
            </CardFooter>
          ) : null}
        </Card>
      </div>
    </div>
  )
}
