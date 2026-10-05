#!/usr/bin/env bash
# Per-module contract: manifest, bootstrap, REST init, client bundle.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODULES="$(cd "$ROOT/.." && pwd)/Modules"
FAIL=0

SLUGS=(
  analytics-module
  bale-bot-module
  basalam-module
  digikala-sellers-module
  digipay-upg-module
  sms-panel-module
  snapppay-gateway-module
  telegram-bot-module
  torobpay-gateway-module
  torob-products-extractor-module
  wfcp-module
  zarinpal-gateway-module
)

echo "== Modules contract smoke (12 modules) =="

for slug in "${SLUGS[@]}"; do
  dir="$MODULES/$slug"
  manifest="$dir/manifest.json"
  bootstrap="$dir/bootstrap.php"

  if [[ ! -f "$manifest" || ! -f "$bootstrap" ]]; then
    echo "FAIL: $slug missing manifest or bootstrap"
    FAIL=1
    continue
  fi

  mslug=$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1])).get("slug",""))' "$manifest")
  if [[ "$mslug" != "$slug" ]]; then
    echo "FAIL: $slug manifest slug mismatch ($mslug)"
    FAIL=1
  fi

  if [[ "$slug" == "bale-bot-module" ]]; then
    echo "OK: $slug bootstrap (core Bots_Core loads engine)"
  elif ! grep -qE '::init\s*\(\s*\)' "$bootstrap"; then
    echo "FAIL: $slug bootstrap missing ::init()"
    FAIL=1
  else
    echo "OK: $slug bootstrap init"
  fi

  routes=$(python3 - "$manifest" <<'PY'
import json, sys
m = json.load(open(sys.argv[1]))
print(len(m.get("client", {}).get("routes", [])))
PY
)
  if [[ "$routes" -gt 0 ]]; then
    if [[ ! -s "$dir/client/dist/module.js" ]]; then
      echo "FAIL: $slug has routes but empty dist/module.js"
      FAIL=1
    elif [[ ! -f "$dir/client/module-entry.tsx" ]]; then
      echo "FAIL: $slug has routes but no module-entry.tsx"
      FAIL=1
    else
      echo "OK: $slug client bundle ($routes routes)"
    fi
  else
    echo "OK: $slug (no client routes)"
  fi

  if grep -q 'requires_modules' "$manifest"; then
    deps=$(python3 -c 'import json,sys; print(",".join(json.load(open(sys.argv[1])).get("requires_modules",[])))' "$manifest")
    echo "OK: $slug declares requires_modules: $deps"
  fi
done

if [[ "$FAIL" -ne 0 ]]; then
  echo "== smoke-modules-contract FAILED =="
  exit 1
fi

echo "== smoke-modules-contract PASSED =="
