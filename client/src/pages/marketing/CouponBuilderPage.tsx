import { Check, ChevronUp, Percent, Plus, Share2, Trash2, Truck, Coins } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'
import { cn } from '@/lib/utils'

type OfferTemplate = {
  id: string
  title: string
  condition_label: string
  icon: string
  type: string
  amount: string
  condition_type: string
  condition_value: string
  free_shipping?: boolean
  shipping_percent?: number | null
  max_discount?: string | null
}

type OfferCoupon = {
  id: number
  code: string
  type: string
  amount: string
  title?: string
  condition_label?: string
  description?: string
  free_shipping?: boolean
  max_discount?: string
  shipping_percent?: number | null
  template_id?: string
}

function TicketIcon({ icon, className }: { icon: string; className?: string }) {
  const cls = cn('size-5', className)
  if (icon === 'truck') return <Truck className={cls} />
  if (icon === 'percent') return <Percent className={cls} />
  return <Coins className={cls} />
}

function iconForCoupon(c: OfferCoupon | OfferTemplate): string {
  if ('icon' in c && c.icon) return c.icon
  if (c.free_shipping || (c as OfferCoupon).shipping_percent) return 'truck'
  if (c.type === 'percent') return 'percent'
  return 'coins'
}

function CouponTicketCard({
  title,
  condition,
  footer,
  icon,
  actions,
  accent = false,
}: {
  title: string
  condition: string
  footer?: ReactNode
  icon: string
  actions?: ReactNode
  accent?: boolean
}) {
  return (
    <div
      className={cn(
        'relative flex flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm',
        'border-border/70',
      )}
    >
      <div className="flex flex-1 items-start gap-3 p-4 pe-3">
        <div className="min-w-0 flex-1 space-y-1 text-start">
          <p className="text-base font-semibold leading-snug">{title}</p>
          <p className="text-muted-foreground text-sm leading-snug">{condition}</p>
        </div>
        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-full',
            accent ? 'bg-emerald-500/15 text-emerald-600' : 'bg-muted text-muted-foreground',
          )}
        >
          <TicketIcon icon={icon} />
        </div>
      </div>
      <div className="relative mx-3 border-t border-dashed border-border/80">
        <span className="bg-background absolute -start-5 top-1/2 size-4 -translate-y-1/2 rounded-full border border-border/70" />
        <span className="bg-background absolute -end-5 top-1/2 size-4 -translate-y-1/2 rounded-full border border-border/70" />
      </div>
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <div className="text-muted-foreground min-w-0 flex-1 text-sm">{footer}</div>
        {actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
      </div>
    </div>
  )
}

