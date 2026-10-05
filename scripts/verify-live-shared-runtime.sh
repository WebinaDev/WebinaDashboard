#!/usr/bin/env bash
# Post-deploy checks for shared ESM runtime on a live WordPress site.
# Usage: bash scripts/verify-live-shared-runtime.sh https://parisma.ir
set -euo pipefail

BASE="${1:-https://parisma.ir}"
BASE="${BASE%/}"
PLUGIN="$BASE/wp-content/plugins/WebinaDashboard"
FAIL=0

check() {
  local label="$1"
  shift
  if "$@"; then
    echo "OK: $label"
  else
    echo "FAIL: $label"
    FAIL=1
  fi
}

echo "== verify-live-shared-runtime: $BASE =="

TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

curl -fsS -m 30 "$PLUGIN/assets/dashboard-build/build-entry.json" >"$TMP" || {
  echo "FAIL: build-entry.json fetch"
  exit 1
}

python3 - "$TMP" <<'PY'
import json, sys
be = json.load(open(sys.argv[1]))
ok = True
if not be.get("importMap"):
    print("FAIL: build-entry.json missing importMap (old deploy)")
    ok = False
else:
    print("OK: build-entry importMap keys:", len(be["importMap"]))
js = be.get("js") or ""
print("INFO: build-entry js:", js)
sys.exit(0 if ok else 1)
PY
check "build-entry has importMap" true

HTTP="$(curl -sS -m 20 -o /dev/null -w '%{http_code}' "$PLUGIN/assets/dashboard-build/shared/react.js")"
check "shared/react.js HTTP 200 (got $HTTP)" test "$HTTP" = "200"

RQ="$(curl -fsS -m 20 "$PLUGIN/assets/dashboard-build/shared/_tanstack_react-query.js" 2>/dev/null || true)"
if printf '%s' "$RQ" | grep -qE 'export\s*\*\s*from\s*["'\'']@tanstack/query-core["'\'']|export\s*\{[^}]*\bQueryClient\b'; then
  echo "OK: shared react-query re-exports QueryClient / query-core"
else
  echo "FAIL: shared/_tanstack_react-query.js missing QueryClient re-export (Loading dashboard stuck)"
  FAIL=1
fi

# Host Rolldown require shim (fixes Loading dashboard after QueryClient deploy)
BE_JS="$(python3 -c "import json; print(json.load(open('$TMP')).get('shared') or '')" 2>/dev/null || true)"
# Prefer hashed runtime from assets dir listing via known pattern from shell deps
RT_URL=""
RT_CANDIDATES="$(curl -fsS -m 20 "$PLUGIN/assets/dashboard-build/assets/" 2>/dev/null | rg -o 'rolldown-runtime-[A-Za-z0-9_-]+\.js' | head -3 || true)"
# Fallback: extract from shell chunk referenced in build-entry
SHELL_REL="$(python3 -c "import json; print(json.load(open('$TMP')).get('shared') or '')" 2>/dev/null || true)"
if [[ -n "$SHELL_REL" ]]; then
  SHELL_BODY="$(curl -fsS -m 25 "$PLUGIN/assets/dashboard-build/$SHELL_REL" 2>/dev/null | head -c 2500 || true)"
  RT_NAME="$(printf '%s' "$SHELL_BODY" | rg -o 'rolldown-runtime-[A-Za-z0-9_-]+\.js' | head -1 || true)"
  if [[ -n "$RT_NAME" ]]; then
    RT_URL="$PLUGIN/assets/dashboard-build/assets/$RT_NAME"
  fi
fi
if [[ -z "$RT_URL" && -n "$RT_CANDIDATES" ]]; then
  RT_URL="$PLUGIN/assets/dashboard-build/assets/$(printf '%s' "$RT_CANDIDATES" | head -1)"
fi
if [[ -n "$RT_URL" ]]; then
  RT_BODY="$(curl -fsS -m 20 "$RT_URL" 2>/dev/null || true)"
  if printf '%s' "$RT_BODY" | grep -q '__webinRequireMap'; then
    echo "OK: live rolldown-runtime has require shim"
  elif printf '%s' "$RT_BODY" | grep -q 'Calling `require` for'; then
    echo "FAIL: live rolldown-runtime still raw require throw — redeploy patched build"
    FAIL=1
  else
    echo "WARN: live rolldown-runtime has neither throw nor shim"
  fi
else
  echo "WARN: could not locate live rolldown-runtime-*.js"
fi

HEAD="$(curl -fsS -m 20 "$PLUGIN/Modules/snapppay-gateway-module/client/dist/module.js" | head -c 400 || true)"
if printf '%s' "$HEAD" | grep -qE 'from ["'\'']react|from["'\'']react'; then
  echo "OK: snapppay module.js uses bare react import"
else
  echo "FAIL: snapppay module.js still self-contained (rolldown/runtime?)"
  printf '%s\n' "$HEAD" | head -c 160
  echo
  FAIL=1
fi

# Dashboard HTML may redirect when logged out; still try importmap id.
HTML="$(curl -fsS -m 30 -L -A 'Mozilla/5.0' "$BASE/dashboard/" 2>/dev/null || true)"
if printf '%s' "$HTML" | grep -q 'id="webino-dashboard-importmap"'; then
  echo "OK: dashboard HTML has webino-dashboard-importmap"
elif printf '%s' "$HTML" | grep -q 'webino-dashboard-importmap'; then
  echo "OK: dashboard HTML mentions webino-dashboard-importmap"
else
  echo "WARN: importmap not found in /dashboard/ HTML (may need login or PHP not deployed)"
  # Soft-fail only if other checks already failed hard on assets
  if [[ "$HTTP" != "200" ]]; then
    FAIL=1
    echo "FAIL: importmap missing and shared/react.js not 200 — PHP/assets not deployed"
  fi
fi

if [[ "$FAIL" -ne 0 ]]; then
  echo "== FAILED — redeploy assets/dashboard-build (incl shared/), Modules/*/client/dist, class-webino-dashboard-assets.php =="
  exit 1
fi
echo "== PASSED =="
