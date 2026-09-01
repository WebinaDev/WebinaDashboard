import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { PageShell } from '@/components/PageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'
import { formatDisplayDateTime } from '@/lib/date'
import { cn } from '@/lib/utils'

type NotificationRow = {
  id: number
  type: string
  title: string
  body: string
  link: string
  read: boolean
  created_at: string
}

const LEGACY_TABS = ['site', 'sms', 'bale', 'telegram', 'email', 'otp'] as const

function toAppPath(link: string): string | null {
  if (!link) return null
  try {
    if (link.startsWith('/')) {
      if (link.startsWith('/dashboard')) {
        return link.replace(/^\/dashboard/, '') || '/'
      }
      const base = (window.webinoDashboard?.baseUrl || '/dashboard/').replace(/\/$/, '')
      const basePath = new URL(base, window.location.origin).pathname.replace(/\/$/, '')
      if (link === basePath || link.startsWith(`${basePath}/`)) {
        return link.slice(basePath.length) || '/'
      }
      return link
    }
    const u = new URL(link, window.location.origin)
    const base = new URL(window.webinoDashboard?.baseUrl || '/dashboard/', window.location.origin)
    const basePath = base.pathname.replace(/\/$/, '')
    if (u.origin === base.origin && u.pathname.startsWith(basePath)) {
      return `${u.pathname.slice(basePath.length) || '/'}${u.search}`
    }
  } catch {
    return null
  }
  return null
}

export default function NotificationsHubPage() {
  const { t, i18n } = useTranslation()
  const [params, setParams] = useSearchParams()
  const nav = useNavigate()
  const qc = useQueryClient()
  const legacyTab = params.get('tab')

  if (legacyTab && (LEGACY_TABS as readonly string[]).includes(legacyTab)) {
    const next = new URLSearchParams(params)
    next.delete('tab')
    const qs = next.toString()
    return (
      <Navigate
        to={`/settings/site/notifications?tab=${legacyTab}${qs ? `&${qs}` : ''}`}
        replace
      />
    )
  }

  const page = Math.max(1, Number(params.get('page') || 1) || 1)
  const perPage = 15

  const q = useQuery({
    queryKey: ['account', 'notifications', 'inbox', page, perPage],
    queryFn: () =>
      apiFetch<{ items: NotificationRow[]; total: number; unread: number; page: number; per_page: number }>(
        `account/notifications?page=${page}&per_page=${perPage}`,
      ),
  })
  useQueryErrorToast(q)

  const markOne = useMutation({
    mutationFn: (id: number) => apiFetch(`account/notifications/${id}/read`, { method: 'POST' }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['account', 'notifications'] }),
    onError: (e: Error) => toastApiError(t, e),
  })

  const markAll = useMutation({
    mutationFn: () => apiFetch('account/notifications', { method: 'POST' }),
    onSuccess: () => {
      toast.success(t('common.saved'))
      void qc.invalidateQueries({ queryKey: ['account', 'notifications'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const items = q.data?.items ?? []
  const total = q.data?.total ?? 0
  const unread = q.data?.unread ?? 0
  const totalPages = Math.max(1, Math.ceil(total / perPage))

  function openNotification(row: NotificationRow) {
    if (!row.read) void markOne.mutateAsync(row.id)
    const appPath = toAppPath(row.link)
    if (appPath) {
      nav(appPath)
      return
    }
    if (row.link) window.location.assign(row.link)
  }

  return (
    <PageShell title={t('notifications.inboxTitle')} description={t('notifications.inboxSubtitle')}>
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
        <Button type="button" size="sm" variant="outline" asChild>
          <Link to="/settings/site/notifications">{t('notifications.openSettings')}</Link>
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={markAll.isPending || unread === 0}
          onClick={() => void markAll.mutateAsync()}
        >
          {t('account.markAllRead')}
        </Button>
      </div>
      {unread > 0 ? (
        <p className="text-muted-foreground mb-4 text-sm">
          {t('notifications.unreadCount', { count: unread })}
        </p>
      ) : null}

      <div className="space-y-4">
        {q.isLoading ? (
          <p className="text-muted-foreground text-sm">{t('common.loading')}</p>
        ) : items.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <Bell className="text-muted-foreground size-10 opacity-40" />
              <p className="text-muted-foreground text-sm">{t('notifications.inboxEmpty')}</p>
            </CardContent>
          </Card>
        ) : (
          items.map((row) => (
            <Card
              key={row.id}
              className={cn(
                'cursor-pointer shadow-sm transition-colors hover:border-primary/30',
                !row.read && 'border-primary/20 bg-muted/20',
              )}
              onClick={() => openNotification(row)}
            >
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1">
                    <CardDescription className="text-xs">
                      {formatDisplayDateTime(row.created_at, i18n.language)}
                      {row.type ? (
                        <span className="ms-2 inline-flex">
                          <Badge variant="secondary" className="text-[10px] font-normal">
                            {row.type}
                          </Badge>
                        </span>
                      ) : null}
                    </CardDescription>
                    <CardTitle className="text-lg leading-snug">{row.title}</CardTitle>
                  </div>
                  {!row.read ? (
                    <Badge variant="default" className="shrink-0">
                      {t('notifications.unreadBadge')}
                    </Badge>
                  ) : null}
                </div>
              </CardHeader>
              {row.body ? (
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed">{row.body}</p>
                  {row.link ? (
                    <p className="text-primary mt-3 text-sm font-medium">{t('notifications.openAction')}</p>
                  ) : null}
                </CardContent>
              ) : null}
            </Card>
          ))
        )}
      </div>

      {totalPages > 1 ? (
        <div className="mt-6 flex items-center justify-between gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => {
              const next = new URLSearchParams(params)
              next.set('page', String(page - 1))
              setParams(next, { replace: true })
            }}
          >
            <ChevronLeft className="size-4" />
            {t('common.prev')}
          </Button>
          <span className="text-muted-foreground text-sm">
            {t('notifications.pageOf', { page, total: totalPages })}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => {
              const next = new URLSearchParams(params)
              next.set('page', String(page + 1))
              setParams(next, { replace: true })
            }}
          >
            {t('common.next')}
            <ChevronRight className="size-4" />
          </Button>
        </div>
      ) : null}
    </PageShell>
  )
}
