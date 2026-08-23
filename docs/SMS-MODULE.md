# SMS module (ModirPayamak / IPPanel)

## Architecture

- **webinocrm**: settings per licensed domain, templates, pattern sync, send wallet, WooCommerce notify API.
- **WebinoDashboard**: UI + WooCommerce hooks → CRM REST proxy (`webino-dashboard/v1/modirpayamak/*`).

Technical sends use the CRM **Edge API key** (IPPanel reseller). **Billing** always uses the **per-domain wallet** on CRM, not a shared “main CRM balance” for customer sites.

## Customer wallet vs CRM Edge key

| What | Where |
|------|--------|
| Balance / top-up / per-SMS charge | `webinocrm_modirpayamak_accounts` for licensed `domain` + `ledger` |
| Send API (OTP, orders, panel, newsletter) | `WebinoCRM_ModirPayamak_Manager::customer_send()` → `deduct_for_send($domain)` then Edge `send()` |
| Customer REST (`webinocrm/v1/modirpayamak/*`) | Only `customer_send` — never `admin_send` |
| CRM admin panel test send | `admin_send()` — no domain wallet deduction (CRM operators only) |

Top-up: `/marketing/sms/topup` → Zarinpal → CRM `topup($domain)`.

## Site settings

`/settings/site/sms` — OTP login/register, sender lines, templates with `{code}`.

REST: `GET/POST site/settings/sms` → CRM `modirpayamak/settings/site`.

## Shop settings

`/settings/shop/sms` — admin phones, service/dedicated lines, per-event toggles (customer + admin), separate message bodies, pattern sync.

REST: `GET/POST shop/settings/sms` → CRM settings + templates.

For **stock-low** / **stock-out**, enable the **admin** toggle (customer SMS usually has no phone on stock events).

## Order events (`event_key`)

Catalog is built from `wc_get_order_statuses()` on the site (any custom status is included). Built-in aliases:

| Key | When (dashboard hook) |
|-----|------------------------|
| `pending_on_create` | Checkout processed, status pending |
| `pending_on_status` | Status → pending |
| Standard / custom WC slugs | Status change (`event_for_status`) |
| `post-barcode` | `webino_dashboard_order_post_barcode_saved` |
| `stock-low` | `woocommerce_low_stock` or `webino_dashboard_product_stock_low` |
| `stock-out` | `woocommerce_no_stock` or `webino_dashboard_product_stock_out` |

Realtime path: Woo hook → shutdown queue → non-blocking `crm_post_async` → CRM `orders/notify` → Edge pattern send.

## Stock / warehouse integration

**WooCommerce (automatic):** `woocommerce_low_stock` and `woocommerce_no_stock` in [`class-webino-dashboard-sms-order-hooks.php`](../../Modules/sms-panel-module/includes/class-webino-dashboard-sms-order-hooks.php).

**Warehouse table:** after updating `webino_acc_warehouse_stock`, call:

```php
Webino_Dashboard_Sms_Warehouse_Stock::after_quantity_update( $wc_product_id, $quantity, $reorder_point );
// or
Webino_Dashboard_Sms_Warehouse_Stock::upsert_warehouse_stock_row( $warehouse_id, $product_id, $quantity, $reorder_point );
```

See [`class-webino-dashboard-sms-warehouse-stock.php`](../../Modules/sms-panel-module/includes/class-webino-dashboard-sms-warehouse-stock.php).

PHP bootstrap: [`Modules/sms-panel-module/bootstrap.php`](../../Modules/sms-panel-module/bootstrap.php). React UI: `Modules/sms-panel-module/client/pages/marketing/sms/`.

## Shortcodes

`{order_id}`, `{order_number}`, `{customer_name}`, `{customer_phone}`, `{customer_email}`, `{total}`, `{status}`, `{status_label}`, `{tracking}`, `{barcode}`, `{items}`, `{items_qty}`, `{payment_method}`, `{shipping_method}`, `{transaction_id}`, `{billing_address}`, `{shipping_address}`, `{order_date}`, `{site_name}`, `{site_url}`, `{code}`, `{product_name}`, `{product_url}`, `{qty}`, `{stock_quantity}`, `{low_stock_amount}`.

**Order SMS is pattern-only:** if the IPPanel pattern is not synced for that event/role, the send is skipped (`pattern_missing`) — no webservice fallback.

Event catalog comes from `wc_get_order_statuses()` on the customer site (plus extras: `pending_on_create`, `post-barcode`, `stock-low`, `stock-out`). Custom WC statuses are included automatically.

## Marketing panel

`/marketing/sms/*` — balance, send (webservice/pattern/P2P), reports, phonebook, patterns, newsletter, topup.

## CRM tables

- `webinocrm_modirpayamak_domain_settings`
- `webinocrm_modirpayamak_message_templates`
- `webinocrm_modirpayamak_pattern_registry`
- `webinocrm_modirpayamak_newsletter_subscribers`
