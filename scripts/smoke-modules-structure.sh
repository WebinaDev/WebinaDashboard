#!/usr/bin/env bash
# Static smoke checks for Modules/ layout (no WordPress runtime required).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODULES="$ROOT/Modules"
FAIL=0

echo "== Modules structure smoke =="

for slug in ai-content-module wfcp-module sms-panel-module bale-bot-module telegram-bot-module analytics-module digipay-upg-module digikala-sellers-module torob-products-extractor-module torobpay-gateway-module snapppay-gateway-module basalam-module zarinpal-gateway-module coffee-profile-module bale-pay-gateway-module card-to-card-gateway-module payment-module wallet-gateway-module; do
  if [[ ! -f "$MODULES/$slug/manifest.json" ]]; then
    echo "FAIL: missing $MODULES/$slug/manifest.json"
    FAIL=1
  else
    echo "OK: manifest $slug"
  fi
  if [[ ! -f "$MODULES/$slug/bootstrap.php" ]]; then
    echo "FAIL: missing $MODULES/$slug/bootstrap.php"
    FAIL=1
  else
    echo "OK: bootstrap $slug"
  fi
done

LEGACY=(
  "$ROOT/includes/wfcp"
  "$ROOT/includes/analytics"
  "$ROOT/includes/class-webino-dashboard-sms.php"
  "$ROOT/includes/class-webino-dashboard-wfcp-loader.php"
)
for path in "${LEGACY[@]}"; do
  if [[ -e "$path" ]]; then
    echo "FAIL: legacy path still exists: $path"
    FAIL=1
  fi
done
echo "OK: no legacy module paths under WebinoDashboard/includes"

if ! grep -q "WEBINO_MODULES_DIR" "$ROOT/webino-dashboard.php"; then
  echo "FAIL: WEBINO_MODULES_DIR not defined in webino-dashboard.php"
  FAIL=1
else
  echo "OK: WEBINO_MODULES_DIR defined"
fi

if grep -qE "class-webino-dashboard-(sms|wfcp|bots-loader|rest-wfcp|rest-analytics)" "$ROOT/webino-dashboard.php"; then
  echo "FAIL: webino-dashboard.php still requires module PHP directly"
  FAIL=1
else
  echo "OK: core bootstrap does not require module files"
fi

if ! grep -q "analytics_ready" "$ROOT/includes/class-webino-dashboard-module-registry.php"; then
  echo "FAIL: Module_Registry missing analytics_ready helper"
  FAIL=1
else
  echo "OK: core module guards (analytics_ready) present"
fi

if ! grep -q "get_active_module_clients" "$ROOT/includes/class-webino-dashboard-module-registry.php"; then
  echo "FAIL: Module_Registry missing get_active_module_clients"
  FAIL=1
else
  echo "OK: dynamic module client bootstrap present"
fi

if grep -q "is_builtin.*mark_installed" "$ROOT/includes/class-webino-dashboard-rest-marketplace.php"; then
  echo "FAIL: marketplace install still bypasses ZIP for builtins"
  FAIL=1
else
  echo "OK: marketplace install always uses ZIP flow"
fi

if ! grep -q 'for dir in includes templates assets Modules languages' "$ROOT/scripts/build-release-zip.sh"; then
  echo "FAIL: release zip must ship Modules/ inside WebinaDashboard"
  FAIL=1
elif grep -q 'mkdir -p "$STAGE/WebinoDashboard" "$STAGE/Modules"' "$ROOT/scripts/build-release-zip.sh"; then
  echo "FAIL: release zip still stages sibling Modules/"
  FAIL=1
else
  echo "OK: release zip ships Modules/ inside WebinaDashboard"
fi

if ! grep -q "WEBINO_DASHBOARD_DIR ) ) . 'Modules/'" "$ROOT/webino-dashboard.php" && ! grep -q "WEBINO_DASHBOARD_DIR ) . 'Modules/'" "$ROOT/webino-dashboard.php"; then
  echo "FAIL: WEBINO_MODULES_DIR must point inside WebinaDashboard"
  FAIL=1
else
  echo "OK: WEBINO_MODULES_DIR is inside the plugin"
fi

if grep -R --include='*.php' -E "Modules/(bale-bot|telegram-bot|wfcp)/" "$MODULES" 2>/dev/null | grep -v 'bale-bot-module' | grep -v 'telegram-bot-module' | grep -v 'wfcp-module' | head -1 | grep -q .; then
  echo "FAIL: legacy module path slug (bale-bot/telegram-bot/wfcp without -module suffix) in Modules PHP"
  grep -R --include='*.php' -E "Modules/(bale-bot|telegram-bot|wfcp)/" "$MODULES" 2>/dev/null | grep -v 'bale-bot-module' | grep -v 'telegram-bot-module' | grep -v 'wfcp-module' | head -5
  FAIL=1
else
  echo "OK: no legacy Modules path slugs in module PHP"
fi

