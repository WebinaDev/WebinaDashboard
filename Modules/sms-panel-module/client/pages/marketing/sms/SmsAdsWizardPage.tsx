import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import { cn } from '@/lib/utils'
import { toastApiError } from '@/lib/apiError'
import { toPersianDigits } from '@/lib/date'
import {
  createSmsAd,
  fetchSmsAccount,
  previewSmsAdSegment,
  quoteSmsAd,
  smsQueryOptions,
} from '@/lib/modirpayamak-api'

type SegmentKey =
  | 'system_suggest'
  | 'retarget'
  | 'acquire'
  | 'city_customers'
  | 'all_city'
  | 'vip_buyers'
  | 'followers'

const SEGMENTS: SegmentKey[] = [
  'system_suggest',
  'retarget',
  'acquire',
  'city_customers',
  'all_city',
  'vip_buyers',
  'followers',
]

function tomorrowIso(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

function defaultCampaignName(locale: string): string {
  const d = new Date()
  const label = d.toLocaleDateString(locale.startsWith('fa') ? 'fa-IR' : 'en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  const base = locale.startsWith('fa') ? `کمپین پیامکی ${label}` : `SMS campaign ${label}`
  return base.slice(0, 16)
}

export default function SmsAdsWizardPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const locale = i18n.language

  const [step, setStep] = useState(1)
  const [segment, setSegment] = useState<SegmentKey>('system_suggest')
  const [name, setName] = useState(() => defaultCampaignName(locale))
  const [channel, setChannel] = useState<'sms' | 'notification'>('sms')
  const [schedule, setSchedule] = useState(tomorrowIso())
  const [contentType, setContentType] = useState<'product' | 'category'>('product')
  const [productId, setProductId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [message, setMessage] = useState('')
  const [coupon, setCoupon] = useState('')
  const [segCount, setSegCount] = useState<number | null>(null)

  const accountQ = useQuery({
    queryKey: ['sms', 'account'],
    queryFn: fetchSmsAccount,
    ...smsQueryOptions,
  })
  const account = accountQ.data?.account

  const previewMut = useMutation({
    mutationFn: () => previewSmsAdSegment(segment),
    onSuccess: (res) => setSegCount(res.count),
    onError: (e: Error) => toastApiError(t, e),
  })

  const quoteMut = useMutation({
    mutationFn: () =>
      quoteSmsAd({
        segment,
        channel,
        message: message || 'preview',
      }),
    onError: (e: Error) => toastApiError(t, e),
  })

  const createMut = useMutation({
    mutationFn: () =>
      createSmsAd({
        name,
        segment,
        channel,
        message,
        schedule,
        content_type: contentType,
        product_id: contentType === 'product' ? Number(productId) || 0 : 0,
        category_id: contentType === 'category' ? Number(categoryId) || 0 : 0,
        coupon_code: coupon,
        quoted_cost: quoteMut.data?.customer_cost ?? 0,
      }),
    onSuccess: (res) => {
      toast.success(t('marketing.smsAds.created'))
      void qc.invalidateQueries({ queryKey: ['sms', 'ads'] })
      navigate(`/marketing/sms/ads/${res.campaign.id}`)
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const fmt = (n: number) =>
    locale.startsWith('fa') ? toPersianDigits(n.toLocaleString('en-US')) : n.toLocaleString()

  const smsSale = account?.price_per_unit ?? 0
  const smsList = account?.price_list ?? smsSale
  const notifSale = account?.notif_price_per_unit ?? 0
  const notifList = account?.notif_price_list ?? notifSale

  const canNext1 = !!segment
  const canNext2 =
    name.trim().length > 0 &&
    name.trim().length <= 16 &&
    !!schedule &&
    message.trim().length > 0

  const quote = quoteMut.data

  const steps = useMemo(
    () => [
      t('marketing.smsAds.stepTarget'),
      t('marketing.smsAds.stepSettings'),
      t('marketing.smsAds.stepPay'),
    ],
    [t],
  )

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-4 pb-24">
      <div>
        <h1 className="text-xl font-semibold">{t('marketing.smsAds.wizardTitle')}</h1>
        <div className="mt-4 flex items-center justify-between gap-2">
          {steps.map((label, i) => {
            const n = i + 1
            const active = step === n
            const done = step > n
            return (
              <div key={label} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={cn(
                    'flex size-8 items-center justify-center rounded-full text-sm font-medium',
                    active && 'bg-primary text-primary-foreground',
                    done && 'bg-primary/20 text-primary',
                    !active && !done && 'bg-muted text-muted-foreground',
                  )}
                >
                  {done ? '✓' : locale.startsWith('fa') ? toPersianDigits(String(n)) : n}
                </div>
                <span className={cn('text-xs', active ? 'font-medium' : 'text-muted-foreground')}>{label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {step === 1 ? (
        <div className="space-y-3">
          <p className="text-sm font-medium">{t('marketing.smsAds.whoQuestion')}</p>
          {SEGMENTS.map((key) => (
            <label
              key={key}
              className={cn(
                'border-border flex cursor-pointer gap-3 rounded-xl border p-3',
                segment === key && 'border-primary bg-primary/5',
              )}
            >
              <input
                type="radio"
                className="mt-1"
                checked={segment === key}
                onChange={() => {
                  setSegment(key)
                  setSegCount(null)
                }}
              />
              <span>
                <span className="block text-sm font-medium">{t(`marketing.smsAds.seg.${key}.title`)}</span>
                <span className="text-muted-foreground mt-0.5 block text-xs leading-relaxed">
                  {t(`marketing.smsAds.seg.${key}.desc`)}
                </span>
              </span>
            </label>
          ))}
          {segCount != null ? (
            <p className="text-muted-foreground text-sm">
              {t('marketing.smsAds.segmentCount', { count: fmt(segCount) })}
            </p>
          ) : null}
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('marketing.smsAds.nameLabel')}</Label>
            <Input
              maxLength={16}
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 16))}
            />
            <p className="text-muted-foreground text-xs">
              {t('marketing.smsAds.nameHint')} · {fmt(name.length)}/۱۶
            </p>
          </div>

          <div className="space-y-2">
            <Label>{t('marketing.smsAds.channelLabel')}</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {(
                [
                  ['sms', t('marketing.smsAds.channelSms'), smsSale, smsList],
                  ['notification', t('marketing.smsAds.channelNotif'), notifSale, notifList],
                ] as const
              ).map(([key, label, sale, list]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setChannel(key)}
                  className={cn(
                    'border-border rounded-xl border p-3 text-start',
                    channel === key && 'border-primary bg-primary/5',
                  )}
                >
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="mt-1 flex items-center gap-2 text-sm">
                    <span className="font-semibold">{fmt(sale)}</span>
                    {list > sale ? (
                      <span className="text-muted-foreground line-through">{fmt(list)}</span>
                    ) : null}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('marketing.smsAds.dateLabel')}</Label>
            <DatePicker value={schedule} onChange={setSchedule} />
            <p className="text-muted-foreground text-xs">{t('marketing.smsAds.dateHint')}</p>
          </div>

          <div className="space-y-2">
            <Label>{t('marketing.smsAds.contentLabel')}</Label>
            <div className="flex gap-3">
              {(['product', 'category'] as const).map((k) => (
                <label key={k} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={contentType === k}
                    onChange={() => setContentType(k)}
                  />
                  {t(`marketing.smsAds.content.${k}`)}
                </label>
              ))}
            </div>
            {contentType === 'product' ? (
              <Input
                dir="ltr"
                placeholder={t('marketing.smsAds.productId')}
                value={productId}
                onChange={(e) => setProductId(e.target.value.replace(/\D/g, ''))}
              />
            ) : (
              <Input
                dir="ltr"
                placeholder={t('marketing.smsAds.categoryId')}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value.replace(/\D/g, ''))}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>{t('marketing.smsAds.messageLabel')}</Label>
            <Textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('marketing.smsAds.messagePlaceholder')}
            />
            <p className="text-muted-foreground text-xs">{t('marketing.smsAds.messageHint')}</p>
          </div>

          <div className="space-y-2">
            <Label>{t('marketing.smsAds.couponOptional')}</Label>
            <Input value={coupon} onChange={(e) => setCoupon(e.target.value)} dir="ltr" />
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-4">
          <div className="border-border space-y-2 rounded-xl border p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('marketing.smsAds.recipients')}</span>
              <span>{fmt(quote?.recipient_count ?? segCount ?? 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('marketing.smsAds.unitPrice')}</span>
              <span>{fmt(quote?.price_per_unit ?? (channel === 'sms' ? smsSale : notifSale))}</span>
            </div>
            {(quote?.discount_percent ?? 0) > 0 ? (
              <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                <span>{t('marketing.smsAds.volumeDiscount')}</span>
                <span>{fmt(quote?.discount_percent ?? 0)}%</span>
              </div>
            ) : null}
            <div className="flex justify-between font-medium">
              <span>{t('marketing.smsAds.total')}</span>
              <span>
                {fmt(quote?.customer_cost ?? 0)} {t('marketing.sms.toman')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('marketing.sms.balance')}</span>
              <span>
                {fmt(quote?.balance ?? account?.balance ?? 0)} {t('marketing.sms.toman')}
              </span>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={quoteMut.isPending}
            onClick={() => quoteMut.mutate()}
          >
            {t('marketing.smsAds.refreshQuote')}
          </Button>
        </div>
      ) : null}

      <div className="bg-background/95 border-border fixed inset-x-0 bottom-0 z-40 flex justify-between gap-2 border-t p-3 backdrop-blur md:static md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
        {step > 1 ? (
          <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>
            {t('marketing.smsAds.prev')}
          </Button>
        ) : (
          <Button type="button" variant="ghost" asChild>
            <Link to="/marketing/sms">{t('common.cancel')}</Link>
          </Button>
        )}
        {step < 3 ? (
          <Button
            type="button"
            disabled={step === 1 ? !canNext1 : !canNext2}
            onClick={() => {
              if (step === 1) {
                previewMut.mutate()
                setStep(2)
                return
              }
              quoteMut.mutate()
              setStep(3)
            }}
          >
            {t('marketing.smsAds.next')}
          </Button>
        ) : (
          <Button
            type="button"
            disabled={createMut.isPending || !quote || (quote.customer_cost ?? 0) <= 0}
            onClick={() => createMut.mutate()}
          >
            {t('marketing.smsAds.confirmPay')}
          </Button>
        )}
      </div>
    </div>
  )
}
