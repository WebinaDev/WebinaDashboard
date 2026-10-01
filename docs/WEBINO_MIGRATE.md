# WordPress → Webino import contract

Schema name: `webino.wordpress.import.v1`  
Schema version: `1`  
Producer: Webino Dashboard plugin (`includes/migrate/`)  
Consumer: WebinoDashboard tenant ingest (for example `https://parisma.webinaagency.ir`)

The WordPress side pushes batches. Webino fetches media bytes from the `url` fields. This plugin does not upload file bodies.

## Authentication

Every request except a dry run:

- `Authorization: Bearer <token>`
- `Accept: application/json`
- `Content-Type: application/json; charset=utf-8`
- `X-Webino-Import-Schema: webino.wordpress.import.v1`
- `X-Webino-Idempotency-Key: <job>:<entity>:<cursor>:<hash>`

The token is stored in the `webino_dashboard_migrate_settings` option as `v1:` + base64(IV + AES-256-CBC ciphertext). The key is `SHA-256(AUTH_KEY + "|" + SECURE_AUTH_KEY + "|webino-migrate-v1")`. The plaintext token is not returned by REST and is stripped from migration log lines (`Bearer …`, `token=…`, and the known secret).

`409 Conflict` on a batch is treated as success (the same idempotency key was already accepted). `429` keeps the cursor and waits for `Retry-After` (1–300 seconds). Other `4xx` fail the job. Network errors and `5xx` retry the same cursor up to 3 times with exponential backoff. `Resume` continues from the stored cursors.

## Endpoints

Base URL is the tenant origin saved in the screen (HTTPS only, no userinfo, no private or link-local hosts). Paths are configurable. Defaults:

| Key | Method | Path |
| --- | --- | --- |
| ping | POST | `/api/v1/import/wordpress/ping` |
| categories | POST | `/api/v1/import/wordpress/categories` |
| media | POST | `/api/v1/import/wordpress/media` |
| products | POST | `/api/v1/import/wordpress/products` |
| customers | POST | `/api/v1/import/wordpress/customers` |
| orders | POST | `/api/v1/import/wordpress/orders` |
| pages | POST | `/api/v1/import/wordpress/pages` |
| posts | POST | `/api/v1/import/wordpress/posts` |
| menus | POST | `/api/v1/import/wordpress/menus` |
| complete | POST | `/api/v1/import/wordpress/complete` |

Entity order: categories → media → products → customers → orders → pages → posts → menus → complete.

Filters: `webino_dashboard_migrate_endpoints`, `webino_dashboard_migrate_entities`, `webino_dashboard_migrate_taxonomies`, `webino_dashboard_migrate_customer_roles`, `webino_dashboard_migrate_item`, `webino_dashboard_migrate_capability`.

## Ping

```json
{
  "schema": "webino.wordpress.import.v1",
  "schema_version": 1,
  "source": {
    "site_url": "https://parisma.ir",
    "name": "پاریسما",
    "locale": "fa_IR",
    "timezone": "Asia/Tehran",
    "wp_version": "6.8",
    "wc_version": "9.8",
    "plugin_version": "0.9.40",
    "exported_at": "2026-10-01T18:00:00+00:00"
  }
}
```

Any HTTP 2xx is success. A JSON body with `"ok": false` is treated as failure. Recommended response: `{ "ok": true }`.

## Batch envelope

Used for every entity except `complete`.

```json
{
  "schema": "webino.wordpress.import.v1",
  "schema_version": 1,
  "job_id": "a1b2c3d4e5f6",
  "entity": "products",
  "source": {},
  "batch": {
    "cursor": "1200",
    "next_cursor": "1240",
    "limit": 20,
    "count": 20,
    "done": false,
    "total": 860
  },
  "items": []
}
```

`cursor` is the last acknowledged position. The next retry of this batch repeats the same cursor and the same idempotency key. `done: true` means this entity has no further rows after `items`. Cursors:

- categories: `taxonomy|term_id` (example `product_cat|40`)
- everything else: decimal source id of the last row considered (`0` / empty at the start)

Upsert key on Webino should be `(source_site_url, entity, source_id)`.

## Categories

Taxonomies: `product_cat`, `product_tag`, `category`, `post_tag`, plus `product_brand` / `pwb-brand` / `yith_product_brand` when they exist.

