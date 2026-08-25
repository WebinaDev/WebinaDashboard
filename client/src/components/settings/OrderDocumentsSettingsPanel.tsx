import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { QueryErrorState } from '@/components/QueryErrorState'
import { FormSettingsSkeleton } from '@/components/skeletons'
import { DocumentLogoField } from '@/components/settings/DocumentLogoField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
  enable_invoice: boolean
  enable_receipt: boolean
  enable_label: boolean
  enable_product_label: boolean
  enable_packing: boolean
  enable_customer_label: boolean
  enable_store_label: boolean
  invoice_logo_url: string
  invoice_logo_id: number
  receipt_logo_url: string
  receipt_logo_id: number
  label_logo_url: string
  label_logo_id: number
  invoice_thanks: string
  receipt_thanks: string
  label_note: string
  invoice_parties_order: 'sender_first' | 'recipient_first'
  label_orientation: 'portrait' | 'landscape'
  invoice_orientation: 'portrait' | 'landscape'
  invoice_theme: 'classic' | 'modern' | 'band' | 'boxed' | 'stripe' | 'compact' | 'landscape'
  receipt_theme: 'classic' | 'modern' | 'band' | 'compact'
  label_theme: 'stacked' | 'rows' | 'classic' | 'modern' | 'iran' | 'stamp'
  packing_theme: 'classic' | 'band' | 'compact'
  label_size: '100x150' | '100x100' | 'A5'
  customer_label_size: '100x70' | '100x100'
  store_label_size: '100x70' | '100x100'
  product_label_size: '40x30' | '50x30' | '58x40' | '60x40' | '80x50' | '100x50'
  product_label_split_variations: boolean
  invoice_show_status: boolean
  invoice_show_barcode: boolean
  invoice_show_product_image: boolean
  invoice_show_sku: boolean
  receipt_show_barcode: boolean
  receipt_show_items_table: boolean
  label_show_barcode: boolean
  label_show_postman_placeholder: boolean
  label_postman_title: string
  label_postman_hint: string
}

type OrderDocumentsSettingsPanelProps = {
  initial?: OrderDocumentsSettings
  onSaved?: () => void
}

function SwitchRow({
  id,
  label,
  hint,
  checked,
  onChange,
}: {
  id: string
  label: string
  hint?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label htmlFor={id} className="bg-muted/30 flex items-start justify-between gap-3 rounded-xl border px-3 py-2.5">
      <span className="min-w-0">
        <span className="block text-sm">{label}</span>
        {hint ? <span className="text-muted-foreground block text-xs">{hint}</span> : null}
      </span>
      <Switch id={id} checked={checked} onCheckedChange={(v) => onChange(v === true)} />
    </label>
  )
}

