import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { MobileListCard } from '@/components/MobileListCard'
import { PageShell } from '@/components/PageShell'
import { TableListSkeleton } from '@/components/TableListSkeleton'
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
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { formatNumber } from '@/lib/formatNumber'
import type { GlobalAttribute } from '@/types/attributes'

export default function AttributesPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const [deleteTarget, setDeleteTarget] = useState<GlobalAttribute | null>(null)

  const q = useQuery({
    queryKey: ['attributes'],
    queryFn: () => apiFetch<{ items: GlobalAttribute[] }>('shop/attributes'),
  })
  useQueryErrorToast(q)
  const items = q.data?.items ?? []

  const del = useMutation({
    mutationFn: (id: number) => apiFetch(`shop/global-attributes/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success(t('common.deleted'))
      setDeleteTarget(null)
      void qc.invalidateQueries({ queryKey: ['attributes'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  function rowActions(row: GlobalAttribute) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" asChild>
          <Link to={`/shop/attributes/${row.id}`}>
            <Pencil className="size-3.5" />
            {t('common.edit')}
          </Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-destructive"
          onClick={() => setDeleteTarget(row)}
        >
          <Trash2 className="size-3.5" />
          {t('common.delete')}
        </Button>
      </div>
    )
  }

  return (
    <PageShell title={t('attributes.title')} description={t('attributes.description')}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground min-w-0 text-sm">{t('attributes.listHint')}</p>
        <Button type="button" size="sm" asChild>
          <Link to="/shop/attributes/new">
            <Plus className="me-1 size-3.5" />
            {t('attributes.newButton')}
          </Link>
        </Button>
      </div>

      {q.isLoading ? (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <TableListSkeleton rows={6} columns={5} />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {items.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">{t('attributes.emptyHint')}</p>
            ) : (
              items.map((row) => (
                <MobileListCard
                  key={row.id}
                  media={
                    <div className="min-w-0 space-y-1">
                      <Link
                        to={`/shop/attributes/${row.id}`}
                        className="break-words font-medium hover:underline"
                      >
                        {row.label}
                      </Link>
                      {row.slug ? <p className="text-muted-foreground break-all text-xs">{row.slug}</p> : null}
                    </div>
                  }
                  actions={rowActions(row)}
                >
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
                    <div>
                      <dt className="text-muted-foreground text-xs">{t('attributes.colType')}</dt>
                      <dd className="break-words">{t(`attributes.type.${row.type}`, { defaultValue: row.type })}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs">{t('attributes.colTerms')}</dt>
                      <dd>{formatNumber(row.term_count, i18n.language)}</dd>
                    </div>
                  </dl>
                </MobileListCard>
              ))
            )}
          </div>

          <Card className="hidden shadow-sm md:block">
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('attributes.colName')}</TableHead>
                    <TableHead>{t('attributes.colSlug')}</TableHead>
                    <TableHead>{t('attributes.colType')}</TableHead>
                    <TableHead className="text-end">{t('attributes.colTerms')}</TableHead>
                    <TableHead className="w-28" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-muted-foreground p-8 text-center text-sm">
                        {t('attributes.emptyHint')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.label}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{row.slug}</TableCell>
                        <TableCell>{t(`attributes.type.${row.type}`, { defaultValue: row.type })}</TableCell>
                        <TableCell className="text-end">{formatNumber(row.term_count, i18n.language)}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button type="button" variant="ghost" size="icon" className="size-8" asChild>
                              <Link to={`/shop/attributes/${row.id}`}>
                                <Pencil className="size-3.5" />
                              </Link>
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-destructive size-8"
                              onClick={() => setDeleteTarget(row)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('attributes.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('attributes.deleteConfirmBody')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && void del.mutateAsync(deleteTarget.id)}>
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  )
}
