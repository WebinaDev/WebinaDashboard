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

# Resolve a dotted field inside a JSON document: ok | missing | invalid.
# JSON arrives on stdin, so the python program must be passed with -c (a heredoc
# would consume stdin and leave nothing to parse).
JSON_FIELD_PY='
import json, sys
field = sys.argv[1]
try:
    data = json.load(sys.stdin)
except Exception:
    print("invalid")
    raise SystemExit(0)
cur = data
for part in field.split("."):
    if not isinstance(cur, dict) or part not in cur:
        print("missing")
        raise SystemExit(0)
    cur = cur[part]
print("ok" if cur is not None else "missing")
'

json_field_state() {
  python3 -c "$JSON_FIELD_PY" "$1"
}

check_json_field() {
  local name="$1" url="$2" field="$3"
  local body state
  if ! body=$("${CURL[@]}" "$url" 2>/dev/null); then
    echo "FAIL: $name — request failed $url"
    FAIL=1
    return
  fi
  # Single input source: read the body once on stdin. (A previous version used
  # `<<'PY' <<<"$body"`, which fed the script itself to python and left an
  # unterminated heredoc, so this file did not even parse.)
  state=$(printf '%s' "$body" | json_field_state "$field")
  case "$state" in
    ok)
      echo "OK: $name has $field"
      ;;
    missing)
      echo "FAIL: $name missing JSON field $field"
      FAIL=1
      ;;
    *)
      echo "FAIL: $name — invalid JSON from $url"
      FAIL=1
      ;;
  esac
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
      gw=$(printf '%s' "$body" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("gateway_loaded") or d.get("extractor_loaded") or d.get("status",{}).get("gateway_loaded",""))' 2>/dev/null || echo "")
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