if ! grep -q 'list_installed_module_slugs' "$ROOT/includes/class-webino-dashboard-module-registry.php"; then
  echo "FAIL: Module_Registry missing list_installed_module_slugs"
  FAIL=1
else
  echo "OK: bootstrap loads only marketplace-installed modules"
fi

if ! test -f "$ROOT/includes/bots/class-webino-dashboard-bots-core.php"; then
  echo "FAIL: shared bots core bootstrap missing"
  FAIL=1
else
  echo "OK: shared bots live in WebinoDashboard/includes/bots/"
fi

if grep -q "require_once.*bale-bot/includes" "$MODULES/telegram-bot-module/bootstrap.php" 2>/dev/null; then
  echo "FAIL: telegram bootstrap still requires bale-bot/ (wrong path)"
  FAIL=1
else
  echo "OK: telegram bootstrap has no cross-module bale-bot path"
fi

if ! grep -q 'bootstrap_file_is_safe' "$ROOT/includes/class-webino-dashboard-module-registry.php"; then
  echo "FAIL: Module_Registry missing bootstrap_file_is_safe guard"
  FAIL=1
else
  echo "OK: legacy bootstrap guard present"
fi

if ! grep -q 'heal_orphan_module_options' "$ROOT/includes/class-webino-dashboard-module-registry.php"; then
  echo "FAIL: Module_Registry missing heal_orphan_module_options"
  FAIL=1
else
  echo "OK: orphan module option healing present"
fi

if ! grep -q "add_action( 'init', array( __CLASS__, 'load_active_modules' ), 10 )" "$ROOT/includes/class-webino-dashboard-module-registry.php"; then
  echo "FAIL: load_active_modules must hook init priority 10"
  FAIL=1
else
  echo "OK: module bootstraps load on init"
fi

if ! grep -q 'module_package_is_complete' "$ROOT/includes/class-webino-dashboard-module-registry.php"; then
  echo "FAIL: Module_Registry missing module_package_is_complete"
  FAIL=1
else
  echo "OK: module package completeness validation present"
fi

if ! grep -q 'require_module_files' "$ROOT/includes/class-webino-dashboard-module-registry.php"; then
  echo "FAIL: Module_Registry missing require_module_files helper"
  FAIL=1
else
  echo "OK: require_module_files helper present"
fi

if ! grep -q '_installed_via' "$ROOT/includes/class-webino-dashboard-module-registry.php"; then
  echo "FAIL: CRM-only installed marker missing"
  FAIL=1
else
  echo "OK: modules require CRM install marker"
fi

if ! test -f "$ROOT/includes/class-webino-dashboard-bootstrap.php"; then
  echo "FAIL: guarded core bootstrap loader missing"
  FAIL=1
else
  echo "OK: guarded core bootstrap loader present"
fi

if ! test -f "$ROOT/scripts/reset-all-modules.sh"; then
  echo "FAIL: reset-all-modules.sh missing"
  FAIL=1
else
  echo "OK: reset-all-modules.sh present"
fi

GUARDED_BOOTSTRAPS_OK=1
for slug in analytics-module basalam-module digikala-sellers-module digipay-upg-module sms-panel-module wfcp-module zarinpal-gateway-module snapppay-gateway-module torobpay-gateway-module torob-products-extractor-module; do
  if ! grep -q 'require_module_files' "$MODULES/$slug/bootstrap.php" 2>/dev/null; then
    echo "FAIL: $slug bootstrap missing require_module_files guard"
    FAIL=1
    GUARDED_BOOTSTRAPS_OK=0
  fi
done
if [[ "$GUARDED_BOOTSTRAPS_OK" -eq 1 ]]; then
  echo "OK: guarded bootstraps use require_module_files"
fi

if php "$ROOT/scripts/test-incomplete-module-package.php" 2>/dev/null; then
  echo "OK: incomplete module package CLI test passed"
elif command -v php >/dev/null 2>&1; then
  echo "FAIL: incomplete module package CLI test"
  FAIL=1
else
  echo "WARN: php not found — skipping incomplete module package CLI test"
fi

if php "$ROOT/scripts/test-bootstrap-guard.php" 2>/dev/null; then
  echo "OK: bootstrap guard CLI test passed"
elif command -v php >/dev/null 2>&1; then
  echo "FAIL: bootstrap guard CLI test"
  FAIL=1
else
  echo "WARN: php not found — skipping bootstrap guard CLI test"
fi

if [[ "$FAIL" -ne 0 ]]; then
  echo "== smoke FAILED =="
  exit 1
fi

echo "== smoke PASSED (static) =="
echo ""
echo "Manual checks on a WordPress site:"
echo "  A) Confirm modules live at wp-content/plugins/WebinaDashboard/Modules/ — /dashboard home + shop must load (200)."
echo "  B) Disable each module in Settings — no PHP fatal on home-overview REST."
echo "  C) Enable each module — sidebar + one REST route per slug."
echo "  D) Marketplace install ZIP with manifest.json at archive root."
echo "  E) Remove obsolete sibling wp-content/plugins/Modules/ if it still exists."
