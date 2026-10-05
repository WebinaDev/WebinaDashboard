import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { PageShell } from '@/components/PageShell'
import { QuickAddImagePanel } from '@/components/wfcp/QuickAddImagePanel'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiFetch } from '@/lib/api'

export default function WfcpQuickAddPage() {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [imageId, setImageId] = useState(0)
  const [imageUrl, setImageUrl] = useState('')

  const create = useMutation({
    mutationFn: () =>
      apiFetch<{ success: boolean; product_id: number }>('wfcp/quick-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: name,
          purchase_price: parseFloat(price),
          image_id: imageId > 0 ? imageId : 0,
        }),
      }),
    onSuccess: (r) => {
      toast.success(t('wfcp.quickCreated', { id: r.product_id }))
      setName('')
      setPrice('')
      setImageId(0)
      setImageUrl('')
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  return (
    <PageShell title={t('wfcp.quickTitle')} description={t('wfcp.quickDescription')}>
      <Card className="mx-auto max-w-md shadow-sm">
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label>{t('wfcp.productName')}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t('wfcp.purchasePrice')}</Label>
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <QuickAddImagePanel
            imageId={imageId}
            imageUrl={imageUrl}
            onChange={(item) => {
              setImageId(item.id)
              setImageUrl(item.url)
            }}
            onRemove={() => {
              setImageId(0)
              setImageUrl('')
            }}
          />
          <Button type="button" disabled={create.isPending || !name.trim() || !price} onClick={() => void create.mutateAsync()}>
            {t('wfcp.createProduct')}
          </Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
