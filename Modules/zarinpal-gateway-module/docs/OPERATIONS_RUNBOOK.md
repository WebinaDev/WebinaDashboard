# Zarinpal Operations Runbook

## Core checks
- Settings endpoint: `GET /wp-json/webino-dashboard/v1/zarinpal/settings`
- Status endpoint: `GET /wp-json/webino-dashboard/v1/zarinpal/status`
- Coverage endpoint: `GET /wp-json/webino-dashboard/v1/zarinpal/coverage/endpoints`

## Manual operations
- Queue reconcile: `POST /wp-json/webino-dashboard/v1/zarinpal/reconcile`
- Verify cron hook exists: `webino_zarinpal_process_jobs`

## Troubleshooting
- Callback failures: inspect Woo order notes and `_zarinpal_authority` meta.
- Verification failures: inspect `Status` + `Authority` query args and API connectivity.
- Refund failures: ensure `_zarinpal_ref_id` is present in order meta.
