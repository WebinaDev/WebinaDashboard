import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type Row = Record<string, unknown>

export default function TapinCatalogPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [wcProductId, setWcProductId] = useState('')
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState(0)
  const [weight, setWeight] = useState(100)
  const [taskId, setTaskId] = useState('')
  const [taskDetail, setTaskDetail] = useState('')

  const productsQ = useQuery({
    queryKey: ['tapin-products', page],
    queryFn: () =>
      apiFetch<{ items: Row[]; total_count: number }>(`shipping/tapin/products?page=${page}&count=30`),
  })
  useQueryErrorToast(productsQ)

  const customersQ = useQuery({
    queryKey: ['tapin-customers'],
    queryFn: () => apiFetch<{ items: Row[] }>('shipping/tapin/customers?page=1&count=40'),
  })

  const categoriesQ = useQuery({
    queryKey: ['tapin-product-categories'],
    queryFn: () => apiFetch<{ items: Row[] }>('shipping/tapin/products/categories'),
  })

  const customerCatsQ = useQuery({
    queryKey: ['tapin-customer-categories'],
    queryFn: () => apiFetch<{ items: Row[] }>('shipping/tapin/customers/categories'),
  })

  const employeesQ = useQuery({
    queryKey: ['tapin-employees'],
    queryFn: () => apiFetch<{ items: Row[] }>('shipping/tapin/employees?page=1&count=40'),
  })

  const tasksQ = useQuery({
    queryKey: ['tapin-tasks'],
    queryFn: () => apiFetch<{ items: Row[] }>('shipping/tapin/tasks?page=1&count=30'),
  })

  const createProd = useMutation({
    mutationFn: () =>
      apiFetch<{ ok: boolean; message: string }>('shipping/tapin/products/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, price, weight }),
      }),
    onSuccess: (d) => {
      if (d.ok) {
        toast.success(d.message)
        setTitle('')
        void qc.invalidateQueries({ queryKey: ['tapin-products'] })
      } else toast.error(d.message)
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const pushWc = useMutation({
    mutationFn: () =>
      apiFetch<{ ok: boolean; message: string }>('shipping/tapin/products/push-wc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: parseInt(wcProductId, 10) || 0 }),
      }),
    onSuccess: (d) => {
      if (d.ok) {
        toast.success(d.message)
        void qc.invalidateQueries({ queryKey: ['tapin-products'] })
      } else toast.error(d.message)
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const delProd = useMutation({
    mutationFn: (product_id: string) =>
      apiFetch<{ ok: boolean; message: string }>('shipping/tapin/products/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id }),
      }),
    onSuccess: (d) => {
      if (d.ok) {
        toast.success(d.message)
        void qc.invalidateQueries({ queryKey: ['tapin-products'] })
      } else toast.error(d.message)
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const taskDetailMut = useMutation({
    mutationFn: () =>
      apiFetch<{ ok: boolean; message: string; detail?: unknown }>('shipping/tapin/tasks/detail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId }),
      }),
    onSuccess: (d) => {
      if (d.ok) {
        toast.success(d.message)
        setTaskDetail(JSON.stringify(d.detail ?? {}, null, 2))
      } else toast.error(d.message)
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  return (
    <PageShell title={t('tapin.catalogTitle')} description={t('tapin.catalogHint')}>
      <div className="mb-4 flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link to="/settings/shop/transport/tapin">{t('tapin.openSettings')}</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/settings/shop/transport/tapin/ops">{t('tapin.opsTitle')}</Link>
        </Button>
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">{t('tapin.products')}</TabsTrigger>
          <TabsTrigger value="categories">{t('tapin.productCategories')}</TabsTrigger>
          <TabsTrigger value="customers">{t('tapin.customers')}</TabsTrigger>
          <TabsTrigger value="employees">{t('tapin.employees')}</TabsTrigger>
          <TabsTrigger value="tasks">{t('tapin.tasks')}</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('tapin.createProduct')}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-4">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('tapin.productTitle')} />
              <Input type="number" dir="ltr" value={price} onChange={(e) => setPrice(parseInt(e.target.value, 10) || 0)} placeholder={t('tapin.price')} />
              <Input type="number" dir="ltr" value={weight} onChange={(e) => setWeight(parseInt(e.target.value, 10) || 0)} placeholder={t('tapin.orderWeight')} />
              <Button type="button" disabled={!title || createProd.isPending} onClick={() => void createProd.mutate()}>
                {t('common.create')}
              </Button>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('tapin.pushWcProduct')}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-end gap-2">
              <div className="space-y-1.5">
                <Label>{t('tapin.wcProductId')}</Label>
                <Input dir="ltr" value={wcProductId} onChange={(e) => setWcProductId(e.target.value)} />
              </div>
              <Button type="button" disabled={pushWc.isPending} onClick={() => void pushWc.mutate()}>
                {t('tapin.syncToTapin')}
              </Button>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="overflow-x-auto pt-4">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b text-start">
                    <th className="p-2">ID</th>
                    <th className="p-2">{t('tapin.productTitle')}</th>
                    <th className="p-2">{t('tapin.price')}</th>
                    <th className="p-2" />
                  </tr>
                </thead>
                <tbody>
                  {(productsQ.data?.items ?? []).map((row, i) => {
                    const id = String(row.product_id ?? row.id ?? '')
                    return (
                      <tr key={id || i} className="border-b border-border/50">
                        <td className="p-2" dir="ltr">
                          {id || '—'}
                        </td>
                        <td className="p-2">{String(row.title ?? '—')}</td>
                        <td className="p-2" dir="ltr">
                          {String(row.price ?? '—')}
                        </td>
                        <td className="p-2">
                          {id ? (
                            <Button type="button" size="sm" variant="ghost" onClick={() => void delProd.mutate(id)}>
                              {t('common.delete')}
                            </Button>
                          ) : null}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div className="mt-2 flex gap-2">
                <Button type="button" size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  {t('common.prev')}
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setPage((p) => p + 1)}>
                  {t('common.next')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t('tapin.productCategories')}</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <ul className="space-y-1 text-sm">
                  {(categoriesQ.data?.items ?? []).map((row, i) => (
                    <li key={String(row.category_id ?? i)} className="border-b border-border/40 py-1.5">
                      {String(row.title ?? row.name ?? row.category_id ?? '—')}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t('tapin.customerCategories')}</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <ul className="space-y-1 text-sm">
                  {(customerCatsQ.data?.items ?? []).map((row, i) => (
                    <li key={String(row.category_id ?? i)} className="border-b border-border/40 py-1.5">
                      {String(row.title ?? row.name ?? row.category_id ?? '—')}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers">
          <Card className="shadow-sm">
            <CardContent className="overflow-x-auto pt-4">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b text-start">
                    <th className="p-2">{t('tapin.recipient')}</th>
                    <th className="p-2">{t('tapin.mobile')}</th>
                    <th className="p-2">{t('tapin.createdAt')}</th>
                  </tr>
                </thead>
                <tbody>
                  {(customersQ.data?.items ?? []).map((row, i) => (
                    <tr key={String(row.customer_id ?? i)} className="border-b border-border/50">
                      <td className="p-2">
                        {String(row.first_name ?? '')} {String(row.last_name ?? '')}
                      </td>
                      <td className="p-2" dir="ltr">
                        {String(row.mobile ?? '—')}
                      </td>
                      <td className="p-2" dir="ltr">
                        {String(row.created_at ?? '—')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees">
          <Card className="shadow-sm">
            <CardContent className="overflow-x-auto pt-4">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="border-b text-start">
                    <th className="p-2">{t('tapin.recipient')}</th>
                    <th className="p-2">{t('tapin.employeeCode')}</th>
                    <th className="p-2">username</th>
                  </tr>
                </thead>
                <tbody>
                  {(employeesQ.data?.items ?? []).map((row, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="p-2">
                        {String(row.first_name ?? '')} {String(row.last_name ?? '')}
                      </td>
                      <td className="p-2" dir="ltr">
                        {String(row.employee_code ?? '—')}
                      </td>
                      <td className="p-2" dir="ltr">
                        {String(row.username ?? '—')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card className="shadow-sm">
            <CardContent className="overflow-x-auto pt-4">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="border-b text-start">
                    <th className="p-2">ID</th>
                    <th className="p-2">type</th>
                    <th className="p-2">{t('tapin.status')}</th>
                    <th className="p-2">{t('tapin.createdAt')}</th>
                  </tr>
                </thead>
                <tbody>
                  {(tasksQ.data?.items ?? []).map((row, i) => (
                    <tr key={String(row.id ?? i)} className="border-b border-border/50">
                      <td className="p-2" dir="ltr">
                        <button type="button" className="underline" onClick={() => setTaskId(String(row.id ?? ''))}>
                          {String(row.id ?? '—')}
                        </button>
                      </td>
                      <td className="p-2">{String(row.task_type ?? '—')}</td>
                      <td className="p-2">{String(row.task_status ?? '—')}</td>
                      <td className="p-2" dir="ltr">
                        {String(row.created_at ?? '—')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('tapin.taskDetail')}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-end gap-2">
              <Input dir="ltr" value={taskId} onChange={(e) => setTaskId(e.target.value)} placeholder="task_id" />
              <Button type="button" disabled={!taskId || taskDetailMut.isPending} onClick={() => void taskDetailMut.mutate()}>
                {t('tapin.fetchDetail')}
              </Button>
              {taskDetail ? (
                <pre className="bg-muted/30 max-h-64 w-full overflow-auto rounded-md p-2 text-[11px]" dir="ltr">
                  {taskDetail}
                </pre>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  )
}
