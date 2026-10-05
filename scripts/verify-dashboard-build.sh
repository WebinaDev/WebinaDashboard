#!/usr/bin/env bash
# Verify dashboard-build integrity before deploy (run from repo root).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD="$ROOT/assets/dashboard-build"
MANIFEST="$BUILD/.vite/manifest.json"
ENTRY_JSON="$BUILD/build-entry.json"
PUBLIC_MANIFEST="$BUILD/manifest.json"
ASSETS="$BUILD/assets"
FAIL=0

echo "== Webino Dashboard build verify =="

if [[ ! -f "$ENTRY_JSON" ]]; then
  echo "FAIL: missing $ENTRY_JSON (run npm run build)"
  FAIL=1
else
  echo "OK: build-entry.json present"
fi

if [[ ! -f "$PUBLIC_MANIFEST" ]]; then
  echo "WARN: missing $PUBLIC_MANIFEST (upload this file; FTP may skip .vite/)"
else
  echo "OK: manifest.json at build root"
fi

if [[ ! -f "$MANIFEST" ]]; then
  echo "WARN: missing $MANIFEST"
fi

read_build_entry_field() {
  local file="$1" key="$2"
  if command -v php >/dev/null 2>&1; then
    php -r 'echo json_decode(file_get_contents($argv[1]), true)[$argv[2]] ?? "";' "$file" "$key" 2>/dev/null || true
    return
  fi
  python3 - "$file" "$key" <<'PY' 2>/dev/null || true
import json, sys
with open(sys.argv[1]) as f:
    data = json.load(f)
print(data.get(sys.argv[2], "") or "")
PY
}

read_vite_manifest_entry() {
  local file="$1"
  if command -v php >/dev/null 2>&1; then
    php -r '
      $m = json_decode(file_get_contents($argv[1]), true);
      if (!is_array($m)) { exit(2); }
      foreach (array("index.html", "src/main.tsx", "client/src/main.tsx") as $k) {
        if (!empty($m[$k]["file"])) { echo $m[$k]["file"]; exit(0); }
      }
      exit(3);
    ' "$file" 2>/dev/null || true
    return
  fi
  python3 - "$file" <<'PY' 2>/dev/null || true
import json, sys
with open(sys.argv[1]) as f:
    m = json.load(f)
for key in ("index.html", "src/main.tsx", "client/src/main.tsx"):
    entry = m.get(key)
    if isinstance(entry, dict) and entry.get("file"):
        print(entry["file"])
        break
PY
}

ENTRY=""
if [[ -f "$ENTRY_JSON" ]]; then
  ENTRY="$(read_build_entry_field "$ENTRY_JSON" js)"
fi
if [[ -z "$ENTRY" && -f "$MANIFEST" ]]; then
  ENTRY="$(read_vite_manifest_entry "$MANIFEST")"
fi

if [[ -z "$ENTRY" ]]; then
  echo "FAIL: no JS entry in build-entry.json or .vite/manifest.json"
  FAIL=1
else
  echo "OK: manifest entry -> $ENTRY"
  if [[ ! -f "$BUILD/$ENTRY" ]]; then
    echo "FAIL: entry file missing on disk: $BUILD/$ENTRY"
    FAIL=1
  fi
fi

if [[ -f "$ASSETS/PostsListPage.js" ]]; then
  echo "FAIL: legacy PostsListPage.js found (remove before deploy)"
  FAIL=1
else
  echo "OK: no legacy PostsListPage.js in assets/"
fi

if [[ -f "$ENTRY_JSON" && -n "$ENTRY" ]]; then
  ENTRY_BASENAME="${ENTRY##*/}"
  if [[ ! -f "$ASSETS/index.js" ]]; then
    echo "FAIL: missing compat alias assets/index.js (re-run npm run build)"
    FAIL=1
  elif ! cmp -s "$BUILD/$ENTRY" "$ASSETS/index.js"; then
    echo "FAIL: assets/index.js does not match build-entry js ($ENTRY)"
    FAIL=1
  else
    echo "OK: compat alias assets/index.js matches $ENTRY_BASENAME"
  fi
  CSS_ENTRY="$(read_build_entry_field "$ENTRY_JSON" css)"
  if [[ -n "$CSS_ENTRY" ]]; then
    if [[ ! -f "$ASSETS/index.css" ]]; then
      echo "FAIL: missing compat alias assets/index.css"
      FAIL=1
    elif ! cmp -s "$BUILD/$CSS_ENTRY" "$ASSETS/index.css"; then
      echo "FAIL: assets/index.css does not match build-entry css"
      FAIL=1
    else
      echo "OK: compat alias assets/index.css matches build-entry"
    fi
  fi
fi

if grep -l "from['\"]\./index\.js" "$ASSETS"/*.js 2>/dev/null | head -3; then
  echo "FAIL: page chunks still import ./index.js"
  FAIL=1
else
  echo "OK: no imports from ./index.js in built chunks"
fi

SHARED_COUNT=$(find "$ASSETS" -maxdepth 1 \( -name 'dashboard-shared-*.js' -o -name 'dashboard-shell-*.js' \) | wc -l)
if [[ "$SHARED_COUNT" -lt 1 ]]; then
  echo "FAIL: dashboard-shared-*.js or dashboard-shell-*.js not found"
  FAIL=1
else
  echo "OK: dashboard shell/shared chunk present ($SHARED_COUNT)"
fi

if [[ "$FAIL" -ne 0 ]]; then
  echo "== verify FAILED =="
  exit 1
fi

echo "== verify PASSED — safe to upload assets/dashboard-build/ =="
echo ""
echo "After upload to production:"
echo "  1. Delete OLD dashboard-build/ on server before uploading (no merge)."
echo "  2. Upload ALL of assets/dashboard-build/ including build-entry.json and manifest.json"
echo "  3. Upload PHP plugin files (version $(grep WEBINO_DASHBOARD_VERSION "$ROOT/webino-dashboard.php" | head -1 || echo '?'))"
echo "  4. WordPress: Settings → Permalinks → Save"
echo "  5. Browser: DevTools → Application → Unregister Service Workers; Clear site data"
echo "  6. Cloudflare: Purge cache for .../assets/dashboard-build/*"
echo "  7. Hard refresh (Ctrl+Shift+R)"
