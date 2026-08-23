#!/usr/bin/env bash
# Build production zip for WordPress upload (WebinaDashboard including Modules/).
# Folder name MUST match live: wp-content/plugins/WebinaDashboard/
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if command -v php >/dev/null 2>&1; then
  VERSION="$(php -r "preg_match(\"/define\\s*\\(\\s*'WEBINO_DASHBOARD_VERSION'\\s*,\\s*'([^']+)'/\", file_get_contents('$ROOT/webino-dashboard.php'), \$m); echo \$m[1] ?? '0.0.0';")"
else
  VERSION="$(sed -n "s/.*define( 'WEBINO_DASHBOARD_VERSION', '\\([^']*\\)' ).*/\\1/p" "$ROOT/webino-dashboard.php" | head -1)"
  VERSION="${VERSION:-0.0.0}"
fi
DIST="$ROOT/dist"
STAGE="$DIST/stage"
PLUGIN_DIR="WebinaDashboard"
ZIP="$DIST/webino-dashboard-${VERSION}.zip"

echo "== Webina Dashboard release zip (v${VERSION}) =="

if [[ ! -f "$ROOT/assets/dashboard-build/build-entry.json" ]]; then
  echo "Build missing. Run: cd client && npm run build" >&2
  exit 1
fi

# AI settings/attributes pages ship from module.js, not the host SPA.
AI_SETTINGS_SRC="$ROOT/Modules/ai-content-module/client/pages/AiSettingsPage.tsx"
AI_ATTRS_SRC="$ROOT/Modules/ai-content-module/client/pages/AiAttributesPage.tsx"
AI_MODULE_JS="$ROOT/Modules/ai-content-module/client/dist/module.js"
if [[ -f "$AI_SETTINGS_SRC" ]]; then
  if [[ ! -s "$AI_MODULE_JS" ]]; then
    echo "FAIL: missing $AI_MODULE_JS — run: bash scripts/build-module-client.sh ai-content-module" >&2
    exit 1
  fi
  if [[ "$AI_SETTINGS_SRC" -nt "$AI_MODULE_JS" ]]; then
    echo "FAIL: AiSettingsPage.tsx is newer than module.js — run: bash scripts/build-module-client.sh ai-content-module" >&2
    exit 1
  fi
  if [[ -f "$AI_ATTRS_SRC" && "$AI_ATTRS_SRC" -nt "$AI_MODULE_JS" ]]; then
    echo "FAIL: AiAttributesPage.tsx is newer than module.js — run: bash scripts/build-module-client.sh ai-content-module" >&2
    exit 1
  fi
  if ! grep -q 'ai-sec-tones' "$AI_MODULE_JS"; then
    echo "FAIL: module.js missing ai-sec-tones UI — run: bash scripts/build-module-client.sh ai-content-module" >&2
    exit 1
  fi
  if ! grep -q 'noCategoryAttributes' "$AI_MODULE_JS"; then
    echo "FAIL: module.js missing category-scoped attributes UI — run: bash scripts/build-module-client.sh ai-content-module" >&2
    exit 1
  fi
  echo "OK: ai-content-module client is up to date"
fi

# Guard: shared react-query must re-export QueryClient (avoids Loading dashboard stuck).
if ! grep -qE 'export\s*\*\s*from\s*["'\'']@tanstack/query-core["'\'']' \
  "$ROOT/assets/dashboard-build/shared/_tanstack_react-query.js"; then
  echo "FAIL: shared/_tanstack_react-query.js missing query-core re-export — run: node scripts/build-shared-runtime.mjs" >&2
  exit 1
fi
echo "OK: shared react-query re-exports query-core"

if command -v msgfmt >/dev/null 2>&1; then
  "$ROOT/scripts/compile-languages.sh"
else
  echo "WARN: msgfmt missing — using existing .mo catalogs"
fi

for mo in "$ROOT/languages"/webino-dashboard-*.mo; do
  [[ -f "$mo" ]] || { echo "FAIL: missing compiled $mo (install gettext and run compile-languages.sh)" >&2; exit 1; }
done
echo "OK: gettext .mo catalogs present"

"$ROOT/scripts/verify-dashboard-build.sh"

rm -rf "$STAGE"
mkdir -p "$STAGE/$PLUGIN_DIR"

cp "$ROOT/webino-dashboard.php" "$STAGE/$PLUGIN_DIR/"

for dir in includes templates assets Modules languages; do
  if [[ -d "$ROOT/$dir" ]]; then
    cp -a "$ROOT/$dir" "$STAGE/$PLUGIN_DIR/"
  fi
done

mkdir -p "$STAGE/$PLUGIN_DIR/Modules"
touch "$STAGE/$PLUGIN_DIR/Modules/.gitkeep"

# Vite preview artifact — not used by WordPress shell (avoids confusion on static hosts).
rm -f "$STAGE/$PLUGIN_DIR/assets/dashboard-build/index.html"

# Dev / local-only junk must never ship (bloat + wrong paths on host).
rm -rf \
  "$STAGE/$PLUGIN_DIR/assets/dashboard-build/qc-smoke.html" \
  "$STAGE/$PLUGIN_DIR/Modules/"*/client/node_modules \
  "$STAGE/$PLUGIN_DIR/Modules/"*/client/src \
  2>/dev/null || true

test -f "$STAGE/$PLUGIN_DIR/webino-dashboard.php"
test -f "$STAGE/$PLUGIN_DIR/assets/dashboard-build/build-entry.json"
test -f "$STAGE/$PLUGIN_DIR/assets/dashboard-build/manifest.json"
test -f "$STAGE/$PLUGIN_DIR/assets/dashboard-build/shared/_tanstack_react-query.js"
test -d "$STAGE/$PLUGIN_DIR/Modules"
grep -qE 'export\s*\*\s*from\s*["'\'']@tanstack/query-core["'\'']' \
  "$STAGE/$PLUGIN_DIR/assets/dashboard-build/shared/_tanstack_react-query.js"

rm -f "$ZIP"
mkdir -p "$DIST"
(
  cd "$STAGE"
  zip -rq "../webino-dashboard-${VERSION}.zip" "$PLUGIN_DIR" \
    -x "*.DS_Store" "*__MACOSX*" "*.git*" "*node_modules*"
)

chmod -R u+w "$STAGE" 2>/dev/null || true
rm -rf "$STAGE" 2>/dev/null || true

# Sibling zip next to the plugin directory (WordPress upload convenience).
SIBLING_ZIP="$(dirname "$ROOT")/webino-dashboard-${VERSION}.zip"
cp -f "$ZIP" "$SIBLING_ZIP"

echo ""
echo "Created: $ZIP"
echo "Sibling: $SIBLING_ZIP"
echo "Upload steps (WordPress plugin zip):"
echo "  1. Plugins → Add New → Upload Plugin → choose this zip"
echo "     (or deactivate, delete WebinaDashboard/, upload/extract zip)"
echo "  2. Activate Webino Dashboard"
echo "  3. Hard refresh /dashboard (purge CDN if any)"
echo "  4. Verify: bash scripts/verify-live-shared-runtime.sh https://YOUR-SITE"
