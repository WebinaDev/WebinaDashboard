import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { toastApiError } from '@/lib/apiError'
import {
  fetchSecurityTool,
  healApply,
  runSecurityTool,
  SECURITY_TOOLS,
} from '../lib/security-api'
import { SecurityShell } from './SecurityShell'

// ─── Diagnostics panel ───────────────────────────────────────────────────────
function DiagnosticsPanel({ data }: { data: ToolResult }) {
  const { t } = useTranslation()
  const layers = (data.layers as Record<string, unknown>) ?? {}
  const conflicts = (data.conflicts as Array<Record<string, string>>) ?? []

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-3">
        {[
          { label: 'PHP', value: String(data.php ?? '—') },
          { label: 'WordPress', value: String(data.wp ?? '—') },
          { label: t('security.diag.objectCache', { defaultValue: 'Object cache' }), value: data.object_cache ? '✓' : '✗' },
          { label: t('security.diag.cron', { defaultValue: 'Shield cron' }), value: data.cron ? '✓' : '✗' },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-md border px-3 py-2">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-mono text-sm">{value}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">{t('security.diag.layers', { defaultValue: 'Active layers' })}</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(layers).map(([k, v]) => (
            <Badge key={k} variant={v ? 'secondary' : 'outline'} className="capitalize">
              {k}: {String(v)}
            </Badge>
          ))}
        </div>
      </div>

      {conflicts.length > 0 ? (
        <div>
          <p className="mb-2 text-sm font-medium text-amber-600">
            {t('security.diag.conflicts', { defaultValue: 'Plugin conflicts' })}
          </p>
          <ul className="space-y-1">
            {conflicts.map((c, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="capitalize">{c.severity}</Badge>
                <span>{c.plugin}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-emerald-600">{t('security.diag.noConflicts', { defaultValue: 'No plugin conflicts detected.' })}</p>
      )}
    </div>
  )
}

// ─── Snapshots panel ─────────────────────────────────────────────────────────
function SnapshotsPanel({ data }: { data: ToolResult }) {
  const { t } = useTranslation()
  const items = (data.items as Array<Record<string, unknown>>) ?? []

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{t('security.snapshotsEmpty', { defaultValue: 'No snapshots found.' })}</p>
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>{t('security.col.path')}</TableHead>
            <TableHead>{t('security.col.created')}</TableHead>
            <TableHead>{t('security.fileSize')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((row) => (
            <TableRow key={String(row.id ?? row.snapshot_id)}>
              <TableCell>{String(row.id ?? row.snapshot_id ?? '—')}</TableCell>
              <TableCell className="max-w-[280px] truncate font-mono text-xs">
                {String(row.path ?? row.file ?? '—')}
              </TableCell>
              <TableCell className="text-xs">{String(row.created_at ?? '—')}</TableCell>
              <TableCell className="text-xs">{row.size != null ? String(row.size) : '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// ─── Password audit panel ─────────────────────────────────────────────────────
function PasswordAuditPanel({ data }: { data: ToolResult }) {
  const { t } = useTranslation()
  const users = (data.users as Array<Record<string, unknown>>) ?? []
  const checked = data.checked_common_passwords as number ?? 0

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {t('security.passAudit.checked', { defaultValue: 'Common passwords checked: {{count}}', count: checked })}
      </p>
      {users.length === 0 ? (
        <p className="text-sm text-emerald-600">
          {t('security.passAudit.noIssues', { defaultValue: 'All admin/editor accounts look good.' })}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>{t('security.col.login', { defaultValue: 'Login' })}</TableHead>
                <TableHead>{t('security.col.issues', { defaultValue: 'Issues' })}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={String(u.id)}>
                  <TableCell>{String(u.id)}</TableCell>
                  <TableCell className="font-mono text-sm">{String(u.login ?? '—')}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {((u.issues as string[]) ?? []).map((issue) => (
                        <Badge key={issue} variant="destructive" className="text-xs capitalize">
                          {issue.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

// ─── Incident panel ──────────────────────────────────────────────────────────
function IncidentPanel({
  data,
  onRefresh,
  refreshing,
}: {
  data: ToolResult
  onRefresh: () => void
  refreshing: boolean
}) {
  const { t } = useTranslation()
  const incidents = (data.incidents as Array<Record<string, unknown>>) ?? []

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" disabled={refreshing} onClick={onRefresh}>
          {t('security.refresh', { defaultValue: 'Refresh' })}
        </Button>
      </div>
      {incidents.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t('security.incidentNoItems', { defaultValue: 'No incidents recorded.' })}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>{t('security.col.title')}</TableHead>
                <TableHead>{t('security.col.status')}</TableHead>
                <TableHead>{t('security.col.severity', { defaultValue: 'Severity' })}</TableHead>
                <TableHead>{t('security.col.created')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.map((inc) => (
                <TableRow key={String(inc.id)}>
                  <TableCell>{String(inc.id)}</TableCell>
                  <TableCell className="max-w-[220px] truncate">
                    {String(inc.title ?? `Incident #${String(inc.id)}`)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={inc.status === 'open' ? 'destructive' : 'secondary'} className="capitalize text-xs">
                      {String(inc.status ?? '—')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize text-xs">
                      {String(inc.severity ?? '—')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{String(inc.created_at ?? '—')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

// ─── Import / Export panel ────────────────────────────────────────────────────
function ImportExportPanel({
  data,
  onImport,
  importing,
}: {
  data: ToolResult
  onImport: (json: string) => void
  importing: boolean
}) {
  const { t } = useTranslation()
  const [importText, setImportText] = useState('')
  const exportObj = data.export as Record<string, unknown> | null

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'webino-shield-settings.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium">
          {t('security.importExport.exportTitle', { defaultValue: 'Export settings' })}
        </p>
        {exportObj ? (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {Object.keys(exportObj).map((section) => (
                <Badge key={section} variant="outline" className="capitalize">{section}</Badge>
              ))}
            </div>
            <Button size="sm" variant="outline" onClick={handleDownload}>
              {t('security.importExport.download', { defaultValue: 'Download JSON' })}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t('security.toolNoResult')}</p>
        )}
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">
          {t('security.importExport.importTitle', { defaultValue: 'Import settings JSON' })}
        </p>
        <div className="space-y-2">
          <Textarea
            rows={5}
            className="font-mono text-xs"
            placeholder='{"general": {}, "waf": {}}'
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />
          <Button
            size="sm"
            disabled={importing || !importText.trim()}
            onClick={() => onImport(importText)}
          >
            {t('security.importExport.import', { defaultValue: 'Import' })}
          </Button>
        </div>
      </div>
    </div>
  )
}

const TOOL_FIELDS: Record<string, { name: string; labelKey: string; placeholder?: string }[]> = {
  whois: [{ name: 'ip', labelKey: 'security.toolField.ip', placeholder: '203.0.113.1' }],
  'ip-lookup': [{ name: 'ip', labelKey: 'security.toolField.ip' }],
  'integrity-diff': [{ name: 'path', labelKey: 'security.toolField.path', placeholder: 'wp-includes/version.php' }],
  'secrets-search': [{ name: 'path', labelKey: 'security.toolField.path' }],
  'file-browser': [{ name: 'path', labelKey: 'security.toolField.path', placeholder: 'wp-content' }],
}

type ToolResult = Record<string, unknown>

function WhoisPanel({ data }: { data: ToolResult }) {
  const { t } = useTranslation()
  const geo = (data.geo as Record<string, unknown>) || {}
  const events = (data.events as Array<Record<string, unknown>>) || []
  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">{t('security.toolField.ip')}</p>
          <p className="font-mono text-sm">{String(data.ip ?? '—')}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t('security.col.country')}</p>
          <p className="text-sm">
            {String(geo.country ?? geo.country_code ?? '—')}
            {geo.asn ? ` · ASN ${String(geo.asn)}` : ''}
          </p>
        </div>
      </div>
      {events.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('security.col.time')}</TableHead>
                <TableHead>{t('security.col.action')}</TableHead>
                <TableHead>{t('security.col.path')}</TableHead>
                <TableHead>{t('security.col.rule')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((ev) => (
                <TableRow key={String(ev.id)}>
                  <TableCell className="text-xs">{String(ev.created_at ?? '')}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{String(ev.action ?? '')}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate font-mono text-xs">
                    {String(ev.path ?? '')}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{String(ev.rule_id ?? '—')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t('security.noLiveEvents')}</p>
      )}
    </div>
  )
}

function QuarantinePanel({
  data,
  onRestore,
  restoring,
}: {
  data: ToolResult
  onRestore: (id: number) => void
  restoring: boolean
}) {
  const { t } = useTranslation()
  const items = (data.items as Array<Record<string, unknown>>) || []
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{t('security.quarantineEmpty')}</p>
  }
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>{t('security.col.path')}</TableHead>
            <TableHead>{t('security.col.created')}</TableHead>
            <TableHead className="text-right">{t('security.col.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((row) => (
            <TableRow key={String(row.id)}>
              <TableCell>{String(row.id)}</TableCell>
              <TableCell className="max-w-[280px] truncate font-mono text-xs">
                {String(row.path ?? row.original_path ?? '')}
              </TableCell>
              <TableCell className="text-xs">{String(row.created_at ?? '')}</TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={restoring}
                  onClick={() => onRestore(Number(row.id))}
                >
                  {t('security.quarantineRestore')}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function HealWizardPanel({
  data,
  onApply,
  applying,
}: {
  data: ToolResult
  onApply: (token: string, actions: unknown[]) => void
  applying: boolean
}) {
  const { t } = useTranslation()
  const actions = (data.actions as Array<Record<string, unknown>>) || []
  const token = String(data.token ?? '')
  if (actions.length === 0) {
    return <p className="text-sm text-muted-foreground">{t('security.healNoActions')}</p>
  }
  return (
    <div className="space-y-3">
      <ul className="space-y-2 text-sm">
        {actions.map((a, i) => (
          <li key={i} className="rounded-md border p-2">
            <Badge variant="secondary" className="mr-2">
              {String(a.action ?? a.type ?? '')}
            </Badge>
            <span className="font-mono text-xs">{String(a.target ?? '')}</span>
            {a.preview ? <p className="mt-1 text-xs text-muted-foreground">{String(a.preview)}</p> : null}
          </li>
        ))}
      </ul>
      <Button disabled={applying || !token} onClick={() => onApply(token, actions)}>
        {t('security.healApply')}
      </Button>
    </div>
  )
}

function FileBrowserPanel({
  data,
  onNavigate,
}: {
  data: ToolResult
  onNavigate: (path: string) => void
}) {
  const { t } = useTranslation()
  if (data.type === 'file') {
    return (
      <div className="space-y-1 text-sm">
        <p className="font-mono">{String(data.path)}</p>
        <p>
          {t('security.fileSize')}: {String(data.size ?? '—')}
        </p>
        <p className="font-mono text-xs">MD5: {String(data.md5 ?? '—')}</p>
      </div>
    )
  }
  const entries = (data.entries as Array<Record<string, unknown>>) || []
  const base = String(data.path ?? '')
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('security.col.name')}</TableHead>
            <TableHead>{t('security.col.type')}</TableHead>
            <TableHead>{t('security.fileSize')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {base ? (
            <TableRow>
              <TableCell colSpan={3}>
                <Button
                  variant="link"
                  className="h-auto p-0"
                  onClick={() => {
                    const parts = base.split('/').filter(Boolean)
                    parts.pop()
                    onNavigate(parts.join('/'))
                  }}
                >
                  ..
                </Button>
              </TableCell>
            </TableRow>
          ) : null}
          {entries.map((e) => {
            const name = String(e.name)
            const next = base ? `${base}/${name}` : name
            return (
              <TableRow key={name}>
                <TableCell>
                  {e.type === 'dir' ? (
                    <Button variant="link" className="h-auto p-0 font-mono text-xs" onClick={() => onNavigate(next)}>
                      {name}/
                    </Button>
                  ) : (
                    <Button variant="link" className="h-auto p-0 font-mono text-xs" onClick={() => onNavigate(next)}>
                      {name}
                    </Button>
                  )}
                </TableCell>
                <TableCell>{String(e.type)}</TableCell>
                <TableCell>{e.size != null ? String(e.size) : '—'}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export default function SecurityToolPage() {
  const { t } = useTranslation()
  const { tool = '' } = useParams<{ tool: string }>()
  const qc = useQueryClient()
  const known = SECURITY_TOOLS.includes(tool as (typeof SECURITY_TOOLS)[number])

  const [fields, setFields] = useState<Record<string, string>>({})
  const [postJson, setPostJson] = useState('{}')
  const [result, setResult] = useState<ToolResult | null>(null)

  useEffect(() => {
    setFields({})
    setPostJson('{}')
    setResult(null)
  }, [tool])

  const specialized = useMemo(
    () =>
      [
        'whois', 'ip-lookup', 'quarantine', 'heal-wizard', 'file-browser',
        'diagnostics', 'snapshots', 'password-audit', 'incident', 'import-export',
      ].includes(tool),
    [tool],
  )

  // Auto-fetch for tools that return data without user input.
  const autoFetchTools = useMemo(
    () =>
      [
        'quarantine', 'heal-wizard',
        'diagnostics', 'snapshots', 'password-audit', 'incident', 'import-export',
      ].includes(tool),
    [tool],
  )

  const getQ = useQuery({
    queryKey: ['security', 'tool', tool, 'auto'],
    queryFn: () => fetchSecurityTool(tool),
    enabled: known && autoFetchTools,
  })
  useQueryErrorToast(getQ)

  useEffect(() => {
    if (getQ.data && typeof getQ.data === 'object') {
      setResult(getQ.data as ToolResult)
    }
  }, [getQ.data])

  const runGet = useMutation({
    mutationFn: () => fetchSecurityTool(tool, fields),
    onSuccess: (data) => {
      setResult(data as ToolResult)
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const runPost = useMutation({
    mutationFn: async () => {
      let body: Record<string, unknown> = {}
      try {
        body = JSON.parse(postJson) as Record<string, unknown>
      } catch {
        throw new Error(t('security.invalidJson'))
      }
      return runSecurityTool(tool, body)
    },
    onSuccess: (data) => {
      setResult(data as ToolResult)
      toast.success(t('security.toolRunDone'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const restoreQ = useMutation({
    mutationFn: (id: number) => runSecurityTool('quarantine', { restore_id: id }),
    onSuccess: () => {
      toast.success(t('security.quarantineRestored'))
      void qc.invalidateQueries({ queryKey: ['security', 'tool', 'quarantine'] })
      void runGet.mutateAsync()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const healApplyM = useMutation({
    mutationFn: ({ token, actions }: { token: string; actions: unknown[] }) =>
      healApply({ confirmation_token: token, actions }),
    onSuccess: () => {
      toast.success(t('security.healApplied'))
      void qc.invalidateQueries({ queryKey: ['security', 'tool', 'heal-wizard'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const importM = useMutation({
    mutationFn: (importJson: string) => runSecurityTool('import-export', { import: importJson }),
    onSuccess: () => {
      toast.success(t('security.importExport.importDone', { defaultValue: 'Settings imported successfully.' }))
      void qc.invalidateQueries({ queryKey: ['security'] })
      void getQ.refetch()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  if (!known) {
    return (
      <div className="space-y-4">
        <SecurityShell />
        <p className="text-sm text-muted-foreground">{t('security.unknownTool')}</p>
        <Button asChild variant="outline" size="sm">
          <Link to="/security/tools">{t('security.backToTools')}</Link>
        </Button>
      </div>
    )
  }

  const fieldDefs = TOOL_FIELDS[tool] ?? []
  const display = result

  return (
    <div className="space-y-4">
      <SecurityShell />

      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/security/tools">{t('security.backToTools')}</Link>
        </Button>
        <span className="font-mono text-sm text-muted-foreground">{tool}</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t(`security.tools.${tool}.title`, { defaultValue: tool })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t(`security.tools.${tool}.desc`, { defaultValue: t('security.toolDefaultDesc') })}
          </p>

          {fieldDefs.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {fieldDefs.map((f) => (
                <div key={f.name} className="space-y-1">
                  <Label htmlFor={`field-${f.name}`}>{t(f.labelKey)}</Label>
                  <Input
                    id={`field-${f.name}`}
                    value={fields[f.name] ?? ''}
                    placeholder={f.placeholder}
                    onChange={(e) => setFields((prev) => ({ ...prev, [f.name]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button disabled={runGet.isPending} onClick={() => void runGet.mutateAsync()}>
              {t('security.toolRunGet')}
            </Button>
            {!specialized ? (
              <Button variant="secondary" disabled={runPost.isPending} onClick={() => void runPost.mutateAsync()}>
                {t('security.toolRunPost')}
              </Button>
            ) : null}
          </div>

          {!specialized ? (
            <div className="space-y-1">
              <Label htmlFor="tool-post">{t('security.toolPostBody')}</Label>
              <Textarea
                id="tool-post"
                rows={4}
                className="font-mono text-xs"
                value={postJson}
                onChange={(e) => setPostJson(e.target.value)}
              />
            </div>
          ) : null}

          <div>
            <p className="mb-2 text-sm font-medium">{t('security.toolResult')}</p>
            {runGet.isPending || getQ.isPending ? (
              <Skeleton className="h-40 w-full" />
            ) : !display ? (
              <p className="text-sm text-muted-foreground">{t('security.toolNoResult')}</p>
            ) : tool === 'whois' || tool === 'ip-lookup' ? (
              <WhoisPanel data={display} />
            ) : tool === 'quarantine' ? (
              <QuarantinePanel
                data={display}
                restoring={restoreQ.isPending}
                onRestore={(id) => void restoreQ.mutateAsync(id)}
              />
            ) : tool === 'heal-wizard' ? (
              <HealWizardPanel
                data={display}
                applying={healApplyM.isPending}
                onApply={(token, actions) => void healApplyM.mutateAsync({ token, actions })}
              />
            ) : tool === 'file-browser' ? (
              <FileBrowserPanel
                data={display}
                onNavigate={(path) => {
                  setFields({ path })
                  void fetchSecurityTool(tool, { path }).then((data) => setResult(data as ToolResult))
                }}
              />
            ) : tool === 'diagnostics' ? (
              <DiagnosticsPanel data={display} />
            ) : tool === 'snapshots' ? (
              <SnapshotsPanel data={display} />
            ) : tool === 'password-audit' ? (
              <PasswordAuditPanel data={display} />
            ) : tool === 'incident' ? (
              <IncidentPanel
                data={display}
                refreshing={getQ.isFetching}
                onRefresh={() => void getQ.refetch()}
              />
            ) : tool === 'import-export' ? (
              <ImportExportPanel
                data={display}
                importing={importM.isPending}
                onImport={(json) => void importM.mutateAsync(json)}
              />
            ) : (
              <pre className="max-h-96 overflow-auto rounded-md border bg-muted/40 p-3 text-xs">
                {JSON.stringify(display, null, 2)}
              </pre>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