```json
{
  "taxonomy": "product_cat",
  "source_id": 15,
  "parent_source_id": 4,
  "name": "آرایش",
  "slug": "makeup",
  "description": "",
  "count": 32,
  "image": { "source_id": 90, "url": "https://parisma.ir/wp-content/uploads/cat.jpg", "alt": "" }
}
```

`image` is `null` when there is no public thumbnail.

## Media

Attachment metadata only. `url` and `sizes[].url` are public `http(s)` URLs. Local paths and non-HTTP values are omitted.

```json
{
  "source_id": 90,
  "title": "lipstick",
  "alt": "رژ",
  "caption": "",
  "description": "",
  "mime_type": "image/jpeg",
  "url": "https://parisma.ir/wp-content/uploads/2024/05/lipstick.jpg",
  "file": "2024/05/lipstick.jpg",
  "width": 1200,
  "height": 1200,
  "filesize": 240112,
  "sizes": [
    { "name": "woocommerce_thumbnail", "url": "https://parisma.ir/wp-content/uploads/2024/05/lipstick-300x300.jpg", "width": 300, "height": 300, "mime_type": "image/jpeg" }
  ],
  "created_at": "2024-05-02T08:11:00+00:00"
}
```

## Products

One parent product per item. Variations are nested (cap 200). Prices are decimal strings as stored by WooCommerce. Gallery images are ordered by `position` (`0` is the featured image). Arbitrary post meta is not copied. Download rows keep only public URLs.

```json
{
  "source_id": 501,
  "type": "variable",
  "status": "publish",
  "slug": "matte-lipstick",
  "name": "رژ مات",
  "description": "<p>…</p>",
  "short_description": "",
  "sku": "PRS-501",
  "regular_price": "",
  "sale_price": "",
  "currency": "IRT",
  "manage_stock": false,
  "stock_quantity": null,
  "stock_status": "instock",
  "backorders": "no",
  "weight": "",
  "dimensions": { "length": "", "width": "", "height": "" },
  "tax_status": "taxable",
  "tax_class": "",
  "catalog_visibility": "visible",
  "featured": false,
  "virtual": false,
  "downloadable": false,
  "downloads": [],
  "menu_order": 0,
  "categories": [{ "source_id": 15, "name": "آرایش", "slug": "makeup" }],
  "tags": [],
  "brands": [{ "source_id": 3, "name": "پاریسما", "slug": "parisma" }],
  "attributes": [
    {
      "source_id": 2,
      "name": "رنگ",
      "slug": "pa_color",
      "visible": true,
      "variation": true,
      "options": [{ "source_id": 8, "name": "قرمز", "slug": "red" }]
    }
  ],
  "images": [
    { "source_id": 90, "url": "https://parisma.ir/wp-content/uploads/2024/05/lipstick.jpg", "alt": "", "position": 0 }
  ],
  "variations": [
    {
      "source_id": 502,
      "sku": "PRS-501-RED",
      "status": "publish",
      "regular_price": "450000",
      "sale_price": "399000",
      "manage_stock": true,
      "stock_quantity": 12,
      "stock_status": "instock",
      "weight": "",
      "attributes": { "pa_color": "red" },
      "image": { "source_id": 91, "url": "https://parisma.ir/wp-content/uploads/2024/05/lipstick-red.jpg", "alt": "" },
      "description": ""
    }
  ],
  "grouped_children": [],
  "external_url": "",
  "created_at": "2024-05-02T08:00:00+00:00",
  "updated_at": "2026-01-04T10:00:00+00:00",
  "permalink": "https://parisma.ir/product/matte-lipstick/"
}
```

## Customers

WordPress users in the `customer` role (filterable). Password hashes, activation keys, session tokens, and API keys are removed. Guests exist only on orders.

```json
{
  "source_id": 44,
  "email": "customer@example.com",
  "username": "customer44",
  "first_name": "سارا",
  "last_name": "احمدی",
  "display_name": "سارا احمدی",
  "roles": ["customer"],
  "registered_at": "2023-11-01T12:00:00+00:00",
  "phone": "09120000000",
  "billing": {
    "first_name": "سارا",
    "last_name": "احمدی",
    "company": "",
    "address_1": "",
    "address_2": "",
    "city": "تهران",
    "state": "THR",
    "postcode": "",
    "country": "IR",
    "phone": "09120000000",
    "email": "customer@example.com"
  },
  "shipping": {
    "first_name": "",
    "last_name": "",
    "company": "",
    "address_1": "",
    "address_2": "",
    "city": "",
    "state": "",
    "postcode": "",
    "country": ""
  }
}
```

