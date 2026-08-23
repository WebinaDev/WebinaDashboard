import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { PageShell } from '@/components/PageShell'
import { UserAddressesPanel, type UserAddress } from '@/components/users/UserAddressesPanel'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'

type MePayload = {
  id: number
  addresses: UserAddress[]
  default_address_id?: string
}

export default function AccountAddressesPage() {
  const { t } = useTranslation()
  const q = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => apiFetch<MePayload>('users/me'),
  })
  useQueryErrorToast(q)

  const userId = q.data?.id ?? 0

  return (
    <PageShell title={t('account.addressesTitle')} description={t('account.addressesSubtitle')}>
      {userId ? (
        <UserAddressesPanel
          userId={userId}
          addresses={q.data?.addresses ?? []}
          defaultAddressId={q.data?.default_address_id}
          onChanged={() => void q.refetch()}
          variant="page"
        />
      ) : (
        <p className="text-muted-foreground text-sm">{t('common.loading')}</p>
      )}
    </PageShell>
  )
}
