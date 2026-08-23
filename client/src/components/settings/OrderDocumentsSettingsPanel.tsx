import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { QueryErrorState } from '@/components/QueryErrorState'
import { FormSettingsSkeleton } from '@/components/skeletons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { getSsrPage } from '@/lib/ssrPage'

export type OrderDocumentsSettings = {
  store_name: string
  logo_url: string
  accent_color: string
  footer_thanks: string
  footer_site: string
  sender_name: string
  sender_address: string
  sender_postcode: string
  sender_phone: string
  sender_email: string
  invoice_show_status: boolean
  invoice_show_barcode: boolean
  invoice_show_product_image: boolean
  invoice_show_sku: boolean
  receipt_show_barcode: boolean
  receipt_show_items_table: boolean
  label_show_barcode: boolean
  label_show_products: boolean
  label_show_postman_placeholder: boolean
  label_postman_title: string
  label_postman_hint: string
}

type OrderDocumentsSettingsPanelProps = {
  initial?: OrderDocumentsSettings
  onSaved?: () => void
}

export function OrderDocumentsSettingsPanel({ initial, onSaved }: OrderDocumentsSettingsPanelProps) {
  const { t } = useTranslation()
  const ssrInitial = useMemo(
    () => (initial ? undefined : (getSsrPage()?.shopInvoices as OrderDocumentsSettings | undefined)),
    [initial],
  )
  const seed = initial ?? ssrInitial

  const q = useQuery({
    queryKey: ['shop-settings', 'invoices'],
    queryFn: () => apiFetch<OrderDocumentsSettings>('shop/settings/invoices'),
    enabled: !initial,
    initialData: !initial ? ssrInitial : undefined,
    staleTime: ssrInitial ? 90_000 : undefined,
    refetchOnMount: ssrInitial ? false : true,
  })
  useQueryErrorToast(q)
  const [draft, setDraft] = useState<OrderDocumentsSettings | null>(seed ?? null)

  useEffect(() => {
    if (initial) setDraft(initial)
    else if (q.data) setDraft({ ...q.data })
  }, [initial, q.data])

  const save = useMutation({
    mutationFn: () =>
      apiFetch('shop/settings/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      }),
    onSuccess: () => {
      toast.success(t('common.saved'))
      onSaved?.()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  if (!draft && q.isLoading) return <FormSettingsSkeleton cards={1} fieldsPerCard={6} />
  if (q.isError && !draft) return <QueryErrorState onRetry={() => void q.refetch()} />
  if (!draft) return null

  function setField<K extends keyof OrderDocumentsSettings>(key: K, value: OrderDocumentsSettings[K]) {
    setDraft((d) => (d ? { ...d, [key]: value } : d))
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{t('settings.orderDocumentsTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-medium">{t('settings.orderDocsCommon')}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="od-store-name">{t('settings.odStoreName')}</Label>
                <Input id="od-store-name" value={draft.store_name} onChange={(e) => setField('store_name', e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="od-logo">{t('settings.odLogoUrl')}</Label>
                <Input id="od-logo" value={draft.logo_url} onChange={(e) => setField('logo_url', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="od-accent">{t('settings.odAccentColor')}</Label>
                <Input id="od-accent" type="color" value={draft.accent_color} onChange={(e) => setField('accent_color', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="od-footer-site">{t('settings.odFooterSite')}</Label>
                <Input id="od-footer-site" value={draft.footer_site} onChange={(e) => setField('footer_site', e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="od-footer-thanks">{t('settings.odFooterThanks')}</Label>
                <Input id="od-footer-thanks" value={draft.footer_thanks} onChange={(e) => setField('footer_thanks', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <p className="text-sm font-medium">{t('settings.orderDocsSender')}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="od-sender-name">{t('settings.odSenderName')}</Label>
                <Input id="od-sender-name" value={draft.sender_name} onChange={(e) => setField('sender_name', e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="od-sender-address">{t('settings.odSenderAddress')}</Label>
                <Textarea id="od-sender-address" rows={2} value={draft.sender_address} onChange={(e) => setField('sender_address', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="od-sender-postcode">{t('settings.odSenderPostcode')}</Label>
                <Input id="od-sender-postcode" value={draft.sender_postcode} onChange={(e) => setField('sender_postcode', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="od-sender-phone">{t('settings.odSenderPhone')}</Label>
                <Input id="od-sender-phone" value={draft.sender_phone} onChange={(e) => setField('sender_phone', e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="od-sender-email">{t('settings.odSenderEmail')}</Label>
                <Input id="od-sender-email" value={draft.sender_email} onChange={(e) => setField('sender_email', e.target.value)} />
              </div>
            </div>
          </div>

          <DocCheckGroup
            title={t('settings.orderDocsInvoice')}
            items={[
              { id: 'inv-status', label: t('settings.odShowStatus'), checked: draft.invoice_show_status, onChange: (v) => setField('invoice_show_status', v) },
              { id: 'inv-barcode', label: t('settings.odShowBarcode'), checked: draft.invoice_show_barcode, onChange: (v) => setField('invoice_show_barcode', v) },
              { id: 'inv-img', label: t('settings.odShowProductImage'), checked: draft.invoice_show_product_image, onChange: (v) => setField('invoice_show_product_image', v) },
              { id: 'inv-sku', label: t('settings.odShowSku'), checked: draft.invoice_show_sku, onChange: (v) => setField('invoice_show_sku', v) },
            ]}
          />

          <DocCheckGroup
            title={t('settings.orderDocsReceipt')}
            items={[
              { id: 'rec-barcode', label: t('settings.odShowBarcode'), checked: draft.receipt_show_barcode, onChange: (v) => setField('receipt_show_barcode', v) },
              { id: 'rec-items', label: t('settings.odShowItemsTable'), checked: draft.receipt_show_items_table, onChange: (v) => setField('receipt_show_items_table', v) },
            ]}
          />

          <DocCheckGroup
            title={t('settings.orderDocsLabel')}
            items={[
              { id: 'lbl-barcode', label: t('settings.odShowBarcode'), checked: draft.label_show_barcode, onChange: (v) => setField('label_show_barcode', v) },
              { id: 'lbl-products', label: t('settings.odShowProducts'), checked: draft.label_show_products, onChange: (v) => setField('label_show_products', v) },
              { id: 'lbl-postman', label: t('settings.odShowPostmanPlaceholder'), checked: draft.label_show_postman_placeholder, onChange: (v) => setField('label_show_postman_placeholder', v) },
            ]}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="od-postman-title">{t('settings.odPostmanTitle')}</Label>
              <Input id="od-postman-title" value={draft.label_postman_title} onChange={(e) => setField('label_postman_title', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="od-postman-hint">{t('settings.odPostmanHint')}</Label>
              <Input id="od-postman-hint" value={draft.label_postman_hint} onChange={(e) => setField('label_postman_hint', e.target.value)} />
            </div>
          </div>

          <Button type="button" disabled={save.isPending} onClick={() => void save.mutateAsync()}>
            {t('common.save')}
          </Button>
        </CardContent>
      </Card>

      <Card variant="hero" className="h-fit lg:sticky lg:top-4">
        <CardHeader>
          <CardTitle className="text-sm">{t('settings.odBrandingPreview')}</CardTitle>
          <CardDescription>{t('settings.orderDocsCommon')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="overflow-hidden rounded-xl border bg-white text-neutral-900 shadow-soft"
            style={{ borderTopWidth: 4, borderTopColor: draft.accent_color || '#111' }}
          >
            <div className="space-y-3 p-4">
              {draft.logo_url ? (
                <img src={draft.logo_url} alt="" className="h-8 max-w-full object-contain" />
              ) : (
                <div className="bg-muted h-8 w-20 rounded" />
              )}
              <p className="text-sm font-semibold">{draft.store_name || t('settings.odStoreName')}</p>
              <p className="text-muted-foreground text-xs">{draft.footer_thanks || '—'}</p>
              <div className="border-t pt-2 text-[10px] text-neutral-500">{draft.footer_site || '—'}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DocCheckGroup({
  title,
  items,
}: {
  title: string
  items: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void }[]
}) {
  return (
    <div className="space-y-3 border-t border-border pt-4">
      <p className="text-sm font-medium">{title}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <label key={item.id} className="bg-muted/30 flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm">
            <Checkbox checked={item.checked} onCheckedChange={(v) => item.onChange(v === true)} />
            {item.label}
          </label>
        ))}
      </div>
    </div>
  )
}
