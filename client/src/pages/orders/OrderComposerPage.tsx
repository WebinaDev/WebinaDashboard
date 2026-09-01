import { useMutation, useQuery } from '@tanstack/react-query'
import { Minus, Plus, Search, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
import { Textarea } from '@/components/ui/textarea'
import { useStoreCurrency } from '@/hooks/useStoreCurrency'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'
import { formatNumber } from '@/lib/formatNumber'
import { openOrderPrint } from '@/lib/orderPrint'

type PosProduct = {
  id: number
  name: string
  sku: string
  price: number
  type: string
  purchase_price?: number
  variations?: Array<{ id: number; name: string; sku: string; price: number }>
}

type CartLine = {
  key: string
  product_id: number
  variation_id?: number
  name: string
  quantity: number
  price: number
  purchase_type?: string
}

type CustomerHit = {
  id: number
  name: string
  phone: string
  email: string
  first_name: string
  last_name: string
}

const CHANNELS = ['in_store', 'phone', 'bale', 'eitaa', 'rubika', 'telegram', 'instagram', 'other'] as const
const TENDERS = ['cash', 'card_to_card', 'pos_terminal', 'online', 'other'] as const
const PURCHASE_TYPES = ['cash', 'credit', 'installment', 'wholesale'] as const

export default function OrderComposerPage() {
  const { t, i18n } = useTranslation()
  const nav = useNavigate()
  const { orderId } = useParams()
  const editId = orderId ? Number(orderId) : 0
  const { currency } = useStoreCurrency()
  const locale = i18n.language
  const fmt = (n: number) => formatNumber(n, locale)

  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<PosProduct[]>([])
  const [cart, setCart] = useState<CartLine[]>([])
  const [channel, setChannel] = useState('in_store')
  const [tender, setTender] = useState('cash')
  const [purchaseType, setPurchaseType] = useState('cash')
  const [status, setStatus] = useState('processing')
  const [discount, setDiscount] = useState('')
  const [shipping, setShipping] = useState('')
  const [coupon, setCoupon] = useState('')
  const [note, setNote] = useState('')
  const [sendMoadian, setSendMoadian] = useState(false)

  const [custQ, setCustQ] = useState('')
  const [custHits, setCustHits] = useState<CustomerHit[]>([])
  const [customerId, setCustomerId] = useState(0)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address1, setAddress1] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [personKind, setPersonKind] = useState('natural')
  const [nationalId, setNationalId] = useState('')
  const [economicCode, setEconomicCode] = useState('')

  const existing = useQuery({
    queryKey: ['order', editId],
    enabled: editId > 0,
    queryFn: () => apiFetch<Record<string, unknown>>(`orders/${editId}`),
  })

  useEffect(() => {
    const o = existing.data
    if (!o) return
    const items = (o.items as Array<Record<string, unknown>>) || []
    setCart(
      items.map((it, i) => ({
        key: `e-${i}`,
        product_id: Number(it.product_id || 0),
        variation_id: Number(it.variation_id || 0) || undefined,
        name: String(it.name || ''),
        quantity: Number(it.quantity || 1),
        price: Number(it.price || it.total || 0) / Math.max(1, Number(it.quantity || 1)),
      })),
    )
    setChannel(String(o.sales_channel || 'in_store'))
    setTender(String(o.payment_tender || 'cash'))
    setPurchaseType(String(o.purchase_type || 'cash'))
    setStatus(String(o.status || 'processing'))
    setNote(String(o.customer_note || ''))
    setCustomerId(Number(o.customer_id || 0))
    const billing = (o.billing as Record<string, string>) || {}
    setFirstName(billing.first_name || '')
    setLastName(billing.last_name || '')
    setPhone(billing.phone || '')
    setEmail(billing.email || '')
    setAddress1(billing.address_1 || '')
    setCity(billing.city || '')
    setState(billing.state || '')
    const tax = (o.buyer_tax as Record<string, string>) || {}
    setPersonKind(tax.person_kind || 'natural')
    setNationalId(tax.national_id || String(o.national_id || ''))
    setEconomicCode(tax.economic_code || '')
  }, [existing.data])

  useEffect(() => {
    const id = window.setTimeout(async () => {
      if (query.trim().length < 1) {
        setHits([])
        return
      }
      try {
        const res = await apiFetch<{ items: PosProduct[] }>(
          `shop/products/pos-search?q=${encodeURIComponent(query.trim())}&limit=20`,
        )
        setHits(res.items ?? [])
      } catch {
        setHits([])
      }
    }, 200)
    return () => window.clearTimeout(id)
  }, [query])

  useEffect(() => {
    const id = window.setTimeout(async () => {
      if (custQ.trim().length < 2) {
        setCustHits([])
        return
      }
      try {
        const res = await apiFetch<{ items: CustomerHit[] }>(
          `shop/pos/customers?q=${encodeURIComponent(custQ.trim())}`,
        )
        setCustHits(res.items ?? [])
      } catch {
        setCustHits([])
      }
    }, 250)
    return () => window.clearTimeout(id)
  }, [custQ])

  const subtotal = useMemo(() => cart.reduce((s, l) => s + l.price * l.quantity, 0), [cart])
  const total = Math.max(0, subtotal - (Number(discount) || 0) + (Number(shipping) || 0))

  function addProduct(p: PosProduct, variation?: { id: number; name: string; price: number }) {
    const vid = variation?.id
    const key = vid ? `v-${vid}` : `p-${p.id}`
    setCart((prev) => {
      const i = prev.findIndex((l) => l.key === key)
      if (i >= 0) {
        const next = [...prev]
        next[i] = { ...next[i], quantity: next[i].quantity + 1 }
        return next
      }
      return [
        ...prev,
        {
          key,
          product_id: p.id,
          variation_id: vid,
          name: variation?.name ?? p.name,
          quantity: 1,
          price: variation?.price ?? p.price,
          purchase_type: purchaseType,
        },
      ]
    })
    setQuery('')
    setHits([])
  }

  const save = useMutation({
    mutationFn: async () => {
      const body: Record<string, unknown> = {
        pos: true,
        sales_channel: channel,
        payment_tender: tender,
        purchase_type: purchaseType,
        status,
        set_paid: true,
        calculate_taxes: true,
        order_discount: Number(discount) || undefined,
        shipping_total: Number(shipping) || undefined,
        coupon_codes: coupon.trim() ? [coupon.trim()] : undefined,
        customer_note: note,
        create_customer: !customerId && !!phone,
        customer_id: customerId || undefined,
        customer: {
          first_name: firstName,
          last_name: lastName,
          phone,
          email,
          create: !customerId && !!phone,
        },
        billing: {
          first_name: firstName,
          last_name: lastName,
          phone,
          email,
          address_1: address1,
          city,
          state,
          country: 'IR',
        },
        shipping: {
          first_name: firstName,
          last_name: lastName,
          address_1: address1,
          city,
          state,
          country: 'IR',
        },
        buyer_tax: {
          person_kind: personKind,
          national_id: nationalId,
          economic_code: economicCode,
        },
        line_items: cart.map((l) => ({
          product_id: l.product_id,
          variation_id: l.variation_id,
          quantity: l.quantity,
          price: l.price,
          purchase_type: l.purchase_type || purchaseType,
        })),
      }
      if (editId > 0) {
        return apiFetch<{ id: number }>(`orders/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      }
      return apiFetch<{ id: number }>('shop/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    },
    onSuccess: async (order) => {
      toast.success(t('pos.orderCreated', { id: order.id }))
      if (sendMoadian) {
        try {
          await apiFetch(`accounting/sync/order/${order.id}`, { method: 'POST' })
          toast.success(t('pos.moadianQueued'))
        } catch (e) {
          toastApiError(t, e as Error)
        }
      }
      nav(`/orders/list/${order.id}`)
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  return (
    <PageShell title={editId ? t('orders.editOrder', { id: editId }) : t('orders.newOrder')}>
      <div className="mb-4 flex flex-wrap gap-2">
        <Button type="button" variant="outline" asChild>
          <Link to="/pos">{t('pos.simpleMode')}</Link>
        </Button>
        <Button type="button" disabled={!cart.length || save.isPending} onClick={() => void save.mutateAsync()}>
          {save.isPending ? t('common.saving') : t('common.save')}
        </Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              className="ps-10"
              placeholder={t('pos.searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {hits.length > 0 ? (
            <ul className="max-h-40 space-y-1 overflow-y-auto rounded-md border p-1">
              {hits.map((p) => (
                <li key={p.id}>
                  {p.variations?.length ? (
                    <div className="space-y-1 p-2 text-sm">
                      <div className="font-medium">{p.name}</div>
                      <div className="flex flex-wrap gap-1">
                        {p.variations.map((v) => (
                          <Button key={v.id} type="button" size="sm" variant="secondary" onClick={() => addProduct(p, v)}>
                            {v.name} · {fmt(v.price)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="hover:bg-muted flex w-full justify-between px-3 py-2 text-start text-sm"
                      onClick={() => addProduct(p)}
                    >
                      <span>{p.name}</span>
                      <span className="tabular-nums">{fmt(p.price)}</span>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-xs">
                  <th className="px-2 py-2 text-start">{t('products.colName')}</th>
                  <th className="px-2 py-2 text-start">{t('pos.qty')}</th>
                  <th className="px-2 py-2 text-start">{t('pos.price')}</th>
                  <th className="px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {cart.map((l) => (
                  <tr key={l.key} className="border-b">
                    <td className="px-2 py-2">{l.name}</td>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-1">
                        <Button type="button" size="icon" variant="outline" className="size-7" onClick={() => setCart((p) => p.map((x) => (x.key === l.key ? { ...x, quantity: Math.max(1, x.quantity - 1) } : x)))}>
                          <Minus className="size-3" />
                        </Button>
                        <Input
                          className="h-8 w-14"
                          type="number"
                          value={l.quantity}
                          onChange={(e) =>
                            setCart((p) =>
                              p.map((x) => (x.key === l.key ? { ...x, quantity: Math.max(1, Number(e.target.value) || 1) } : x)),
                            )
                          }
                        />
                        <Button type="button" size="icon" variant="outline" className="size-7" onClick={() => setCart((p) => p.map((x) => (x.key === l.key ? { ...x, quantity: x.quantity + 1 } : x)))}>
                          <Plus className="size-3" />
                        </Button>
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <Input
                        className="h-8 w-28"
                        type="number"
                        value={l.price}
                        onChange={(e) =>
                          setCart((p) => p.map((x) => (x.key === l.key ? { ...x, price: Number(e.target.value) || 0 } : x)))
                        }
                      />
                    </td>
                    <td className="px-2 py-2">
                      <Button type="button" size="icon" variant="ghost" onClick={() => setCart((p) => p.filter((x) => x.key !== l.key))}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2 rounded-md border p-3">
            <Label>{t('pos.customer')}</Label>
            <Input placeholder={t('pos.customerSearch')} value={custQ} onChange={(e) => setCustQ(e.target.value)} />
            {custHits.length > 0 ? (
              <ul className="max-h-24 overflow-y-auto rounded border text-sm">
                {custHits.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      className="hover:bg-muted w-full px-2 py-1 text-start"
                      onClick={() => {
                        setCustomerId(c.id)
                        setFirstName(c.first_name)
                        setLastName(c.last_name)
                        setPhone(c.phone)
                        setEmail(c.email)
                        setCustQ('')
                        setCustHits([])
                      }}
                    >
                      {c.name} · {c.phone}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder={t('users.fieldFirstName')} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              <Input placeholder={t('users.fieldLastName')} value={lastName} onChange={(e) => setLastName(e.target.value)} />
              <Input placeholder={t('pos.newPhone')} value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Input placeholder={t('users.fieldEmail')} value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input className="col-span-2" placeholder={t('pos.address')} value={address1} onChange={(e) => setAddress1(e.target.value)} />
              <Input placeholder={t('pos.city')} value={city} onChange={(e) => setCity(e.target.value)} />
              <Input placeholder={t('pos.state')} value={state} onChange={(e) => setState(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2 rounded-md border p-3">
            <Label>{t('pos.buyerTax')}</Label>
            <Select value={personKind} onValueChange={setPersonKind}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="natural">{t('pos.personNatural')}</SelectItem>
                <SelectItem value="legal">{t('pos.personLegal')}</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder={t('pos.nationalId')} value={nationalId} onChange={(e) => setNationalId(e.target.value)} />
            <Input placeholder={t('pos.economicCode')} value={economicCode} onChange={(e) => setEconomicCode(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label>{t('pos.channel')}</Label>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHANNELS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {t(`pos.channel.${c}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>{t('pos.tender')}</Label>
              <Select value={tender} onValueChange={setTender}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TENDERS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {t(`pos.tender.${c}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>{t('pos.purchaseType')}</Label>
              <Select value={purchaseType} onValueChange={setPurchaseType}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PURCHASE_TYPES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {t(`pos.purchase.${c}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>{t('orders.colStatus')}</Label>
              <Input value={status} onChange={(e) => setStatus(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>{t('pos.discount')}</Label>
              <Input value={discount} onChange={(e) => setDiscount(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>{t('pos.shipping')}</Label>
              <Input value={shipping} onChange={(e) => setShipping(e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>{t('pos.coupon')}</Label>
              <Input value={coupon} onChange={(e) => setCoupon(e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>{t('orders.customerNote')}</Label>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={sendMoadian} onChange={(e) => setSendMoadian(e.target.checked)} />
            {t('pos.sendMoadianAfter')}
          </label>

          <div className="bg-muted/40 flex items-center justify-between rounded-md p-3 text-base font-semibold">
            <span>{t('pos.total')}</span>
            <span className="tabular-nums">
              {fmt(total)} {currency}
            </span>
          </div>

          {editId > 0 ? (
            <Button type="button" variant="outline" onClick={() => openOrderPrint(editId, 'invoice')}>
              {t('orders.printInvoice')}
            </Button>
          ) : null}
        </div>
      </div>
    </PageShell>
  )
}
