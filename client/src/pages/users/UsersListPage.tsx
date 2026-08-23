import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { ListStatsStrip } from '@/components/ListStatsStrip'
import type { BotProvider } from '@/types/bots'
import { PostsPagination } from '@/components/magazine/PostsPagination'
import { PageShell } from '@/components/PageShell'
import { TableListSkeleton } from '@/components/TableListSkeleton'
import { UsersTable, type UserListRow } from '@/components/users/UsersTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBootstrapQuery } from '@/hooks/useBootstrapQuery'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { apiPostFormData } from '@/lib/apiFormData'
import { localizeDigits } from '@/lib/digits'
import { formatNumber } from '@/lib/formatNumber'
import { cn } from '@/lib/utils'

type BotFilter = 'all' | BotProvider

type BotUsersResponse = {
  users: Array<{ id: number; display_name: string; email: string; phone: string; chat_id: string }>
  page: number
  per_page: number
  total_users: number
}

type ImportResponse = { ok: boolean; total: number; matched: number; invalid: number; duplicate: number; not_found: number }

function parseBotFilter(raw: string | null): BotFilter {
  if (raw === 'bale' || raw === 'telegram') return raw
  return 'all'
}

export default function UsersListPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const boot = useBootstrapQuery()
  const caps = boot.data?.capabilities ?? []
  const canDelete = caps.includes('delete_users')
  const canEdit = caps.includes('edit_users')
  const canPromote = caps.includes('promote_users')
  const canCreate = caps.includes('create_users')

  const [params, setParams] = useSearchParams()
  const botFilter = parseBotFilter(params.get('bot'))
  const isBotMode = botFilter !== 'all'

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const setBotFilter = useCallback(
    (next: BotFilter) => {
      setParams(
        (prev) => {
          const p = new URLSearchParams(prev)
          if (next === 'all') p.delete('bot')
          else p.set('bot', next)
          return p
        },
        { replace: true },
      )
      setPage(1)
    },
    [setParams],
  )

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const usersQ = useQuery({
    queryKey: ['users', page, perPage, search, roleFilter],
    queryFn: () => {
      const p = new URLSearchParams({ page: String(page), per_page: String(perPage) })
      if (search.trim()) p.set('search', search.trim())
      if (roleFilter && roleFilter !== 'all') p.set('role', roleFilter)
      return apiFetch<{
        items: UserListRow[]
        page: number
        per_page: number
        found: number
        stats?: { total: number; customers: number; partners?: number }
      }>(`users?${p.toString()}`)
    },
    enabled: !isBotMode,
  })

  const botUsersQ = useQuery({
    queryKey: ['bots', botFilter, 'users', page, search],
    queryFn: () => {
      const p = new URLSearchParams({ page: String(page) })
      if (search.trim()) p.set('search', search.trim())
      return apiFetch<BotUsersResponse>(`bots/${botFilter}/users?${p.toString()}`)
    },
    enabled: isBotMode,
  })

  const q = isBotMode ? botUsersQ : usersQ
  useQueryErrorToast(q)

  const imp = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData()
      fd.append('contacts_csv', file)
      return apiPostFormData<ImportResponse>(`bots/${botFilter}/users/import`, fd)
    },
    onSuccess: (data) => {
      toast.success(
        t('bots.users.importDone', {
          total: data.total,
          matched: data.matched,
          invalid: data.invalid,
          duplicate: data.duplicate,
          not_found: data.not_found,
        }),
      )
      void qc.invalidateQueries({ queryKey: ['bots', botFilter, 'users'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const bulkRole = useMutation({
    mutationFn: async (role: string) =>
      apiFetch<{ ok: boolean; updated: number }>('users/bulk-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, role }),
      }),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ['users'] })
      setSelectedIds([])
      toast.success(t('users.bulkRoleDone', { count: data.updated }))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const del = useMutation({
    mutationFn: async (id: number) => {
      setDeletingId(id)
      await apiFetch(`users/${id}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['users'] })
      toast.success(t('common.deleted'))
    },
    onError: (e: Error) => toastApiError(t, e),
    onSettled: () => setDeletingId(null),
  })

  const items = usersQ.data?.items ?? []
  const found = isBotMode ? (botUsersQ.data?.total_users ?? 0) : (usersQ.data?.found ?? 0)
  const botUsers = botUsersQ.data?.users ?? []
  const botPerPage = botUsersQ.data?.per_page ?? 20
  const listStats = usersQ.data?.stats
  const statItems = useMemo(() => {
    const total = isBotMode ? found : (listStats?.total ?? found)
    const customers = isBotMode
      ? 0
      : (listStats?.customers ?? items.filter((u) => (u.role ?? '').includes('customer')).length)
    const partners = isBotMode ? 0 : (listStats?.partners ?? items.filter((u) => (u.role ?? '') === 'webino_partner').length)
    return [
      { id: 'total', label: t('users.stats.total'), value: total },
      { id: 'customers', label: t('users.stats.customers'), value: customers },
      { id: 'partners', label: t('users.stats.partners'), value: partners },
    ]
  }, [isBotMode, found, listStats, items, t, i18n.language])

  const botFilters: { id: BotFilter; label: string }[] = [
    { id: 'all', label: t('users.filter.botAll') },
    { id: 'bale', label: t('users.filter.botBale') },
    { id: 'telegram', label: t('users.filter.botTelegram') },
  ]

  return (
    <PageShell title={t('users.title')}>
      <div className="mb-4">
        <ListStatsStrip items={statItems} locale={i18n.language} />
      </div>
      {canCreate ? (
        <div className="flex justify-end">
          <Button asChild size="sm">
            <Link to="/users/new">
              <Plus className="size-4" aria-hidden />
              {t('users.createTitle')}
            </Link>
          </Button>
        </div>
      ) : null}
      <Card className="mb-4 shadow-sm">
        <CardContent className="flex flex-wrap items-end gap-3 pt-6">
          <div className="inline-flex rounded-lg border border-border p-1" role="tablist" aria-label={t('users.botFilterLabel')}>
            {botFilters.map(({ id, label }) => {
              const tabId = `users-bot-filter-${id}`
              return (
              <button
                key={id}
                id={tabId}
                type="button"
                role="tab"
                aria-selected={botFilter === id}
                aria-controls="users-bot-filter-panel"
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  botFilter === id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground',
                )}
                onClick={() => setBotFilter(id)}
              >
                {label}
              </button>
            )})}
          </div>
          <div className="relative min-w-[200px] flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-2.5 start-3 size-4" aria-hidden />
            <Input
              className="ps-9"
              placeholder={t('users.searchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          {!isBotMode ? (
            <div className="w-44 space-y-1">
              <Label className="text-muted-foreground text-xs">{t('users.fieldRole')}</Label>
              <Select
                value={roleFilter}
                onValueChange={(v) => {
                  setRoleFilter(v)
                  setPage(1)
                  setSelectedIds([])
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('users.filter.roleAll')}</SelectItem>
                  <SelectItem value="customer">{t('users.roleCustomer')}</SelectItem>
                  <SelectItem value="webino_partner">{t('users.rolePartner')}</SelectItem>
                  <SelectItem value="subscriber">{t('users.roleSubscriber')}</SelectItem>
                  <SelectItem value="shop_manager">{t('users.roleShopManager')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}
          {found > 0 ? (
            <p className="text-muted-foreground text-sm">{t('users.foundCount', { count: formatNumber(found, i18n.language) })}</p>
          ) : null}
        </CardContent>
      </Card>

      {isBotMode ? (
        <Card id="users-bot-filter-panel" className="mb-4 shadow-sm" role="tabpanel">
          <CardContent className="pt-6">
            <Label className="text-sm font-medium">{t('bots.users.importCsv')}</Label>
            <p className="mt-1 text-xs text-muted-foreground">{t('bots.users.importHint')}</p>
            <Input
              type="file"
              accept=".csv,text/csv"
              className="mt-2 block cursor-pointer text-sm file:me-2 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm"
              disabled={imp.isPending}
              onChange={(e) => {
                const f = e.target.files?.[0]
                e.target.value = ''
                if (f) void imp.mutateAsync(f)
              }}
            />
          </CardContent>
        </Card>
      ) : null}

      {!isBotMode && canPromote && selectedIds.length > 0 ? (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
          <span>{t('users.bulkSelected', { count: selectedIds.length })}</span>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={bulkRole.isPending}
            onClick={() => void bulkRole.mutateAsync('webino_partner')}
          >
            {t('users.bulkMakePartner')}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={bulkRole.isPending}
            onClick={() => void bulkRole.mutateAsync('customer')}
          >
            {t('users.bulkMakeCustomer')}
          </Button>
        </div>
      ) : null}

      <Card className="shadow-sm">
        <CardContent className="overflow-x-auto p-0">
          {q.isLoading ? (
            <TableListSkeleton rows={8} columns={isBotMode ? 5 : 7} />
          ) : isBotMode ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-start text-xs text-muted-foreground">
                  <th className="p-3">{t('bots.users.colName')}</th>
                  <th className="p-3">{t('bots.users.colEmail')}</th>
                  <th className="p-3">{t('bots.users.colPhone')}</th>
                  <th className="p-3">{t('users.colChatId')}</th>
                  <th className="p-3">{t('users.colActions')}</th>
                </tr>
              </thead>
              <tbody>
                {botUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      {t('users.emptyListHint')}
                    </td>
                  </tr>
                ) : (
                  botUsers.map((u) => (
                    <tr key={u.id} className="border-t border-border">
                      <td className="p-3">
                        <Link to={`/users/${u.id}`} className="text-primary underline-offset-4 hover:underline">
                          {u.display_name}
                        </Link>
                      </td>
                      <td className="p-3">{u.email}</td>
                      <td className="p-3">{localizeDigits(u.phone, i18n.language)}</td>
                      <td className="p-3 font-mono text-xs">{u.chat_id}</td>
                      <td className="p-3">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/users/${u.id}`}>{t('common.view')}</Link>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <UsersTable
              items={items}
              canDelete={canDelete}
              canEdit={canEdit}
              canPromote={canPromote}
              selectedIds={selectedIds}
              onToggleSelect={(id, on) =>
                setSelectedIds((prev) => (on ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter((x) => x !== id)))
              }
              onToggleAll={(on) => setSelectedIds(on ? items.map((u) => u.id) : [])}
              onDelete={(id) => del.mutateAsync(id)}
              deletingId={deletingId}
            />
          )}
        </CardContent>
      </Card>

      {found > (isBotMode ? botPerPage : perPage) ? (
        <PostsPagination
          page={page}
          perPage={isBotMode ? botPerPage : perPage}
          found={found}
          onPageChange={setPage}
          onPerPageChange={isBotMode ? () => {} : setPerPage}
          showPerPageSelector={!isBotMode}
        />
      ) : null}
    </PageShell>
  )
}
