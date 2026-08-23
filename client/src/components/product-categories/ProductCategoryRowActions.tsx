import { ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import type { ProductCategoryRow } from '@/components/product-categories/types'
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

type ProductCategoryRowActionsProps = {
  row: ProductCategoryRow
  busy?: boolean
  onDelete: () => Promise<void>
}

export function ProductCategoryRowActions({ row, busy, onDelete }: ProductCategoryRowActionsProps) {
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
              <Link to={`/shop/product-categories/${row.id}`}>
                <Pencil className="size-4" />
                <span className="sr-only">{t('productCats.actionEdit')}</span>
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('productCats.actionEdit')}</TooltipContent>
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
                  <span className="sr-only">{t('productCats.actionView')}</span>
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('productCats.actionView')}</TooltipContent>
          </Tooltip>
        ) : null}
      </div>
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('productCats.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('productCats.deleteConfirm', { name: row.name })}</AlertDialogDescription>
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