function ThemeGrid({
  value,
  options,
  accent,
  onChange,
}: {
  value: string
  options: Array<[string, string]>
  accent: string
  onChange: (v: string) => void
}) {
  const { t } = useTranslation()
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {options.map(([id, labelKey]) => {
        const selected = value === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`rounded-lg border p-2 text-start text-xs ${selected ? 'border-primary ring-2 ring-primary/30' : 'border-border'}`}
          >
            <span
              className="mb-2 block h-8 rounded-sm"
              style={{
                background:
                  id === 'band' || id === 'stripe' || id === 'landscape'
                    ? accent || '#e775ae'
                    : id === 'modern'
                      ? '#111'
                      : id === 'iran' || id === 'stamp'
                        ? `repeating-linear-gradient(-45deg, ${accent || '#e775ae'}22, ${accent || '#e775ae'}22 4px, transparent 4px, transparent 8px)`
                        : '#f3f4f6',
              }}
            />
            {t(labelKey)}
          </button>
        )
      })}
    </div>
  )
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

  const previewLogo = draft.invoice_logo_url || draft.logo_url

  return (
    <div className="mx-auto grid max-w-4xl gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{t('settings.orderDocumentsTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-medium">{t('settings.orderDocsEnable')}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <SwitchRow
                id="od-en-inv"
                label={t('settings.odEnableInvoice')}
                checked={!!draft.enable_invoice}
                onChange={(v) => setField('enable_invoice', v)}
              />
              <SwitchRow
                id="od-en-rec"
                label={t('settings.odEnableReceipt')}
                checked={!!draft.enable_receipt}
                onChange={(v) => setField('enable_receipt', v)}
              />
              <SwitchRow
                id="od-en-lbl"
                label={t('settings.odEnableLabel')}
                checked={!!draft.enable_label}
                onChange={(v) => setField('enable_label', v)}
              />
              <SwitchRow
                id="od-en-pl"
                label={t('settings.odEnableProductLabel')}
                checked={!!draft.enable_product_label}
                onChange={(v) => setField('enable_product_label', v)}
              />
              <SwitchRow
                id="od-en-pack"
                label={t('settings.odEnablePacking')}
                checked={!!draft.enable_packing}
                onChange={(v) => setField('enable_packing', v)}
              />
              <SwitchRow
                id="od-en-cust"
                label={t('settings.odEnableCustomerLabel')}
                checked={!!draft.enable_customer_label}
                onChange={(v) => setField('enable_customer_label', v)}
              />
              <SwitchRow
                id="od-en-store"
                label={t('settings.odEnableStoreLabel')}
                checked={!!draft.enable_store_label}
                onChange={(v) => setField('enable_store_label', v)}
              />
            </div>
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <p className="text-sm font-medium">{t('settings.orderDocsCommon')}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="od-store-name">{t('settings.odStoreName')}</Label>
                <Input id="od-store-name" value={draft.store_name} onChange={(e) => setField('store_name', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="od-accent">{t('settings.odAccentColor')}</Label>
                <Input id="od-accent" type="color" value={draft.accent_color} onChange={(e) => setField('accent_color', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="od-footer-site">{t('settings.odFooterSite')}</Label>
                <Input id="od-footer-site" value={draft.footer_site} onChange={(e) => setField('footer_site', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-4">
            <p className="text-sm font-medium">{t('settings.orderDocsLogos')}</p>
            <DocumentLogoField
              label={t('settings.odInvoiceLogo')}
              hint={t('settings.odInvoiceLogoHint')}
              imageId={draft.invoice_logo_id || 0}
              imageUrl={draft.invoice_logo_url || ''}
              onChange={(item) => {
                setField('invoice_logo_id', item.id)
                setField('invoice_logo_url', item.url)
              }}
              onRemove={() => {
                setField('invoice_logo_id', 0)
                setField('invoice_logo_url', '')
              }}
            />
            <DocumentLogoField
              label={t('settings.odLabelLogo')}
              hint={t('settings.odLabelLogoHint')}
              imageId={draft.label_logo_id || 0}
              imageUrl={draft.label_logo_url || ''}
              onChange={(item) => {
                setField('label_logo_id', item.id)
                setField('label_logo_url', item.url)
              }}
              onRemove={() => {
                setField('label_logo_id', 0)
                setField('label_logo_url', '')
              }}
            />
            <DocumentLogoField
              label={t('settings.odReceiptLogo')}
              hint={t('settings.odReceiptLogoHint')}
              imageId={draft.receipt_logo_id || 0}
              imageUrl={draft.receipt_logo_url || ''}
              onChange={(item) => {
                setField('receipt_logo_id', item.id)
                setField('receipt_logo_url', item.url)
              }}
              onRemove={() => {
                setField('receipt_logo_id', 0)
                setField('receipt_logo_url', '')
              }}
            />
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <p className="text-sm font-medium">{t('settings.orderDocsSender')}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="od-sender-name">{t('settings.odSenderName')}</Label>
                <p className="text-muted-foreground text-xs">{t('settings.odSenderNameHint')}</p>
                <Input id="od-sender-name" value={draft.sender_name} onChange={(e) => setField('sender_name', e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="od-sender-address">{t('settings.odSenderAddress')}</Label>
                <p className="text-muted-foreground text-xs">{t('settings.odSenderAddressHint')}</p>
                <Textarea id="od-sender-address" rows={2} value={draft.sender_address} onChange={(e) => setField('sender_address', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="od-sender-postcode">{t('settings.odSenderPostcode')}</Label>
                <p className="text-muted-foreground text-xs">{t('settings.odSenderPostcodeHint')}</p>
                <Input id="od-sender-postcode" value={draft.sender_postcode} onChange={(e) => setField('sender_postcode', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="od-sender-phone">{t('settings.odSenderPhone')}</Label>
                <p className="text-muted-foreground text-xs">{t('settings.odSenderPhoneHint')}</p>
                <Input id="od-sender-phone" value={draft.sender_phone} onChange={(e) => setField('sender_phone', e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="od-sender-email">{t('settings.odSenderEmail')}</Label>
                <p className="text-muted-foreground text-xs">{t('settings.odSenderEmailHint')}</p>
                <Input id="od-sender-email" value={draft.sender_email} onChange={(e) => setField('sender_email', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <p className="text-sm font-medium">{t('settings.orderDocsInvoice')}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <SwitchRow id="inv-status" label={t('settings.odShowStatus')} checked={!!draft.invoice_show_status} onChange={(v) => setField('invoice_show_status', v)} />
              <SwitchRow id="inv-barcode" label={t('settings.odShowBarcodeInvoice')} checked={!!draft.invoice_show_barcode} onChange={(v) => setField('invoice_show_barcode', v)} />
              <SwitchRow id="inv-img" label={t('settings.odShowProductImage')} checked={!!draft.invoice_show_product_image} onChange={(v) => setField('invoice_show_product_image', v)} />
              <SwitchRow id="inv-sku" label={t('settings.odShowSku')} checked={!!draft.invoice_show_sku} onChange={(v) => setField('invoice_show_sku', v)} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>{t('settings.odInvoiceTheme')}</Label>
                <ThemeGrid
                  value={draft.invoice_theme}
                  accent={draft.accent_color}
                  options={[
                    ['classic', 'settings.odThemeClassic'],
                    ['modern', 'settings.odThemeModern'],
                    ['band', 'settings.odThemeBand'],
                    ['boxed', 'settings.odThemeBoxed'],
                    ['stripe', 'settings.odThemeStripe'],
                    ['compact', 'settings.odThemeCompact'],
                    ['landscape', 'settings.odThemeLandscape'],
                  ]}
                  onChange={(v) => setField('invoice_theme', v as OrderDocumentsSettings['invoice_theme'])}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inv-orient">{t('settings.odInvoiceOrientation')}</Label>
                <select
                  id="inv-orient"
                  className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                  value={draft.invoice_orientation === 'landscape' ? 'landscape' : 'portrait'}
                  onChange={(e) => setField('invoice_orientation', e.target.value as OrderDocumentsSettings['invoice_orientation'])}
                >
                  <option value="portrait">{t('settings.odOrientationPortrait')}</option>
                  <option value="landscape">{t('settings.odOrientationLandscape')}</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="inv-parties">{t('settings.odInvoiceParties')}</Label>
                <p className="text-muted-foreground text-xs">{t('settings.odPartiesHint')}</p>
                <select
                  id="inv-parties"
                  className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                  value={draft.invoice_parties_order}
                  onChange={(e) => setField('invoice_parties_order', e.target.value as OrderDocumentsSettings['invoice_parties_order'])}
                >
                  <option value="sender_first">{t('settings.odPartiesSellerFirst')}</option>
                  <option value="recipient_first">{t('settings.odPartiesBuyerFirst')}</option>
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="inv-thanks">{t('settings.odInvoiceThanks')}</Label>
                <Input id="inv-thanks" value={draft.invoice_thanks} onChange={(e) => setField('invoice_thanks', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <p className="text-sm font-medium">{t('settings.orderDocsReceipt')}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <SwitchRow id="rec-barcode" label={t('settings.odShowBarcodeReceipt')} checked={!!draft.receipt_show_barcode} onChange={(v) => setField('receipt_show_barcode', v)} />
              <SwitchRow id="rec-items" label={t('settings.odShowItemsTable')} checked={!!draft.receipt_show_items_table} onChange={(v) => setField('receipt_show_items_table', v)} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rec-theme">{t('settings.odReceiptTheme')}</Label>
                <select
                  id="rec-theme"
                  className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                  value={draft.receipt_theme}
                  onChange={(e) => setField('receipt_theme', e.target.value as OrderDocumentsSettings['receipt_theme'])}
                >
                  <option value="classic">{t('settings.odThemeClassic')}</option>
                  <option value="modern">{t('settings.odThemeModern')}</option>
                  <option value="band">{t('settings.odThemeBand')}</option>
                  <option value="compact">{t('settings.odThemeCompact')}</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rec-thanks">{t('settings.odReceiptThanks')}</Label>
                <Input id="rec-thanks" value={draft.receipt_thanks} onChange={(e) => setField('receipt_thanks', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <p className="text-sm font-medium">{t('settings.orderDocsLabel')}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <SwitchRow id="lbl-barcode" label={t('settings.odShowBarcodeLabel')} checked={!!draft.label_show_barcode} onChange={(v) => setField('label_show_barcode', v)} />
              <SwitchRow id="lbl-postman" label={t('settings.odShowPostmanPlaceholder')} checked={!!draft.label_show_postman_placeholder} onChange={(v) => setField('label_show_postman_placeholder', v)} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lbl-theme">{t('settings.odLabelTheme')}</Label>
                <select
                  id="lbl-theme"
                  className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                  value={draft.label_theme}
                  onChange={(e) => setField('label_theme', e.target.value as OrderDocumentsSettings['label_theme'])}
                >
                  <option value="stacked">{t('settings.odThemeStacked')}</option>
                  <option value="rows">{t('settings.odThemeRows')}</option>
                  <option value="classic">{t('settings.odThemeClassic')}</option>
                  <option value="modern">{t('settings.odThemeModern')}</option>
                  <option value="iran">{t('settings.odThemeIran')}</option>
                  <option value="stamp">{t('settings.odThemeStamp')}</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lbl-size">{t('settings.odLabelSize')}</Label>
                <select
                  id="lbl-size"
                  className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                  value={draft.label_size}
                  onChange={(e) => setField('label_size', e.target.value as OrderDocumentsSettings['label_size'])}
                >
                  <option value="100x150">{t('settings.odSize100x150')}</option>
                  <option value="100x100">{t('settings.odSize100x100')}</option>
                  <option value="A5">{t('settings.odSizeA5')}</option>
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="lbl-orient">{t('settings.odLabelOrientation')}</Label>
                <p className="text-muted-foreground text-xs">{t('settings.odLabelOrientationHint')}</p>
                <select
                  id="lbl-orient"
                  className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                  value={draft.label_orientation === 'landscape' ? 'landscape' : 'portrait'}
                  onChange={(e) => setField('label_orientation', e.target.value as OrderDocumentsSettings['label_orientation'])}
                >
                  <option value="portrait">{t('settings.odOrientationPortrait')}</option>
                  <option value="landscape">{t('settings.odOrientationLandscape')}</option>
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="lbl-note">{t('settings.odLabelNote')}</Label>
                <Input id="lbl-note" value={draft.label_note} onChange={(e) => setField('label_note', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="od-postman-title">{t('settings.odPostmanTitle')}</Label>
                <Input id="od-postman-title" value={draft.label_postman_title} onChange={(e) => setField('label_postman_title', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="od-postman-hint">{t('settings.odPostmanHint')}</Label>
                <Input id="od-postman-hint" value={draft.label_postman_hint} onChange={(e) => setField('label_postman_hint', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <p className="text-sm font-medium">{t('settings.orderDocsPacking')}</p>
            <div className="space-y-2">
              <Label htmlFor="pk-theme">{t('settings.odPackingTheme')}</Label>
              <select
                id="pk-theme"
                className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                value={draft.packing_theme || 'classic'}
                onChange={(e) => setField('packing_theme', e.target.value as OrderDocumentsSettings['packing_theme'])}
              >
                <option value="classic">{t('settings.odThemeClassic')}</option>
                <option value="band">{t('settings.odThemeBand')}</option>
                <option value="compact">{t('settings.odThemeCompact')}</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <p className="text-sm font-medium">{t('settings.orderDocsStickers')}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cust-size">{t('settings.odCustomerLabelSize')}</Label>
                <select
                  id="cust-size"
                  className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                  value={draft.customer_label_size || '100x70'}
                  onChange={(e) => setField('customer_label_size', e.target.value as OrderDocumentsSettings['customer_label_size'])}
                >
                  <option value="100x70">100 × 70 mm</option>
                  <option value="100x100">100 × 100 mm</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-size">{t('settings.odStoreLabelSize')}</Label>
                <select
                  id="store-size"
                  className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                  value={draft.store_label_size || '100x70'}
                  onChange={(e) => setField('store_label_size', e.target.value as OrderDocumentsSettings['store_label_size'])}
                >
                  <option value="100x70">100 × 70 mm</option>
                  <option value="100x100">100 × 100 mm</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <p className="text-sm font-medium">{t('settings.orderDocsProductLabel')}</p>
            <SwitchRow
              id="pl-split"
              label={t('settings.odSplitVariations')}
              hint={t('settings.odSplitVariationsHint')}
              checked={!!draft.product_label_split_variations}
              onChange={(v) => setField('product_label_split_variations', v)}
            />
            <div className="space-y-2">
              <Label htmlFor="pl-size">{t('settings.odProductLabelSize')}</Label>
              <select
                id="pl-size"
                className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                value={draft.product_label_size}
                onChange={(e) => setField('product_label_size', e.target.value as OrderDocumentsSettings['product_label_size'])}
              >
                {(['40x30', '50x30', '58x40', '60x40', '80x50', '100x50'] as const).map((sz) => (
                  <option key={sz} value={sz}>
                    {sz.replace('x', ' × ')} mm
                  </option>
                ))}
              </select>
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
              {previewLogo ? (
                <img src={previewLogo} alt="" className="h-8 max-w-full object-contain" />
              ) : (
                <div className="bg-muted h-8 w-20 rounded" />
              )}
              <p className="text-sm font-semibold">{draft.store_name || t('settings.odStoreName')}</p>
              <p className="text-muted-foreground text-xs">{draft.invoice_thanks || draft.footer_thanks || '—'}</p>
              <div className="border-t pt-2 text-[10px] text-neutral-500">{draft.footer_site || '—'}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
