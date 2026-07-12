import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMatch, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { OrderSidebarPanel } from '@/components/orders/OrderSidebarPanel'
import { PageShell } from '@/components/PageShell'
import { UserAddressesPanel, type UserAddress } from '@/components/users/UserAddressesPanel'
import { UserBotConnectionsPanel } from '@/components/users/UserBotConnectionsPanel'
import type { BotConnectionInfo } from '@/components/users/SendMessageDialog'
import { UserCommunicationPanel } from '@/components/users/UserCommunicationPanel'
import { UserWishlistPanel, type WishlistItem } from '@/components/users/UserWishlistPanel'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'

type UserProfile = {
  job: string
  national_id: string
  birth_date: string
  landline: string
}

type UserBank = {
  bank_name: string
  account_number: string
  card_number: string
  sheba: string
}

type UserDetail = {
  id: number
  login: string
  name: string
  first_name?: string
  last_name?: string
  email: string
  phone?: string
  role?: string
  profile: UserProfile
  bank: UserBank
  addresses: UserAddress[]
  default_address_id?: string
  wishlist: WishlistItem[]
  bots: BotConnectionInfo
}

const ROLES = [
  { value: 'subscriber', key: 'users.roleSubscriber' },
  { value: 'customer', key: 'users.roleCustomer' },
  { value: 'author', key: 'users.roleAuthor' },
  { value: 'editor', key: 'users.roleEditor' },
  { value: 'shop_manager', key: 'users.roleShopManager' },
] as const