export default function CouponBuilderPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [suggestedOpen, setSuggestedOpen] = useState(true)
  const [ownedOpen, setOwnedOpen] = useState(true)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [condType, setCondType] = useState<'order_nth' | 'min_amount' | 'min_items'>('min_amount')
  const [condValue, setCondValue] = useState('1000000')
  const [rewardType, setRewardType] = useState<'fixed_cart' | 'percent' | 'free_shipping' | 'ship_pct'>('fixed_cart')
  const [rewardAmount, setRewardAmount] = useState('50000')

  const templatesQ = useQuery({
    queryKey: ['coupons', 'templates'],
    queryFn: () =>
      apiFetch<{ items: OfferTemplate[]; owned: Record<string, boolean> }>('marketing/coupons/templates'),
  })
  useQueryErrorToast(templatesQ)

  const offersQ = useQuery({
    queryKey: ['coupons', 'offers'],
    queryFn: () => apiFetch<{ items: OfferCoupon[] }>('marketing/coupons/offers'),
  })
  useQueryErrorToast(offersQ)

  const addTemplate = useMutation({
    mutationFn: (template_id: string) =>
      apiFetch<{ already: boolean; coupon: OfferCoupon }>('marketing/coupons/from-template', {
        method: 'POST',
        body: JSON.stringify({ template_id }),
      }),
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: ['coupons'] })
      toast.success(res.already ? t('coupons.builder.alreadyOwned') : t('coupons.builder.added'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const trash = useMutation({
    mutationFn: (id: number) => apiFetch(`marketing/coupons/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['coupons'] })
      toast.success(t('coupons.trashed'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const createWizard = useMutation({
    mutationFn: async () => {
      const codeRes = await apiFetch<{ code: string }>('marketing/coupons/generate-code')
      const body: Record<string, unknown> = {
        code: codeRes.code,
        type: rewardType === 'ship_pct' || rewardType === 'free_shipping' ? 'fixed_cart' : rewardType,
        amount: rewardType === 'free_shipping' || rewardType === 'ship_pct' ? '0' : rewardAmount,
        free_shipping: rewardType === 'free_shipping',
        individual_use: true,
        status: 'publish',
        is_offer: true,
        condition_type: condType,
        condition_value: condValue,
        auto_apply: true,
        offer_visible: true,
        offer_public: true,
        description: t('coupons.builder.customDesc'),
      }
      if (rewardType === 'ship_pct') {
        body.shipping_percent = Number(rewardAmount) || 50
      }
      if (condType === 'min_amount') {
        body.minimum_amount = condValue
      }
      return apiFetch('marketing/coupons', { method: 'POST', body: JSON.stringify(body) })
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['coupons'] })
      setWizardOpen(false)
      toast.success(t('coupons.builder.added'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const ownedMap = templatesQ.data?.owned ?? {}
  const templates = templatesQ.data?.items ?? []
  const owned = offersQ.data?.items ?? []

  const note = useMemo(() => t('coupons.builder.publicNote'), [t])

  return (
    <PageShell title={t('coupons.builder.title')}>
      <p className="text-muted-foreground mb-6 max-w-3xl text-sm leading-relaxed">{note}</p>

      <div className="mb-4 flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={() => setWizardOpen((v) => !v)}>
          <Plus className="size-4" />
          {t('coupons.builder.create')}
        </Button>
        <Button type="button" size="sm" variant="outline" asChild>
          <Link to="/marketing/coupons/new">{t('coupons.builder.advanced')}</Link>
        </Button>
        <Button type="button" size="sm" variant="ghost" asChild>
          <Link to="/marketing/coupons/table">{t('coupons.builder.classicList')}</Link>
        </Button>
      </div>

      {wizardOpen ? (
        <div className="border-border/70 mb-8 space-y-4 rounded-2xl border p-4">
          <h2 className="text-base font-semibold">{t('coupons.builder.wizardTitle')}</h2>
          <p className="text-muted-foreground text-sm">{t('coupons.builder.wizardHint')}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>{t('coupons.builder.conditionType')}</Label>
              <Select value={condType} onValueChange={(v) => setCondType(v as typeof condType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="order_nth">{t('coupons.builder.cond.orderNth')}</SelectItem>
                  <SelectItem value="min_amount">{t('coupons.builder.cond.minAmount')}</SelectItem>
                  <SelectItem value="min_items">{t('coupons.builder.cond.minItems')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('coupons.builder.conditionValue')}</Label>
              <Input value={condValue} onChange={(e) => setCondValue(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t('coupons.builder.rewardType')}</Label>
              <Select value={rewardType} onValueChange={(v) => setRewardType(v as typeof rewardType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed_cart">{t('coupons.builder.reward.fixed')}</SelectItem>
                  <SelectItem value="percent">{t('coupons.builder.reward.percent')}</SelectItem>
                  <SelectItem value="free_shipping">{t('coupons.builder.reward.freeShip')}</SelectItem>
                  <SelectItem value="ship_pct">{t('coupons.builder.reward.shipPct')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {rewardType !== 'free_shipping' ? (
              <div className="space-y-2">
                <Label>{t('coupons.builder.rewardAmount')}</Label>
                <Input value={rewardAmount} onChange={(e) => setRewardAmount(e.target.value)} />
              </div>
            ) : null}
          </div>
          <Button type="button" onClick={() => createWizard.mutate()} disabled={createWizard.isPending}>
            {t('coupons.builder.publish')}
          </Button>
        </div>
      ) : null}

      <section className="mb-10">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{t('coupons.builder.suggested')}</h2>
            <p className="text-muted-foreground text-sm">{t('coupons.builder.suggestedHint')}</p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => setSuggestedOpen((v) => !v)}>
            {suggestedOpen ? t('coupons.builder.less') : t('coupons.builder.more')}
            <ChevronUp className={cn('size-4 transition', !suggestedOpen && 'rotate-180')} />
          </Button>
        </div>
        {suggestedOpen ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {templates.map((tpl) => {
              const ownedAlready = !!ownedMap[tpl.id]
              return (
                <CouponTicketCard
                  key={tpl.id}
                  title={tpl.title}
                  condition={tpl.condition_label}
                  icon={tpl.icon}
                  footer={
                    ownedAlready ? (
                      <span className="inline-flex items-center gap-1">
                        <Check className="size-3.5 text-emerald-600" />
                        {t('coupons.builder.youHave')}
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="text-primary text-sm font-medium hover:underline"
                        disabled={addTemplate.isPending}
                        onClick={() => addTemplate.mutate(tpl.id)}
                      >
                        {t('coupons.builder.addSuggested')}
                      </button>
                    )
                  }
                />
              )
            })}
          </div>
        ) : null}
      </section>

      <section>
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold">{t('coupons.builder.owned')}</h2>
          <Button type="button" variant="ghost" size="sm" onClick={() => setOwnedOpen((v) => !v)}>
            {ownedOpen ? t('coupons.builder.less') : t('coupons.builder.more')}
            <ChevronUp className={cn('size-4 transition', !ownedOpen && 'rotate-180')} />
          </Button>
        </div>
        {ownedOpen ? (
          owned.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('coupons.builder.ownedEmpty')}</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {owned.map((c) => {
                const title = c.title || c.description || c.code
                const condition = c.condition_label || c.code
                return (
                  <CouponTicketCard
                    key={c.id}
                    title={title}
                    condition={condition}
                    icon={iconForCoupon(c)}
                    accent
                    footer={
                      c.max_discount ? (
                        <span>
                          {t('coupons.builder.upTo', { amount: c.max_discount })}
                        </span>
                      ) : (
                        <span className="font-mono text-xs tracking-wide">{c.code}</span>
                      )
                    }
                    actions={
                      <>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="size-8"
                          asChild
                        >
                          <Link to={`/marketing/coupons/${c.id}`} title={t('coupons.actionEdit')}>
                            <Share2 className="size-4" />
                          </Link>
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="size-8"
                          onClick={() => trash.mutate(c.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </>
                    }
                  />
                )
              })}
            </div>
          )
        ) : null}
      </section>
    </PageShell>
  )
}
