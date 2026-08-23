import { Copy, ExternalLink, Pencil, Send, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import type { ProductListRow } from '@/components/products/types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

type ProductRowActionsProps = {
  row: ProductListRow
  busy?: boolean
  onDuplicate: () => Promise<void>
  onDelete: () => Promise<void>
  onSyncChannel: (provider: 'bale' | 'telegram') => Promise<void>
}

export function ProductRowActions({ row, busy, onDuplicate, onDelete, onSyncChannel }: ProductRowActionsProps) {
  const { t } = useTranslation()
  const [deleteOpen, setDeleteOpen] = useState(false)

  async function confirmDelete() {
    await onDelete()
    setDeleteOpen(false)
  }

  return (
    <>
      <div className="flex flex-nowrap items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button asChild size="icon" variant="ghost" className="size-8" disabled={busy}>
              <Link to={`/shop/products/${row.id}`}>
                <Pencil className="size-4" />
                <span className="sr-only">{t('common.edit')}</span>
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('common.edit')}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" size="icon" variant="ghost" className="size-8" disabled={busy} onClick={() => void onDuplicate()}>
              <Copy className="size-4" />
              <span className="sr-only">{t('products.actionDuplicate')}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('products.actionDuplicate')}</TooltipContent>
        </Tooltip>
        {row.permalink ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild size="icon" variant="ghost" className="size-8" disabled={busy}>
                <a href={row.permalink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" />
                  <span className="sr-only">{t('products.actionView')}</span>
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('products.actionView')}</TooltipContent>
          </Tooltip>
        ) : null}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" size="icon" variant="ghost" className="size-8" disabled={busy} onClick={() => setDeleteOpen(true)}>
              <Trash2 className="size-4" />
              <span className="sr-only">{t('common.delete')}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('common.delete')}</TooltipContent>
        </Tooltip>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button type="button" size="icon" variant="ghost" className="size-8" disabled={busy}>
                  <Send className="size-4" />
                  <span className="sr-only">{t('products.actionSendChannel')}</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>{t('products.actionSendChannel')}</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t('products.actionSendChannel')}</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => void onSyncChannel('bale')}>{t('products.actionSendBale')}</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void onSyncChannel('telegram')}>{t('products.actionSendTelegram')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('products.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('products.deleteConfirm', { name: row.name })}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction disabled={busy} onClick={() => void confirmDelete()}>
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
