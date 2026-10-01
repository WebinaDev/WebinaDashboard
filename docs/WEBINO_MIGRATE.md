# WordPress → Webino import contract

Schema name: `webino.wordpress.import.v1`  
Schema version: `1`  
Producer: Webino Dashboard plugin (`includes/migrate/`)  
Consumer: WebinoDashboard tenant ingest (for example `https://parisma.webinaagency.ir`)

The WordPress side **pushes** batches through the WebinoDashboard job API documented in that repo’s `docs/wordpress-import.md`. Webino applies rows with `POST …/jobs/{id}/run`. Remote image bytes are fetched by Webino from public `url` fields (or from `data_base64` when present).

## Authentication

Every request except a dry run:

- `Authorization: Bearer <token>` — Sanctum personal access token with ability `wordpress-import` (issued on Webino at `/dashboard/import/wordpress`)
- `Accept: application/json`
- `Content-Type: application/json; charset=utf-8`
- `X-Webino-Import-Schema: webino.wordpress.import.v1`
- `X-Webino-Idempotency-Key: <job>:<entity>:<cursor>:<hash>`

The token is stored in the `webino_dashboard_migrate_settings` option as `v1:` + base64(IV + AES-256-CBC ciphertext). The key is `SHA-256(AUTH_KEY + "|" + SECURE_AUTH_KEY + "|webino-migrate-v1")`. The plaintext token is not returned by REST and is stripped from migration log lines.

`409 Conflict` on a batch is treated as success. `429` keeps the cursor and waits for `Retry-After` (1–300 seconds). Other `4xx` fail the job. Network errors and `5xx` retry the same cursor up to 3 times with exponential backoff. `Resume` continues from the stored cursors.

## Endpoints (aligned with WebinoDashboard)

Base URL is the tenant origin saved in the screen (HTTPS only). Paths are configurable; defaults match `docs/wordpress-import.md` on WebinoDashboard:

| Key | Method | Path | Purpose |
| --- | --- | --- | --- |
| ping | POST | `/api/v1/import/wordpress/ping` | Auth check (`{ "ok": true }`) |
| ingest | POST | `/api/v1/import/wordpress/ingest` | Find/create job for `source_url`, upsert ≤50 items |
| run | POST | `/api/v1/import/wordpress/jobs/{id}/run` | Apply pending records (default limit 25, max 100) |
| complete | POST | `/api/v1/import/wordpress/jobs/{id}/run` | Final drain of pending rows (same as run) |

Related operator routes on Webino (dashboard session, not required by the plugin): `probe`, `start`, `jobs`, `batches`, `upload`, `pause`, `resume`, `retry`, `tokens`.

Entity export order on WordPress: categories → media → products → customers → orders → pages → posts → menus.  
Webino applies queued records in: media, categories, tags, customers, products, pages, posts, orders, menus, stats.

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

Any HTTP 2xx with `"ok": true` (or missing `ok`) is success.

## Ingest body

The plugin adapts each exporter batch into one or more ingest calls:

```json
{
  "source_url": "https://parisma.ir",
  "resource": "products",
  "items": [ { "external_id": "501", "name": "…", "…": "…" } ],
  "download_media": true,
  "dry_run": false
}
```

`resource` values: `products`, `categories`, `tags`, `customers`, `orders`, `pages`, `posts`, `media`, `menus` (plus Webino aliases such as `woo_products`, `users`, `attachments`).

WordPress `source_id` fields are mapped to Webino `external_id`. Category taxonomies `product_tag` / `post_tag` become resource `tags`; other taxonomies become `categories`. Product nested categories/tags become `category_external_ids` / `tag_external_ids`. Order totals are flattened; `customer_source_id` / `product_source_id` become `*_external_id`.

Batch size defaults to 20 (clamped 1–50 to match Webino’s ingest limit).

Successful ingest responses include `data.job.id`. The plugin stores that as `webino_job_id` and calls `POST /api/v1/import/wordpress/jobs/{id}/run` after each accepted batch, then again during the complete phase until Webino reports no pending rows.

## Payload shapes

Exporter row shapes (before adaptation) remain documented historically below for debugging. After adaptation, items must satisfy Webino’s ingest examples in `docs/wordpress-import.md` (`external_id` required on every row).

### Categories (exporter)

Taxonomies: `product_cat`, `product_tag`, `category`, `post_tag`, plus brand taxonomies when present.

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

### Media / products / customers / orders / pages / posts / menus

See the exporter classes under `includes/migrate/class-webino-dashboard-migrate-exporters.php` and the Webino sample at `backend/tests/Fixtures/wordpress/parisma-sample.json`.

## Parisma.ir → parisma.webinaagency.ir

1. On Webino (`https://parisma.webinaagency.ir`): open `/dashboard/import/wordpress`, set source `https://parisma.ir`, currency/multiplier, optional CDN hosts, leave publish off for the first pass, **Issue token**.
2. On WordPress (`https://parisma.ir`): Dashboard → Tools → Migrate to Webino (`/dashboard/tools/migrate`). Paste Webino site URL + token. Optionally enable dry run once.
3. Test connection, select entities, Start. The plugin ticks via admin UI / cron: ingest batches → run.
4. On Webino, watch the job until `completed`. Review hidden products and drafts, then enable publish and re-run (or use **Continue until finished** / `php artisan wordpress-import:run {id}`).
5. Publish header/footer from the builder after checking merged menus. Confirm sales reports for historical order months.

## Local checks

```bash
php scripts/test-migrate-webino.php
```

Rebuild the React screen so `/dashboard/tools/migrate` ships:

```bash
npm run build:dashboard
```
