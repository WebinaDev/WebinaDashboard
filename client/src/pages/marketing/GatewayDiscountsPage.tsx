import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BadgePercent, Copy, Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { FormattedNumberInput, parseFormattedNumberInput } from '@/components/ui/formatted-number-input'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { PageShell } from '@/components/PageShell'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'
import { formatNumber } from '@/lib/formatNumber'

type GatewayItem = { id: string; title: string; enabled: boolean; preset?: boolean }

const CUSTOM_GATEWAY = '__custom__'

type Campaign = {
  id: string
  gateway: string
  title: string
  code: string
  description: string
  min_amount: number
  discount_amount: number
  store_share_percent: number
  store_share: number
  gateway_share: number
  start_date: string
  end_date: string
  active: boolean
  combine_with_site: boolean
}

type CampaignForm = {
  gateway: string
  title: string
  code: string
  description: string
  min_amount: string
  discount_amount: string
  store_share_percent: string
  start_date: string
  end_date: string
  active: boolean
  combine_with_site: boolean
}

const EMPTY_FORM: CampaignForm = {
  gateway: '',
  title: '',
  code: '',
  description: '',
  min_amount: '',
  discount_amount: '',
  store_share_percent: '50',
  start_date: '',
  end_date: '',
  active: true,
  combine_with_site: true,
}

function formFromCampaign(c: Campaign): CampaignForm {
  return {
    gateway: c.gateway,
    title: c.title,
    code: c.code,
    description: c.description,
    min_amount: c.min_amount > 0 ? String(c.min_amount) : '',
    discount_amount: c.discount_amount > 0 ? String(c.discount_amount) : '',
    store_share_percent: String(c.store_share_percent ?? 50),
    start_date: c.start_date,
    end_date: c.end_date,
    active: c.active,
    combine_with_site: c.combine_with_site,
  }
}

