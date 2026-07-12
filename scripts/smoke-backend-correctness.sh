#!/usr/bin/env bash
# Static smoke: Phase C backend correctness (no live WordPress required).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INC="$ROOT/includes"
REST="$INC/class-webino-dashboard-rest.php"
CRUD="$INC/class-webino-dashboard-rest-crud.php"
BOTS="$INC/bots/class-webino-dashboard-rest-bots.php"
ASSETS="$INC/class-webino-dashboard-assets.php"
DOCS="$INC/class-webino-dashboard-order-documents.php"
AGG="$INC/class-webino-dashboard-order-aggregates.php"

echo "== Backend correctness smoke =="

grep -q 'comment_query_args_for_status' "$CRUD" \
  || { echo "FAIL: comment_query_args_for_status helper missing" >&2; exit 1; }
echo "OK: comment status helper"

if grep -q "'status' => 'all'" "$CRUD" "$REST"; then
  echo "FAIL: get_comments must not use status=all" >&2
  exit 1
fi
echo "OK: no status=all in comment queries"

grep -q 'bot_ui_ready' "$REST" \
  || { echo "FAIL: bot_ui_ready missing in REST" >&2; exit 1; }
grep -q 'Webino_Dashboard_REST::bot_ui_ready' "$ASSETS" \
  || { echo "FAIL: assets.php must use bot_ui_ready" >&2; exit 1; }
echo "OK: bot flags aligned"

test -f "$AGG" \
  || { echo "FAIL: order-aggregates class missing" >&2; exit 1; }
grep -q 'sum_orders_in_range' "$AGG" \
  || { echo "FAIL: sum_orders_in_range missing" >&2; exit 1; }
grep -q 'Webino_Dashboard_Order_Aggregates::sum_orders_in_range' "$REST" \
  || { echo "FAIL: analytics_summary must use order aggregates" >&2; exit 1; }
grep -q 'Webino_Dashboard_Order_Aggregates::sum_orders_in_range' "$CRUD" \
  || { echo "FAIL: reports_sales must use order aggregates" >&2; exit 1; }
echo "OK: paginated order aggregates"

grep -q "'number'     => 1000" "$CRUD" \
  || { echo "FAIL: get_terms number cap missing" >&2; exit 1; }
echo "OK: terms list capped"

grep -q 'get_addresses' "$CRUD" \
  && grep -A25 'function user_address_set_default' "$CRUD" | grep -q 'owned' \
  || { echo "FAIL: address ownership check missing" >&2; exit 1; }
echo "OK: address ownership on set-default"

grep -q 'Could not update comment status' "$CRUD" \
  || { echo "FAIL: comment status error handling missing" >&2; exit 1; }
echo "OK: comment status transition errors"

grep -q 'require_bot_ctx' "$BOTS" \
  || { echo "FAIL: require_bot_ctx missing" >&2; exit 1; }
if grep -A5 'function users_import' "$BOTS" | grep -q "resolve( \$which )\\['"; then
  echo "FAIL: users_import must not dereference resolve without guard" >&2
  exit 1
fi
echo "OK: bot ctx guards"

grep -q 'get_subtotal' "$DOCS" \
  && grep -q 'get_subtotal' "$DOCS" \
  || true
if ! grep -q 'get_subtotal() / $qty' "$DOCS"; then
  echo "FAIL: receipt unit price must use get_subtotal" >&2
  exit 1
fi
echo "OK: receipt unit price uses subtotal"

grep -q 'module_node_requires_wfcp' "$REST" \
  || { echo "FAIL: module_node_requires_wfcp helper missing" >&2; exit 1; }
grep -q "requires_wfcp-module" "$REST" \
  || { echo "FAIL: REST must strip requires_wfcp-module nodes" >&2; exit 1; }
echo "OK: WFCP sidebar key requires_wfcp-module supported"

grep -q 'wp_insert_post( $new_post, true )' "$CRUD" \
  || { echo "FAIL: product duplicate wp_insert_post error check" >&2; exit 1; }
grep -q 'wp_update_post(.*true' "$CRUD" 2>/dev/null || grep -q 'wp_update_post( $args, true )' "$CRUD" \
  || { echo "FAIL: apply_page_meta wp_update_post error check" >&2; exit 1; }
echo "OK: insert/update error checks"

echo "== smoke PASSED =="
