import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'

import { CommentQuickEditRow } from '@/components/comments/CommentQuickEditRow'
import { CommentReplyRow } from '@/components/comments/CommentReplyRow'
import { CommentRowActions } from '@/components/comments/CommentRowActions'
import type { CommentColumnVisibility, CommentRow } from '@/components/comments/types'
import { MobileListCard } from '@/components/MobileListCard'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDisplayDate } from '@/lib/date'
import { cn } from '@/lib/utils'

type CommentsTableProps = {
  items: CommentRow[]
  columns: CommentColumnVisibility
  locale: string
  statusFilter: string
  emptyMessage: string
  visibleColumnCount: number
  quickEditId: number | null
  replyId: number | null
  busyId: number | null
  onQuickEditToggle: (id: number) => void
  onReplyToggle: (id: number) => void
  onApprove: (id: number) => Promise<void>
  onUnapprove: (id: number) => Promise<void>
  onSpam: (id: number) => Promise<void>
  onTrash: (id: number) => Promise<void>
  onDelete: (id: number) => Promise<void>
  onSaved: () => void
}

function statusLabel(t: (key: string) => string, status: string) {
  if (status === 'approved' || status === 'approve') return t('comments.statusApproved')
  if (status === 'spam') return t('comments.statusSpam')
  if (status === 'trash') return t('comments.statusTrash')
  return t('comments.statusPending')
}

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'approved' || status === 'approve') return 'default'
  if (status === 'spam' || status === 'trash') return 'destructive'
  return 'secondary'
}

