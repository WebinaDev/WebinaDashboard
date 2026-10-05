#!/usr/bin/env bash
# Static smoke checks for dashboard core update feature.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CRM="$(cd "$ROOT/../webinocrm" && pwd)"
FAIL=0

echo "== Core update smoke =="

for f in \
  "$ROOT/includes/class-webino-dashboard-core-updater.php" \
  "$ROOT/includes/class-webino-dashboard-rest-core-update.php"
do
  if [[ -f "$f" ]]; then
    echo "OK: $(basename "$f")"
  else
    echo "FAIL: missing $f"
    FAIL=1
  fi
done

if grep -q "Webino_Dashboard_REST_Core_Update::init" "$ROOT/includes/class-webino-dashboard-bootstrap.php"; then
  echo "OK: REST core update init registered"
else
  echo "FAIL: REST core update not initialized in webino-dashboard.php"
  FAIL=1
fi

if grep -q "coreUpdate" "$ROOT/includes/class-webino-dashboard-rest.php"; then
  echo "OK: bootstrap coreUpdate field"
else
  echo "FAIL: bootstrap missing coreUpdate"
  FAIL=1
fi

if grep -q "marketplace/core/check" "$CRM/includes/class-marketplace-api.php"; then
  echo "OK: CRM core/check route"
else
  echo "FAIL: CRM core/check route missing"
  FAIL=1
fi

if grep -q "CORE_MODULE_SLUG" "$CRM/includes/class-marketplace-manager.php"; then
  echo "OK: CRM core module slug constant"
else
  echo "FAIL: CRM core module not defined"
  FAIL=1
fi

if [[ "$FAIL" -ne 0 ]]; then
  echo "== smoke FAILED =="
  exit 1
fi

echo "== smoke PASSED =="
