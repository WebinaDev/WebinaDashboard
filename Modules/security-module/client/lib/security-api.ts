import { apiFetch } from '@/lib/api'

export type SecurityOverview = {
  score: number
  blocks_24h: number
  open_findings: number
  open_incidents?: number
  suggested_actions?: string[]
  last_scan: SecurityScan | null
  waf_mode: string
  layers: Record<string, boolean | string>
}

export type SecurityScan = {
  id: number
  profile: string
  status: string
  progress_pct: number
  current_path: string
  findings_count: number
  started_at: string | null
  finished_at: string | null
  created_at: string
  meta?: string | Record<string, unknown> | null
}

export type SecurityFinding = {
  id: number
  scan_id: number
  severity: string
  status: string
  category: string
  title: string
  path_or_object: string
  evidence?: string | null
  remediation?: string | null
  auto_heal_available: number | boolean
  created_at: string
  updated_at: string
}

export type SecurityFirewallEvent = {
  id: number
  created_at: string
  action: string
  method: string
  path: string
  rule_id: string
  country: string
  ip?: string
}

export type SecurityFirewallStatus = {
  layers: Record<string, boolean | string>
  mode: string
  enabled: boolean
  disabled: boolean
}

export type SecurityBlockEntry = {
  id: number
  type: string
  value_text: string
  reason: string
  source: string
  created_at: string
  expires_at: string | null
}

export type SecurityAllowEntry = {
  id: number
  type: string
  value_text: string
  note: string
  created_at: string
  expires_at: string | null
}

export type SecurityRule = {
  id: number
  rule_id: string
  name: string
  enabled: number | boolean
  priority: number
  conditions: string
  action: string
  learning: number | boolean
  created_at: string
  updated_at: string
}

export type SecurityFeed = {
  feed_id: string
  version?: string
  etag?: string
  last_ok?: string | null
  last_error?: string | null
  last_sync?: string | null
  enabled?: number | boolean
}

export type SecurityReport = {
  id: number
  report_type: string
  title: string
  score: number
  created_at: string
  payload?: unknown
}

/** Structured payload shapes (optional — payloads may be arbitrary). */
export type ReportPayload = {
  title?: string
  score?: number
  summary?: string | string[]
  sections?: Array<{ title: string; items?: unknown[] }>
  [key: string]: unknown
}

export type SecurityAuditEntry = {
  id?: number
  action?: string
  event?: string
  object_id?: string | number
  path?: string
  user_id?: number
  user_login?: string
  created_at?: string
  [key: string]: unknown
}

export type SecuritySettings = Record<string, Record<string, unknown>>

export type SecuritySettingsSchema = {
  version: string
  profiles: string[]
  sections: string[]
}

export type SecurityDiagnostics = {
  layers: Record<string, boolean | string>
  php: string
  wp: string
  module: string
  wizard: boolean
  conflicts: unknown[]
}

export type FindingStatus = 'acknowledged' | 'ignored' | 'false_positive' | 'fixed' | 'healed'

export const SECURITY_TOOLS = [
  'whois',
  'ip-lookup',
  'diagnostics',
  'integrity-diff',
  'quarantine',
  'snapshots',
  'sessions',
  'password-audit',
  'headers-tester',
  'tls-dns',
  'secrets-search',
  'canary',
  'honeypot',
  'import-export',
  'waf-learning',
  'incident',
  'compat',
  'cli-recipes',
  'heal-wizard',
  'file-browser',
] as const

export type SecurityToolId = (typeof SECURITY_TOOLS)[number]

export const REPORT_TYPES = [
  'executive',
  'firewall',
  'vulnerabilities',
  'malware',
  'hardening',
  'compliance_hint',
  'incident',
  'feed_health',
] as const

export type ReportType = (typeof REPORT_TYPES)[number]

export function fetchSecurityOverview() {
  return apiFetch<SecurityOverview>('security/overview')
}

export function fetchSecuritySettings() {
  return apiFetch<SecuritySettings>('security/settings')
}

export function saveSecuritySettings(body: Partial<SecuritySettings>) {
  return apiFetch<SecuritySettings>('security/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export function applySecurityProfile(profile: string) {
  return apiFetch<SecuritySettings>('security/settings/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile }),
  })
}

export function fetchSecuritySettingsSchema() {
  return apiFetch<SecuritySettingsSchema>('security/settings/schema')
}

export function fetchSecurityDiagnostics() {
  return apiFetch<SecurityDiagnostics>('security/diagnostics')
}

export function fetchFirewallLive(params?: { seconds?: number }) {
  const q = new URLSearchParams()
  if (params?.seconds) q.set('seconds', String(params.seconds))
  const qs = q.toString()
  return apiFetch<{ events: SecurityFirewallEvent[] }>(`security/firewall/live${qs ? `?${qs}` : ''}`)
}

export function fetchFirewallStatus() {
  return apiFetch<SecurityFirewallStatus>('security/firewall/status')
}

export function fetchFirewallBlocks() {
  return apiFetch<{ items: SecurityBlockEntry[] }>('security/firewall/blocks')
}

