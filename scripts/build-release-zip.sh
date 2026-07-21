#!/usr/bin/env bash
# Build production zip for WordPress upload (WebinoDashboard including Modules/).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
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
mkdir -p "$STAGE/WebinoDashboard"

cp "$ROOT/webino-dashboard.php" "$STAGE/WebinoDashboard/"

for dir in includes templates assets Modules languages; do
  if [[ -d "$ROOT/$dir" ]]; then
    cp -a "$ROOT/$dir" "$STAGE/WebinaDashboard/"
  fi
done

mkdir -p "$STAGE/WebinaDashboard/Modules"
touch "$STAGE/WebinaDashboard/Modules/.gitkeep"

# Vite preview artifact — not used by WordPress shell (avoids confusion on static hosts).
rm -f "$STAGE/WebinaDashboard/assets/dashboard-build/index.html"

test -f "$STAGE/WebinaDashboard/assets/dashboard-build/build-entry.json"
test -f "$STAGE/WebinaDashboard/assets/dashboard-build/manifest.json"
test -d "$STAGE/WebinaDashboard/Modules"

rm -f "$ZIP"
mkdir -p "$DIST"
(
  cd "$STAGE"
  zip -rq "../webino-dashboard-${VERSION}.zip" WebinaDashboard \
    -x "*.DS_Store" "*__MACOSX*" "*.git*"
)

chmod -R u+w "$STAGE" 2>/dev/null || true
rm -rf "$STAGE" 2>/dev/null || true

echo ""
echo "Created: $ZIP"
echo "Upload steps:"
echo "  1. Deactivate plugin in WP Admin"
echo "  2. Delete wp-content/plugins/WebinaDashboard/"
echo "  3. Remove obsolete sibling wp-content/plugins/Modules/ if present"
echo "  4. Upload zip and extract to wp-content/plugins/"
echo "  5. Activate Webino Dashboard"
echo "  6. Hard refresh /dashboard"
