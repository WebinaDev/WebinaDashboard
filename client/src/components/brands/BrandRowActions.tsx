import { ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import type { BrandRow } from '@/components/brands/types'
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

type BrandRowActionsProps = {
  row: BrandRow
  busy?: boolean
  onDelete: () => Promise<void>
}

export function BrandRowActions({ row, busy, onDelete }: BrandRowActionsProps) {
  const { t } = useTranslation()
  const [deleteOpen, setDeleteOpen] = useState(false)

  async function confirmDelete() {
    await onDelete()
    setDeleteOpen(false)
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button asChild size="icon" variant="ghost" className="size-8" disabled={busy}>
              <Link to={`/shop/brands/${row.id}`}>
                <Pencil className="size-4" />
                <span className="sr-only">{t('brands.actionEdit')}</span>
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('brands.actionEdit')}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" size="icon" variant="ghost" className="size-8" disabled={busy} onClick={() => setDeleteOpen(true)}>
              <Trash2 className="size-4" />
              <span className="sr-only">{t('common.delete')}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('common.delete')}</TooltipContent>
        </Tooltip>
        {row.url ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild size="icon" variant="ghost" className="size-8" disabled={busy}>
                <a href={row.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" />
                  <span className="sr-only">{t('brands.actionView')}</span>
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('brands.actionView')}</TooltipContent>
          </Tooltip>
        ) : null}
      </div>
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('brands.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('brands.deleteConfirm', { name: row.name })}</AlertDialogDescription>
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
