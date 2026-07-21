#!/usr/bin/env bash
# Smoke checks for gateway modules: no demo/ refs, vendor loader + manifest vendor contract.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODULES="$ROOT/Modules"
FAIL=0

echo "== Gateway vendor smoke =="

GATEWAYS=(
  snapppay-gateway-module
  torobpay-gateway-module
  torob-products-extractor-module
)

for slug in "${GATEWAYS[@]}"; do
  bootstrap="$MODULES/$slug/bootstrap.php"
  manifest="$MODULES/$slug/manifest.json"

  if [[ ! -f "$bootstrap" ]]; then
    echo "FAIL: missing bootstrap $slug"
    FAIL=1
    continue
  fi

  if grep -q '/demo/' "$bootstrap" || grep -q "dirname( __DIR__, 2 )" "$bootstrap"; then
    echo "FAIL: $slug bootstrap still references demo/ or monorepo demo path"
    FAIL=1
  else
    echo "OK: $slug bootstrap has no demo/ reference"
  fi

  if ! grep -q 'Vendor_Loader::init' "$bootstrap"; then
    echo "FAIL: $slug bootstrap missing Vendor_Loader::init()"
    FAIL=1
  else
    echo "OK: $slug vendor loader wired in bootstrap"
  fi

  if ! grep -q 'require_module_files' "$bootstrap"; then
    echo "FAIL: $slug bootstrap missing require_module_files guard"
    FAIL=1
  fi

  if [[ ! -f "$manifest" ]]; then
    echo "FAIL: missing manifest $slug"
    FAIL=1
    continue
  fi

  if ! grep -q '"requires_woocommerce": true' "$manifest"; then
    echo "FAIL: $slug manifest missing requires_woocommerce"
    FAIL=1
  else
    echo "OK: $slug requires_woocommerce in manifest"
  fi

  if ! grep -q '"vendor"' "$manifest"; then
    echo "FAIL: $slug manifest missing vendor block"
    FAIL=1
  else
    echo "OK: $slug manifest declares vendor contract"
  fi

  vendor_readme="$MODULES/$slug/vendor/README.md"
  if [[ ! -f "$vendor_readme" ]]; then
    echo "FAIL: $slug missing vendor/README.md"
    FAIL=1
  else
    echo "OK: $slug vendor/README.md present"
  fi
  loader="$(find "$MODULES/$slug/includes" -maxdepth 1 -name '*vendor-loader.php' -print -quit 2>/dev/null || true)"
  if [[ -z "$loader" ]] || ! grep -q 'function status' "$loader" 2>/dev/null; then
    echo "FAIL: $slug vendor loader missing status()"
    FAIL=1
  else
    echo "OK: $slug vendor loader exposes status()"
  fi
done

if ! grep -q "required_paths" "$ROOT/../webinocrm/includes/class-marketplace-release-service.php" 2>/dev/null; then
  echo "FAIL: CRM release service missing vendor required_paths support"
  FAIL=1
else
  echo "OK: CRM validates manifest vendor.required_paths"
fi

if [[ "$FAIL" -ne 0 ]]; then
  echo "== gateway vendor smoke FAILED =="
  exit 1
fi

echo "== gateway vendor smoke PASSED =="
