import { useMutation, useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Minus, Plus, Search, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useStoreCurrency } from '@/hooks/useStoreCurrency'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'
import { formatNumber } from '@/lib/formatNumber'

type PosProduct = {
  id: number
  name: string
  sku: string
  price: number
  type: string
  variations?: Array<{ id: number; name: string; sku: string; price: number }>
}

type CartLine = {
  key: string
  product_id: number
  variation_id?: number
  name: string
  quantity: number
  price: number
}

type ShippingOption = {
  key: string
  zone_id: number
  method_id: string
  instance_id: number
  title: string
  cost: number
}

type PaymentGateway = {
  id: string
  title: string
  enabled: boolean
}

export default function PosPayLinkPage() {
  const { t, i18n } = useTranslation()
  const { currency } = useStoreCurrency()
  const fmt = (n: number) => formatNumber(n, i18n.language)

  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<PosProduct[]>([])
  const [cart, setCart] = useState<CartLine[]>([])
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [postcode, setPostcode] = useState('')
  const [discount, setDiscount] = useState('')
  const [purchaseType, setPurchaseType] = useState<'retail' | 'credit'>('retail')
  const [allowBothTypes, setAllowBothTypes] = useState(false)
  const [selectedShipping, setSelectedShipping] = useState('')
  const [manualShipping, setManualShipping] = useState('')
  const [selectedGateways, setSelectedGateways] = useState<string[]>([])

  const gatewaysQ = useQuery({
    queryKey: ['shop', 'payment-gateways'],
    queryFn: () => apiFetch<{ gateways: PaymentGateway[] }>('shop/payment-gateways'),
  })

  const shippingQ = useQuery({
    queryKey: ['shop', 'shipping-zones'],
    queryFn: () =>
      apiFetch<{
        zones: Array<{
          id: number
          name: string
          methods: Array<{ id: string; instance_id?: number; title: string; cost?: string | number }>
        }>
      }>('shop/shipping/zones'),
  })

  const shippingOptions = useMemo<ShippingOption[]>(() => {
    const out: ShippingOption[] = []
    for (const zone of shippingQ.data?.zones ?? []) {
      for (const raw of zone.methods ?? []) {
        if (!raw || typeof raw !== 'object') continue
        const method = raw as Record<string, unknown>
        const methodId = String(method.method_id ?? method.id ?? '')
        if (!methodId) continue
        const instanceId = Number(method.instance_id ?? 0)
        const title = String(method.title ?? method.method_title ?? methodId)
        const settings = method.settings
        let cost = Number(method.cost ?? 0) || 0
        if (settings && typeof settings === 'object') {
          const s = settings as Record<string, unknown>
          cost = Number(s.cost ?? cost) || cost
        }
        const key = `${zone.id}:${methodId}:${instanceId}`
        out.push({
          key,
          zone_id: zone.id,
          method_id: methodId,
          instance_id: instanceId,
          title: `${zone.name} — ${title}`,
          cost,
        })
      }
    }
    return out
  }, [shippingQ.data])

  const enabledGateways = useMemo(
    () =>
      (gatewaysQ.data?.gateways ?? []).filter(
        (g) => g.enabled && !g.id.startsWith('webino_'),
      ),
    [gatewaysQ.data],
  )

  useEffect(() => {
    if (!selectedGateways.length && enabledGateways.length) {
      setSelectedGateways(enabledGateways.map((g) => g.id))
    }
  }, [enabledGateways, selectedGateways.length])

  const runSearch = useCallback(async (q: string) => {
    const trimmed = q.trim()
    if (trimmed.length < 1) {
      setHits([])
      return
    }
    try {
      const res = await apiFetch<{ items: PosProduct[] }>(
        `shop/products/pos-search?q=${encodeURIComponent(trimmed)}&limit=20`,
      )
      setHits(res.items ?? [])
    } catch {
      setHits([])
    }
  }, [])

  useEffect(() => {
    const id = window.setTimeout(() => void runSearch(query), 220)
    return () => window.clearTimeout(id)
  }, [query, runSearch])

  function addProduct(p: PosProduct, variation?: PosProduct['variations'] extends (infer V)[] | undefined ? V : never) {
    const vid = variation?.id
    const key = vid ? `v-${vid}` : `p-${p.id}`
    const name = variation?.name ?? p.name
    const price = variation?.price ?? p.price
    setCart((prev) => {
      const i = prev.findIndex((l) => l.key === key)
      if (i >= 0) {
        const next = [...prev]
        next[i] = { ...next[i], quantity: next[i].quantity + 1 }
        return next
      }
      return [...prev, { key, product_id: p.id, variation_id: vid, name, quantity: 1, price }]
    })
    setQuery('')
    setHits([])
  }

  const shipOption = shippingOptions.find((s) => s.key === selectedShipping)
  const manualShip = Number(manualShipping) || 0
  const subtotal = cart.reduce((s, l) => s + l.price * l.quantity, 0)
  const disc = Number(discount) || 0
  const ship = shipOption?.cost ?? manualShip
  const total = Math.max(0, subtotal - disc + ship)

  const submit = useMutation({
    mutationFn: async () => {
      if (!cart.length) throw new Error(t('pos.emptyCart'))
      if (!phone.trim()) throw new Error(t('pos.payLink.phoneRequired'))
      if (!selectedGateways.length) throw new Error(t('pos.payLink.gatewayRequired'))
      const body: Record<string, unknown> = {
        pay_link: true,
        pos: true,
        status: 'pending',
        set_paid: false,
        create_customer: true,
        purchase_type: purchaseType,
        allowed_purchase_types: allowBothTypes ? ['retail', 'credit'] : [purchaseType],
        payment_gateways: selectedGateways,
        order_discount: disc > 0 ? disc : undefined,
        customer: {
          first_name: firstName,
          last_name: lastName,
          phone,
          create: true,
        },
        billing: {
          first_name: firstName,
          last_name: lastName,
          phone,
          address_1: address,
          city,
          state,
          postcode,
          country: 'IR',
        },
        shipping: {
          first_name: firstName,
          last_name: lastName,
          address_1: address,
          city,
          state,
          postcode,
          country: 'IR',
        },
        line_items: cart.map((l) => ({
          product_id: l.product_id,
          variation_id: l.variation_id,
          quantity: l.quantity,
          price: l.price,
          purchase_type: purchaseType,
        })),
      }
      if (shipOption) {
        body.shipping_line = {
          title: shipOption.title,
          method_id: shipOption.method_id,
          instance_id: shipOption.instance_id,
          total: shipOption.cost,
        }
      } else if (ship > 0) {
        body.shipping_total = ship
        body.shipping_method = t('pos.payLink.manualShipping')
      }
      return apiFetch<{ id: number; payment_url?: string }>('shop/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    },
    onSuccess: (res) => {
      toast.success(t('pos.payLink.created'))
      if (res.payment_url) {
        void navigator.clipboard.writeText(res.payment_url).catch(() => undefined)
        toast.message(t('pos.payLink.linkCopied'))
      }
      setCart([])
      setDiscount('')
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  return (
    <PageShell title={t('pos.payLink.title')} description={t('pos.payLink.subtitle')}>
      <div className="mb-4">
        <Button type="button" variant="outline" size="sm" asChild>
          <Link to="/pos">{t('pos.payLink.backToPos')}</Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('pos.payLink.customer')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>{t('pos.payLink.firstName')}</Label>
              <Input className="mt-1" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div>
              <Label>{t('pos.payLink.lastName')}</Label>
              <Input className="mt-1" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label>{t('pos.payLink.phone')}</Label>
              <Input className="mt-1" value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" />
            </div>
            <div className="sm:col-span-2">
              <Label>{t('pos.payLink.address')}</Label>
              <Textarea className="mt-1" value={address} onChange={(e) => setAddress(e.target.value)} rows={2} />
            </div>
            <div>
              <Label>{t('pos.payLink.city')}</Label>
              <Input className="mt-1" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div>
              <Label>{t('pos.payLink.state')}</Label>
              <Input className="mt-1" value={state} onChange={(e) => setState(e.target.value)} />
            </div>
            <div>
              <Label>{t('pos.payLink.postcode')}</Label>
              <Input className="mt-1" value={postcode} onChange={(e) => setPostcode(e.target.value)} dir="ltr" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('pos.payLink.products')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="text-muted-foreground absolute start-3 top-1/2 size-4 -translate-y-1/2" />
              <Input
                className="ps-9"
                placeholder={t('pos.searchPlaceholder')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            {hits.length > 0 ? (
              <ul className="max-h-40 space-y-1 overflow-y-auto rounded-md border p-2 text-sm">
                {hits.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      className="hover:bg-muted w-full rounded px-2 py-1 text-start"
                      onClick={() => addProduct(p)}
                    >
                      {p.name} — {fmt(p.price)} {currency}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            <ul className="space-y-2">
              {cart.map((line) => (
                <li key={line.key} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                  <span className="min-w-0 flex-1 truncate">{line.name}</span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="size-7"
                      onClick={() =>
                        setCart((prev) =>
                          prev
                            .map((l) => (l.key === line.key ? { ...l, quantity: l.quantity - 1 } : l))
                            .filter((l) => l.quantity > 0),
                        )
                      }
                    >
                      <Minus className="size-3" />
                    </Button>
                    <span className="w-6 text-center">{line.quantity}</span>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="size-7"
                      onClick={() =>
                        setCart((prev) =>
                          prev.map((l) => (l.key === line.key ? { ...l, quantity: l.quantity + 1 } : l)),
                        )
                      }
                    >
                      <Plus className="size-3" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="size-7"
                      onClick={() => setCart((prev) => prev.filter((l) => l.key !== line.key))}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                  <span className="text-muted-foreground whitespace-nowrap">
                    {fmt(line.price * line.quantity)} {currency}
                  </span>
                </li>
              ))}
            </ul>
            <div>
              <Label>{t('pos.discount')}</Label>
              <Input
                className="mt-1"
                type="number"
                min={0}
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('pos.payLink.shipping')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedShipping} onValueChange={setSelectedShipping}>
              <SelectTrigger>
                <SelectValue placeholder={t('pos.payLink.selectShipping')} />
              </SelectTrigger>
              <SelectContent>
                {shippingOptions.map((opt) => (
                  <SelectItem key={opt.key} value={opt.key}>
                    {opt.title} ({fmt(opt.cost)} {currency})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!shippingOptions.length ? (
              <div className="mt-3">
                <Label>{t('pos.payLink.manualShipping')}</Label>
                <Input
                  className="mt-1"
                  type="number"
                  min={0}
                  value={manualShipping}
                  onChange={(e) => setManualShipping(e.target.value)}
                />
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('pos.payLink.payment')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t('pos.payLink.purchaseType')}</Label>
              <Select value={purchaseType} onValueChange={(v) => setPurchaseType(v as 'retail' | 'credit')}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retail">{t('pos.payLink.cash')}</SelectItem>
                  <SelectItem value="credit">{t('pos.payLink.installment')}</SelectItem>
                </SelectContent>
              </Select>
              <label className="mt-2 flex items-center gap-2 text-sm">
                <Checkbox checked={allowBothTypes} onCheckedChange={(v) => setAllowBothTypes(!!v)} />
                {t('pos.payLink.allowBothTypes')}
              </label>
            </div>
            <div className="space-y-2">
              <Label>{t('pos.payLink.gateways')}</Label>
              {enabledGateways.map((gw) => (
                <label key={gw.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={selectedGateways.includes(gw.id)}
                    onCheckedChange={(checked) => {
                      setSelectedGateways((prev) =>
                        checked ? [...prev, gw.id] : prev.filter((id) => id !== gw.id),
                      )
                    }}
                  />
                  {gw.title}
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
          <div>
            <p className="text-muted-foreground text-sm">{t('pos.total')}</p>
            <p className="text-2xl font-semibold">
              {fmt(total)} {currency}
            </p>
          </div>
          <Button
            type="button"
            size="lg"
            disabled={submit.isPending || !cart.length}
            onClick={() => void submit.mutateAsync()}
          >
            {submit.isPending ? t('common.loading') : t('pos.payLink.submit')}
          </Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
