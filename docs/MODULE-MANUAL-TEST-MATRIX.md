# Module manual test matrix (12 Dashboard modules)

Run on a staging WordPress site with WooCommerce, WebinoDashboard, sibling `Modules/`, and WebinoCRM connected.

## Preconditions

- WordPress 6.1+
- WooCommerce active
- WebinoDashboard active at `/dashboard`
- `Modules/` directory sibling to `WebinoDashboard/`
- Valid marketplace license per paid module
- CRM URL configured for SMS and marketplace

## Per-module checklist

| Module | Install from marketplace | Sidebar appears | Key REST (200) | E2E scenario |
|--------|--------------------------|-----------------|----------------|--------------|
| security-module | Yes (builtin) | Security nav (tools) | `GET /security/overview` | Wizard → firewall live → quick scan → heal preview |
| analytics-module | Yes | Analytics nav | `GET /analytics/overview` | Open overview + visitors panels |
| bale-bot-module | Yes | Bots > Bale | bots REST context | Connect bot, send test broadcast |
| telegram-bot-module | Yes (requires bale) | Bots > Telegram | shared bots REST | Webhook + shop panel |
| sms-panel-module | Yes | Marketing > SMS | `GET /modirpayamak/dashboard` | Send SMS via CRM proxy |
| wfcp-module | Yes | WFCP shop routes | `GET /wfcp/...` | Quick-add product pricing |
| basalam-module | Yes | Basalam settings | `GET /basalam/status` | OAuth + sync smoke |
| digikala-sellers-module | Yes | Digikala settings | `GET /digikala/status` | Product sync job |
| digipay-upg-module | Yes | DigiPay settings | `GET /digipay/status` | OAuth + gateway in checkout |
| zarinpal-gateway-module | Yes | Zarinpal settings | `GET /zarinpal/settings` | Save settings + test payment |
| snapppay-gateway-module | Yes | SnappPay settings | `GET /snapppay/settings` | Vendor loaded + save settings |
| torobpay-gateway-module | Yes | TorobPay settings | `GET /torobpay/settings` | Vendor loaded + save settings |
| torob-products-extractor-module | Yes | Torob extractor | `GET /torob-extractor/settings` | Vendor loaded + feed token |

## Toggle safety

For each installed module:

1. Disable in Dashboard Settings > Modules
2. Confirm `GET /wp-json/webino-dashboard/v1/home-overview` returns 200 (no PHP fatal)
3. Re-enable and confirm sidebar + REST return

## Gateway vendor release note

SnappPay, TorobPay, and Torob Extractor ZIPs published to CRM **must** include licensed files under `vendor/` per each module's `manifest.json` → `vendor.required_paths`. Dev clones without vendor code will show `gateway_source: missing` until release ZIP is built.

## Automated smoke (no WordPress)

From `WebinaDashboard/`:

```bash
bash scripts/smoke-modules-structure.sh
bash scripts/smoke-module-routes.sh
bash scripts/smoke-security-module.sh
bash scripts/smoke-gateway-vendor.sh
php scripts/test-incomplete-module-package.php
php scripts/test-bootstrap-guard.php
```

## Security module (Webino Shield) — v1.0 manual matrix

Run on an Iranian WooCommerce staging site behind CDN (Cloudflare or Arvan) when possible.

| # | Scenario | Steps | Pass criteria |
|---|----------|-------|---------------|
| S1 | First-run wizard | Open `/security/settings`, complete 6 steps, finish | `diagnostics.wizard` false; no admin lockout |
| S2 | Allowlist + unlock | Add admin IP to allowlist; create panic file / unlock token | Dashboard reachable; WAF bypass with disable file |
| S3 | Live firewall | Hit a custom block rule; watch Live Traffic | Event row appears; block page FA/EN with branding |
| S4 | CIDR v4 + v6 | Block `203.0.113.0/24` and an IPv6 CIDR; request from matching IP | Request blocked; non-matching allowed |
| S5 | Checkout skip | Browse `/checkout` and place test order | No WAF block; order completes |
| S6 | Custom rule CRUD | Create path rule, test JSON, toggle, delete | Test matches; rule compiles to runtime JSON |
| S7 | Quick + standard scan | Start scans; open job; wait for resume chunks | Progress advances; findings filter by `scan_id` |
| S8 | Integrity heal | Corrupt a core file in staging; scan; preview/apply heal; rollback | File restored then rolled back |
| S9 | Feeds | Sync feeds from settings | checksums + WPVulnerability + KEV + FireHOL or Spamhaus OK; one failure does not stop others |
| S10 | Virtual patch | With KEV matching an installed plugin, confirm rules exclude `/wp-admin` slug FP | Admin plugin screens load |
| S11 | 2FA TOTP | Settings → generate secret → enable with code | Login requires TOTP; backup codes work |
| S12 | Canary | Create canary path; request it | Incident + notify + auto-block |
| S13 | Tools | whois, quarantine, file-browser, tls-dns, heal-wizard | Specialized UI; tls-dns shows SPF/DMARC/MX if DNS works |
| S14 | Reports | Generate executive + feed_health + compliance_hint | Detail page structured; JSON download works |
| S15 | Overview home | Open dashboard home | Security score/panel present |
| S16 | Module off | Disable security-module | `home-overview` 200; no fatals |
| S17 | Fail-open | Force WAF errors past circuit threshold | Subsequent requests pass (circuit open) |

**Out of scope for 1.0 (document only):** WebAuthn, full OWASP CRS vendoring, commercial feed API keys, Multisite network-wide, 100 req/s load bench.