import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Navigate, Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

const SECTIONS = [
  'overview',
  'chart',
  'journals',
  'persons',
  'products',
  'invoices',
  'purchases',
  'expenses',
  'treasury',
  'checks',
  'installments',
  'warehouses',
  'production',
  'moadian',
  'hesabfa',
  'payroll',
  'projects',
  'reports',
  'tools',
] as const

type Section = (typeof SECTIONS)[number]

function isSection(s: string | undefined): s is Section {
  return !!s && (SECTIONS as readonly string[]).includes(s)
}

type ListResp<T> = { items: T[]; total: number }

function Money({ value }: { value: number | string | undefined }) {
  const n = Number(value ?? 0)
  return <span className="tabular-nums">{n.toLocaleString()}</span>
}

function ResourceTable({
  rows,
  columns,
}: {
  rows: Record<string, unknown>[]
  columns: { key: string; label: string }[]
}) {
  if (!rows.length) return <p className="text-muted-foreground text-sm">—</p>
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
            {columns.map((c) => (
              <th key={c.key} className="px-2 py-2 text-start font-medium">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={String(row.id ?? i)} className="border-b last:border-0">
              {columns.map((c) => (
                <td key={c.key} className="px-2 py-2">
                  {String(row[c.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function useAccList(path: string, enabled = true) {
  return useQuery({
    queryKey: ['accounting', path],
    queryFn: async () => apiFetch<ListResp<Record<string, unknown>>>(path),
    enabled,
  })
}

export default function AccountingShell() {
  const { t } = useTranslation()
  const { section } = useParams<{ section: string }>()
  const qc = useQueryClient()

  if (!isSection(section)) {
    return <Navigate to="/accounting/overview" replace />
  }

  const overviewQ = useQuery({
    queryKey: ['accounting', 'overview'],
    queryFn: async () => apiFetch<Record<string, unknown>>('accounting/overview'),
    enabled: section === 'overview',
  })

  const journalsQ = useAccList('accounting/journals', section === 'journals')
  const chartQ = useAccList('accounting/chart', section === 'chart')
  const fiscalQ = useAccList('accounting/fiscal-years', section === 'chart')
  const personsQ = useAccList('accounting/persons', section === 'persons')
  const productsQ = useAccList('accounting/products', section === 'products')
  const invoicesQ = useAccList(
    section === 'purchases' ? 'accounting/invoices?type=purchase' : 'accounting/invoices?type=sale',
    section === 'invoices' || section === 'purchases',
  )
  const expensesQ = useAccList('accounting/expenses', section === 'expenses')
  const cashQ = useAccList('accounting/cash-accounts', section === 'treasury')
  const vouchersQ = useAccList('accounting/vouchers', section === 'treasury')
  const checksQ = useAccList('accounting/checks', section === 'checks')
  const installmentsQ = useAccList('accounting/installments', section === 'installments')
  const whQ = useAccList('accounting/warehouses', section === 'warehouses')
  const stockQ = useAccList('accounting/warehouse-stock', section === 'warehouses')
  const productionQ = useAccList('accounting/production', section === 'production')
  const moadianQ = useAccList('accounting/moadian/jobs', section === 'moadian')
  const hesabfaJobsQ = useAccList('accounting/hesabfa/jobs', section === 'hesabfa')
  const hesabfaMapQ = useAccList('accounting/hesabfa/map', section === 'hesabfa')
  const hesabfaLogQ = useAccList('accounting/hesabfa/log', section === 'hesabfa')
  const employeesQ = useAccList('accounting/employees', section === 'payroll')
  const payrollQ = useAccList('accounting/payroll', section === 'payroll')
  const workshopsQ = useAccList('accounting/workshops', section === 'payroll')
  const decreesQ = useAccList('accounting/decrees', section === 'payroll')
  const projectsQ = useAccList('accounting/projects', section === 'projects')

  const [selectedRunId, setSelectedRunId] = useState<number | null>(null)
  const runDetailQ = useQuery({
    queryKey: ['accounting', 'payroll-run', selectedRunId],
    queryFn: async () =>
      apiFetch<{
        id: number
        status: string
        list_status?: string
        jalali_year?: number
        jalali_month?: number
        year_month?: string
        total_net?: number
        total_gross?: number
        payslips?: Record<string, unknown>[]
      }>(`accounting/payroll/${selectedRunId}`),
    enabled: section === 'payroll' && !!selectedRunId,
  })

  const taminPreviewQ = useQuery({
    queryKey: ['accounting', 'tamin-preview', selectedRunId],
    queryFn: async () =>
      apiFetch<{ kar: Record<string, unknown>; workers: Record<string, unknown>[]; guide?: string }>(
        `accounting/payroll/${selectedRunId}/tamin-preview`,
      ),
    enabled: section === 'payroll' && !!selectedRunId,
  })

  const reportsQ = useQuery({
    queryKey: ['accounting', 'reports', 'bundle'],
    queryFn: async () => {
      const [pnl, vat, margin, aging, tb, bs, taxSplit, cashFlow] = await Promise.all([
        apiFetch<Record<string, unknown>>('accounting/reports/pnl'),
        apiFetch<Record<string, unknown>>('accounting/reports/vat'),
        apiFetch<Record<string, unknown>>('accounting/reports/margin'),
        apiFetch<Record<string, unknown>>('accounting/reports/aging'),
        apiFetch<{ rows?: Record<string, unknown>[] } | Record<string, unknown>[]>('accounting/reports/trial-balance'),
        apiFetch<Record<string, unknown>>('accounting/reports/balance-sheet'),
        apiFetch<Record<string, unknown>>('accounting/reports/tax-split'),
        apiFetch<Record<string, unknown>>('accounting/reports/cash-flow'),
      ])
      return { pnl, vat, margin, aging, tb, bs, taxSplit, cashFlow }
    },
    enabled: section === 'reports',
  })

  const [personName, setPersonName] = useState('')
  const [productName, setProductName] = useState('')
  const [sstid, setSstid] = useState('')
  const [empFirst, setEmpFirst] = useState('')
  const [empLast, setEmpLast] = useState('')
  const [empNationalId, setEmpNationalId] = useState('')
  const [empInsuranceNo, setEmpInsuranceNo] = useState('')
  const [empSalary, setEmpSalary] = useState('0')
  const [empDailyWage, setEmpDailyWage] = useState('0')
  const [empJobCode, setEmpJobCode] = useState('')
  const [empWorkshopId, setEmpWorkshopId] = useState('')
  const [whCode, setWhCode] = useState('')
  const [whName, setWhName] = useState('')
  const [whBranch, setWhBranch] = useState('')
  const [whRow, setWhRow] = useState('')
  const [jy, setJy] = useState('1404')
  const [jm, setJm] = useState('1')
  const [runWorkshopId, setRunWorkshopId] = useState('')
  const [attEmpId, setAttEmpId] = useState('')
  const [attAbsent, setAttAbsent] = useState('0')
  const [attLeave, setAttLeave] = useState('0')
  const [attOt, setAttOt] = useState('0')
  const [attVolume, setAttVolume] = useState('0')
  const [attPiece, setAttPiece] = useState('0')
  const [decreeEmpId, setDecreeEmpId] = useState('')
  const [decreeDaily, setDecreeDaily] = useState('0')
  const [decreeJobCode, setDecreeJobCode] = useState('')
  const [projectName, setProjectName] = useState('')

  const openHtml = (html: string) => {
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(html)
    w.document.close()
  }

  const createPerson = useMutation({
    mutationFn: async () => apiFetch('accounting/persons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: personName, type: 'both' }) }),
    onSuccess: async () => {
      toast.success(t('common.saved'))
      setPersonName('')
      await qc.invalidateQueries({ queryKey: ['accounting', 'accounting/persons'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const createProduct = useMutation({
    mutationFn: async () =>
      apiFetch('accounting/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: productName, sstid, vat_rate: 10 }),
      }),
    onSuccess: async () => {
      toast.success(t('common.saved'))
      setProductName('')
      setSstid('')
      await qc.invalidateQueries({ queryKey: ['accounting'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const createEmployee = useMutation({
    mutationFn: async () =>
      apiFetch('accounting/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: empFirst,
          last_name: empLast,
          name: `${empFirst} ${empLast}`.trim(),
          national_id: empNationalId,
          insurance_no: empInsuranceNo,
          base_salary: Number(empSalary) || 0,
          daily_wage: Number(empDailyWage) || 0,
          job_code: empJobCode,
          workshop_id: empWorkshopId ? Number(empWorkshopId) : undefined,
        }),
      }),
    onSuccess: async () => {
      toast.success(t('common.saved'))
      setEmpFirst('')
      setEmpLast('')
      setEmpNationalId('')
      setEmpInsuranceNo('')
      await qc.invalidateQueries({ queryKey: ['accounting'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const createWorkshop = useMutation({
    mutationFn: async () =>
      apiFetch('accounting/workshops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: whCode,
          name: whName,
          branch_code: whBranch,
          row_code: whRow,
          is_default: true,
        }),
      }),
    onSuccess: async () => {
      toast.success(t('common.saved'))
      setWhCode('')
      setWhName('')
      await qc.invalidateQueries({ queryKey: ['accounting'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const saveAttendance = useMutation({
    mutationFn: async () =>
      apiFetch('accounting/payroll/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: Number(attEmpId),
          jalali_year: Number(jy),
          jalali_month: Number(jm),
          absent_days: Number(attAbsent) || 0,
          leave_days: Number(attLeave) || 0,
          overtime_hours: Number(attOt) || 0,
          volume_qty: Number(attVolume) || 0,
          piece_rate: Number(attPiece) || 0,
        }),
      }),
    onSuccess: async () => {
      toast.success(t('common.saved'))
      await qc.invalidateQueries({ queryKey: ['accounting'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const createPayroll = useMutation({
    mutationFn: async () =>
      apiFetch('accounting/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jalali_year: Number(jy),
          jalali_month: Number(jm),
          workshop_id: runWorkshopId ? Number(runWorkshopId) : undefined,
        }),
      }),
    onSuccess: async (res: { id?: number }) => {
      toast.success(t('common.saved'))
      if (res?.id) setSelectedRunId(res.id)
      await qc.invalidateQueries({ queryKey: ['accounting'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const postPayroll = useMutation({
    mutationFn: async (id: number) => apiFetch(`accounting/payroll/${id}/post`, { method: 'POST' }),
    onSuccess: async () => {
      toast.success(t('accounting.posted'))
      await qc.invalidateQueries({ queryKey: ['accounting'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const recalcPayroll = useMutation({
    mutationFn: async (id: number) => apiFetch(`accounting/payroll/${id}/recalc`, { method: 'POST' }),
    onSuccess: async () => {
      toast.success(t('accounting.payroll.recalculated'))
      await qc.invalidateQueries({ queryKey: ['accounting'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const exportTamin = useMutation({
    mutationFn: async (id: number) =>
      apiFetch<{ url: string; filename: string }>(`accounting/payroll/${id}/tamin-dsk`, { method: 'POST' }),
    onSuccess: async (res) => {
      toast.success(t('accounting.payroll.taminExported'))
      if (res.url) window.open(res.url, '_blank', 'noopener,noreferrer')
      await qc.invalidateQueries({ queryKey: ['accounting'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const createDecree = useMutation({
    mutationFn: async () =>
      apiFetch('accounting/decrees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: Number(decreeEmpId),
          decree_type: 'hire',
          status: 'issued',
          effective_from: new Date().toISOString().slice(0, 10),
          issue_date: new Date().toISOString().slice(0, 10),
          daily_wage: Number(decreeDaily) || 0,
          job_code: decreeJobCode,
        }),
      }),
    onSuccess: async () => {
      toast.success(t('common.saved'))
      setDecreeEmpId('')
      await qc.invalidateQueries({ queryKey: ['accounting'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const createProject = useMutation({
    mutationFn: async () => apiFetch('accounting/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: projectName }) }),
    onSuccess: async () => {
      toast.success(t('common.saved'))
      setProjectName('')
      await qc.invalidateQueries({ queryKey: ['accounting'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const processMoadian = useMutation({
    mutationFn: async () => apiFetch<{ processed: number }>('accounting/moadian/process', { method: 'POST' }),
    onSuccess: async (r) => {
      toast.success(t('accounting.moadianProcessed', { count: r.processed }))
      await qc.invalidateQueries({ queryKey: ['accounting'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const processHesabfa = useMutation({
    mutationFn: async () => apiFetch<{ processed: number }>('accounting/hesabfa/process', { method: 'POST' }),
    onSuccess: async (r) => {
      toast.success(t('accounting.hesabfa.processed', { count: r.processed }))
      await qc.invalidateQueries({ queryKey: ['accounting'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const syncHesabfa = useMutation({
    mutationFn: async () => apiFetch<{ pulled: number }>('accounting/hesabfa/sync-now', { method: 'POST' }),
    onSuccess: async (r) => {
      toast.success(t('accounting.hesabfa.synced', { count: r.pulled ?? 0 }))
      await qc.invalidateQueries({ queryKey: ['accounting'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const migrateHesabfa = useMutation({
    mutationFn: async () => apiFetch<{ queued: number }>('accounting/hesabfa/migrate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }),
    onSuccess: async (r) => {
      toast.success(t('accounting.hesabfa.migrateQueued', { count: r.queued }))
      await qc.invalidateQueries({ queryKey: ['accounting'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const [inquiryType, setInquiryType] = useState('iban')
  const [inquiryValue, setInquiryValue] = useState('')
  const [inquiryResult, setInquiryResult] = useState('')
  const runInquiry = useMutation({
    mutationFn: async () => {
      const body: Record<string, string> = { type: inquiryType }
      if (inquiryType === 'iban' || inquiryType === 'iban_national') body.iban = inquiryValue
      else if (inquiryType === 'card' || inquiryType === 'card_to_iban' || inquiryType === 'card_national') body.card_number = inquiryValue
      else if (inquiryType === 'postal') body.postal_code = inquiryValue
      else if (inquiryType === 'national' || inquiryType === 'mobile_national') body.national_code = inquiryValue
      else if (inquiryType === 'credit') {
        /* no args */
      } else body.national_code = inquiryValue
      return apiFetch<{ result: unknown }>('accounting/hesabfa/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    },
    onSuccess: (r) => setInquiryResult(JSON.stringify(r.result, null, 2)),
    onError: (e: Error) => toastApiError(t, e),
  })

  const backfill = useMutation({
    mutationFn: async () => apiFetch<{ synced: number }>('accounting/sync/backfill', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ limit: 30 }) }),
    onSuccess: async (r) => {
      toast.success(t('accounting.backfillDone', { count: r.synced }))
      await qc.invalidateQueries({ queryKey: ['accounting'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const nav = useMemo(
    () =>
      SECTIONS.map((s) => ({
        id: s,
        label: t(`accounting.nav.${s}`),
        to: `/accounting/${s}`,
      })),
    [t],
  )

  const title = t(`accounting.nav.${section}`)

  return (
    <PageShell title={t('accounting.title')} description={title}>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {nav.map((n) => (
          <Link
            key={n.id}
            to={n.to}
            className={`shrink-0 rounded-full border px-3 py-1 text-xs ${section === n.id ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
          >
            {n.label}
          </Link>
        ))}
      </div>

      {section === 'overview' ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Card title={t('accounting.kpi.profit')} value={<Money value={(overviewQ.data?.profit as { profit?: number })?.profit} />} />
          <Card title={t('accounting.kpi.margin')} value={<Money value={(overviewQ.data?.margin as { margin?: number })?.margin} />} />
          <Card title={t('accounting.kpi.moadianPending')} value={String((overviewQ.data as { moadian_pending?: number })?.moadian_pending ?? 0)} />
          <div className="md:col-span-3 flex flex-wrap gap-2">
            <Button onClick={() => void backfill.mutate()} disabled={backfill.isPending}>
              {t('accounting.backfillOrders')}
            </Button>
            <Button variant="outline" onClick={() => { window.location.href = '/dashboard/settings/shop/accounting' }}>
              {t('accounting.settings.moadian')}
            </Button>
          </div>
        </div>
      ) : null}

      {section === 'chart' ? (
        <div className="space-y-6">
          <div>
            <h3 className="mb-2 text-sm font-semibold">{t('accounting.nav.chart')}</h3>
            <ResourceTable
              rows={(chartQ.data?.items ?? []) as Record<string, unknown>[]}
              columns={[
                { key: 'code', label: t('accounting.col.code') },
                { key: 'name', label: t('accounting.col.name') },
                { key: 'type', label: t('accounting.col.kind') },
                { key: 'is_postable', label: t('accounting.col.postable') },
              ]}
            />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold">{t('accounting.fiscalYears')}</h3>
            <ResourceTable
              rows={(fiscalQ.data?.items ?? []) as Record<string, unknown>[]}
              columns={[
                { key: 'id', label: 'ID' },
                { key: 'title', label: t('accounting.col.name') },
                { key: 'starts_on', label: t('accounting.col.from') },
                { key: 'ends_on', label: t('accounting.col.to') },
                { key: 'is_closed', label: t('accounting.col.closed') },
              ]}
            />
          </div>
        </div>
      ) : null}

      {section === 'journals' ? (
        <ResourceTable
          rows={(journalsQ.data?.items ?? []) as Record<string, unknown>[]}
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'document_no', label: t('accounting.col.number') },
            { key: 'document_date', label: t('accounting.col.date') },
            { key: 'status', label: t('accounting.col.status') },
            { key: 'description', label: t('accounting.col.description') },
          ]}
        />
      ) : null}

      {section === 'persons' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Input className="max-w-xs" value={personName} onChange={(e) => setPersonName(e.target.value)} placeholder={t('accounting.personName')} />
            <Button onClick={() => void createPerson.mutate()} disabled={!personName || createPerson.isPending}>
              {t('common.save')}
            </Button>
          </div>
          <ResourceTable
            rows={(personsQ.data?.items ?? []) as Record<string, unknown>[]}
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'name', label: t('accounting.col.name') },
              { key: 'person_kind', label: t('accounting.col.kind') },
              { key: 'national_id', label: t('accounting.col.nationalId') },
              { key: 'mobile', label: t('accounting.col.mobile') },
            ]}
          />
        </div>
      ) : null}

      {section === 'products' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Input className="max-w-xs" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder={t('accounting.productName')} />
            <Input className="max-w-xs" value={sstid} onChange={(e) => setSstid(e.target.value)} placeholder={t('accounting.sstid')} />
            <Button onClick={() => void createProduct.mutate()} disabled={!productName || createProduct.isPending}>
              {t('common.save')}
            </Button>
          </div>
          <ResourceTable
            rows={(productsQ.data?.items ?? []) as Record<string, unknown>[]}
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'name', label: t('accounting.col.name') },
              { key: 'sstid', label: t('accounting.sstid') },
              { key: 'vat_rate', label: t('accounting.col.vat') },
              { key: 'wc_product_id', label: 'WC' },
            ]}
          />
        </div>
      ) : null}

      {section === 'invoices' || section === 'purchases' ? (
        <ResourceTable
          rows={(invoicesQ.data?.items ?? []) as Record<string, unknown>[]}
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'number', label: t('accounting.col.number') },
            { key: 'document_date', label: t('accounting.col.date') },
            { key: 'total', label: t('accounting.col.total') },
            { key: 'status', label: t('accounting.col.status') },
            { key: 'moadian_status', label: t('accounting.col.moadian') },
          ]}
        />
      ) : null}

      {section === 'expenses' ? (
        <ResourceTable
          rows={(expensesQ.data?.items ?? []) as Record<string, unknown>[]}
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'number', label: t('accounting.col.number') },
            { key: 'total', label: t('accounting.col.total') },
            { key: 'status', label: t('accounting.col.status') },
          ]}
        />
      ) : null}

      {section === 'treasury' ? (
        <div className="grid gap-4">
          <h3 className="text-sm font-semibold">{t('accounting.cashAccounts')}</h3>
          <ResourceTable
            rows={(cashQ.data?.items ?? []) as Record<string, unknown>[]}
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'name', label: t('accounting.col.name') },
              { key: 'type', label: t('accounting.col.type') },
            ]}
          />
          <h3 className="text-sm font-semibold">{t('accounting.vouchers')}</h3>
          <ResourceTable
            rows={(vouchersQ.data?.items ?? []) as Record<string, unknown>[]}
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'type', label: t('accounting.col.type') },
              { key: 'number', label: t('accounting.col.number') },
              { key: 'amount', label: t('accounting.col.amount') },
              { key: 'status', label: t('accounting.col.status') },
            ]}
          />
        </div>
      ) : null}

      {section === 'checks' ? (
        <ResourceTable
          rows={(checksQ.data?.items ?? []) as Record<string, unknown>[]}
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'type', label: t('accounting.col.type') },
            { key: 'number', label: t('accounting.col.number') },
            { key: 'amount', label: t('accounting.col.amount') },
            { key: 'due_date', label: t('accounting.col.due') },
            { key: 'status', label: t('accounting.col.status') },
          ]}
        />
      ) : null}

      {section === 'installments' ? (
        <ResourceTable
          rows={(installmentsQ.data?.items ?? []) as Record<string, unknown>[]}
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'person_id', label: t('accounting.col.person') },
            { key: 'due_on', label: t('accounting.col.date') },
            { key: 'amount', label: t('accounting.col.total') },
            { key: 'paid_amount', label: t('accounting.col.paid') },
            { key: 'status', label: t('accounting.col.status') },
            { key: 'direction', label: t('accounting.col.kind') },
          ]}
        />
      ) : null}

      {section === 'warehouses' ? (
        <div className="grid gap-4">
          <ResourceTable
            rows={(whQ.data?.items ?? []) as Record<string, unknown>[]}
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'name', label: t('accounting.col.name') },
              { key: 'is_default', label: t('accounting.col.default') },
            ]}
          />
          <h3 className="text-sm font-semibold">{t('accounting.stock')}</h3>
          <ResourceTable
            rows={(stockQ.data?.items ?? []) as Record<string, unknown>[]}
            columns={[
              { key: 'warehouse_id', label: t('accounting.col.warehouse') },
              { key: 'product_id', label: t('accounting.col.product') },
              { key: 'quantity', label: t('accounting.col.qty') },
            ]}
          />
        </div>
      ) : null}

      {section === 'moadian' ? (
        <div className="space-y-4">
          <Button onClick={() => void processMoadian.mutate()} disabled={processMoadian.isPending}>
            {t('accounting.processMoadian')}
          </Button>
          <ResourceTable
            rows={(moadianQ.data?.items ?? []) as Record<string, unknown>[]}
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'invoice_id', label: t('accounting.col.invoice') },
              { key: 'action', label: t('accounting.col.action') },
              { key: 'status', label: t('accounting.col.status') },
              { key: 'last_error', label: t('accounting.col.error') },
            ]}
          />
        </div>
      ) : null}

      {section === 'hesabfa' ? (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void processHesabfa.mutate()} disabled={processHesabfa.isPending}>
              {t('accounting.hesabfa.process')}
            </Button>
            <Button variant="outline" onClick={() => void syncHesabfa.mutate()} disabled={syncHesabfa.isPending}>
              {t('accounting.hesabfa.syncNow')}
            </Button>
            <Button variant="secondary" onClick={() => void migrateHesabfa.mutate()} disabled={migrateHesabfa.isPending}>
              {t('accounting.hesabfa.migrate')}
            </Button>
            <Button variant="outline" onClick={() => { window.location.href = '/dashboard/settings/shop/accounting/hesabfa' }}>
              {t('accounting.settings.hesabfa')}
            </Button>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold">{t('accounting.hesabfa.jobs')}</h3>
            <ResourceTable
              rows={(hesabfaJobsQ.data?.items ?? []) as Record<string, unknown>[]}
              columns={[
                { key: 'id', label: 'ID' },
                { key: 'action', label: t('accounting.col.action') },
                { key: 'entity_type', label: t('accounting.col.kind') },
                { key: 'local_id', label: 'Local' },
                { key: 'status', label: t('accounting.col.status') },
                { key: 'last_error', label: t('accounting.col.error') },
              ]}
            />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold">{t('accounting.hesabfa.map')}</h3>
            <ResourceTable
              rows={(hesabfaMapQ.data?.items ?? []) as Record<string, unknown>[]}
              columns={[
                { key: 'entity_type', label: t('accounting.col.kind') },
                { key: 'local_id', label: 'Local' },
                { key: 'remote_id', label: 'Remote ID' },
                { key: 'remote_code', label: t('accounting.col.code') },
                { key: 'last_direction', label: t('accounting.col.action') },
                { key: 'last_synced_at', label: t('accounting.col.date') },
              ]}
            />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold">{t('accounting.hesabfa.log')}</h3>
            <ResourceTable
              rows={(hesabfaLogQ.data?.items ?? []) as Record<string, unknown>[]}
              columns={[
                { key: 'id', label: 'ID' },
                { key: 'endpoint', label: t('accounting.col.action') },
                { key: 'http_code', label: 'HTTP' },
                { key: 'direction', label: t('accounting.col.kind') },
                { key: 'created_at', label: t('accounting.col.date') },
              ]}
            />
          </div>
          <div className="space-y-2 rounded-md border p-3">
            <h3 className="text-sm font-semibold">{t('accounting.hesabfa.inquiry')}</h3>
            <div className="flex flex-wrap gap-2">
              <Input className="max-w-[10rem]" value={inquiryType} onChange={(e) => setInquiryType(e.target.value)} placeholder="iban|card|postal|credit" />
              <Input className="max-w-xs" value={inquiryValue} onChange={(e) => setInquiryValue(e.target.value)} placeholder={t('accounting.hesabfa.inquiryValue')} />
              <Button size="sm" onClick={() => void runInquiry.mutate()} disabled={runInquiry.isPending}>
                {t('accounting.hesabfa.runInquiry')}
              </Button>
            </div>
            {inquiryResult ? <pre className="bg-muted/40 max-h-48 overflow-auto rounded p-2 text-xs">{inquiryResult}</pre> : null}
          </div>
        </div>
      ) : null}

      {section === 'production' ? (
        <ResourceTable
          rows={(productionQ.data?.items ?? []) as Record<string, unknown>[]}
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'document_no', label: t('accounting.col.number') },
            { key: 'document_date', label: t('accounting.col.date') },
            { key: 'output_product_id', label: t('accounting.col.product') },
            { key: 'output_qty', label: t('accounting.col.qty') },
            { key: 'status', label: t('accounting.col.status') },
          ]}
        />
      ) : null}

      {section === 'payroll' ? (
        <div className="space-y-6">
          <div className="space-y-2 rounded-md border p-3">
            <p className="text-sm font-medium">{t('accounting.payroll.workshops')}</p>
            <div className="flex flex-wrap gap-2">
              <Input className="max-w-[8rem]" value={whCode} onChange={(e) => setWhCode(e.target.value)} placeholder={t('accounting.payroll.workshopCode')} />
              <Input className="max-w-xs" value={whName} onChange={(e) => setWhName(e.target.value)} placeholder={t('accounting.payroll.workshopName')} />
              <Input className="max-w-[8rem]" value={whBranch} onChange={(e) => setWhBranch(e.target.value)} placeholder={t('accounting.payroll.branchCode')} />
              <Input className="max-w-[8rem]" value={whRow} onChange={(e) => setWhRow(e.target.value)} placeholder={t('accounting.payroll.rowCode')} />
              <Button onClick={() => void createWorkshop.mutate()} disabled={!whCode || !whName || createWorkshop.isPending}>
                {t('common.save')}
              </Button>
            </div>
            <ResourceTable
              rows={(workshopsQ.data?.items ?? []) as Record<string, unknown>[]}
              columns={[
                { key: 'id', label: 'ID' },
                { key: 'code', label: t('accounting.col.code') },
                { key: 'name', label: t('accounting.col.name') },
                { key: 'branch_code', label: t('accounting.payroll.branchCode') },
                { key: 'is_active', label: t('accounting.col.status') },
              ]}
            />
          </div>

          <div className="space-y-2 rounded-md border p-3">
            <p className="text-sm font-medium">{t('accounting.payroll.employees')}</p>
            <div className="flex flex-wrap gap-2">
              <Input className="max-w-[8rem]" value={empFirst} onChange={(e) => setEmpFirst(e.target.value)} placeholder={t('accounting.payroll.firstName')} />
              <Input className="max-w-[8rem]" value={empLast} onChange={(e) => setEmpLast(e.target.value)} placeholder={t('accounting.payroll.lastName')} />
              <Input className="max-w-[8rem]" value={empNationalId} onChange={(e) => setEmpNationalId(e.target.value)} placeholder={t('accounting.payroll.nationalId')} />
              <Input className="max-w-[8rem]" value={empInsuranceNo} onChange={(e) => setEmpInsuranceNo(e.target.value)} placeholder={t('accounting.payroll.insuranceNo')} />
              <Input className="max-w-[8rem]" value={empSalary} onChange={(e) => setEmpSalary(e.target.value)} placeholder={t('accounting.baseSalary')} />
              <Input className="max-w-[8rem]" value={empDailyWage} onChange={(e) => setEmpDailyWage(e.target.value)} placeholder={t('accounting.payroll.dailyWage')} />
              <Input className="max-w-[6rem]" value={empJobCode} onChange={(e) => setEmpJobCode(e.target.value)} placeholder={t('accounting.payroll.jobCode')} />
              <Input className="max-w-[6rem]" value={empWorkshopId} onChange={(e) => setEmpWorkshopId(e.target.value)} placeholder={t('accounting.payroll.workshopId')} />
              <Button onClick={() => void createEmployee.mutate()} disabled={(!empFirst && !empLast) || createEmployee.isPending}>
                {t('common.save')}
              </Button>
            </div>
            <ResourceTable
              rows={(employeesQ.data?.items ?? []) as Record<string, unknown>[]}
              columns={[
                { key: 'id', label: 'ID' },
                { key: 'name', label: t('accounting.col.name') },
                { key: 'national_id', label: t('accounting.payroll.nationalId') },
                { key: 'insurance_no', label: t('accounting.payroll.insuranceNo') },
                { key: 'base_salary', label: t('accounting.baseSalary') },
                { key: 'daily_wage', label: t('accounting.payroll.dailyWage') },
                { key: 'status', label: t('accounting.col.status') },
              ]}
            />
          </div>

          <div className="space-y-2 rounded-md border p-3">
            <p className="text-sm font-medium">{t('accounting.payroll.attendance')}</p>
            <div className="flex flex-wrap gap-2">
              <Input className="max-w-[6rem]" value={attEmpId} onChange={(e) => setAttEmpId(e.target.value)} placeholder={t('accounting.payroll.employeeId')} />
              <Input className="max-w-[5rem]" value={jy} onChange={(e) => setJy(e.target.value)} placeholder={t('accounting.payroll.jalaliYear')} />
              <Input className="max-w-[4rem]" value={jm} onChange={(e) => setJm(e.target.value)} placeholder={t('accounting.payroll.jalaliMonth')} />
              <Input className="max-w-[5rem]" value={attAbsent} onChange={(e) => setAttAbsent(e.target.value)} placeholder={t('accounting.payroll.absentDays')} />
              <Input className="max-w-[5rem]" value={attLeave} onChange={(e) => setAttLeave(e.target.value)} placeholder={t('accounting.payroll.leaveDays')} />
              <Input className="max-w-[5rem]" value={attOt} onChange={(e) => setAttOt(e.target.value)} placeholder={t('accounting.payroll.overtimeHours')} />
              <Input className="max-w-[5rem]" value={attVolume} onChange={(e) => setAttVolume(e.target.value)} placeholder={t('accounting.payroll.volumeQty')} />
              <Input className="max-w-[5rem]" value={attPiece} onChange={(e) => setAttPiece(e.target.value)} placeholder={t('accounting.payroll.pieceRate')} />
              <Button onClick={() => void saveAttendance.mutate()} disabled={!attEmpId || saveAttendance.isPending}>
                {t('common.save')}
              </Button>
            </div>
          </div>

          <div className="space-y-2 rounded-md border p-3">
            <p className="text-sm font-medium">{t('accounting.payroll.decrees')}</p>
            <div className="flex flex-wrap gap-2">
              <Input className="max-w-[6rem]" value={decreeEmpId} onChange={(e) => setDecreeEmpId(e.target.value)} placeholder={t('accounting.payroll.employeeId')} />
              <Input className="max-w-[8rem]" value={decreeDaily} onChange={(e) => setDecreeDaily(e.target.value)} placeholder={t('accounting.payroll.dailyWage')} />
              <Input className="max-w-[6rem]" value={decreeJobCode} onChange={(e) => setDecreeJobCode(e.target.value)} placeholder={t('accounting.payroll.jobCode')} />
              <Button onClick={() => void createDecree.mutate()} disabled={!decreeEmpId || createDecree.isPending}>
                {t('accounting.payroll.issueDecree')}
              </Button>
            </div>
            <div className="space-y-2">
              {(decreesQ.data?.items ?? []).slice(0, 20).map((d) => (
                <div key={String(d.id)} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <span>
                    #{String(d.id)} {String(d.decree_no)} — emp {String(d.employee_id)} — {String(d.status)}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      void apiFetch<{ html: string }>(`accounting/decrees/${d.id}/print`)
                        .then((r) => openHtml(r.html))
                        .catch((e: Error) => toastApiError(t, e))
                    }
                  >
                    {t('accounting.payroll.print')}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 rounded-md border p-3">
            <p className="text-sm font-medium">{t('accounting.payroll.runs')}</p>
            <div className="flex flex-wrap gap-2">
              <Input className="max-w-[5rem]" value={jy} onChange={(e) => setJy(e.target.value)} placeholder={t('accounting.payroll.jalaliYear')} />
              <Input className="max-w-[4rem]" value={jm} onChange={(e) => setJm(e.target.value)} placeholder={t('accounting.payroll.jalaliMonth')} />
              <Input className="max-w-[6rem]" value={runWorkshopId} onChange={(e) => setRunWorkshopId(e.target.value)} placeholder={t('accounting.payroll.workshopId')} />
              <Button onClick={() => void createPayroll.mutate()} disabled={createPayroll.isPending}>
                {t('accounting.createPayroll')}
              </Button>
            </div>
            <div className="space-y-2">
              {(payrollQ.data?.items ?? []).map((run) => (
                <div key={String(run.id)} className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
                  <button type="button" className="text-start hover:underline" onClick={() => setSelectedRunId(Number(run.id))}>
                    {String(run.jalali_year ?? '')}/{String(run.jalali_month ?? '')} ({String(run.year_month)}) — {String(run.status)}
                    {run.list_status ? ` / ${String(run.list_status)}` : ''} — <Money value={run.total_net as number} />
                  </button>
                  <div className="flex flex-wrap gap-1">
                    {run.status !== 'posted' ? (
                      <>
                        <Button size="sm" variant="outline" onClick={() => void recalcPayroll.mutate(Number(run.id))}>
                          {t('accounting.payroll.recalc')}
                        </Button>
                        <Button size="sm" onClick={() => void postPayroll.mutate(Number(run.id))}>
                          {t('accounting.post')}
                        </Button>
                      </>
                    ) : null}
                    <Button size="sm" variant="secondary" onClick={() => void exportTamin.mutate(Number(run.id))} disabled={exportTamin.isPending}>
                      {t('accounting.payroll.exportTamin')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedRunId && runDetailQ.data ? (
            <div className="space-y-2 rounded-md border p-3">
              <p className="text-sm font-medium">
                {t('accounting.payroll.payslips')} #{selectedRunId}
              </p>
              <div className="space-y-2">
                {(runDetailQ.data.payslips ?? []).map((s) => (
                  <div key={String(s.id)} className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
                    <span>
                      {String(s.employee_name)} — {t('accounting.payroll.daysWorked')}: {String(s.days_worked)} —{' '}
                      <Money value={s.net as number} />
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        void apiFetch<{ html: string }>(`accounting/payslips/${s.id}/print`)
                          .then((r) => openHtml(r.html))
                          .catch((e: Error) => toastApiError(t, e))
                      }
                    >
                      {t('accounting.payroll.print')}
                    </Button>
                  </div>
                ))}
              </div>
              <ResourceTable
                rows={(runDetailQ.data.payslips ?? []) as Record<string, unknown>[]}
                columns={[
                  { key: 'employee_name', label: t('accounting.col.name') },
                  { key: 'days_worked', label: t('accounting.payroll.daysWorked') },
                  { key: 'volume_pay', label: t('accounting.payroll.volumePay') },
                  { key: 'gross', label: t('accounting.payroll.gross') },
                  { key: 'insurable_capped', label: t('accounting.payroll.insurable') },
                  { key: 'employee_insurance', label: t('accounting.payroll.empIns') },
                  { key: 'employer_insurance', label: t('accounting.payroll.erIns') },
                  { key: 'unemployment_insurance', label: t('accounting.payroll.unemp') },
                  { key: 'tax', label: t('accounting.payroll.tax') },
                  { key: 'net', label: t('accounting.payroll.net') },
                ]}
              />
              {taminPreviewQ.data?.guide ? <p className="text-muted-foreground text-xs">{taminPreviewQ.data.guide}</p> : null}
              {taminPreviewQ.data?.workers?.length ? (
                <ResourceTable
                  rows={taminPreviewQ.data.workers as Record<string, unknown>[]}
                  columns={[
                    { key: 'DSW_ID1', label: t('accounting.payroll.insuranceNo') },
                    { key: 'DSW_FNAME', label: t('accounting.payroll.firstName') },
                    { key: 'DSW_LNAME', label: t('accounting.payroll.lastName') },
                    { key: 'DSW_DD', label: t('accounting.payroll.daysWorked') },
                    { key: 'DSW_MASH', label: t('accounting.payroll.insurable') },
                    { key: 'DSW_BIME', label: t('accounting.payroll.empIns') },
                  ]}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {section === 'projects' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Input className="max-w-xs" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder={t('accounting.projectName')} />
            <Button onClick={() => void createProject.mutate()} disabled={!projectName || createProject.isPending}>
              {t('common.save')}
            </Button>
          </div>
          <ResourceTable
            rows={(projectsQ.data?.items ?? []) as Record<string, unknown>[]}
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'code', label: t('accounting.col.code') },
              { key: 'name', label: t('accounting.col.name') },
              { key: 'status', label: t('accounting.col.status') },
              { key: 'budget', label: t('accounting.col.budget') },
            ]}
          />
        </div>
      ) : null}

      {section === 'reports' ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Card title={t('accounting.report.pnl')} value={<Money value={(reportsQ.data?.pnl as { profit?: number })?.profit} />} />
          <Card title={t('accounting.report.vat')} value={<Money value={(reportsQ.data?.vat as { net_vat?: number })?.net_vat} />} />
          <Card title={t('accounting.report.margin')} value={<Money value={(reportsQ.data?.margin as { margin?: number })?.margin} />} />
          <Card title={t('accounting.report.balanceSheet')} value={<Money value={(reportsQ.data?.bs as { assets?: number })?.assets} />} />
          <Card title={t('accounting.report.taxable')} value={<Money value={(reportsQ.data?.taxSplit as { taxable?: number })?.taxable} />} />
          <Card title={t('accounting.report.exempt')} value={<Money value={(reportsQ.data?.taxSplit as { exempt?: number })?.exempt} />} />
          <Card title={t('accounting.report.cashFlow')} value={<Money value={(reportsQ.data?.cashFlow as { net?: number })?.net} />} />
          <div className="md:col-span-2">
            <h3 className="mb-2 text-sm font-semibold">{t('accounting.report.trialBalance')}</h3>
            <ResourceTable
              rows={
                (Array.isArray(reportsQ.data?.tb)
                  ? reportsQ.data?.tb
                  : ((reportsQ.data?.tb as { rows?: Record<string, unknown>[] })?.rows ?? [])) as Record<string, unknown>[]
              }
              columns={[
                { key: 'code', label: t('accounting.col.code') },
                { key: 'name', label: t('accounting.col.name') },
                { key: 'debit', label: t('accounting.col.debit') },
                { key: 'credit', label: t('accounting.col.credit') },
                { key: 'balance', label: t('accounting.col.balance') },
              ]}
            />
          </div>
        </div>
      ) : null}

      {section === 'tools' ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() =>
              void apiFetch<{ url: string }>('accounting/backup', { method: 'POST' })
                .then((r) => {
                  toast.success(t('common.saved'))
                  if (r.url) window.open(r.url, '_blank')
                })
                .catch((e: Error) => toastApiError(t, e))
            }
          >
            {t('accounting.backup')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              void apiFetch<{ csv: string; filename: string }>('accounting/export/csv?resource=invoices')
                .then((r) => {
                  const blob = new Blob([r.csv], { type: 'text/csv;charset=utf-8' })
                  const a = document.createElement('a')
                  a.href = URL.createObjectURL(blob)
                  a.download = r.filename
                  a.click()
                })
                .catch((e: Error) => toastApiError(t, e))
            }
          >
            {t('accounting.exportCsv')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              void apiFetch('accounting/calculator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ op: 'percent', a: 1000000, b: 10 }),
              })
                .then((r) => toast.success(String((r as { result?: number }).result ?? '')))
                .catch((e: Error) => toastApiError(t, e))
            }
          >
            {t('accounting.calculator')}
          </Button>
        </div>
      ) : null}
    </PageShell>
  )
}

function Card({ title, value }: { title: string; value: string | number | JSX.Element }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="text-muted-foreground text-xs">{title}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  )
}
