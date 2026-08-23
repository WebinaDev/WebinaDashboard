import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { MoneyDisplay } from '@/components/currency/MoneyDisplay'
import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LazyImage } from '@/components/ui/lazy-image'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { useStoreCurrency } from '@/hooks/useStoreCurrency'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type FavItem = {
  id: number
  name: string
  thumbnail?: string
  price?: string | number
  permalink?: string
}

export default function AccountFavoritesPage() {
  const { t, i18n } = useTranslation()
  const store = useStoreCurrency()
  const qc = useQueryClient()
  const q = useQuery({
    queryKey: ['account', 'wishlist'],
    queryFn: () => apiFetch<{ items: FavItem[] }>('account/wishlist'),
  })
  useQueryErrorToast(q)

  const remove = useMutation({
    mutationFn: (id: number) => apiFetch(`account/wishlist/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success(t('common.deleted'))
      void qc.invalidateQueries({ queryKey: ['account', 'wishlist'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const items = q.data?.items ?? []

  return (
    <PageShell title={t('account.favoritesTitle')} description={t('account.favoritesSubtitle')}>
      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t('common.empty')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex gap-3 p-4">
                {item.thumbnail ? (
                  <LazyImage src={item.thumbnail} alt={item.name} className="size-16 rounded object-cover" />
                ) : null}
                <div className="min-w-0 flex-1">
                  {item.permalink ? (
                    <a
                      href={item.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary line-clamp-2 text-sm font-medium hover:underline"
                    >
                      {item.name}
                    </a>
                  ) : (
                    <p className="line-clamp-2 text-sm font-medium">{item.name}</p>
                  )}
                  {item.price != null && item.price !== '' ? (
                    <p className="text-muted-foreground mt-1 text-xs">
                      <MoneyDisplay
                        amount={parseFloat(String(item.price))}
                        currency={store.currency}
                        locale={i18n.language}
                      />
                    </p>
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="mt-2 px-0"
                    disabled={remove.isPending}
                    onClick={() => void remove.mutateAsync(item.id)}
                  >
                    {t('common.delete')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  )
}
