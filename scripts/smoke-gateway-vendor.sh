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

# The CRM release service lives in a separate repository — validate the contract it
# consumes (manifest vendor.required_paths vs. loader/README/bootstrap wiring) here.
if command -v node >/dev/null 2>&1; then
  node "$ROOT/scripts/verify-vendor-manifests.mjs" || FAIL=1
elif command -v python3 >/dev/null 2>&1; then
  python3 "$ROOT/scripts/verify-vendor-manifests.py" || FAIL=1
else
  echo "FAIL: need node or python3 to verify vendor manifests" >&2
  FAIL=1
fi

if [[ "$FAIL" -ne 0 ]]; then
  echo "== gateway vendor smoke FAILED =="
  exit 1
fi

echo "== gateway vendor smoke PASSED =="
