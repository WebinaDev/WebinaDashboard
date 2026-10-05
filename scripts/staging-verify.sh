#!/usr/bin/env bash
# Staging E2E smoke against a live WordPress site (read-only GET checks + optional auth).
#
# Usage:
#   WEBINO_STAGING_URL=https://staging.example.com \
#   WEBINO_STAGING_COOKIE='wordpress_logged_in_...=...' \
#   bash scripts/staging-verify.sh
#
# Without WEBINO_STAGING_COOKIE only public/unauthenticated checks run.
set -euo pipefail

BASE="${WEBINO_STAGING_URL:-}"
COOKIE="${WEBINO_STAGING_COOKIE:-}"
FAIL=0

if [[ -z "$BASE" ]]; then
  echo "SKIP: set WEBINO_STAGING_URL to run staging verification" >&2
  exit 0
fi

BASE="${BASE%/}"
REST="${BASE}/wp-json/webino-dashboard/v1"
CURL=(curl -fsS -m 30)

if [[ -n "$COOKIE" ]]; then
  CURL+=(-H "Cookie: $COOKIE")
fi

echo "== Staging verify: $BASE =="

check_http() {
  local name="$1" url="$2" expect="${3:-200}"
  local code
  code=$("${CURL[@]}" -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || echo "000")
  if [[ "$code" != "$expect" ]]; then
    echo "FAIL: $name HTTP $code (expected $expect) — $url"
    FAIL=1
  else
    echo "OK: $name HTTP $code"
  fi
}

check_json_field() {
  local name="$1" url="$2" field="$3"
  local body
  if ! body=$("${CURL[@]}" "$url" 2>/dev/null); then
    echo "FAIL: $name — request failed $url"
    FAIL=1
    return
  fi
  if ! python3 - "$field" <<'PY' <<<"$body"
import json, sys
field = sys.argv[1]
data = json.load(sys.stdin)
parts = field.split(".")
cur = data
for p in parts:
    if not isinstance(cur, dict) or p not in cur:
        print("missing")
        sys.exit(0)
    cur = cur[p]
print("ok" if cur is not None else "missing")
PY
  then
    echo "FAIL: $name — invalid JSON from $url"
    FAIL=1
    return
  fi
  if python3 - "$field" <<'PY' <<<"$body" | grep -qx ok; then
    echo "OK: $name has $field"
  else
    echo "FAIL: $name missing JSON field $field"
    FAIL=1
  fi
}

check_http "dashboard shell" "${BASE}/dashboard/" 200

if [[ -n "$COOKIE" ]]; then
  check_json_field "bootstrap" "${REST}/bootstrap" "modules"
  check_json_field "bootstrap flags" "${REST}/bootstrap" "flags"
  check_json_field "bootstrap clients" "${REST}/bootstrap" "activeModuleClients"

  for ep in torobpay/status snapppay/status torob-extractor/status; do
  slug="${ep%%/*}"
  code=$("${CURL[@]}" -o /dev/null -w '%{http_code}' "${REST}/${ep}" 2>/dev/null || echo "000")
  if [[ "$code" == "200" ]]; then
    body=$("${CURL[@]}" "${REST}/${ep}" 2>/dev/null || echo "{}")
    gw=$(python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("gateway_loaded") or d.get("extractor_loaded") or d.get("status",{}).get("gateway_loaded",""))' <<<"$body" 2>/dev/null || echo "")
    echo "OK: ${slug} status HTTP 200 (gateway_loaded=${gw:-?})"
  elif [[ "$code" == "403" || "$code" == "404" ]]; then
    echo "WARN: ${slug} status HTTP $code (module may be inactive)"
  else
    echo "FAIL: ${slug} status HTTP $code"
    FAIL=1
  fi
  done
else
  echo "WARN: WEBINO_STAGING_COOKIE not set — skipping authenticated REST checks"
fi

if [[ "$FAIL" -ne 0 ]]; then
  echo "== staging-verify FAILED =="
  exit 1
fi

echo "== staging-verify PASSED =="
