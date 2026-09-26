import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'

type CatalogSettings = {
  google_books_api_key?: string
  barcodenest_api_key?: string
  gtinhub_api_key?: string
  buycott_access_token?: string
  google_books_configured?: boolean
  barcodenest_configured?: boolean
  gtinhub_configured?: boolean
  buycott_configured?: boolean
}

export default function ProductCatalogSettingsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [form, setForm] = useState({
    google_books_api_key: '',
    barcodenest_api_key: '',
    gtinhub_api_key: '',
    buycott_access_token: '',
  })

  const q = useQuery({
    queryKey: ['catalog', 'settings'],
    queryFn: () => apiFetch<{ ok: boolean; settings: CatalogSettings }>('catalog/settings'),
  })
  useQueryErrorToast(q)

  useEffect(() => {
    const s = q.data?.settings
    if (!s) return
    setForm({
      google_books_api_key: s.google_books_api_key ?? '',
      barcodenest_api_key: s.barcodenest_api_key ?? '',
      gtinhub_api_key: s.gtinhub_api_key ?? '',
      buycott_access_token: s.buycott_access_token ?? '',
    })
  }, [q.data])

  const saveMut = useMutation({
    mutationFn: () =>
      apiFetch<{ ok: boolean }>('catalog/settings', {
        method: 'POST',
        body: JSON.stringify(form),
      }),
    onSuccess: () => {
      toast.success(t('catalog.settingsSaved'))
      void qc.invalidateQueries({ queryKey: ['catalog', 'settings'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  return (
    <div className="mx-auto w-full max-w-xl space-y-4 p-4 pb-10">
      <Card>
        <CardHeader>
          <CardTitle>{t('catalog.settingsTitle')}</CardTitle>
          <CardDescription>{t('catalog.settingsDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(
            [
              ['google_books_api_key', 'catalog.keyGoogleBooks'],
              ['barcodenest_api_key', 'catalog.keyBarcodeNest'],
              ['gtinhub_api_key', 'catalog.keyGtinHub'],
              ['buycott_access_token', 'catalog.keyBuycott'],
            ] as const
          ).map(([key, labelKey]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{t(labelKey)}</Label>
              <Input
                id={key}
                dir="ltr"
                className="font-mono text-sm"
                type="password"
                autoComplete="off"
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </div>
          ))}
          <Button type="button" disabled={saveMut.isPending} onClick={() => saveMut.mutate()}>
            {saveMut.isPending ? <Loader2 className="me-2 size-4 animate-spin" /> : null}
            {t('common.save')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
