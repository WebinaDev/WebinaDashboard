import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

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
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { formatNumber } from '@/lib/formatNumber'

import { CoffeeFlag } from '../components/CoffeeFlag'
import type { CoffeeOrigin } from '../types'

export default function CoffeeOriginsPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput), 300)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const q = useQuery({
    queryKey: ['coffee-origins', search],
    queryFn: () => {
      const p = new URLSearchParams()
      if (search.trim()) p.set('search', search.trim())
      const qs = p.toString()
      return apiFetch<{ items: CoffeeOrigin[]; found: number }>(`shop/coffee-origins${qs ? `?${qs}` : ''}`)
    },
  })
  useQueryErrorToast(q)

  const remove = useMutation({
    mutationFn: (id: number) => {
      setBusyId(id)
      return apiFetch(`shop/coffee-origins/${id}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      toast.success(t('common.deleted'))
      void qc.invalidateQueries({ queryKey: ['coffee-origins'] })
    },
    onError: (e: Error) => toastApiError(t, e),
    onSettled: () => {
      setBusyId(null)
      setDeleteId(null)
    },
  })

  const items = q.data?.items ?? []
  const found = q.data?.found ?? 0
  const deleting = items.find((i) => i.id === deleteId)

  return (
    <PageShell title={t('coffeeProfile.originsTitle')} description={t('coffeeProfile.originsHint')}>
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
        <Button asChild size="sm">
          <Link to="/shop/coffee-origins/new">
            <Plus className="size-4" />
            {t('coffeeProfile.originAdd')}
          </Link>
        </Button>
      </div>

      <Card className="mb-4 shadow-sm">
        <CardContent className="pt-6">
          <div className="relative min-w-[200px] max-w-md">
            <Search className="text-muted-foreground pointer-events-none absolute top-2.5 start-3 size-4" aria-hidden />
            <Input
              className="ps-9"
              placeholder={t('coffeeProfile.originSearch')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          {found > 0 ? (
            <p className="text-muted-foreground mt-3 text-sm">{t('coffeeProfile.originFound', { count: formatNumber(found, i18n.language) })}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="overflow-x-auto p-0">
          {q.isLoading ? (
            <TableListSkeleton rows={8} columns={5} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14">{t('coffeeProfile.colFlag')}</TableHead>
                  <TableHead>{t('coffeeProfile.colName')}</TableHead>
                  <TableHead>{t('coffeeProfile.colIso')}</TableHead>
                  <TableHead>{t('coffeeProfile.colCount')}</TableHead>
                  <TableHead className="w-28">{t('coffeeProfile.colActions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground py-8 text-center text-sm">
                      {t('coffeeProfile.originEmpty')}
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <CoffeeFlag origin={row} />
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link to={`/shop/coffee-origins/${row.id}`} className="hover:underline">
                          {row.name}
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{row.iso_code || '—'}</TableCell>
                      <TableCell>{formatNumber(row.count, i18n.language)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button asChild size="icon" variant="ghost" className="size-8">
                            <Link to={`/shop/coffee-origins/${row.id}`}>
                              <Pencil className="size-4" />
                            </Link>
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="size-8"
                            disabled={busyId === row.id}
                            onClick={() => setDeleteId(row.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteId != null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('coffeeProfile.originDeleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('coffeeProfile.originDeleteConfirm', { name: deleting?.name ?? '' })}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction disabled={remove.isPending || !deleteId} onClick={() => deleteId && void remove.mutateAsync(deleteId)}>
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  )
}
