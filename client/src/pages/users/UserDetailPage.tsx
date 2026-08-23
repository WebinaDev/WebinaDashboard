import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMatch, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { OrderCustomerContactBar } from '@/components/orders/OrderCustomerContactBar'
import { OrderCustomerHistoryPanel } from '@/components/orders/OrderCustomerHistoryPanel'
import { OrderSidebarPanel } from '@/components/orders/OrderSidebarPanel'
import { MoneyDisplay } from '@/components/currency/MoneyDisplay'
import { PageShell } from '@/components/PageShell'
import { UserAddressesPanel, type UserAddress } from '@/components/users/UserAddressesPanel'
import { UserCommentsPanel, UserNotesPanel } from '@/components/users/UserActivityPanels'
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
import { useBootstrapQuery } from '@/hooks/useBootstrapQuery'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { normalizeCapabilities } from '@/lib/bootstrapQuery'

type UserProfile = {
  job: string
  national_id: string
  birth_date: string
  landline: string
  refund_method?: string
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
  order_history?: {
    order_count: number
    total_spent: number
    avg_order_value: number
  }
  notes?: Array<{ id: string; content: string; author: string; created_at: string }>
  wallet_balance?: number
}

const ROLES = [
  { value: 'subscriber', key: 'users.roleSubscriber' },
  { value: 'customer', key: 'users.roleCustomer' },
  { value: 'webino_partner', key: 'users.rolePartner' },
  { value: 'author', key: 'users.roleAuthor' },
  { value: 'editor', key: 'users.roleEditor' },
  { value: 'shop_manager', key: 'users.roleShopManager' },
] as const

