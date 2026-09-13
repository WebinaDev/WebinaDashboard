# Torob Coverage Matrix (Torob-Sync parity)

Status legend: `implemented`, `partial`, `out_of_scope`.

Reference: [Torob-Sync](https://github.com/torob/Torob-Sync)

## Engine

Dual copies (must stay in sync):

- WebinaConnector: `includes/api/torob/`
- WebinaDashboard: `Modules/wnc-core-module/plugin/includes/api/torob/`

Dashboard UI shell: `Modules/torob-connector-module` → `WncPlatformPanel` (`platform=torob`, `feedPlatform`)

Legacy stub: `Modules/torob-products-extractor-module` — UI redirects to `/settings/shop/torob`; REST aliases WNC settings (no second settings store)

## Torob-Sync capabilities

| Capability | Endpoint / mechanism | Status |
|---|---|---|
| Product API **v3** | `POST /wp-json/torob_api/v3/products` (`api_version: torob_api_v3`) | `implemented` |
| Legacy Woo feed | `POST /wp-json/wcpe/v1/products` (`torob_woocommerce_products_v1`) | `implemented` (compat) |
| JWT auth | `X-Torob-Token` + Ed25519 | `implemented` |
| Product Webhook | Queue → `api.torob.com/update/webhook/v1/` Bearer; `POST …/set-token` | `implemented` |
| Order Tracking | `GET /wp-json/torob/v1/orders` (+ legacy `torob-api/v1/orders`); `torob_clid` cookie | `implemented` |
| Order Status | `GET /wp-json/torob-api/v1/order-status` | `implemented` (official Woo plugin) |
| Action Tracking | `GET /wp-json/torob/v1/actions`; flag `action_tracking_enabled` → 403 when off | `implemented` |
| Per-shop feature flags | order status / orders list / webhook / action tracking | `implemented` |
| TorobPay gateway | — | `out_of_scope` |

## Dashboard UI

- Endpoint URLs (v3, legacy wcpe, orders, actions, set-token, order-status) — `implemented`
- Feature toggles + preview + webhook queue + test-connection — `implemented`
- Coverage doc (this file) — `implemented`

## Notes

- Action tracking defaults **off** until the shop enables it (Torob-Sync shop-generator rule).
- Order/action `status` values are only `completed` | `cancelled`.
- Product v3 `availability` is boolean; prices are int toman; `page_unique` is string.
