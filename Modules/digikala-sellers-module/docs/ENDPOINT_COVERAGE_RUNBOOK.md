# Endpoint Coverage Runbook

## What it provides

- Endpoint-level status (`implemented`, `queued`, `pending`)
- Trace chain: `endpoint -> sources -> job_types -> dispatchers`
- Parser telemetry (`parse_duration_ms`, scanned files, parse errors, assertions)

## Cache and refresh

- Registry cache key is versioned by PHP file mtimes + schema version.
- Auto-refresh happens when tracked files change.
- Manual refresh:
  - Call `GET /webino-dashboard/v1/digikala/coverage/endpoints?refresh=true`

## Common operations

- Filter by status:
  - `?status=implemented`
- Filter by job type:
  - `?job_type=orders_pull`
- Filter by dispatcher:
  - `?dispatcher=Digikala_Order_Sync`
- Hide pending:
  - `?include_pending=false`

## Troubleshooting

- `partial=true` in response:
  - Check `meta.parse_errors[]` and review recent code changes.
- Empty `job_types` with populated `sources`:
  - Dispatcher parser could not map handler signatures. Verify `Digikala_Jobs::dispatch` switch/case format.
- Mismatch with OpenAPI:
  - Endpoint remains `pending` if not found in code call-sites.
  - Endpoint becomes `queued` with low confidence if found in code without dispatcher mapping.

## SLO guidance

- `parse_duration_ms` target: under 1500ms for normal installations.
- `partial=true` should be rare and investigated.
- Unresolved endpoint ratio (`pending / total`) should trend down release-over-release.
