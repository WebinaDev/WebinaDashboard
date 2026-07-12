# License verification

Standard **domain-based** licensing. No per-site HMAC on outbound CRM calls. Install the plugin and it works.

## Lifecycle

1. Admin registers the customer domain in WebinoCRM with status **`active`** (domain is the license; no activation code).
2. Customer installs WebinoDashboard on their site — no wp-admin license step.
3. On plugin activation, bootstrap (TTL default 5 min), and license gate, the plugin calls CRM `POST /wp-json/webinocrm/v1/license/check` with `{"domain":"example.com"}` from `home_url()`.
4. If CRM returns `active`, the dashboard unlocks automatically. If `inactive`, the site stays gated until CRM activates the domain (no customer **Activate** button in the SPA).
5. CRM webhooks on license create (active) and status changes trigger `remote_license_check` on the site. `wp-cron` refreshes every 12 hours.

## Request format

```json
{ "domain": "example.com" }
```

Only `domain` is required. The Dashboard plugin fills it from `home_url()` automatically.

## CRM responses

| Status | Meaning |
|--------|---------|
| `valid` / `active` | Licensed |
| `inactive` | Domain registered, not activated yet |
| `expired` | Past expiry date |
| `cancelled` | Revoked |
| `not_found` | Domain not in CRM — contact support |

## Security

- `/check` is a lightweight public lookup by domain (rate-limited). Legacy mirror routes under `webino-dashboard/v1/webinocrm/v1/license/*` return `Deprecation: true` and link to CRM; primary path is outbound check + `wp_webino_dashboard_license`.
- CRM → site webhook (`maneli_license_webhook`): **domain required**; on production hosts a shared secret is **required** via `WEBINO_DASHBOARD_LICENSE_WEBHOOK_SECRET` and header `X-Webino-Webhook-Secret` (CRM: `WEBINOCRM_LICENSE_WEBHOOK_SECRET`). Dev/staging hosts (localhost, `.local`, `.test`, `WP_DEBUG`) may omit the secret unless configured.
- Filter `webino_dashboard_allow_open_webhook` — opt-in to allow webhooks without secret on production (default `false`).
- Copying the plugin to another host does not grant a license until that domain is added in CRM.

## Transport (Dashboard → CRM)

- HTTPS to `https://webina.dev` by default; optional HTTP via filter `webino_dashboard_license_allow_http_fallback`.
- Sync UI timeouts: connect 2s, request 6s, no retry, 8s wall clock cap. Cron may retry once.
- If CRM is unreachable and a good license was stored locally, UI shows last-known status with `warning: crm_unreachable`.

## Same DirectAdmin server (auto)

When the customer site and CRM resolve to the **same public IP**, the public HTTPS request from PHP can hairpin-NAT and time out. The plugin auto-detects this and tries:

- `https://<SERVER_ADDR>/wp-json/webinocrm/v1/license/check` with header `Host: webina.dev` and `sslverify: false`

`SERVER_ADDR` is the local NIC IP Apache bound the vhost to — connecting to it stays inside the host (no NAT). If that fails, it falls back to public HTTPS.

### Rollback / configuration

- `webino_dashboard_license_disable_local_bypass` — disable the bypass (public HTTPS only)
- `webino_dashboard_license_server_urls` — override CRM base URL(s)

### SSH check on same-server hosts

```bash
SADDR=$(hostname -I | awk '{print $1}')
curl -vk --max-time 5 -H "Host: webina.dev" \
  https://${SADDR}/wp-json/webinocrm/v1/license/check \
  -H 'Content-Type: application/json' -d '{"domain":"parisma.ir"}'
```

## Manual curl

```bash
DOMAIN=example.com
curl -sS -X POST "https://webina.dev/wp-json/webinocrm/v1/license/check" \
  -H 'Content-Type: application/json' \
  -d "{\"domain\":\"${DOMAIN}\"}"
```

Or:

```bash
WEBINO_LICENSE_DOMAIN=example.com ./scripts/test-license.sh check
```

## Local checks

```bash
php -l includes/class-webino-dashboard-license.php
php -l ../webinocrm/includes/class-license-api.php
cd client && npm run lint && npm run build
```

## CRM performance

License REST uses fast-path bootstrap (skips full WebinoCRM stack). Check cache TTL default 300s (`webinocrm_license_cache_ttl` filter).
