import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type MapRow = {
  platform: string
  remote_product_id?: string
  remote_variant_id?: string
  remote_url?: string
  sync_enabled?: number | boolean
  can_create?: boolean
  last_sync_at?: string
  last_error?: string
}

const API_PLATFORMS = ['digikala', 'basalam', 'technolife', 'tapsishop', 'snappshop'] as const

type ProductMarketplaceMapPanelProps = {
  productId?: number
}

export function ProductMarketplaceMapPanel({ productId }: ProductMarketplaceMapPanelProps) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [draft, setDraft] = useState<MapRow[]>([])

  const q = useQuery({
    queryKey: ['wnc', 'product-maps', productId],
    enabled: Boolean(productId),
    queryFn: () => apiFetch<{ maps: MapRow[] }>(`wnc/products/${productId}/maps`),
  })

  useEffect(() => {
    if (q.data?.maps) {
      setDraft(JSON.parse(JSON.stringify(q.data.maps)) as MapRow[])
    }
  }, [q.data])

  const save = useMutation({
    mutationFn: async () => {
      await apiFetch(`wnc/products/${productId}/maps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maps: draft }),
      })
    },
    onSuccess: async () => {
      toast.success(t('common.saved'))
      await qc.invalidateQueries({ queryKey: ['wnc', 'product-maps', productId] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const sync = useMutation({
    mutationFn: async () => {
      await apiFetch(`wnc/products/${productId}/sync-now`, { method: 'POST', body: '{}' })
    },
    onSuccess: () => toast.success(t('wnc.syncQueued')),
    onError: (e: Error) => toastApiError(t, e),
  })

  const createRemote = useMutation({
    mutationFn: async (platform: string) => {
      await apiFetch(`wnc/products/${productId}/create-remote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      })
    },
    onSuccess: async () => {
      toast.success(t('wnc.createRemoteOk'))
      await qc.invalidateQueries({ queryKey: ['wnc', 'product-maps', productId] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const updateRow = (platform: string, patch: Partial<MapRow>) => {
    setDraft((rows) => rows.map((r) => (r.platform === platform ? { ...r, ...patch } : r)))
  }

  const resolveDkp = useMutation({
    mutationFn: async (row: MapRow) => {
      const res = await apiFetch<{
        dk_product_id: string
        dk_variant_id: string
        variants: { variant_id: string; title: string }[]
        needs_variant?: boolean
      }>(`digikala/products/${productId}/map`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dkp: row.remote_product_id,
          variant_id: row.remote_variant_id,
        }),
      })
      return res
    },
    onSuccess: async (res, row) => {
      updateRow(row.platform, {
        remote_product_id: res.dk_product_id ? `DKP-${res.dk_product_id}` : row.remote_product_id,
        remote_variant_id: res.dk_variant_id || row.remote_variant_id,
      })
      if (res.needs_variant) {
        toast.message(t('digikala.pickVariant'), {
          description: res.variants.map((v) => `${v.title} (#${v.variant_id})`).join(' · '),
        })
      } else {
        toast.success(t('digikala.dkpMapped'))
      }
      await qc.invalidateQueries({ queryKey: ['wnc', 'product-maps', productId] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  if (!productId) {
    return (
      <Card className="gap-2 py-3 shadow-sm">
        <CardHeader className="px-3 pb-0">
          <CardTitle className="text-sm font-semibold">{t('wnc.productMapTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="px-3">
          <p className="text-muted-foreground text-xs">{t('wnc.productMapSaveFirst')}</p>
        </CardContent>
      </Card>
    )
  }

  const rows: MapRow[] =
    draft.length > 0
      ? draft
      : API_PLATFORMS.map((platform) => ({
          platform,
          remote_product_id: '',
          remote_variant_id: '',
          remote_url: '',
          sync_enabled: 1,
          can_create: false,
          last_sync_at: undefined,
          last_error: undefined,
        }))

  return (
    <Card className="gap-2 py-3 shadow-sm">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 space-y-0 px-3 pb-0">
        <div className="min-w-0 space-y-0.5">
          <CardTitle className="text-sm font-semibold">{t('wnc.productMapTitle')}</CardTitle>
          <p className="text-muted-foreground text-xs">{t('wnc.productMapHint')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" disabled={sync.isPending} onClick={() => void sync.mutateAsync()}>
            {t('wnc.syncNow')}
          </Button>
          <Button type="button" size="sm" disabled={save.isPending} onClick={() => void save.mutateAsync()}>
            {t('common.save')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 px-3">
        {rows.map((row) => (
          <div key={row.platform} className="space-y-2 rounded-md border border-border/70 p-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium">{t(`wnc.modules.${row.platform}.title`, row.platform)}</span>
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`wnc-map-${row.platform}-sync`}
                  checked={Boolean(row.sync_enabled)}
                  onCheckedChange={(v) => updateRow(row.platform, { sync_enabled: v === true ? 1 : 0 })}
                />
                <Label htmlFor={`wnc-map-${row.platform}-sync`} className="text-xs font-normal">
                  {t('wnc.autoSync')}
                </Label>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">{t('wnc.remoteProductId')}</Label>
                <Input
                  value={String(row.remote_product_id ?? '')}
                  onChange={(e) => updateRow(row.platform, { remote_product_id: e.target.value })}
                  placeholder={row.platform === 'digikala' ? 'DKP-10252314' : undefined}
                  dir="ltr"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t('wnc.remoteVariantId')}</Label>
                <Input
                  value={String(row.remote_variant_id ?? '')}
                  onChange={(e) => updateRow(row.platform, { remote_variant_id: e.target.value })}
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">{t('wnc.remoteUrl')}</Label>
                <Input
                  type="url"
                  value={String(row.remote_url ?? '')}
                  onChange={(e) => updateRow(row.platform, { remote_url: e.target.value })}
                  placeholder="https://"
                  dir="ltr"
                />
              </div>
            </div>
            {row.last_error ? <p className="text-destructive text-xs">{row.last_error}</p> : null}
            {row.platform === 'digikala' ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={resolveDkp.isPending || !row.remote_product_id}
                onClick={() => void resolveDkp.mutateAsync(row)}
              >
                {t('digikala.findVariants')}
              </Button>
            ) : null}
            {row.last_sync_at ? (
              <p className="text-muted-foreground text-xs">
                {t('wnc.lastSync')}: {row.last_sync_at}
              </p>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!row.can_create || createRemote.isPending}
              onClick={() => void createRemote.mutateAsync(row.platform)}
              title={!row.can_create ? t('wnc.createRemoteUnsupported') : undefined}
            >
              {t('wnc.createRemote')}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default ProductMarketplaceMapPanel
