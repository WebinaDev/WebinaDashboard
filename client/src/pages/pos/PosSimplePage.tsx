import { useMutation } from '@tanstack/react-query'
import { Minus, Plus, Search, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'

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
  stock_quantity: number | null
  stock_status: string
  type: string
  image?: string
  variations?: Array<{
    id: number
    name: string
    sku: string
    price: number
    stock_quantity: number | null
    attributes?: Record<string, string>
  }>
}

type CartLine = {
  key: string
  product_id: number
  variation_id?: number
  name: string
  sku: string
  quantity: number
  price: number
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

export default function PosSimplePage() {
  const { t, i18n } = useTranslation()
  const nav = useNavigate()
  const { currency } = useStoreCurrency()
  const fmt = (n: number) => formatNumber(n, i18n.language)
  const scanRef = useRef<HTMLInputElement>(null)

  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<PosProduct[]>([])
  const [searching, setSearching] = useState(false)
  const [cart, setCart] = useState<CartLine[]>([])
  const [channel, setChannel] = useState<string>('in_store')
  const [tender, setTender] = useState<string>('cash')
  const [amountPaid, setAmountPaid] = useState('')
  const [discount, setDiscount] = useState('')
  const [shipping, setShipping] = useState('')
  const [showExtras, setShowExtras] = useState(false)

  const [custQ, setCustQ] = useState('')
  const [custHits, setCustHits] = useState<CustomerHit[]>([])
  const [customer, setCustomer] = useState<CustomerHit | null>(null)
  const [newPhone, setNewPhone] = useState('')
  const [newName, setNewName] = useState('')

  const subtotal = useMemo(() => cart.reduce((s, l) => s + l.price * l.quantity, 0), [cart])
  const disc = Number(discount) || 0
  const ship = Number(shipping) || 0
  const total = Math.max(0, subtotal - disc + ship)
  const paid = amountPaid === '' ? total : Number(amountPaid) || 0
  const change = paid - total

  const runSearch = useCallback(async (q: string) => {
    const trimmed = q.trim()
    if (trimmed.length < 1) {
      setHits([])
      return
    }
    setSearching(true)
    try {
      const res = await apiFetch<{ items: PosProduct[] }>(
        `shop/products/pos-search?q=${encodeURIComponent(trimmed)}&limit=20`,
      )
      setHits(res.items ?? [])
      if ((res.items?.length ?? 0) === 1 && trimmed.length >= 4) {
        const only = res.items![0]
        if (only.type !== 'variable' || !only.variations?.length) {
          addProduct(only)
          setQuery('')
          setHits([])
        }
      }
    } catch (e) {
      toastApiError(t, e as Error)
    } finally {
      setSearching(false)
    }
  }, [t])

  useEffect(() => {
    const id = window.setTimeout(() => void runSearch(query), 220)
    return () => window.clearTimeout(id)
  }, [query, runSearch])

  useEffect(() => {
    const id = window.setTimeout(async () => {
      const q = custQ.trim()
      if (q.length < 2) {
        setCustHits([])
        return
      }
      try {
        const res = await apiFetch<{ items: CustomerHit[] }>(
          `shop/pos/customers?q=${encodeURIComponent(q)}`,
        )
        setCustHits(res.items ?? [])
      } catch {
        setCustHits([])
      }
    }, 250)
    return () => window.clearTimeout(id)
  }, [custQ])

  function addProduct(p: PosProduct, variation?: PosProduct['variations'] extends (infer V)[] | undefined ? V : never) {
    const vid = variation?.id
    const key = vid ? `v-${vid}` : `p-${p.id}`
    const name = variation?.name ?? p.name
    const sku = variation?.sku || p.sku
    const price = variation?.price ?? p.price
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
          name,
          sku,
          quantity: 1,
          price,
        },
      ]
    })
    scanRef.current?.focus()
  }

  function setQty(key: string, qty: number) {
    setCart((prev) =>
      prev
        .map((l) => (l.key === key ? { ...l, quantity: qty } : l))
        .filter((l) => l.quantity > 0),
    )
  }

  const submit = useMutation({
    mutationFn: async () => {
      if (!cart.length) throw new Error(t('pos.emptyCart'))
      const [first = '', ...rest] = newName.trim().split(/\s+/)
      const body: Record<string, unknown> = {
        pos: true,
        sales_channel: channel,
        payment_tender: tender,
        amount_paid: paid,
        set_paid: true,
        status: 'processing',
        order_discount: disc > 0 ? disc : undefined,
        shipping_total: ship > 0 ? ship : undefined,
        create_customer: !customer && !!newPhone,
        line_items: cart.map((l) => ({
          product_id: l.product_id,
          variation_id: l.variation_id,
          quantity: l.quantity,
          price: l.price,
        })),
      }
      if (customer) {
        body.customer_id = customer.id
        body.customer = {
          phone: customer.phone,
          email: customer.email,
          first_name: customer.first_name,
          last_name: customer.last_name,
        }
      } else if (newPhone || newName) {
        body.customer = {
          phone: newPhone,
          first_name: first,
          last_name: rest.join(' '),
          create: true,
        }
      }
      return apiFetch<{ id: number }>('shop/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    },
    onSuccess: (order) => {
      toast.success(t('pos.orderCreated', { id: order.id }))
      setCart([])
      setDiscount('')
      setShipping('')
      setAmountPaid('')
      setCustomer(null)
      setNewPhone('')
      setNewName('')
      openOrderPrint(order.id, 'receipt')
      scanRef.current?.focus()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col gap-3 lg:flex-row lg:gap-4">
      <section className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl font-semibold tracking-tight">{t('pos.title')}</h1>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" asChild>
              <Link to="/pos/pay-link">{t('pos.payLink.shortTitle')}</Link>
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => nav('/orders/list')}>
              {t('pos.myOrders')}
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            ref={scanRef}
            autoFocus
            className="h-12 pe-3 ps-10 text-base"
            placeholder={t('pos.searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                void runSearch(query)
              }
            }}
          />
        </div>

        {searching ? <p className="text-muted-foreground text-sm">{t('common.loading')}</p> : null}

        {hits.length > 0 ? (
          <ul className="max-h-56 space-y-1 overflow-y-auto rounded-md border p-1">
            {hits.map((p) => (
              <li key={p.id}>
                {p.type === 'variable' && p.variations?.length ? (
                  <div className="space-y-1 p-2">
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="flex flex-wrap gap-1">
                      {p.variations.map((v) => (
                        <Button key={v.id} type="button" size="sm" variant="secondary" onClick={() => addProduct(p, v)}>
                          {v.name.replace(p.name, '').trim() || v.sku || `#${v.id}`} · {fmt(v.price)}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="hover:bg-muted flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-start text-sm"
                    onClick={() => {
                      addProduct(p)
                      setQuery('')
                      setHits([])
                    }}
                  >
                    <span className="min-w-0 truncate font-medium">
                      {p.name}
                      {p.sku ? <span className="text-muted-foreground ms-2 text-xs">{p.sku}</span> : null}
                    </span>
                    <span className="tabular-nums">{fmt(p.price)} {currency}</span>
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="bg-card flex-1 overflow-hidden rounded-lg border">
          {cart.length === 0 ? (
            <p className="text-muted-foreground p-6 text-center text-sm">{t('pos.emptyCart')}</p>
          ) : (
            <ul className="divide-y">
              {cart.map((l) => (
                <li key={l.key} className="flex items-center gap-2 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{l.name}</div>
                    <div className="text-muted-foreground text-xs tabular-nums">
                      {fmt(l.price)} × {l.quantity} = {fmt(l.price * l.quantity)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button type="button" size="icon" variant="outline" className="size-8" onClick={() => setQty(l.key, l.quantity - 1)}>
                      <Minus className="size-3.5" />
                    </Button>
                    <span className="w-8 text-center tabular-nums text-sm">{l.quantity}</span>
                    <Button type="button" size="icon" variant="outline" className="size-8" onClick={() => setQty(l.key, l.quantity + 1)}>
                      <Plus className="size-3.5" />
                    </Button>
                    <Button type="button" size="icon" variant="ghost" className="size-8" onClick={() => setQty(l.key, 0)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <aside className="bg-card flex w-full shrink-0 flex-col gap-3 rounded-lg border p-4 lg:w-80">
        <div className="space-y-2">
          <Label>{t('pos.customer')}</Label>
          {customer ? (
            <div className="bg-muted flex items-center justify-between rounded-md px-3 py-2 text-sm">
              <span className="truncate">
                {customer.name || customer.phone}
                {customer.phone ? ` · ${customer.phone}` : ''}
              </span>
              <Button type="button" size="icon" variant="ghost" className="size-7" onClick={() => setCustomer(null)}>
                <X className="size-3.5" />
              </Button>
            </div>
          ) : (
            <>
              <Input
                placeholder={t('pos.customerSearch')}
                value={custQ}
                onChange={(e) => setCustQ(e.target.value)}
              />
              {custHits.length > 0 ? (
                <ul className="max-h-28 overflow-y-auto rounded-md border text-sm">
                  {custHits.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        className="hover:bg-muted w-full px-3 py-1.5 text-start"
                        onClick={() => {
                          setCustomer(c)
                          setCustQ('')
                          setCustHits([])
                        }}
                      >
                        {c.name || c.phone} {c.phone ? `· ${c.phone}` : ''}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder={t('pos.newPhone')} value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
                <Input placeholder={t('pos.newName')} value={newName} onChange={(e) => setNewName(e.target.value)} />
              </div>
            </>
          )}
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
        </div>

        <button type="button" className="text-muted-foreground text-start text-xs underline" onClick={() => setShowExtras((v) => !v)}>
          {showExtras ? t('pos.hideExtras') : t('pos.showExtras')}
        </button>
        {showExtras ? (
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label>{t('pos.discount')}</Label>
              <Input inputMode="decimal" value={discount} onChange={(e) => setDiscount(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>{t('pos.shipping')}</Label>
              <Input inputMode="decimal" value={shipping} onChange={(e) => setShipping(e.target.value)} />
            </div>
          </div>
        ) : null}

        <div className="space-y-1">
          <Label>{t('pos.amountPaid')}</Label>
          <Input
            inputMode="decimal"
            placeholder={fmt(total)}
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
          />
        </div>

        <div className="bg-muted/50 space-y-1 rounded-md p-3 text-sm">
          <div className="flex justify-between">
            <span>{t('pos.subtotal')}</span>
            <span className="tabular-nums">{fmt(subtotal)}</span>
          </div>
          {disc > 0 ? (
            <div className="flex justify-between text-destructive">
              <span>{t('pos.discount')}</span>
              <span className="tabular-nums">−{fmt(disc)}</span>
            </div>
          ) : null}
          {ship > 0 ? (
            <div className="flex justify-between">
              <span>{t('pos.shipping')}</span>
              <span className="tabular-nums">{fmt(ship)}</span>
            </div>
          ) : null}
          <div className="flex justify-between border-t pt-1 text-base font-semibold">
            <span>{t('pos.total')}</span>
            <span className="tabular-nums">
              {fmt(total)} {currency}
            </span>
          </div>
          {change !== 0 ? (
            <div className="flex justify-between text-xs">
              <span>{change >= 0 ? t('pos.change') : t('pos.remaining')}</span>
              <span className="tabular-nums">{fmt(Math.abs(change))}</span>
            </div>
          ) : null}
        </div>

        <Button
          type="button"
          className="h-12 text-base"
          disabled={!cart.length || submit.isPending}
          onClick={() => void submit.mutateAsync()}
        >
          {submit.isPending ? t('common.saving') : t('pos.checkout')}
        </Button>
      </aside>
    </div>
  )
}
