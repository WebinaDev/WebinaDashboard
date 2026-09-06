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

From `WebinoDashboard/`:

```bash
bash scripts/smoke-modules-structure.sh
bash scripts/smoke-module-routes.sh
bash scripts/smoke-gateway-vendor.sh
php scripts/test-incomplete-module-package.php
php scripts/test-bootstrap-guard.php
```
