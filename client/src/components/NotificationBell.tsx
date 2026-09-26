import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NotificationText } from '@/components/notifications/NotificationText'
import { useBootstrapQuery } from '@/hooks/useBootstrapQuery'
import { apiFetch } from '@/lib/api'
import { normalizeCapabilities } from '@/lib/bootstrapQuery'
import { formatDisplayDateTime } from '@/lib/date'
import { toNotificationNavPath } from '@/lib/notificationLink'
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

export function NotificationBell() {
  const { t, i18n } = useTranslation()
  const nav = useNavigate()
  const qc = useQueryClient()
  const bq = useBootstrapQuery()
  const caps = normalizeCapabilities(bq.data?.capabilities ?? window.webinoDashboard?.bootstrap?.capabilities)
  const isAdmin = caps.includes('manage_woocommerce') || caps.includes('manage_options')
  const inboxPath = isAdmin ? '/notifications' : '/account/notifications'

  const q = useQuery({
    queryKey: ['account', 'notifications', 'header'],
    queryFn: () =>
      apiFetch<{ items: NotificationRow[]; total: number; unread: number }>('account/notifications?page=1'),
    refetchInterval: 120_000,
    refetchIntervalInBackground: false,
    staleTime: 60_000,
  })

  const markOne = useMutation({
    mutationFn: (id: number) => apiFetch(`account/notifications/${id}/read`, { method: 'POST' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['account', 'notifications'] })
    },
  })

  const items = (q.data?.items ?? []).slice(0, 8)
  const unread = q.data?.unread ?? 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="relative"
          aria-label={t('notifications.bellLabel')}
        >
          <Bell className="size-4" />
          {unread > 0 ? (
            <span className="bg-destructive text-destructive-foreground absolute -end-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold leading-none">
              {unread > 99 ? '99+' : unread}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between gap-2">
          <span>{t('notifications.bellTitle')}</span>
          {unread > 0 ? (
            <span className="text-muted-foreground text-xs">
              {t('notifications.unreadCount', { count: unread })}
            </span>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <p className="text-muted-foreground px-2 py-4 text-center text-sm">{t('common.empty')}</p>
        ) : (
          items.map((row) => (
            <DropdownMenuItem
              key={row.id}
              className={cn('flex cursor-pointer flex-col items-stretch gap-0.5 py-2', !row.read && 'bg-muted/40')}
              onSelect={(e) => {
                e.preventDefault()
                if (!row.read) void markOne.mutateAsync(row.id)
                const appPath = toNotificationNavPath(row.link, isAdmin)
                if (appPath) {
                  nav(appPath)
                  return
                }
                if (row.link) window.location.href = row.link
              }}
            >
              <NotificationText text={row.title} locale={i18n.language} className="truncate text-sm font-medium" />
              {row.body ? (
                <NotificationText
                  text={row.body}
                  locale={i18n.language}
                  className="text-muted-foreground line-clamp-2 text-xs"
                />
              ) : null}
              <span className="text-muted-foreground text-[10px]">
                {formatDisplayDateTime(row.created_at, i18n.language)}
              </span>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={inboxPath}>{t('notifications.viewAll')}</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
