import { useQuery } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiFetch } from '@/lib/api'

export type UserOption = {
  id: number
  name: string
  email?: string
  phone?: string
  national_id?: string
}

type UserMultiSelectProps = {
  id: string
  label: string
  value: number[]
  onChange: (ids: number[]) => void
  hint?: string
}

export function UserMultiSelect({ id, label, value, onChange, hint }: UserMultiSelectProps) {
  const { t } = useTranslation()
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [labels, setLabels] = useState<Record<number, string>>({})

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput), 300)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const q = useQuery({
    queryKey: ['users', 'coupon-search', search],
    queryFn: () =>
      apiFetch<{ items: UserOption[] }>(
        `users?page=1&per_page=20&search=${encodeURIComponent(search.trim())}`,
      ),
    enabled: search.trim().length >= 1,
  })

  // Hydrate labels for already-selected users.
  const missingKey = value.filter((uid) => !labels[uid]).join(',')
  useEffect(() => {
    if (!missingKey) return
    const missing = missingKey.split(',').map((s) => parseInt(s, 10)).filter((n) => n > 0)
    let cancelled = false
    void (async () => {
      const next: Record<number, string> = {}
      await Promise.all(
        missing.slice(0, 20).map(async (uid) => {
          try {
            const u = await apiFetch<UserOption>(`users/${uid}`)
            next[uid] = formatUserLabel(u)
          } catch {
            next[uid] = `#${uid}`
          }
        }),
      )
      if (!cancelled) setLabels((prev) => ({ ...prev, ...next }))
    })()
    return () => {
      cancelled = true
    }
  }, [missingKey])

  function addUser(u: UserOption) {
    if (value.includes(u.id)) return
    setLabels((prev) => ({ ...prev, [u.id]: formatUserLabel(u) }))
    onChange([...value, u.id])
    setSearchInput('')
    setSearch('')
  }

  function removeUser(uid: number) {
    onChange(value.filter((x) => x !== uid))
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
      <Input
        id={id}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder={t('coupons.restrict.userSearchPlaceholder')}
      />
      {q.isFetching && search ? (
        <p className="text-muted-foreground text-xs">{t('common.loading')}</p>
      ) : null}
      {q.data?.items && search ? (
        <div className="max-h-40 overflow-y-auto rounded-md border border-border p-1 text-sm">
          {q.data.items.length === 0 ? (
            <p className="text-muted-foreground p-2">{t('coupons.restrict.noUsersFound')}</p>
          ) : (
            q.data.items.map((u) => (
              <button
                key={u.id}
                type="button"
                className="hover:bg-muted block w-full rounded px-2 py-1.5 text-start"
                onClick={() => addUser(u)}
              >
                <span className="font-medium">{u.name || u.email || `#${u.id}`}</span>
                <span className="text-muted-foreground ms-1 text-xs">
                  {[u.phone, u.national_id, u.email].filter(Boolean).join(' · ')}
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}
      {value.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {value.map((uid) => (
            <Badge key={uid} variant="secondary" className="gap-1 pe-1">
              {labels[uid] ?? `#${uid}`}
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-5"
                onClick={() => removeUser(uid)}
              >
                <X className="size-3" />
                <span className="sr-only">{t('common.delete')}</span>
              </Button>
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function formatUserLabel(u: UserOption) {
  const parts = [u.name || u.email || `#${u.id}`]
  if (u.phone) parts.push(u.phone)
  return parts.join(' · ')
}