export default function UserDetailPage() {
  const { t, i18n } = useTranslation()
  const nav = useNavigate()
  const qc = useQueryClient()
  const isNew = Boolean(useMatch('/users/new'))
  const isAccount = Boolean(useMatch('/account/profile'))
  const params = useParams()
  const userId = isNew || isAccount ? null : Number(params.userId)
  const boot = useBootstrapQuery()
  const caps = normalizeCapabilities(boot.data?.capabilities)
  const canEditRole = caps.includes('promote_users') || caps.includes('list_users')
  const isPortalOnly =
    isAccount || (caps.includes('webino_partner_portal') && !caps.includes('edit_users'))
  const isRtl = i18n.dir() === 'rtl'

  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('customer')
  const [profile, setProfile] = useState<UserProfile>({
    job: '',
    national_id: '',
    birth_date: '',
    landline: '',
    refund_method: 'wallet',
  })
  const [bank, setBank] = useState<UserBank>({ bank_name: '', account_number: '', card_number: '', sheba: '' })
  const [walletAmt, setWalletAmt] = useState('')
  const [walletDir, setWalletDir] = useState<'credit' | 'debit'>('credit')

  const q = useQuery({
    queryKey: ['user', isAccount ? 'me' : userId],
    queryFn: () => apiFetch<UserDetail>(isAccount ? 'users/me' : `users/${userId}`),
    enabled: isAccount || (!isNew && userId != null && !Number.isNaN(userId)),
  })
  useQueryErrorToast(q)

  useEffect(() => {
    if (!q.data) return
    setFirstName(q.data.first_name ?? q.data.name.split(/\s+/)[0] ?? '')
    setLastName(q.data.last_name ?? q.data.name.split(/\s+/).slice(1).join(' ') ?? '')
    setEmail(q.data.email)
    setPhone(q.data.phone ?? '')
    setRole(q.data.role ?? 'customer')
    setProfile(q.data.profile ?? { job: '', national_id: '', birth_date: '', landline: '', refund_method: 'wallet' })
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
    mutationFn: async () => {
      await apiFetch(isAccount ? 'users/me' : `users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          user_email: email,
          phone,
          ...(canEditRole ? { role } : {}),
          profile,
          bank,
        }),
      })
      if (isAccount && profile.refund_method) {
        await apiFetch('account/wallet/prefs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refund_method: profile.refund_method }),
        })
      }
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['user', isAccount ? 'me' : userId] })
      void qc.invalidateQueries({ queryKey: ['users'] })
      toast.success(t('common.saved'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const walletAdjust = useMutation({
    mutationFn: async () =>
      apiFetch<{ balance: number }>(`wallet/users/${userId}/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction: walletDir, amount: Number(walletAmt) }),
      }),
    onSuccess: async () => {
      toast.success(t('common.saved'))
      setWalletAmt('')
      await qc.invalidateQueries({ queryKey: ['user', userId] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const title = isNew
    ? t('users.createTitle')
    : isAccount
      ? t('users.myAccountTitle')
      : t('users.editTitle', { login: q.data?.login ?? '' })

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
  const resolvedUserId = isAccount ? data?.id ?? 0 : userId

  return (
    <PageShell title={title}>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardContent className="space-y-3 pt-6">
              <h2 className="text-sm font-semibold">{t('users.sectionAccount')}</h2>
              {!isNew && resolvedUserId && !isPortalOnly ? (
                <div className="space-y-2">
                  <OrderCustomerContactBar
                    phone={phone}
                    email={email}
                    customerId={resolvedUserId}
                    bots={bots}
                    onSms={() => {
                      const el = document.getElementById('user-communication-panel')
                      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                  />
                  {profile.landline.trim() && profile.landline.trim() !== phone.trim() ? (
                    <a
                      href={`tel:${profile.landline.replace(/\s/g, '')}`}
                      className="text-muted-foreground text-xs underline underline-offset-2"
                    >
                      {t('users.contactLandline')}: {profile.landline}
                    </a>
                  ) : null}
                </div>
              ) : null}
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
                {isAccount ? (
                  <>
                    <div>
                      <Label>{t('users.fieldJob')}</Label>
                      <Input className="mt-1" value={profile.job} onChange={(e) => setProfile((p) => ({ ...p, job: e.target.value }))} />
                    </div>
                    <div>
                      <Label>{t('users.fieldNationalId')}</Label>
                      <Input
                        className="mt-1"
                        value={profile.national_id}
                        onChange={(e) => setProfile((p) => ({ ...p, national_id: e.target.value }))}
                      />
                    </div>
                  </>
                ) : null}
              </div>
              {isNew ? (
                <div>
                  <Label>{t('users.fieldPassword')}</Label>
                  <Input className="mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              ) : null}
              {canEditRole ? (
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
              ) : null}
              <Button
                type="button"
                disabled={create.isPending || save.isPending}
                onClick={() => (isNew ? void create.mutateAsync() : void save.mutateAsync())}
              >
                {isNew ? t('users.submitCreate') : t('common.save')}
              </Button>
            </CardContent>
          </Card>

          {!isNew && resolvedUserId ? (
            <>
              {!isPortalOnly ? (
                <div id="user-communication-panel">
                  <UserCommunicationPanel userId={resolvedUserId} email={email} phone={phone} bots={bots} />
                </div>
              ) : null}
              {!isAccount ? (
                <OrderCustomerHistoryPanel
                  history={data?.order_history}
                  currency=""
                  locale={i18n.language}
                  customerId={resolvedUserId}
                  customerEmail={email}
                  customerPhone={phone}
                />
              ) : null}
              {!isPortalOnly ? <UserCommentsPanel userId={resolvedUserId} locale={i18n.language} /> : null}
              {!isPortalOnly ? (
                <UserNotesPanel userId={resolvedUserId} locale={i18n.language} initialNotes={data?.notes} />
              ) : null}
              {!isAccount ? (
                <UserAddressesPanel
                  userId={resolvedUserId}
                  addresses={addresses}
                  defaultAddressId={data?.default_address_id}
                  onChanged={() => void q.refetch()}
                />
              ) : null}
            </>
          ) : null}
        </div>

        <aside className="space-y-4">
          {!isNew && resolvedUserId ? (
            <>
              {!isAccount ? <UserWishlistPanel items={wishlist} locale={i18n.language} /> : null}
              {!isPortalOnly ? (
                <UserBotConnectionsPanel userId={resolvedUserId} bots={bots} onChanged={() => void q.refetch()} />
              ) : null}

              <OrderSidebarPanel title={t('users.sectionProfile')}>
                <div className="space-y-2 text-start">
                  {!isAccount ? (
                    <>
                  <div>
                    <Label className="text-xs">{t('users.fieldJob')}</Label>
                    <Input className="mt-1" value={profile.job} onChange={(e) => setProfile((p) => ({ ...p, job: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs">{t('users.fieldNationalId')}</Label>
                    <Input className="mt-1" value={profile.national_id} onChange={(e) => setProfile((p) => ({ ...p, national_id: e.target.value }))} />
                  </div>
                    </>
                  ) : null}
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
                  {isAccount ? (
                    <div>
                      <Label className="text-xs">{t('wallet.refundMethod')}</Label>
                      <Select
                        value={profile.refund_method || 'wallet'}
                        onValueChange={(v) => setProfile((p) => ({ ...p, refund_method: v }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wallet">{t('wallet.refundWallet')}</SelectItem>
                          <SelectItem value="bank">{t('wallet.refundBank')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : null}
                </div>
              </OrderSidebarPanel>

              {!isAccount && userId ? (
                <OrderSidebarPanel title={t('wallet.title')}>
                  <div className="space-y-2 text-start">
                    <p className="text-sm">
                      {t('wallet.balance')}:{' '}
                      <MoneyDisplay amount={q.data?.wallet_balance ?? 0} currency="IRT" locale={i18n.language} />
                    </p>
                    <Select value={walletDir} onValueChange={(v) => setWalletDir(v === 'debit' ? 'debit' : 'credit')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit">{t('wallet.credit')}</SelectItem>
                        <SelectItem value="debit">{t('wallet.debit')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min={1}
                      value={walletAmt}
                      onChange={(e) => setWalletAmt(e.target.value)}
                    />
                    <Button
                      type="button"
                      size="sm"
                      disabled={walletAdjust.isPending || !walletAmt}
                      onClick={() => void walletAdjust.mutateAsync()}
                    >
                      {t('wallet.adjust')}
                    </Button>
                  </div>
                </OrderSidebarPanel>
              ) : null}
            </>
          ) : null}
        </aside>
      </div>
    </PageShell>
  )
}
