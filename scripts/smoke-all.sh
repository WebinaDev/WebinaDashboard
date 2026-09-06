#!/usr/bin/env bash
# Run dashboard static smoke checks (build verify, modules layout, core update, optional .mo compile).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "== Webino Dashboard smoke-all =="

"$ROOT/scripts/verify-dashboard-build.sh"
"$ROOT/scripts/smoke-modules-structure.sh"
"$ROOT/scripts/smoke-modules-contract.sh"
"$ROOT/scripts/smoke-module-routes.sh"
"$ROOT/scripts/smoke-gateway-vendor.sh"
"$ROOT/scripts/smoke-core-update.sh"
"$ROOT/scripts/smoke-license-security.sh"
"$ROOT/scripts/smoke-backend-correctness.sh"
"$ROOT/scripts/smoke-hygiene.sh"
"$ROOT/scripts/smoke-page-dod.sh"
"$ROOT/scripts/smoke-i18n.sh"
"$ROOT/scripts/smoke-security-module.sh"

if command -v msgfmt >/dev/null 2>&1; then
  "$ROOT/scripts/compile-languages.sh"
  for mo in "$ROOT/languages"/webino-dashboard-*.mo; do
    [[ -f "$mo" ]] || { echo "FAIL: missing compiled $mo" >&2; exit 1; }
  done
  echo "OK: .mo catalogs present"
else
  echo "WARN: msgfmt not found — skipping compile-languages"
fi

echo "== smoke-all PASSED =="
