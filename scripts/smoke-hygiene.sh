#!/usr/bin/env bash
# Static smoke: Phase E hygiene (dead code, security polish, facade removal).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INC="$ROOT/includes"
CLIENT="$ROOT/client/src"
PO="$ROOT/languages/webino-dashboard-fa_IR.po"
SIDEBAR="$CLIENT/components/ui/sidebar.tsx"

echo "== Phase E/F hygiene smoke =="

if grep -rq 'Quantity:Quantity' "$INC"; then
  echo "FAIL: CSV typo Quantity:Quantity still present" >&2
  exit 1
fi
echo "OK: no Quantity:Quantity typo"

if grep -rq 'function serialize_note' "$INC"; then
  echo "FAIL: dead serialize_note() still present" >&2
  exit 1
fi
echo "OK: serialize_note removed"

if grep -rq 'function map_order_rest' "$INC"; then
  echo "FAIL: deprecated map_order_rest() still present" >&2
  exit 1
fi
echo "OK: map_order_rest removed"

if grep -q 'function install_error' "$INC/class-webino-dashboard-rest-marketplace.php"; then
  echo "FAIL: install_error() should be removed" >&2
  exit 1
fi
echo "OK: install_error removed"

if grep -q 'text-left' "$SIDEBAR"; then
  echo "FAIL: sidebar cva still uses text-left" >&2
  exit 1
fi
echo "OK: sidebar uses text-start"

if ! grep -rq 'rel="noopener noreferrer"' "$CLIENT"; then
  echo "FAIL: noopener noreferrer links missing" >&2
  exit 1
fi
if grep -rq 'rel="noreferrer"' "$CLIENT"; then
  echo "FAIL: rel=noreferrer without noopener still present" >&2
  exit 1
fi
echo "OK: external links use noopener noreferrer"

grep -q 'LICENSE_MESSAGE_KEYS' "$CLIENT/lib/apiError.ts" \
  || { echo "FAIL: LICENSE_MESSAGE_KEYS missing" >&2; exit 1; }
echo "OK: LICENSE_MESSAGE_KEYS present"

grep -q "telegram-bot-module" "$INC/class-webino-dashboard-module-registry.php" \
  && grep -A2 'function bots_loader_ready' "$INC/class-webino-dashboard-module-registry.php" | grep -q 'telegram-bot-module' \
  || { echo "FAIL: bots_loader_ready must accept telegram-bot-module" >&2; exit 1; }
echo "OK: bots_loader_ready includes telegram"

grep -q 'woocommerce_required' "$INC/class-webino-dashboard-module-registry.php" \
  || { echo "FAIL: woocommerce_required check missing" >&2; exit 1; }
echo "OK: woocommerce_required in registry"

if [[ -f "$INC/class-webino-dashboard-marketplace-loader.php" ]]; then
  echo "FAIL: deprecated marketplace-loader.php should be removed" >&2
  exit 1
fi
echo "OK: marketplace-loader facade removed"

grep -q 'cache_bootstrap_payload' "$INC/class-webino-dashboard-rest.php" \
  || { echo "FAIL: bootstrap cache not wired" >&2; exit 1; }
echo "OK: bootstrap cache wired"

grep -q 'WEBINO_DASHBOARD_VENDOR_HOST' "$ROOT/webino-dashboard.php" \
  || { echo "FAIL: WEBINO_DASHBOARD_VENDOR_HOST constant missing" >&2; exit 1; }
echo "OK: vendor host constant"

if grep -q 'root.innerHTML' "$CLIENT/lib/bootError.ts"; then
  echo "FAIL: bootError still uses innerHTML" >&2
  exit 1
fi
echo "OK: bootError uses DOM APIs"

if grep -q 'get_total_spent' "$INC/class-webino-dashboard-orders.php"; then
  echo "FAIL: get_customer_history must not use WC_Customer get_total_spent" >&2
  exit 1
fi
grep -q 'wc_get_is_paid_statuses' "$INC/class-webino-dashboard-orders.php" \
  || { echo "FAIL: paid status filter missing in orders.php" >&2; exit 1; }
echo "OK: customer history uses paid statuses only"

grep -q 'sum_orders_in_range' "$INC/class-webino-dashboard-order-reports.php" \
  || { echo "FAIL: order-reports must use sum_orders_in_range when truncated" >&2; exit 1; }
echo "OK: order-reports aggregate on truncate"

grep -q 'detailUrl' "$CLIENT/components/marketplace/ModuleDetailDialog.tsx" \
  && grep -q 'isAllowedRemoteUrl(module.detail_url)' "$CLIENT/components/marketplace/ModuleDetailDialog.tsx" \
  || { echo "FAIL: ModuleDetailDialog must validate detail_url" >&2; exit 1; }
echo "OK: marketplace detail_url validated"

grep -q 'realpath' "$INC/class-webino-dashboard-zip.php" \
  || { echo "FAIL: zip resolve_safe_target must use realpath" >&2; exit 1; }
echo "OK: zip realpath guard"

grep -q 'run_cli' "$INC/class-webino-dashboard-marketplace-install-job.php" \
  || { echo "FAIL: install job run_cli missing" >&2; exit 1; }
grep -q 'internal_token required' "$INC/marketplace-install-worker.php" \
  || grep -q 'internal token required' "$INC/marketplace-install-worker.php" \
  || { echo "FAIL: marketplace worker must require token" >&2; exit 1; }
grep -q 'verify_worker_token' "$INC/class-webino-dashboard-build-pipeline.php" \
  || { echo "FAIL: build pipeline worker token verify missing" >&2; exit 1; }