export default function GatewayDiscountsPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const locale = i18n.language

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CampaignForm>(EMPTY_FORM)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [customGateway, setCustomGateway] = useState(false)

  const listQ = useQuery({
    queryKey: ['gateway-discounts', 'list'],
    queryFn: () => apiFetch<{ items: Campaign[] }>('marketing/gateway-discounts'),
  })
  useQueryErrorToast(listQ)
  const gatewaysQ = useQuery({
    queryKey: ['gateway-discounts', 'gateways'],
    queryFn: () => apiFetch<{ items: GatewayItem[] }>('marketing/gateway-discounts/gateways'),
    staleTime: 60_000,
  })
  const gatewayOptions = useMemo(() => gatewaysQ.data?.items ?? [], [gatewaysQ.data])
  const gatewaysFailed = gatewaysQ.isError
  const items = useMemo(() => listQ.data?.items ?? [], [listQ.data])

  const invalidate = () => void qc.invalidateQueries({ queryKey: ['gateway-discounts'] })

  const saveM = useMutation({
    mutationFn: (payload: CampaignForm & { id?: string }) => {
      const body = {
        gateway: payload.gateway.trim(),
        title: payload.title.trim(),
        code: payload.code.trim().toUpperCase(),
        description: payload.description.trim(),
        min_amount: parseFormattedNumberInput(payload.min_amount) || '0',
        discount_amount: parseFormattedNumberInput(payload.discount_amount) || '0',
        store_share_percent: parseFormattedNumberInput(payload.store_share_percent) || '0',
        start_date: payload.start_date,
        end_date: payload.end_date,
        active: payload.active,
        combine_with_site: payload.combine_with_site,
      }
      if (payload.id) {
        return apiFetch<{ item: Campaign }>(`marketing/gateway-discounts/${encodeURIComponent(payload.id)}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        })
      }
      return apiFetch<{ item: Campaign }>('marketing/gateway-discounts', {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => {
      toast.success(t('gatewayDiscounts.saved'))
      setDialogOpen(false)
      setEditingId(null)
      setForm(EMPTY_FORM)
      invalidate()
    },
    onError: (e) => toastApiError(t, e as Error),
  })

  const deleteM = useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ ok: boolean }>(`marketing/gateway-discounts/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success(t('gatewayDiscounts.deleted'))
      setDeleteId(null)
      invalidate()
    },
    onError: (e) => toastApiError(t, e as Error),
  })

  const toggleM = useMutation({
    mutationFn: (c: Campaign) =>
      apiFetch<{ item: Campaign }>(`marketing/gateway-discounts/${encodeURIComponent(c.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ active: !c.active }),
      }),
    onSuccess: () => invalidate(),
    onError: (e) => toastApiError(t, e as Error),
  })

  const knownGateway = gatewayOptions.some((g) => g.title === form.gateway)
  // The Select stays visible whenever it is usable; the free-text input appears beside it for custom names.
  const showCustomGateway = customGateway || gatewaysFailed || (gatewaysQ.isSuccess && form.gateway !== '' && !knownGateway)
  const gatewaySelectValue = showCustomGateway ? CUSTOM_GATEWAY : knownGateway ? form.gateway : ''

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setCustomGateway(false)
    setDialogOpen(true)
  }

  function openEdit(c: Campaign) {
    setEditingId(c.id)
    setForm(formFromCampaign(c))
    setCustomGateway(gatewayOptions.length > 0 && !gatewayOptions.some((g) => g.title === c.gateway))
    setDialogOpen(true)
  }

  function copyCode(code: string) {
    const done = () => toast.success(t('gatewayDiscounts.copied'))
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(code).then(done).catch(done)
    } else {
      const ta = document.createElement('textarea')
      ta.value = code
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand('copy')
      } catch {
        /* noop */
      }
      document.body.removeChild(ta)
      done()
    }
  }

  const discountNum = Number(parseFormattedNumberInput(form.discount_amount) || '0')
  const shareNum = Math.min(100, Math.max(0, Number(parseFormattedNumberInput(form.store_share_percent) || '0')))
  const storeShare = (discountNum * shareNum) / 100
  const gatewayShare = Math.max(0, discountNum - storeShare)

  const activeCount = items.filter((c) => c.active).length

  const money = (n: number) => formatNumber(Math.round(n), locale)

  const deadlineLabel = (c: Campaign) => {
    if (!c.end_date) return null
    const d = new Date(`${c.end_date}T00:00:00`)
    if (Number.isNaN(d.getTime())) return c.end_date
    return new Intl.DateTimeFormat(locale === 'fa' || locale.startsWith('fa') ? 'fa-IR' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d)
  }

  return (
    <PageShell title={t('gatewayDiscounts.title')} description={t('gatewayDiscounts.description')}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-muted-foreground text-sm">
          {t('gatewayDiscounts.stats', {
            total: formatNumber(items.length, locale),
            active: formatNumber(activeCount, locale),
          })}
        </div>
        <Button type="button" size="sm" onClick={openCreate}>
          <Plus className="size-4" />
          {t('gatewayDiscounts.add')}
        </Button>
      </div>

      {listQ.isLoading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <BadgePercent className="text-muted-foreground size-10" strokeWidth={1.5} />
            <div className="space-y-1">
              <p className="font-semibold">{t('gatewayDiscounts.emptyTitle')}</p>
              <p className="text-muted-foreground max-w-md text-sm leading-relaxed">{t('gatewayDiscounts.emptyHint')}</p>
            </div>
            <Button type="button" size="sm" onClick={openCreate}>
              <Plus className="size-4" />
              {t('gatewayDiscounts.add')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((c) => (
            <Card key={c.id} className={c.active ? 'border-emerald-500/40' : 'opacity-75'}>
              <CardContent className="space-y-3 py-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-emerald-600">{t('gatewayDiscounts.gatewayLabel', { gateway: c.gateway })}</p>
                    {c.title ? <p className="font-bold leading-snug">{c.title}</p> : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={c.combine_with_site ? 'outline' : 'destructive'} className="text-[10px]">
                      {c.combine_with_site ? t('gatewayDiscounts.badgeStack') : t('gatewayDiscounts.badgeExclusive')}
                    </Badge>
                    <Switch
                      checked={c.active}
                      onCheckedChange={() => toggleM.mutate(c)}
                      aria-label={t('gatewayDiscounts.toggleActive')}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-lg font-extrabold">{t('gatewayDiscounts.discountLabel', { amount: money(c.discount_amount) })}</span>
                    {c.min_amount > 0 ? (
                      <p className="text-muted-foreground text-xs">{t('gatewayDiscounts.minLabel', { amount: money(c.min_amount) })}</p>
                    ) : null}
                    {deadlineLabel(c) ? (
                      <p className="text-muted-foreground text-xs">{t('gatewayDiscounts.deadlineLabel', { date: deadlineLabel(c) })}</p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-1.5" dir="ltr">
                    <code className="rounded-md border border-dashed bg-muted/50 px-2.5 py-1.5 font-mono text-sm font-bold tracking-widest select-all">
                      {c.code}
                    </code>
                    <Button type="button" size="icon" variant="outline" className="size-9" onClick={() => copyCode(c.code)} aria-label={t('gatewayDiscounts.copy')}>
                      <Copy className="size-4" />
                    </Button>
                  </div>
                </div>

                <div className="text-muted-foreground grid grid-cols-2 gap-1 rounded-xl border bg-muted/30 p-2 text-[11px]">
                  <span>{t('gatewayDiscounts.shareStore', { amount: money(c.store_share), percent: formatNumber(c.store_share_percent, locale) })}</span>
                  <span>{t('gatewayDiscounts.shareGateway', { amount: money(c.gateway_share), gateway: c.gateway })}</span>
                </div>
                {c.description ? <p className="text-muted-foreground text-xs leading-relaxed">{c.description}</p> : null}

                <div className="flex items-center justify-end gap-1.5">
                  <Button type="button" size="sm" variant="outline" onClick={() => openEdit(c)}>
                    <Pencil className="size-3.5" />
                    {t('common.edit')}
                  </Button>
                  <Button type="button" size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteId(c.id)}>
                    <Trash2 className="size-3.5" />
                    {t('common.delete')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-muted-foreground/90 max-w-2xl text-xs leading-relaxed">{t('gatewayDiscounts.footerNote')}</p>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? t('gatewayDiscounts.editTitle') : t('gatewayDiscounts.createTitle')}</DialogTitle>
            <DialogDescription>{t('gatewayDiscounts.dialogHint')}</DialogDescription>
          </DialogHeader>

          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              if (!form.gateway.trim()) {
                toast.error(t('gatewayDiscounts.gatewayRequired'))
                return
              }
              saveM.mutate({ ...form, id: editingId ?? undefined })
            }}
          >
            <div className="grid gap-1.5">
              <Label>{t('gatewayDiscounts.field.gateway')}</Label>
              {!gatewaysFailed ? (
                <Select
                  value={gatewaySelectValue}
                  onValueChange={(v) => {
                    if (v === CUSTOM_GATEWAY) {
                      setCustomGateway(true)
                      setForm({ ...form, gateway: '' })
                      return
                    }
                    setCustomGateway(false)
                    setForm({ ...form, gateway: v })
                  }}
                  disabled={gatewaysQ.isLoading}
                >
                  <SelectTrigger id="gd-gateway" className="w-full">
                    <SelectValue placeholder={gatewaysQ.isLoading ? t('common.loading') : t('gatewayDiscounts.field.gatewayPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {gatewayOptions.map((g) => (
                      <SelectItem key={g.id} value={g.title}>
                        {g.enabled ? g.title : `${g.title} (${t('gatewayDiscounts.gatewayDisabledSuffix')})`}
                      </SelectItem>
                    ))}
                    <SelectItem value={CUSTOM_GATEWAY}>{t('gatewayDiscounts.gatewayCustom')}</SelectItem>
                  </SelectContent>
                </Select>
              ) : null}
              {showCustomGateway ? (
                <div className="flex items-center gap-2">
                  <Input
                    id="gd-gateway-custom"
                    value={form.gateway}
                    onChange={(e) => setForm({ ...form, gateway: e.target.value })}
                    placeholder={t('gatewayDiscounts.field.gatewayPlaceholder')}
                    autoFocus
                  />
                  {!gatewaysFailed ? (
                    <Button type="button" variant="ghost" size="sm" onClick={() => { setCustomGateway(false); setForm({ ...form, gateway: '' }) }}>
                      {t('gatewayDiscounts.gatewayBackToList')}
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="gd-title">{t('gatewayDiscounts.field.campaignTitle')}</Label>
              <Input
                id="gd-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={t('gatewayDiscounts.field.campaignTitlePlaceholder')}
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="gd-code">{t('gatewayDiscounts.field.code')}</Label>
              <Input
                id="gd-code"
                dir="ltr"
                className="font-mono uppercase tracking-widest"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="TP25NMH"
                autoCapitalize="characters"
                required
              />
              <p className="text-muted-foreground text-[11px]">{t('gatewayDiscounts.field.codeHint')}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="gd-discount">{t('gatewayDiscounts.field.discount')}</Label>
                <FormattedNumberInput
                  id="gd-discount"
                  inputMode="numeric"
                  value={form.discount_amount}
                  onChange={(v) => setForm({ ...form, discount_amount: v })}
                  placeholder="2,500,000"
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="gd-min">{t('gatewayDiscounts.field.min')}</Label>
                <FormattedNumberInput
                  id="gd-min"
                  inputMode="numeric"
                  value={form.min_amount}
                  onChange={(v) => setForm({ ...form, min_amount: v })}
                  placeholder="8,000,000"
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="gd-share">{t('gatewayDiscounts.field.share')}</Label>
              <FormattedNumberInput
                id="gd-share"
                inputMode="decimal"
                value={form.store_share_percent}
                onChange={(v) => setForm({ ...form, store_share_percent: v })}
              />
              <div className="text-muted-foreground grid grid-cols-2 gap-1 rounded-xl border bg-muted/30 p-2 text-[11px] leading-relaxed">
                <span>{t('gatewayDiscounts.shareStore', { amount: money(storeShare), percent: formatNumber(shareNum, locale) })}</span>
                <span>{t('gatewayDiscounts.shareGateway', { amount: money(gatewayShare), gateway: form.gateway.trim() || t('gatewayDiscounts.gatewayLabelShort') })}</span>
              </div>
              <p className="text-muted-foreground text-[11px]">{t('gatewayDiscounts.field.shareHint')}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="gd-start">{t('gatewayDiscounts.field.start')}</Label>
                <DatePicker id="gd-start" value={form.start_date} onChange={(iso) => setForm({ ...form, start_date: iso })} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="gd-end">{t('gatewayDiscounts.field.end')}</Label>
                <DatePicker id="gd-end" value={form.end_date} onChange={(iso) => setForm({ ...form, end_date: iso })} />
              </div>
            </div>

            <fieldset className="grid gap-2 rounded-xl border p-3">
              <legend className="text-muted-foreground px-1 text-[11px] font-medium">{t('gatewayDiscounts.field.combine')}</legend>
              <RadioGroup
                value={form.combine_with_site ? 'stack' : 'exclusive'}
                onValueChange={(v) => setForm({ ...form, combine_with_site: v === 'stack' })}
                className="gap-2"
              >
                <label className="flex cursor-pointer items-start gap-2 text-sm leading-snug">
                  <RadioGroupItem value="stack" id="gd-combine-stack" className="mt-0.5" />
                  <span>
                    <span className="block font-semibold">{t('gatewayDiscounts.combine.stack')}</span>
                    <span className="text-muted-foreground block text-[11px]">{t('gatewayDiscounts.combine.stackHint')}</span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-2 text-sm leading-snug">
                  <RadioGroupItem value="exclusive" id="gd-combine-exclusive" className="mt-0.5" />
                  <span>
                    <span className="block font-semibold">{t('gatewayDiscounts.combine.exclusive')}</span>
                    <span className="text-muted-foreground block text-[11px]">{t('gatewayDiscounts.combine.exclusiveHint')}</span>
                  </span>
                </label>
              </RadioGroup>
            </fieldset>

            <div className="grid gap-1.5">
              <Label htmlFor="gd-desc">{t('gatewayDiscounts.field.description')}</Label>
              <Textarea
                id="gd-desc"
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={t('gatewayDiscounts.field.descriptionPlaceholder')}
              />
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl border bg-muted/30 px-3 py-2">
              <Label htmlFor="gd-active" className="cursor-pointer text-sm font-semibold">{t('gatewayDiscounts.field.active')}</Label>
              <Switch id="gd-active" checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: Boolean(v) })} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={saveM.isPending}>
                {t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => (!open ? setDeleteId(null) : undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('gatewayDiscounts.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('gatewayDiscounts.deleteHint')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteM.mutate(deleteId)}>{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  )
}
