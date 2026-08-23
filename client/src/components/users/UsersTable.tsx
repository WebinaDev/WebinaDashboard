import { useTranslation } from 'react-i18next'

import { UserRowActions } from '@/components/users/UserRowActions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { localizeDigits } from '@/lib/digits'
import { cn } from '@/lib/utils'

export type UserListRow = {
  id: number
  login: string
  name: string
  email: string
  phone?: string
  avatar_url?: string
  role?: string
  role_label?: string
}

type UsersTableProps = {
  items: UserListRow[]
  canDelete?: boolean
  canEdit?: boolean
  canPromote?: boolean
  selectedIds?: number[]
  onToggleSelect?: (id: number, on: boolean) => void
  onToggleAll?: (on: boolean) => void
  onDelete: (id: number) => Promise<void>
  deletingId?: number | null
}

export function UsersTable({
  items,
  canDelete,
  canEdit,
  canPromote,
  selectedIds,
  onToggleSelect,
  onToggleAll,
  onDelete,
  deletingId,
}: UsersTableProps) {
  const { t, i18n } = useTranslation()
  const selectable = Boolean(canPromote && onToggleSelect)
  const allSelected = selectable && items.length > 0 && items.every((r) => selectedIds?.includes(r.id))

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {selectable ? (
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(v) => onToggleAll?.(v === true)}
                aria-label={t('users.selectAll')}
              />
            </TableHead>
          ) : null}
          <TableHead className="w-14">{t('users.colAvatar')}</TableHead>
          <TableHead>{t('users.colLogin')}</TableHead>
          <TableHead>{t('users.colName')}</TableHead>
          <TableHead>{t('users.colEmail')}</TableHead>
          <TableHead>{t('users.colPhone')}</TableHead>
          <TableHead>{t('users.colRole')}</TableHead>
          <TableHead className="w-[220px]">{t('users.colActions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 ? (
          <TableRow>
            <TableCell colSpan={selectable ? 8 : 7} className="p-8 text-center text-sm text-muted-foreground">
              {t('users.emptyListHint')}
            </TableCell>
          </TableRow>
        ) : (
          items.map((row) => (
            <TableRow key={row.id}>
              {selectable ? (
                <TableCell>
                  <Checkbox
                    checked={Boolean(selectedIds?.includes(row.id))}
                    onCheckedChange={(v) => onToggleSelect?.(row.id, v === true)}
                    aria-label={t('users.selectUser')}
                  />
                </TableCell>
              ) : null}
              <TableCell>
                <Avatar className="size-9">
                  {row.avatar_url ? <AvatarImage src={row.avatar_url} alt={row.name || row.login || t('a11y.thumbnail')} /> : null}
                  <AvatarFallback>{row.name?.charAt(0) || row.login.charAt(0)}</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell className="font-medium">{row.login}</TableCell>
              <TableCell>{row.name || t('common.emptyValue')}</TableCell>
              <TableCell className="text-muted-foreground text-sm">{row.email}</TableCell>
              <TableCell className={cn('text-sm', !row.phone && 'text-muted-foreground')}>
                {row.phone ? localizeDigits(row.phone, i18n.language) : t('common.emptyValue')}
              </TableCell>
              <TableCell className="text-sm">{row.role_label || row.role || t('common.emptyValue')}</TableCell>
              <TableCell>
                <UserRowActions
                  row={row}
                  canDelete={canDelete}
                  canEdit={canEdit}
                  canPromote={canPromote}
                  onDelete={onDelete}
                  isDeleting={deletingId === row.id}
                />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