export default function UserDetailPage() {
  const { t, i18n } = useTranslation()
  const nav = useNavigate()
  const qc = useQueryClient()
  const isNew = Boolean(useMatch('/users/new'))
  const params = useParams()
  const userId = isNew ? null : Number(params.userId)
  const isRtl = i18n.dir() === 'rtl'

  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('customer')
  const [profile, setProfile] = useState<UserProfile>({ job: '', national_id: '', birth_date: '', landline: '' })
  const [bank, setBank] = useState<UserBank>({ bank_name: '', account_number: '', card_number: '', sheba: '' })

  const q = useQuery({
    queryKey: ['user', userId],
    queryFn: () => apiFetch<UserDetail>(`users/${userId}`),
    enabled: !isNew && userId != null && !Number.isNaN(userId),
  })
  useQueryErrorToast(q)

  useEffect(() => {
    if (!q.data) return
    setFirstName(q.data.first_name ?? q.data.name.split(/\s+/)[0] ?? '')
    setLastName(q.data.last_name ?? q.data.name.split(/\s+/).slice(1).join(' ') ?? '')
    setEmail(q.data.email)
    setPhone(q.data.phone ?? '')
    setRole(q.data.role ?? 'customer')
    setProfile(q.data.profile ?? { job: '', national_id: '', birth_date: '', landline: '' })
    setBank(q.data.bank ?? { bank_name: '', account_number: '', card_number: '', sheba: '' })
  }, [q.data])

  const create = useMutation({
    mutationFn: async () => {
      const created = await apiFetch<{ id: number }>('users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_login: login, user_email: email, user_pass: password, role }),
      })
      await apiFetch(`users/${created.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, phone, profile, bank }),
      })
      return created.id
    },
    onSuccess: (id) => {
      toast.success(t('common.saved'))
      void qc.invalidateQueries({ queryKey: ['users'] })
      nav(`/users/${id}`, { replace: true })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const save = useMutation({
    mutationFn: () =>
      apiFetch(`users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, user_email: email, phone, role, profile, bank }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['user', userId] })
      void qc.invalidateQueries({ queryKey: ['users'] })
      toast.success(t('common.saved'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const title = isNew ? t('users.createTitle') : t('users.editTitle', { login: q.data?.login ?? '' })

  if (!isNew && q.isLoading) {
    return (
      <PageShell title={title}>
        <Skeleton className="h-40 w-full max-w-2xl" />
      </PageShell>
    )
  }

  const data = q.data
  const addresses = data?.addresses ?? []
  const wishlist = data?.wishlist ?? []
  const bots = data?.bots ?? {}

  return (
    <PageShell title={title}>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardContent className="space-y-3 pt-6">
              <h2 className="text-sm font-semibold">{t('users.sectionAccount')}</h2>
              {isNew ? (
                <div>
                  <Label>{t('users.fieldLogin')}</Label>
                  <Input className="mt-1" value={login} onChange={(e) => setLogin(e.target.value)} autoComplete="off" />
                </div>
              ) : (
                <div>
                  <Label>{t('users.fieldLogin')}</Label>
                  <Input className="mt-1 bg-muted" value={data?.login ?? ''} readOnly />
                </div>
              )}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label>{t('users.fieldFirstName')}</Label>
                  <Input className="mt-1" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div>
                  <Label>{t('users.fieldLastName')}</Label>
                  <Input className="mt-1" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
                <div>
                  <Label>{t('users.colPhone')}</Label>
                  <Input className="mt-1" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div>
                  <Label>{t('users.colEmail')}</Label>
                  <Input className="mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
              {isNew ? (
                <div>
                  <Label>{t('users.fieldPassword')}</Label>
                  <Input className="mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              ) : null}
              <div>
                <Label className={isRtl ? 'block text-end' : undefined}>{t('users.fieldRole')}</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className={`mt-1 w-full${isRtl ? ' text-end' : ''}`} dir={isRtl ? 'rtl' : undefined}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {t(r.key)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                disabled={create.isPending || save.isPending}
                onClick={() => (isNew ? void create.mutateAsync() : void save.mutateAsync())}
              >
                {isNew ? t('users.submitCreate') : t('common.save')}
              </Button>
            </CardContent>
          </Card>

          {!isNew && userId ? (
            <>
              <UserCommunicationPanel userId={userId} email={email} phone={phone} bots={bots} />
              <UserAddressesPanel
                userId={userId}
                addresses={addresses}
                defaultAddressId={data?.default_address_id}
                onChanged={() => void q.refetch()}
              />
            </>
          ) : null}
        </div>

        <aside className="space-y-4">
          {!isNew && userId ? (
            <>
              <UserWishlistPanel items={wishlist} locale={i18n.language} />
              <UserBotConnectionsPanel userId={userId} bots={bots} onChanged={() => void q.refetch()} />

              <OrderSidebarPanel title={t('users.sectionProfile')}>
                <div className="space-y-2 text-start">
                  <div>
                    <Label className="text-xs">{t('users.fieldJob')}</Label>
                    <Input className="mt-1" value={profile.job} onChange={(e) => setProfile((p) => ({ ...p, job: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs">{t('users.fieldNationalId')}</Label>
                    <Input className="mt-1" value={profile.national_id} onChange={(e) => setProfile((p) => ({ ...p, national_id: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs">{t('users.fieldBirthDate')}</Label>
                    <DatePicker className="mt-1" value={profile.birth_date} onChange={(v) => setProfile((p) => ({ ...p, birth_date: v }))} />
                  </div>
                  <div>
                    <Label className="text-xs">{t('users.fieldLandline')}</Label>
                    <Input className="mt-1" value={profile.landline} onChange={(e) => setProfile((p) => ({ ...p, landline: e.target.value }))} />
                  </div>
                </div>
              </OrderSidebarPanel>

              <OrderSidebarPanel title={t('users.sectionBank')}>
                <div className="space-y-2 text-start">
                  <div>
                    <Label className="text-xs">{t('users.fieldBankName')}</Label>
                    <Input className="mt-1" value={bank.bank_name} onChange={(e) => setBank((b) => ({ ...b, bank_name: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs">{t('users.fieldBankAccount')}</Label>
                    <Input className="mt-1" value={bank.account_number} onChange={(e) => setBank((b) => ({ ...b, account_number: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs">{t('users.fieldBankCard')}</Label>
                    <Input className="mt-1" value={bank.card_number} onChange={(e) => setBank((b) => ({ ...b, card_number: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs">{t('users.fieldBankSheba')}</Label>
                    <Input className="mt-1" value={bank.sheba} onChange={(e) => setBank((b) => ({ ...b, sheba: e.target.value }))} />
                  </div>
                </div>
              </OrderSidebarPanel>
            </>
          ) : null}
        </aside>
      </div>
    </PageShell>
  )
}
