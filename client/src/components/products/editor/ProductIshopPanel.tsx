import { Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type { IshopLabelOption, ProductIshop } from '@/types/product'

type ProductIshopPanelProps = {
  ishop: ProductIshop
  onChange: (next: ProductIshop) => void
  labelOptions?: IshopLabelOption[]
}

const DEFAULT_LABEL_KEYS = [
  'check_purchase',
  'installment_purchase',
  'credit_purchase',
  'original_product',
  'non_original_product',
  'has_warranty',
] as const

export function ProductIshopPanel({
  ishop,
  onChange,
  labelOptions,
}: ProductIshopPanelProps) {
  const { t } = useTranslation()
  const labels: IshopLabelOption[] = labelOptions?.length
    ? labelOptions
    : DEFAULT_LABEL_KEYS.map((key) => ({
        key,
        label: t(`products.ishop.label.${key}`),
      }))
  const customLabels = ishop.custom_labels ?? []
  const faqs = ishop.faqs ?? []

  function patch(partial: Partial<ProductIshop>) {
    onChange({ ...ishop, ...partial })
  }

  function setLabel(key: string, on: boolean) {
    patch({
      labels: {
        ...(ishop.labels ?? {}),
        [key]: on,
      },
    })
  }

  return (
    <Card className="gap-4 py-4 shadow-sm">
      <CardHeader className="px-4 pb-0">
        <CardTitle className="text-sm font-semibold">{t('products.ishop.panelTitle')}</CardTitle>
        <p className="text-muted-foreground text-xs">{t('products.ishop.panelHint')}</p>
      </CardHeader>
      <CardContent className="space-y-5 px-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ishop-ship">{t('products.ishop.shippingTime')}</Label>
            <Input
              id="ishop-ship"
              type="number"
              min={0}
              value={ishop.shipping_time ?? ''}
              onChange={(e) => patch({ shipping_time: e.target.value })}
              placeholder="0"
            />
            <p className="text-muted-foreground text-xs">{t('products.ishop.shippingTimeHint')}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ishop-initial-stock">{t('products.ishop.initialStock')}</Label>
            <Input
              id="ishop-initial-stock"
              type="number"
              min={0}
              value={ishop.initial_stock_quantity ?? ''}
              onChange={(e) => patch({ initial_stock_quantity: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium">{t('products.ishop.labels')}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {labels.map((opt) => (
              <label
                key={opt.key}
                className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2"
              >
                <span className="text-sm">{opt.label}</span>
                <Switch
                  checked={Boolean(ishop.labels?.[opt.key])}
                  onCheckedChange={(v) => setLabel(opt.key, v)}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">{t('products.ishop.customLabels')}</p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 gap-1"
              onClick={() =>
                patch({
                  custom_labels: [...customLabels, { text: '', color: '#4052f0' }],
                })
              }
            >
              <Plus className="size-3.5" />
              {t('products.ishop.addCustomLabel')}
            </Button>
          </div>
          {customLabels.length === 0 ? (
            <p className="text-muted-foreground text-xs">{t('products.ishop.noCustomLabels')}</p>
          ) : (
            <div className="space-y-2">
              {customLabels.map((row, idx) => (
                <div key={idx} className="flex flex-wrap items-center gap-2">
                  <Input
                    value={row.text}
                    onChange={(e) => {
                      const next = [...customLabels]
                      next[idx] = { ...next[idx], text: e.target.value }
                      patch({ custom_labels: next })
                    }}
                    placeholder={t('products.ishop.customLabelText')}
                    className="min-w-[10rem] flex-1"
                  />
                  <Input
                    type="color"
                    value={row.color || '#4052f0'}
                    onChange={(e) => {
                      const next = [...customLabels]
                      next[idx] = { ...next[idx], color: e.target.value }
                      patch({ custom_labels: next })
                    }}
                    className="h-9 w-14 p-1"
                  />
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={() =>
                      patch({ custom_labels: customLabels.filter((_, i) => i !== idx) })
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="ishop-ai-summary">{t('products.ishop.aiReviewSummary')}</Label>
          <Textarea
            id="ishop-ai-summary"
            value={ishop.ai_review_summary || ''}
            onChange={(e) => patch({ ai_review_summary: e.target.value })}
            rows={3}
            placeholder={t('products.ishop.aiReviewSummaryPlaceholder')}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">{t('products.ishop.faqs')}</p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 gap-1"
              onClick={() =>
                patch({
                  faqs: [...faqs, { question: '', answer: '' }],
                })
              }
            >
              <Plus className="size-3.5" />
              {t('products.ishop.addFaq')}
            </Button>
          </div>
          {faqs.length === 0 ? (
            <p className="text-muted-foreground text-xs">{t('products.ishop.noFaqs')}</p>
          ) : (
            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div key={idx} className="space-y-2 rounded-md border border-border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <Label className="text-xs">{t('products.ishop.faqQuestion')}</Label>
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => patch({ faqs: faqs.filter((_, i) => i !== idx) })}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                  <Input
                    value={faq.question}
                    onChange={(e) => {
                      const next = [...faqs]
                      next[idx] = { ...next[idx], question: e.target.value }
                      patch({ faqs: next })
                    }}
                  />
                  <Label className="text-xs">{t('products.ishop.faqAnswer')}</Label>
                  <Textarea
                    value={faq.answer}
                    onChange={(e) => {
                      const next = [...faqs]
                      next[idx] = { ...next[idx], answer: e.target.value }
                      patch({ faqs: next })
                    }}
                    rows={2}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