export function CommentsTable({
  items,
  columns,
  locale,
  statusFilter,
  emptyMessage,
  visibleColumnCount,
  quickEditId,
  replyId,
  busyId,
  onQuickEditToggle,
  onReplyToggle,
  onApprove,
  onUnapprove,
  onSpam,
  onTrash,
  onDelete,
  onSaved,
}: CommentsTableProps) {
  const { t } = useTranslation()

  return (
    <>
      <div className="space-y-3 p-3 md:hidden">
        {items.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">{emptyMessage}</p>
        ) : (
          items.map((row) => (
            <div key={row.id} className="space-y-2">
              <MobileListCard
                className={cn(row.parent_id > 0 && 'border-s-4 border-s-muted')}
                media={
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{row.author}</span>
                      <Badge variant={statusVariant(row.status)}>{statusLabel(t, row.status)}</Badge>
                    </div>
                    {row.parent_id > 0 && row.parent_excerpt ? (
                      <p className="text-muted-foreground line-clamp-1 text-xs">
                        {t('comments.inReplyTo')}: {row.parent_excerpt}
                      </p>
                    ) : null}
                  </div>
                }
                actions={
                  <CommentRowActions
                    row={row}
                    statusFilter={statusFilter}
                    quickEditOpen={quickEditId === row.id}
                    replyOpen={replyId === row.id}
                    busy={busyId === row.id}
                    onApprove={() => onApprove(row.id)}
                    onUnapprove={() => onUnapprove(row.id)}
                    onSpam={() => onSpam(row.id)}
                    onTrash={() => onTrash(row.id)}
                    onDelete={() => onDelete(row.id)}
                    onQuickEditToggle={() => onQuickEditToggle(row.id)}
                    onReplyToggle={() => onReplyToggle(row.id)}
                  />
                }
              >
                <p className="line-clamp-3 text-sm text-muted-foreground">{row.excerpt}</p>
                <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
                  <div className="col-span-2">
                    <dt className="text-muted-foreground text-xs">{t('comments.colPost')}</dt>
                    <dd>
                      {row.post_url ? (
                        <a
                          href={row.post_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="line-clamp-2 hover:underline"
                        >
                          {row.post_title || `#${row.post_id}`}
                        </a>
                      ) : (
                        row.post_title || `#${row.post_id}`
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs">{t('comments.colDate')}</dt>
                    <dd className="text-muted-foreground text-xs">{formatDisplayDate(row.date, locale)}</dd>
                  </div>
                  {columns.email ? (
                    <div>
                      <dt className="text-muted-foreground text-xs">{t('comments.colEmail')}</dt>
                      <dd className="truncate text-xs">{row.author_email}</dd>
                    </div>
                  ) : null}
                </dl>
              </MobileListCard>
              {quickEditId === row.id ? (
                <div className="overflow-hidden rounded-xl border">
                  <table className="w-full">
                    <tbody>
                      <CommentQuickEditRow
                        commentId={row.id}
                        initialAuthor={row.author}
                        initialEmail={row.author_email}
                        initialContent={row.content}
                        colSpan={1}
                        onSaved={onSaved}
                        onCancel={() => onQuickEditToggle(row.id)}
                      />
                    </tbody>
                  </table>
                </div>
              ) : null}
              {replyId === row.id ? (
                <div className="overflow-hidden rounded-xl border">
                  <table className="w-full">
                    <tbody>
                      <CommentReplyRow
                        row={row}
                        colSpan={1}
                        onSaved={onSaved}
                        onCancel={() => onReplyToggle(row.id)}
                      />
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.author ? <TableHead>{t('comments.colAuthor')}</TableHead> : null}
              {columns.email ? <TableHead>{t('comments.colEmail')}</TableHead> : null}
              {columns.excerpt ? <TableHead>{t('comments.colExcerpt')}</TableHead> : null}
              {columns.post ? <TableHead>{t('comments.colPost')}</TableHead> : null}
              {columns.date ? <TableHead>{t('comments.colDate')}</TableHead> : null}
              {columns.status ? <TableHead>{t('comments.colStatus')}</TableHead> : null}
              <TableHead className="w-56">{t('comments.colActions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumnCount} className="p-8 text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              items.map((row) => (
                <Fragment key={row.id}>
                  <TableRow className={cn(row.parent_id > 0 && 'bg-muted/20')}>
                    {columns.author ? (
                      <TableCell className={cn('text-sm', row.parent_id > 0 && 'ps-8')}>
                        <div className="font-medium">{row.author}</div>
                        {row.parent_id > 0 && row.parent_excerpt ? (
                          <p className="text-muted-foreground mt-1 line-clamp-1 text-xs">
                            {t('comments.inReplyTo')}: {row.parent_excerpt}
                          </p>
                        ) : null}
                      </TableCell>
                    ) : null}
                    {columns.email ? (
                      <TableCell className="text-sm text-muted-foreground">{row.author_email}</TableCell>
                    ) : null}
                    {columns.excerpt ? (
                      <TableCell className="max-w-md text-sm text-muted-foreground">
                        <span className="line-clamp-2">{row.excerpt}</span>
                      </TableCell>
                    ) : null}
                    {columns.post ? (
                      <TableCell className="max-w-[12rem] text-sm">
                        {row.post_url ? (
                          <a
                            href={row.post_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="line-clamp-2 hover:underline"
                          >
                            {row.post_title || `#${row.post_id}`}
                          </a>
                        ) : (
                          row.post_title || `#${row.post_id}`
                        )}
                      </TableCell>
                    ) : null}
                    {columns.date ? (
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {formatDisplayDate(row.date, locale)}
                      </TableCell>
                    ) : null}
                    {columns.status ? (
                      <TableCell>
                        <Badge variant={statusVariant(row.status)}>{statusLabel(t, row.status)}</Badge>
                      </TableCell>
                    ) : null}
                    <TableCell>
                      <CommentRowActions
                        row={row}
                        statusFilter={statusFilter}
                        quickEditOpen={quickEditId === row.id}
                        replyOpen={replyId === row.id}
                        busy={busyId === row.id}
                        onApprove={() => onApprove(row.id)}
                        onUnapprove={() => onUnapprove(row.id)}
                        onSpam={() => onSpam(row.id)}
                        onTrash={() => onTrash(row.id)}
                        onDelete={() => onDelete(row.id)}
                        onQuickEditToggle={() => onQuickEditToggle(row.id)}
                        onReplyToggle={() => onReplyToggle(row.id)}
                      />
                    </TableCell>
                  </TableRow>
                  {quickEditId === row.id ? (
                    <CommentQuickEditRow
                      commentId={row.id}
                      initialAuthor={row.author}
                      initialEmail={row.author_email}
                      initialContent={row.content}
                      colSpan={visibleColumnCount}
                      onSaved={onSaved}
                      onCancel={() => onQuickEditToggle(row.id)}
                    />
                  ) : null}
                  {replyId === row.id ? (
                    <CommentReplyRow
                      row={row}
                      colSpan={visibleColumnCount}
                      onSaved={onSaved}
                      onCancel={() => onReplyToggle(row.id)}
                    />
                  ) : null}
                </Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