echo "OK: CLI workers require per-job tokens"

grep -q 'createQueryClient' "$CLIENT/lib/queryClient.ts" \
  || { echo "FAIL: createQueryClient factory missing" >&2; exit 1; }
grep -q 'RuntimeErrorToasts' "$CLIENT/App.tsx" \
  || { echo "FAIL: post-mount rejection toast missing" >&2; exit 1; }
echo "OK: FE-L09/L14 residual hygiene"

grep -q 'DashboardModulePageProps' "$CLIENT/types/dashboard-modules.d.ts" \
  || { echo "FAIL: DashboardModulePageProps type missing" >&2; exit 1; }
echo "OK: shared module page props type"

grep -q 'maybe_sync_if_stale' "$INC/class-webino-dashboard-license.php" \
  || { echo "FAIL: license bootstrap sync missing" >&2; exit 1; }
grep -q "maybe_sync_if_stale( 'bootstrap' )" "$INC/class-webino-dashboard-rest.php" \
  || { echo "FAIL: bootstrap must sync stale license" >&2; exit 1; }
echo "OK: zero-touch license sync wired"

grep -q 'package.webina.dev' "$INC/class-webino-dashboard-remote-url.php" \
  || { echo "FAIL: Gitea icon host not in allowlist default" >&2; exit 1; }
echo "OK: package.webina.dev in download allowlist"

grep -q 'revoke_crm_entitlement' "$INC/class-webino-dashboard-rest-marketplace.php" \
  || { echo "FAIL: CRM revoke on uninstall hook missing" >&2; exit 1; }
echo "OK: IMP-M07 uninstall revoke hook"

grep -q 'assertAllowedModuleEntry' "$CLIENT/lib/moduleRuntime.ts" \
  && grep -q 'normalizeModuleRoutePath' "$CLIENT/lib/moduleRuntime.ts" \
  && grep -q 'resolveBundleRoute' "$CLIENT/lib/moduleRuntime.ts" \
  && grep -q 'stripModulePathSegment' "$CLIENT/lib/moduleRuntime.ts" \
  || { echo "FAIL: moduleRuntime must validate entry URL and tolerate legacy route keys" >&2; exit 1; }
grep -q 'isAllowedRemoteUrl' "$CLIENT/lib/api.ts" \
  || { echo "FAIL: api.ts missing isAllowedRemoteUrl" >&2; exit 1; }
grep -q 'remote_activate' "$INC/class-webino-dashboard-license.php" \
  || { echo "FAIL: license remote_activate missing" >&2; exit 1; }
echo "OK: security regression patterns (module import, remote URL, license)"

grep -q 'AuthGate' "$CLIENT/App.tsx" \
  || { echo "FAIL: AuthGate not used in App.tsx" >&2; exit 1; }
grep -q 'ServiceWorkerRegister' "$CLIENT/components/ServiceWorkerRegister.tsx" \
  || { echo "FAIL: ServiceWorkerRegister component missing" >&2; exit 1; }
echo "OK: FE-L12 AuthGate + FE-M13 SW component"

grep -q 'license_mirror_deprecated_response' "$INC/class-webino-dashboard-rest.php" \
  || { echo "FAIL: license mirror deprecation headers missing" >&2; exit 1; }
echo "OK: NEW-INT-10 mirror deprecation"

grep -q 'home.sms.checking' "$CLIENT/i18n/locales/en.json" \
  && grep -q 'home.sms.checking' "$CLIENT/i18n/locales/fa.json" \
  || { echo "FAIL: home.sms.checking i18n missing" >&2; exit 1; }
grep -q 'smsRefetch' "$CLIENT/components/home/HomeMiniCardsStrip.tsx" \
  || { echo "FAIL: SMS inline refetch UX missing" >&2; exit 1; }
echo "OK: FE-M20 SMS inline fallback"

total=$(grep -c '^msgid "' "$PO" || true)
total=$((total - 1))
trans=$(awk '
/^msgid "/ && $0 != "msgid \"\"" {
  gsub(/^msgid "/, "", $0); gsub(/"$/, "", $0); getline
  if ($0 ~ /^msgstr "/) { gsub(/^msgstr "/, "", $0); gsub(/"$/, "", $0); if ($0 != "") c++ }
}
END { print c+0 }
' "$PO")
pct=$((trans * 100 / total))
if [[ "$pct" -lt 90 ]]; then
  echo "FAIL: fa_IR.po coverage ${pct}% — need ≥90%" >&2
  exit 1
fi
echo "OK: fa_IR.po coverage ${pct}%"

grep -q 'register_minimal_routes' "$ROOT/webino-dashboard.php" \
  || { echo "FAIL: webino-dashboard.php must register minimal routes before bootstrap load" >&2; exit 1; }
grep -q "register_rest_route.*'/health'" "$INC/class-webino-dashboard-bootstrap.php" \
  || { echo "FAIL: bootstrap health REST route missing" >&2; exit 1; }
grep -q 'register_broken_fallback_hooks' "$INC/class-webino-dashboard-bootstrap.php" \
  || { echo "FAIL: broken dashboard fallback hooks missing" >&2; exit 1; }
grep -q 'clear_dashboard_404' "$INC/class-webino-dashboard-rewrite.php" \
  || { echo "FAIL: rewrite must clear virtual route 404" >&2; exit 1; }
echo "OK: 404 deploy hardening (health route + virtual 404 fix)"

echo "== smoke-hygiene PASSED =="
