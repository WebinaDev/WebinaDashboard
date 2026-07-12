import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import type { ProductVariation } from '@/types/product'

type ProductVariationsPanelProps = {
  productId: number
}

export function ProductVariationsPanel({ productId }: ProductVariationsPanelProps) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [newSku, setNewSku] = useState('')
  const [newPrice, setNewPrice] = useState('')

  const q = useQuery({
    queryKey: ['product-variations', productId],
    queryFn: () =>
      apiFetch<{ items: ProductVariation[] }>(`shop/products/${productId}/variations?per_page=100`),
    enabled: productId > 0,
  })
  useQueryErrorToast(q)

  const create = useMutation({
    mutationFn: () =>
      apiFetch<ProductVariation>(`shop/products/${productId}/variations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: newSku,
          regular_price: newPrice,
          status: 'publish',
        }),
      }),
    onSuccess: () => {
      setNewSku('')
      setNewPrice('')
      void qc.invalidateQueries({ queryKey: ['product-variations', productId] })
      void qc.invalidateQueries({ queryKey: ['product', productId] })
      toast.success(t('common.saved'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const patch = useMutation({
    mutationFn: ({ vid, body }: { vid: number; body: Record<string, unknown> }) =>
      apiFetch(`shop/products/${productId}/variations/${vid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['product-variations', productId] })
      toast.success(t('common.saved'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const del = useMutation({
    mutationFn: (vid: number) =>
      apiFetch(`shop/products/${productId}/variations/${vid}`, { method: 'DELETE' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['product-variations', productId] })
      void qc.invalidateQueries({ queryKey: ['product', productId] })
      toast.success(t('common.deleted'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const items = q.data?.items ?? []

  return (
    <Card className="gap-4 py-4 shadow-sm">
      <CardHeader className="px-4 pb-0">
        <CardTitle className="text-sm font-semibold">{t('products.editor.variationsPanel')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4">
        <p className="text-muted-foreground text-xs">{t('products.editor.variationsHint')}</p>

        {items.length > 0 ? (
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>{t('products.fieldSku')}</TableHead>
                  <TableHead>{t('products.fieldRegular')}</TableHead>
                  <TableHead>{t('products.fieldStock')}</TableHead>
                  <TableHead className="w-28" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((v) => (
                  <VariationRow
                    key={v.id}
                    variation={v}
                    onSave={(body) => void patch.mutateAsync({ vid: v.id, body })}
                    onDelete={() => void del.mutateAsync(v.id)}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">{t('products.editor.noVariations')}</p>
        )}

        <div className="flex flex-wrap items-end gap-2 border-t border-border pt-4">
          <Input
            className="max-w-[8rem]"
            value={newSku}
            onChange={(e) => setNewSku(e.target.value)}
            placeholder={t('products.fieldSku')}
          />
          <Input
            className="max-w-[8rem]"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            placeholder={t('products.fieldRegular')}
          />
          <Button
            type="button"
            size="sm"
            disabled={create.isPending || !newPrice.trim()}
            onClick={() => void create.mutateAsync()}
          >
            {t('products.editor.addVariation')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function VariationRow({
  variation,
  onSave,
  onDelete,
}: {
  variation: ProductVariation
  onSave: (body: Record<string, unknown>) => void
  onDelete: () => void
}) {
  const { t } = useTranslation()
  const [sku, setSku] = useState(variation.sku ?? '')
  const [price, setPrice] = useState(variation.regular_price ?? '')
  const [stock, setStock] = useState(
    variation.stock_quantity != null ? String(variation.stock_quantity) : '',
  )

  return (
    <TableRow>
      <TableCell className="text-muted-foreground text-xs">#{variation.id}</TableCell>
      <TableCell>
        <Input className="h-8" value={sku} onChange={(e) => setSku(e.target.value)} />
      </TableCell>
      <TableCell>
        <Input className="h-8" value={price} onChange={(e) => setPrice(e.target.value)} />
      </TableCell>
      <TableCell>
        <Input className="h-8 w-20" value={stock} onChange={(e) => setStock(e.target.value)} />
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              onSave({
                sku,
                regular_price: price,
                stock_quantity: stock === '' ? null : parseInt(stock, 10),
              })
            }
          >
            {t('common.save')}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onDelete}>
            {t('common.delete')}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