## Orders

HPOS (`wp_wc_orders`) and legacy `shop_order` posts are both read. Trash and checkout-draft orders are skipped. Refunds are nested, not separate top-level rows. Payment tokens and card numbers are not exported. Coupon codes travel on the order; there is no separate coupon entity.

```json
{
  "source_id": 9001,
  "number": "9001",
  "status": "completed",
  "currency": "IRT",
  "created_at": "2025-03-01T09:30:00+00:00",
  "updated_at": "2025-03-02T09:30:00+00:00",
  "customer_source_id": 44,
  "billing": { "first_name": "سارا", "email": "customer@example.com", "phone": "09120000000" },
  "shipping_address": { "city": "تهران", "country": "IR" },
  "totals": { "subtotal": "450000", "discount": "0", "shipping": "50000", "tax": "0", "total": "500000" },
  "payment_method": "cod",
  "payment_method_title": "پرداخت در محل",
  "transaction_id": "",
  "customer_note": "",
  "line_items": [
    {
      "source_id": 1,
      "product_source_id": 501,
      "variation_source_id": 502,
      "name": "رژ مات - قرمز",
      "sku": "PRS-501-RED",
      "quantity": 1,
      "subtotal": "450000",
      "total": "450000",
      "tax": "0"
    }
  ],
  "shipping_lines": [{ "source_id": 2, "method_id": "flat_rate", "method_title": "پست", "total": "50000" }],
  "coupon_lines": [],
  "fee_lines": [],
  "refunds": []
}
```

`customer_source_id` is `0` for guest checkout.

## Pages and posts

```json
{
  "source_id": 12,
  "type": "page",
  "status": "publish",
  "slug": "about",
  "title": "درباره ما",
  "content": "<!-- raw post_content, shortcodes included -->",
  "excerpt": "",
  "parent_source_id": 0,
  "menu_order": 0,
  "author": { "source_id": 1, "display_name": "admin" },
  "featured_image": null,
  "categories": [],
  "tags": [],
  "created_at": "2022-01-01T00:00:00+00:00",
  "updated_at": "2024-01-01T00:00:00+00:00",
  "permalink": "https://parisma.ir/about/"
}
```

Posts fill `categories` (`category`) and `tags` (`post_tag`). Statuses: `publish`, `draft`, `private`, `pending`.

## Menus

```json
{
  "source_id": 7,
  "name": "فهرست اصلی",
  "slug": "main",
  "locations": ["primary"],
  "items": [
    {
      "source_id": 80,
      "parent_source_id": 0,
      "title": "فروشگاه",
      "type": "taxonomy",
      "object": "product_cat",
      "object_source_id": 15,
      "url": "https://parisma.ir/product-category/makeup/",
      "target": "",
      "classes": [],
      "menu_order": 1,
      "attr_title": "",
      "description": ""
    }
  ]
}
```

`type` is the WordPress menu item type (`post_type`, `taxonomy`, `custom`). `object_source_id` points at the page, post, product, or term exported above.

## Complete

Sent once after every selected entity is finished.

```json
{
  "schema": "webino.wordpress.import.v1",
  "schema_version": 1,
  "job_id": "a1b2c3d4e5f6",
  "entity": "complete",
  "source": {},
  "summary": {
    "products": { "exported": 860, "failed": 0 },
    "orders": { "exported": 12040, "failed": 0 }
  }
}
```

Recommended response: `{ "ok": true }`.

## Operator notes (parisma.ir)

1. Open **مهاجرت به وبینو** in wp-admin, or `/dashboard/tools/migrate` after the dashboard client is built.
2. Site URL: `https://parisma.webinaagency.ir`. Paste the tenant import token. Save.
3. Test connection (`POST …/ping`).
4. Leave the checklist on, or turn off entities you do not want. Counts on the screen are estimates.
5. Optional: enable dry run to walk cursors without HTTP.
6. Start. Pause keeps cursors. Resume does not restart from zero. A new start clears the job.
7. If the browser closes, WP-Cron hook `webino_dashboard_migrate_tick` sends one batch per minute until the job is no longer `running`.

Only users with `manage_options` (filter `webino_dashboard_migrate_capability`) can read or change this screen.
