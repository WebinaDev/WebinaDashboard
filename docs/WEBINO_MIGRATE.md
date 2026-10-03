# WordPress → Webino import contract

Schema name: `webino.wordpress.import.v1`  
Schema version: `1`  
Plugin: Webino Dashboard `0.9.41` (`includes/migrate/`)  
Consumer: WebinoDashboard tenant, for example `https://parisma.webinaagency.ir`

The WordPress plugin pushes batches. It does not upload file bodies. Webino downloads public image URLs itself. Destination site URL must be HTTPS, with no userinfo and no private or link-local host.

`publish_content` is always `false`. Content stays draft on Webino until an operator publishes it.

## Full and selective

The migrate screen (wp-admin and the dashboard tools page) has two modes:

- **Full** turns every resource checkbox on.
- **Selective** sends only the checked resources.

A saved settings row that has an entity checklist and no `mode` is treated as selective, so an older partial save is not promoted to a full cutover. New installs default to full.

The plugin only POSTs a resource when the tenant ping advertises it. If `resources` is missing or empty, the fallback is the accepted v1 set below. An ingest `422` whose message contains `Unknown import resource` marks that entity `skipped_remote` and continues. Resume re-pings and retries skipped entities after Webino adds the importer. Dry run builds every selected entity locally and does not call the tenant.

## Authentication

Every live request:

- `Authorization: Bearer <token>`
- `Accept: application/json`
- `Content-Type: application/json; charset=utf-8`
- `X-Webino-Import-Schema: webino.wordpress.import.v1`
- `X-Webino-Idempotency-Key: <job>:<entity>:<cursor>:<hash>`

The token is stored in `webino_dashboard_migrate_settings` as `v1:` + base64(IV + AES-256-CBC). The key is `SHA-256(AUTH_KEY + "|" + SECURE_AUTH_KEY + "|webino-migrate-v1")`. REST never returns the plaintext. Log lines redact `Bearer …`, `token=…`, and the known secret.

`409 Conflict` counts as success. `429` keeps the cursor and waits for `Retry-After` (1–300 seconds). Other `4xx` fail the job, except the unknown-resource case above. Network errors and `5xx` retry the same cursor up to 3 times with exponential backoff. WordPress cron keeps a running job moving if the browser is closed.

Customer password hashes are never exported. Staff rows are invite payloads (`invite: true`, `password_exported: false`) and are not sent as customers. License keys, consumer secrets, payment credentials, and similar fields are stripped before settings, products, and review-queue rows leave the site.

## Endpoints

These are the only paths this plugin calls. They match the existing Webino importer. There is no per-entity URL and no `/complete`.

| Key | Method | Path |
| --- | --- | --- |
| ping | POST | `/api/v1/import/wordpress/ping` |
| ingest | POST | `/api/v1/import/wordpress/ingest` |
| run | POST | `/api/v1/import/wordpress/jobs/{id}/run` |

