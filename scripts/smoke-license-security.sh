#!/usr/bin/env bash
# Static smoke: license activate/webhook mitigations (no live WordPress required).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INC="$ROOT/includes"
REST="$INC/class-webino-dashboard-rest.php"
LICENSE="$INC/class-webino-dashboard-license.php"

echo "== License security smoke =="

grep -q 'remote_activate' "$REST" \
  || { echo "FAIL: license_activate must call remote_activate" >&2; exit 1; }
echo "OK: license_activate uses CRM remote_activate"

grep -q 'License key mismatch' "$REST" \
  || { echo "FAIL: license_activate must reject mismatched license_key" >&2; exit 1; }
echo "OK: license_activate binds license_key to domain"

grep -q "normalize_site_domain( \$req_dom ) !== \$domain" "$REST" \
  || { echo "FAIL: license_activate domain gate missing" >&2; exit 1; }
echo "OK: license_activate domain gate"

grep -q "'' === \$req_dom" "$REST" \
  || { echo "FAIL: license_check must require domain" >&2; exit 1; }
echo "OK: license_check requires domain"

grep -q "current_user_can( 'manage_options' )" "$REST" \
  || { echo "FAIL: license_check must redact metadata for non-admins" >&2; exit 1; }
echo "OK: license_check metadata redaction"

grep -q 'is_production_host' "$LICENSE" \
  || { echo "FAIL: production host check missing" >&2; exit 1; }
echo "OK: production host helper present"

grep -q 'webino_dashboard_allow_open_webhook' "$LICENSE" \
  || { echo "FAIL: open webhook filter missing" >&2; exit 1; }
echo "OK: production webhook secret gate"

grep -q "verify_inbound_webhook_secret" "$LICENSE" \
  || { echo "FAIL: webhook secret verifier missing" >&2; exit 1; }
echo "OK: webhook secret verifier present"

grep -q "'' === \$domain" "$LICENSE" \
  || { echo "FAIL: webhook must require domain" >&2; exit 1; }
echo "OK: webhook requires domain"

grep -q 'public_message_for_bootstrap' "$LICENSE" \
  || { echo "FAIL: bootstrap message redaction missing" >&2; exit 1; }
echo "OK: bootstrap diagnostic redaction"

grep -q "rate_limit_ok( 'auth_session'" "$REST" \
  || { echo "FAIL: auth_session rate limit missing" >&2; exit 1; }
echo "OK: auth_session rate limited"

if grep -A5 'function auth_session' "$REST" | grep -q 'user_login'; then
  echo "FAIL: auth_session must not return user metadata" >&2
  exit 1
fi
echo "OK: auth_session minimal payload"

if grep -A20 'function user_reset_password' "$INC/class-webino-dashboard-rest-crud.php" | grep -q "'password'"; then
  echo "FAIL: user_reset_password must not return plaintext password" >&2
  exit 1
fi
echo "OK: reset-password email-only (no plaintext in API)"

grep -q 'get_meta_data' "$INC/class-webino-dashboard-rest-crud.php" \
  || { echo "FAIL: product duplicate must use WC get_meta_data" >&2; exit 1; }
echo "OK: product duplicate WC meta path"

grep -q 'safe_extract' "$INC/class-webino-dashboard-zip.php" \
  || { echo "FAIL: Zip Slip guard missing" >&2; exit 1; }
echo "OK: safe_zip_extract helper"

grep -q 'log_tail' "$INC/class-webino-dashboard-rest-build-pipeline.php" \
  || { echo "FAIL: build pipeline must expose log_tail not full log" >&2; exit 1; }
echo "OK: build pipeline log_tail"

if grep -q 'backup_path' "$INC/class-webino-dashboard-core-updater.php"; then
  echo "FAIL: core updater must not return backup_path in REST response" >&2
  exit 1
fi
echo "OK: core updater omits backup_path"

test -f "$ROOT/docs/LICENSE-VERIFICATION.md" \
  || { echo "FAIL: LICENSE-VERIFICATION.md missing" >&2; exit 1; }
echo "OK: LICENSE-VERIFICATION.md present"

echo "== smoke PASSED =="
