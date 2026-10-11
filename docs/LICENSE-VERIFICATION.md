# License verification

Standard **domain + product** licensing against **WebinoERP** Edge. No per-site HMAC required on outbound calls (optional shared deploy secret). Install the plugin and it works.

## Lifecycle

1. Admin registers the customer domain in WebinoERP (`core_licenses`) with status **`active`** and product **`webinodashboard`** (domain is the license; no activation code).
2. Customer installs WebinoDashboard on their site — no wp-admin license step.
3. On plugin activation (one initial check) and License page “check now”, the plugin calls ERP `POST /api/webinocrm/v1/license/check` with `{"domain":"example.com","product":"webinodashboard","ts":...}` from `home_url()`.
4. If ERP returns `active` / `demo`, the dashboard unlocks. If `invalid` / inactive, the site stays gated until ERP activates the domain.
5. ERP → site webhook (`maneli_license_webhook`) triggers `remote_license_check` on the site. There is **no** recurring 12h cron poll (initial + on-demand only).

## Request format

```json
{ "domain": "example.com", "product": "webinodashboard", "ts": 1710000000 }
```

`domain` is filled from `home_url()` automatically. Optional `signature` (HMAC-SHA256 of `domain|{product}|ts`) when `WEBINOCRM_LICENSE_HMAC_SECRET` / filter `webino_dashboard_license_hmac_secret` is set on both sides.

## ERP responses

| Status | Meaning |
|--------|---------|
| `valid` / `active` | Licensed |
| `demo` | Demo entitlement |
| `inactive` | Domain registered, not activated yet |
| `expired` | Past expiry date |
| `cancelled` | Revoked |
| `invalid` / `not_found` | Domain not licensed — contact support |

Envelope: `{ "data": { "status", "active", "demo", "expiry_date", "entitlements", ... } }`.

## Security

- `/license/check` is a lightweight public lookup by domain (+ product), rate-limited. Legacy mirror routes under `webino-dashboard/v1/webinocrm/v1/license/*` return `Deprecation: true` and link to ERP Edge; primary path is outbound check + `wp_webino_dashboard_license`.
- ERP → site webhook (`maneli_license_webhook`): **domain required**; on production hosts a shared secret is **required** via `WEBINO_DASHBOARD_LICENSE_WEBHOOK_SECRET` and header `X-Webino-Webhook-Secret` (ERP: `WEBINOCRM_LICENSE_WEBHOOK_SECRET`). Dev/staging hosts (localhost, `.local`, `.test`, `WP_DEBUG`) may omit the secret unless configured.
- Filter `webino_dashboard_allow_open_webhook` — opt-in to allow webhooks without secret on production (default `false`).
- Copying the plugin to another host does not grant a license until that domain is added in ERP.
- ERP treats `webina.dev` ↔ `webinaagency.ir` as one license host family for subdomain matching.

## Transport (Dashboard → ERP)

- HTTPS to `https://webinaagency.ir` by default (`WEBINO_DASHBOARD_VENDOR_URL`); optional HTTP via filter `webino_dashboard_license_allow_http_fallback`.
- Path prefix: `/api/webinocrm/v1/...` (legacy caller strings `wp-json/webinocrm/v1/...` are rewritten automatically).
- Sync UI timeouts: connect 2s, request 6s, no retry, 8s wall clock cap.
- If ERP is unreachable and a good license was stored locally, UI shows last-known status with `warning: crm_unreachable`.
- Filter `webino_dashboard_license_server_urls` — override ERP base URL(s). License checks always use the public domain (never IP / local NIC).
- Same-VPS Platform tenants may set base to `http://erp-backend:8080` via that filter / provisioner.

## Manual curl

```bash
DOMAIN=example.com
curl -sS -X POST "https://webinaagency.ir/api/webinocrm/v1/license/check" \
  -H 'Content-Type: application/json' \
  -d "{\"domain\":\"${DOMAIN}\",\"product\":\"webinodashboard\",\"ts\":$(date +%s)}"
```

Or:

```bash
WEBINO_LICENSE_DOMAIN=example.com ./scripts/test-license.sh check
```

## Local checks

```bash
php -l includes/class-webino-dashboard-license.php
bash scripts/smoke-license-security.sh
bash scripts/smoke-core-update.sh
cd client && npm run lint && npm run build
```

## Production cutover (CRM → ERP)

1. Confirm domain license exists in ERP (`webinodashboard`, status active) and ModirPayamak tables migrated if SMS is used.
2. Deploy WebinoDashboard ≥ 0.9.57 (vendor host `webinaagency.ir`, Edge `/api/webinocrm/v1`).
3. Hard-refresh dashboard clients; purge CDN/WAF caches for `/dashboard` and REST/admin-ajax license paths.
4. Smoke: License check, SMS account (expect clear unavailable if Edge not ready), Basalam OAuth start, free module install (requires `git` on host), core update check.
5. Staging override via `webino_dashboard_license_server_urls` before locking production to agency.
6. WebinoCRM WordPress is no longer called by site traffic after cutover.