export function addFirewallBlock(body: {
  type: string
  value: string
  reason?: string
  minutes?: number
}) {
  return apiFetch<{ id: number }>('security/firewall/blocks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export function deleteFirewallBlock(id: number) {
  return apiFetch<{ ok: boolean }>(`security/firewall/blocks?id=${id}`, { method: 'DELETE' })
}

export function fetchFirewallAllows() {
  return apiFetch<{ items: SecurityAllowEntry[] }>('security/firewall/allows')
}

export function addFirewallAllow(body: { type: string; value: string; note?: string }) {
  return apiFetch<{ id: number }>('security/firewall/allows', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export function deleteFirewallAllow(id: number) {
  return apiFetch<{ ok: boolean }>(`security/firewall/allows?id=${id}`, { method: 'DELETE' })
}

export function fetchFirewallRules() {
  return apiFetch<{ items: SecurityRule[] }>('security/firewall/rules')
}

export function saveFirewallRule(body: Partial<SecurityRule> & { rule_id?: string }) {
  return apiFetch<{ id: number }>('security/firewall/rules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export function patchFirewallRule(body: Partial<SecurityRule> & { id?: number; rule_id?: string }) {
  return apiFetch<{ id: number }>('security/firewall/rules', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export function deleteFirewallRule(id: number) {
  return apiFetch<{ ok: boolean }>(`security/firewall/rules?id=${id}`, { method: 'DELETE' })
}

export function testFirewallRule(body: { rule?: Record<string, unknown>; request?: Record<string, unknown> }) {
  return apiFetch<Record<string, unknown>>('security/firewall/rules/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export function promoteLearningRule(ruleId: string) {
  return apiFetch<{ ok: boolean }>('security/firewall/learning/promote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rule_id: ruleId }),
  })
}

export function fetchScans() {
  return apiFetch<{ items: SecurityScan[] }>('security/scan')
}

export function startScan(profile: 'quick' | 'standard' | 'deep' | string) {
  return apiFetch<{ id: number }>('security/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile }),
  })
}

export function fetchScan(id: number) {
  return apiFetch<SecurityScan>(`security/scan/${id}`)
}

export function cancelScan(id: number) {
  return apiFetch<{ ok: boolean }>(`security/scan/${id}/cancel`, { method: 'POST' })
}

export function fetchFindings(params?: { status?: string; severity?: string; scan_id?: number }) {
  const q = new URLSearchParams()
  if (params?.status) q.set('status', params.status)
  if (params?.severity) q.set('severity', params.severity)
  if (params?.scan_id != null && params.scan_id > 0) q.set('scan_id', String(params.scan_id))
  const qs = q.toString()
  return apiFetch<{ items: SecurityFinding[] }>(`security/findings${qs ? `?${qs}` : ''}`)
}

export function updateFinding(id: number, status: FindingStatus) {
  return apiFetch<{ ok: boolean }>(`security/findings/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
}

export function healPreview(actions: unknown[]) {
  return apiFetch<Record<string, unknown>>('security/heal/preview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actions }),
  })
}

export function healApply(body: Record<string, unknown>) {
  return apiFetch<Record<string, unknown>>('security/heal/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export function healRollback(snapshotId: number) {
  return apiFetch<Record<string, unknown>>('security/heal/rollback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ snapshot_id: snapshotId }),
  })
}

export function fetchFeeds() {
  return apiFetch<{ feeds: SecurityFeed[] }>('security/feeds')
}

export function syncFeeds() {
  return apiFetch<Record<string, unknown>>('security/feeds/sync', { method: 'POST' })
}

export function fetchSecurityTool(tool: string, params?: Record<string, string>) {
  const q = new URLSearchParams(params ?? {})
  const qs = q.toString()
  return apiFetch<Record<string, unknown>>(`security/tools/${encodeURIComponent(tool)}${qs ? `?${qs}` : ''}`)
}

export function runSecurityTool(tool: string, body: Record<string, unknown> = {}) {
  return apiFetch<Record<string, unknown>>(`security/tools/${encodeURIComponent(tool)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export function fetchReports() {
  return apiFetch<{ items: SecurityReport[] }>('security/reports')
}

export function generateReport(type: ReportType | string) {
  return apiFetch<SecurityReport>('security/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type }),
  })
}

export function fetchReport(id: number) {
  return apiFetch<SecurityReport>(`security/reports/${id}`)
}

/**
 * Trigger a browser download of a report's payload as JSON.
 * Call this in a click handler (not inside useEffect).
 */
export function downloadReportJson(report: SecurityReport): void {
  const content = JSON.stringify(report.payload ?? report, null, 2)
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `webino-report-${report.id}-${report.report_type}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function fetchAuditLog() {
  return apiFetch<{ items: SecurityAuditEntry[] }>('security/audit')
}

export function fetchIncidents() {
  return apiFetch<{ items: Record<string, unknown>[] }>('security/incidents')
}

export type TwoFaStatus = {
  enabled_users: number
  required_roles: string[]
  methods: string[]
  current_user?: { id: number; enabled: boolean }
}

export function fetchTwoFaStatus() {
  return apiFetch<TwoFaStatus>('security/2fa')
}

export function runTwoFaAction(body: { action: 'setup' | 'enable' | 'disable'; code?: string }) {
  return apiFetch<Record<string, unknown>>('security/2fa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
