#!/usr/bin/env bash
# Static smoke checks for dashboard core update feature (ERP git model).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ERP="$(cd "$ROOT/../../Webina/WebinoERP" && pwd 2>/dev/null || true)"
if [[ -z "${ERP}" || ! -d "${ERP}" ]]; then
  ERP="$(cd "$ROOT/../Webina/WebinoERP" && pwd 2>/dev/null || true)"
fi
# Prefer sibling under Plugins/Webina when present.
if [[ -z "${ERP}" || ! -d "${ERP}" ]]; then
  CANDIDATE="$(cd "$ROOT/../../Webina/WebinoERP" 2>/dev/null && pwd || true)"
  ERP="${CANDIDATE}"
fi
# Absolute fallback used in this monorepo layout.
if [[ -z "${ERP}" || ! -d "${ERP}" ]]; then
  ERP="/mnt/Mine/Projects/Webina/Webina/Plugins/Webina/WebinoERP"
fi
FAIL=0

echo "== Core update smoke (ERP git) =="

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
  echo "FAIL: REST core update not initialized in bootstrap"
  FAIL=1
fi

if grep -q "coreUpdate" "$ROOT/includes/class-webino-dashboard-rest.php"; then
  echo "OK: bootstrap coreUpdate field"
else
  echo "FAIL: bootstrap missing coreUpdate"
  FAIL=1
fi

if grep -q "license/module-clone-url" "$ROOT/includes/class-webino-dashboard-core-updater.php"; then
  echo "OK: Dashboard core updater uses module-clone-url"
else
  echo "FAIL: core updater missing module-clone-url"
  FAIL=1
fi

if grep -q "git_clone_to\|git clone" "$ROOT/includes/class-webino-dashboard-core-updater.php"; then
  echo "OK: Dashboard core updater uses git clone"
else
  echo "FAIL: core updater missing git clone"
  FAIL=1
fi

if ! grep -q "core/download-token" "$ROOT/includes/class-webino-dashboard-core-updater.php"; then
  echo "OK: Dashboard core updater no longer uses ZIP download-token"
else
  echo "FAIL: core updater still references core/download-token"
  FAIL=1
fi

if [[ -d "$ERP" ]]; then
  if grep -q "core/check" "$ERP/backend/Modules/Marketplace/Providers/MarketplaceServiceProvider.php"; then
    echo "OK: ERP marketplace/core/check route"
  else
    echo "FAIL: ERP core/check route missing"
    FAIL=1
  fi
  if grep -q "function coreCheck" "$ERP/backend/Modules/Marketplace/Http/Controllers/WebinocrmMarketplaceCompatController.php"; then
    echo "OK: ERP coreCheck handler"
  else
    echo "FAIL: ERP coreCheck handler missing"
    FAIL=1
  fi
  if grep -q "module-clone-url" "$ERP/backend/Modules/Accounting/Providers/AccountingServiceProvider.php"; then
    echo "OK: ERP license/module-clone-url route"
  else
    echo "FAIL: ERP module-clone-url route missing"
    FAIL=1
  fi
else
  echo "WARN: ERP tree not found at $ERP (skipped ERP route checks)"
fi

if [[ "$FAIL" -ne 0 ]]; then
  echo "== smoke FAILED =="
  exit 1
fi

echo "== smoke PASSED =="
