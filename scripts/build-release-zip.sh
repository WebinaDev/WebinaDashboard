#!/usr/bin/env bash
# Build production zip for WordPress upload (WebinoDashboard core only; Modules/ empty until marketplace install).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_ROOT="$(cd "$ROOT/.." && pwd)"
VERSION="$(php -r "preg_match(\"/define\\s*\\(\\s*'WEBINO_DASHBOARD_VERSION'\\s*,\\s*'([^']+)'/\", file_get_contents('$ROOT/webino-dashboard.php'), \$m); echo \$m[1] ?? '0.0.0';")"
DIST="$ROOT/dist"
STAGE="$DIST/stage"
ZIP="$DIST/webino-dashboard-${VERSION}.zip"

echo "== Webino Dashboard release zip (v${VERSION}) =="

if [[ ! -f "$ROOT/assets/dashboard-build/build-entry.json" ]]; then
  echo "Build missing. Run: cd client && npm run build" >&2
  exit 1
fi

"$ROOT/scripts/compile-languages.sh"

for mo in "$ROOT/languages"/webino-dashboard-*.mo; do
  [[ -f "$mo" ]] || { echo "FAIL: missing compiled $mo" >&2; exit 1; }
done
echo "OK: gettext .mo catalogs present"

"$ROOT/scripts/verify-dashboard-build.sh"

rm -rf "$STAGE"
mkdir -p "$STAGE/WebinoDashboard" "$STAGE/Modules"

cp "$ROOT/webino-dashboard.php" "$STAGE/WebinoDashboard/"

for dir in includes templates assets; do
  if [[ -d "$ROOT/$dir" ]]; then
    cp -a "$ROOT/$dir" "$STAGE/WebinoDashboard/"
  fi
done

if [[ -d "$ROOT/languages" ]]; then
  cp -a "$ROOT/languages" "$STAGE/WebinoDashboard/"
fi

touch "$STAGE/Modules/.gitkeep"

# Vite preview artifact — not used by WordPress shell (avoids confusion on static hosts).
rm -f "$STAGE/WebinoDashboard/assets/dashboard-build/index.html"

test -f "$STAGE/WebinoDashboard/assets/dashboard-build/build-entry.json"
test -f "$STAGE/WebinoDashboard/assets/dashboard-build/manifest.json"
test -f "$STAGE/Modules/.gitkeep"

rm -f "$ZIP"
mkdir -p "$DIST"
(
  cd "$STAGE"
  zip -rq "../webino-dashboard-${VERSION}.zip" WebinoDashboard Modules \
    -x "*.DS_Store" "*__MACOSX*" "*.git*"
)

chmod -R u+w "$STAGE" 2>/dev/null || true
rm -rf "$STAGE" 2>/dev/null || true

echo ""
echo "Created: $ZIP"
echo "Upload steps:"
echo "  1. Deactivate plugin in WP Admin"
echo "  2. Delete wp-content/plugins/WebinoDashboard/ (keep or create empty wp-content/plugins/Modules/)"
echo "  3. Upload zip and extract to wp-content/plugins/"
echo "  4. Activate Webino Dashboard"
echo "  5. Install modules from Marketplace (CRM + Gitea ZIP)"
echo "  6. Hard refresh /dashboard"