`{id}` is the remote job id from `data.job.id` on the first successful ingest. Each tick: one ingest batch (max 50 items), then `run` with `{ "limit": <count> }` when a remote job id exists. After the last entity, `run` is repeated until the remote status is `completed` or `completed_with_errors`, or `pending` is `0`, or 40 tries have been used (the local job still completes, with a warning).

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
    "plugin_version": "0.9.41",
    "exported_at": "2026-10-03T09:00:00+00:00"
  }
}
```

HTTP 2xx with `"ok": true` is success. The plugin reads `resources` (the list from `advertised()`).

## Ingest body

Laravel validation keeps `source_url`, `resource`, `items` (max 50), `dry_run`, `currency`, `price_multiplier`, `media_hosts` (max 10), `download_media`, and `publish_content`. Unknown keys are dropped, so `schema` and `schema_version` are informational.

```json
{
  "schema": "webino.wordpress.import.v1",
  "schema_version": 1,
  "source_url": "https://parisma.ir",
  "resource": "pages",
  "items": [],
  "publish_content": false,
  "currency": "IRT",
  "download_media": true
}
```

Every item gets `external_id` from `source_id` when it is missing. Upsert on Webino is the job plus `external_id`.

Local checklist order:

`media` → `media_files` → `categories` → `tags` → `brands` → `customers` → `staff` → `products` → `coupons` → `reviews` → `pages` → `posts` → `elementor_templates` → `orders` → `menus` → `redirects` → `settings` → `stats` → `waiting_list` → `permalinks` → `review_queue`

`media_files` is not a remote resource. It ingests as `media`.

## Resources the current importer already applies

Aliases the plugin understands the same way as Webino: `woo_products` → `products`, `product_categories` → `categories`, `product_tags` → `tags`, `users` → `customers`, `attachments` → `media`, `analytics` → `stats`.

| Resource | What this plugin sends | What the current importer does with it |
| --- | --- | --- |
| `media` | Public JPEG, PNG, GIF, WebP, plus the optional non-image batch | Stores raster images up to 8MB. SVG, PDF, and video can fail per row. |
| `categories` | `product_cat` only | Shop categories. |
| `tags` | `product_tag` only | Product tags. |
| `customers` | Role `customer`, field `name`, no password | Customers. Non-customer roles are not sent here. |
| `products` | See fidelity notes | Simple and variable. Grouped and external stay labeled, but Webino currently coerces them to simple. |
| `pages` | HTML, SEO, Elementor `document` | Stores `document` when it has `sections` and the JSON is at most 750000 bytes. |
| `posts` | HTML, `cover`, SEO, categories, tags, Elementor `document` | Cover image. Only the first blog category is linked. Tags need `external_id`. |
| `orders` | Lines, shipping, coupons, fees, refunds, private notes | Line items become order items. Shipping, discount, and tax are order totals. `note` becomes one private note. The extra line arrays stay on the stored import item for a later importer. |
| `menus` | Nested `children` | Draft header, or footer when a location contains `footer`. |
| `stats` | Daily rows when `wp_*webino_dashboard_analytics*` tables exist | Snapshots on the job summary. If the tables are missing, the plugin warns and Webino can derive stats from imported orders. |

## Resources that need a new Webino importer

Send these on the same `POST /api/v1/import/wordpress/ingest` with `resource` set to the name below. Do not add a new path. Until `ping.resources` includes the name, this plugin will not POST it on a live run.

### `brands`

Same term shape as a category, from `product_brand`, `pwb-brand`, or `yith_product_brand` when that taxonomy exists. Products also carry `brand_external_ids` and a `brands` array. The current product importer does not link brands; a Brand model should.

```json
{
  "source_id": 8,
  "external_id": "8",
  "taxonomy": "product_brand",
  "parent_source_id": 0,
  "name": "لورآل",
  "slug": "loreal",
  "description": "",
  "count": 12,
  "image": null
}
```

### `coupons`

WooCommerce coupon posts. Amounts are decimal strings as stored.

`source_id`, `code`, `description`, `status`, `discount_type`, `amount`, `date_expires`, `individual_use`, `free_shipping`, `exclude_sale_items`, `minimum_amount`, `maximum_amount`, `usage_limit`, `usage_count`, `product_ids`, `excluded_product_ids`, `product_categories`, `email_restrictions`.

### `reviews`

Product comments of type `review`, `comment`, or empty, excluding spam and trash.

`source_id`, `product_source_id`, `author`, `email`, `content`, `rating` (int or null), `status`, `user_source_id`, `created_at`.

### `redirects`

Rank Math table `rank_math_redirections`, Yoast tables `yoast_seo_redirects` / `yoast_redirects`, or the `wpseo_redirect` option.

`source_id`, `source` (`rank_math`, `yoast_table`, `yoast_option`), `from`, `to`, `code` (300–399, default 301), `status`.

### `settings`

One item, `source_id` `store`, `kind` `settings`.

Includes store address, currency, email-from, weight and dimension units, shipping zones (method id, title, enabled, settings with secrets removed), tax rates from `woocommerce_tax_rates`, enabled payment gateways with credentials removed, email id/title/enabled/subject/heading, and these options when present: `webino_dashboard_pwa`, `webino_dashboard_notify`, `webino_dashboard_brand_style`, `webino_dashboard_swatch_settings`, `webino_dashboard_attribute_groups`, plus module flags. Keys matching password, secret, api key, token, license, hmac, entitlement, merchant, or webhook secret are removed.

### `elementor_templates`

`elementor_library` posts (Theme Builder header, footer, single, archive, kit). Page and post bodies are **not** this resource; they travel on `pages` and `posts` with the same `document`.

`source_id`, `title`, `slug`, `status`, `template_type`, `location`, `conditions`, `page_settings`, `css`, `css_url`, `document`, `content` (rendered HTML), `elementor` (raw decoded `_elementor_data`, page settings, template type, location).

### `staff`

Users in `administrator`, `shop_manager`, `editor`, `author`, `contributor`, or `translator`.

`source_id`, `email`, `name`, `first_name`, `last_name`, `username`, `roles`, `invite` (always true), `password_exported` (always false), `registered_at`. No `user_pass`.

### `waiting_list`

Rows from `yith_wcwtl_waitlists`, `yith_wcwtl_list`, or `yith_wcwtl_users` when those tables exist. The row is passed through after secret stripping, with `source_id`.

### `permalinks`

One row per product, page, and post so old URLs can map to the new slug.

`source_id` (`product|501`), `entity`, `object_source_id`, `slug`, `permalink`, `path`.

### `review_queue`

Staged JSON for wallet (`webino_wallet_ledger`), tickets (`webino_support_tickets`), and returns (`webino_order_returns`) when those tables exist.

`source_id` (`wallet:15`), `kind`, `needs_mapping` (always true), `record`.

## Elementor → builder document

Pages, posts, and theme templates with `_elementor_data` or Elementor CSS get:

- `content`: rendered HTML (`Elementor` frontend when it is loaded, otherwise `the_content`)
- `content_raw` and `content_rendered`
- `document`: Webino builder JSON
- `elementor`: raw elements, `_elementor_page_settings`, CSS, `css_url` (`uploads/elementor/css/post-{id}.css` when that file exists), `template_type`, `location`, conditions
- `seo`: Rank Math (`rank_math_title`, `rank_math_description`, `rank_math_focus_keyword`, robots, canonical) or Yoast (`_yoast_wpseo_*`) when Rank Math is empty
- `cover`: alias of the featured image (posts need this name)

Document shape, matching the Webino builder registry:

```json
{
  "version": 1,
  "source": "elementor",
  "styles": { "css": ".elementor{color:#111}" },
  "sections": [
    {
      "id": "sec_sec1",
      "columns": [
        {
          "id": "col_col1",
          "span": 12,
          "widgets": [
            { "id": "w_w-heading", "type": "heading", "props": { "text": "پاریسما", "tag": "h1" } }
          ]
        }
      ]
    }
  ]
}
```

Mapped widget types: `heading`, `text`, `image`, `button`, `spacer`, `divider`, `video`, `icon`, `html`, `form`, `product-grid`, `product-detail`. Text that contains HTML becomes an `html` widget. Galleries and icon lists become HTML. Unknown widgets become `html` with `data-webino-unmapped="<widgetType>"` and `props.elementor_widget`. Column span comes from `_column_size` or `width.size` (percent → 1–12).

If the encoded document exceeds 700000 bytes, `styles` is omitted and `styles_omitted` is set so the page importer’s 750000 byte cap can still store `sections`. A fixture lives at `scripts/fixtures/elementor-page.json`. The builder may ignore `styles.css` until it reads that key; the CSS is still on the payload, and rendered HTML remains the fallback.

Homepage cutover (for example Elementor page 1927) is a `pages` item with `document.sections`, not an `elementor_templates` item.

## Product and order fidelity

Products are one parent per item. Variations are nested in that same item and are not paginated, because Webino deletes previously imported variations that are absent from the payload. `variations_truncated` is false.

Also sent, because the current importer reads these names:

- `length`, `width`, `height` (and the nested `dimensions` object)
- `sale_starts_at` / `sale_ends_at` and `date_on_sale_from` / `date_on_sale_to`
- `upsell_external_ids`, `cross_sell_external_ids`, `brand_external_ids`, `grouped_external_ids`
- variation `external_id`, sale dates, and `image.url`
- downloads with public URLs, tax class, external URL

Orders keep `line_type` on line, shipping, coupon, fee, and refund rows, plus `shipping_lines`, `coupon_lines`, `fee_lines`, `refunds`, `private_notes`, and a joined `note` string. The current importer persists `note` and the order-level totals. It does not yet copy the extra line arrays into order meta.

Menus are nested with `children` built from `parent_source_id`. A flat list loses hierarchy in the current menu importer.

Blog categories and tags stay on the post (`external_id` on each term). They are not a separate ingest resource. The current post importer links only the first category.

## Checks

`php scripts/test-migrate-webino.php` covers token encryption, HTTPS origin checks, batch clamp 50, selective versus full, ingest payload (`publish_content: false`, `external_id`), unknown-resource skip, product brands and dimensions, order notes, nested menus, staff invites, secret stripping, and the Elementor fixture. It does not boot WordPress.
