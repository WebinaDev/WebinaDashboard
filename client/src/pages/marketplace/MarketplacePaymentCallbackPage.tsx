import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { verifyMarketplacePurchase } from '@/lib/marketplace-api'

export default function MarketplacePaymentCallbackPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [message, setMessage] = useState(t('marketplace.paymentVerifying'))
  const verifiedRef = useRef(false)

  useEffect(() => {
    if (verifiedRef.current) {
      return
    }
    verifiedRef.current = true

    const controller = new AbortController()
    const authority = params.get('Authority') ?? params.get('authority') ?? ''
    const status = params.get('Status') ?? params.get('status') ?? ''
    const moduleSlug = params.get('module_slug') ?? ''
    const orderId = params.get('order_id')

    if (!moduleSlug) {
      setMessage(t('marketplace.paymentMissing'))
      return () => controller.abort()
    }

    verifyMarketplacePurchase({
      authority,
      status,
      module_slug: moduleSlug,
      order_id: orderId ? Number(orderId) : undefined,
    })
      .then((res) => {
        if (controller.signal.aborted) return
        if (res.ok || res.owned) {
          setMessage(t('marketplace.paymentSuccess'))
          setTimeout(() => navigate('/marketplace'), 1500)
        } else {
          setMessage(t('marketplace.paymentFailed'))
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setMessage(t('marketplace.paymentFailed'))
        }
      })

    return () => controller.abort()
  }, [navigate, params, t])

  return (
    <div className="flex min-h-[40vh] items-center justify-center p-6">
      <p className="text-lg">{message}</p>
    </div>
  )
}
