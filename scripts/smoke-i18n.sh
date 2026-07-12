#!/usr/bin/env bash
# Static smoke: Phase D i18n and build correctness.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PO="$ROOT/languages/webino-dashboard-fa_IR.po"
FA="$ROOT/client/src/i18n/locales/fa.json"
EN="$ROOT/client/src/i18n/locales/en.json"
API="$ROOT/client/src/lib/apiError.ts"

echo "== i18n smoke =="

grep -q 'comment_query_args_for_status' "$ROOT/includes/class-webino-dashboard-rest-crud.php" 2>/dev/null || true

total=$(grep -c '^msgid "' "$PO" || true)
total=$((total - 1))
trans=$(awk '
/^msgid "/ && $0 != "msgid \"\"" {
  gsub(/^msgid "/, "", $0); gsub(/"$/, "", $0); getline
  if ($0 ~ /^msgstr "/) { gsub(/^msgstr "/, "", $0); gsub(/"$/, "", $0); if ($0 != "") c++ }
}
END { print c+0 }
' "$PO")
pct=$((trans * 100 / total))
if [[ "$pct" -lt 90 ]]; then
  echo "FAIL: fa_IR.po coverage ${pct}% (${trans}/${total}) — need ≥90%" >&2
  exit 1
fi
echo "OK: fa_IR.po coverage ${pct}% (${trans}/${total})"

count_json_keys() {
  local file="$1"
  if command -v node >/dev/null 2>&1; then
    node -e "console.log(Object.keys(JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'))).length)" "$file"
    return
  fi
  python3 -c 'import json,sys; print(len(json.load(open(sys.argv[1]))))' "$file"
}

fa_keys=$(count_json_keys "$FA")
en_keys=$(count_json_keys "$EN")
if [[ "$fa_keys" != "$en_keys" ]]; then
  echo "FAIL: fa/en.json key count mismatch ($fa_keys vs $en_keys)" >&2
  exit 1
fi
echo "OK: fa/en.json key parity ($fa_keys)"

if grep -q 'term استفاده' "$FA"; then
  echo "FAIL: English leak in attributes.terms.deleteConfirmBody" >&2
  exit 1
fi
if grep -q 'Modules/' "$FA"; then
  echo "FAIL: filesystem path leak in fa.json coreUpdate.description" >&2
  exit 1
fi
if grep -q '"orders.createdVia.rest-api": "REST API"' "$FA"; then
  echo "FAIL: REST API leak in fa.json" >&2
  exit 1
fi
echo "OK: no flagged English leaks in fa.json"

grep -q 'LICENSE_MESSAGE_KEYS' "$API" \
  || { echo "FAIL: LICENSE_MESSAGE_KEYS missing in apiError.ts" >&2; exit 1; }
grep -q 'license.errors.serverUnavailable' "$FA" \
  || { echo "FAIL: license.errors keys missing in fa.json" >&2; exit 1; }
echo "OK: license message i18n mapping"

grep -q 'resolveModuleSettingsRoutePath' "$ROOT/client/src/lib/moduleRuntime.ts" \
  || { echo "FAIL: resolveModuleSettingsRoutePath missing" >&2; exit 1; }
grep -q 'ModuleDynamicRoute' "$ROOT/client/src/pages/settings/ModuleSettingsShell.tsx" \
  || { echo "FAIL: ModuleSettingsShell must embed ModuleDynamicRoute" >&2; exit 1; }
echo "OK: embedded module settings shell"

grep -q 'woocommerce_required' "$ROOT/includes/class-webino-dashboard-module-registry.php" \
  || { echo "FAIL: WC check missing in validate_installed_package" >&2; exit 1; }
grep -q "apply_filters( 'webino_dashboard_prune_stray_modules', true )" "$ROOT/includes/class-webino-dashboard-module-registry.php" \
  || { echo "FAIL: prune filter default must be true" >&2; exit 1; }
grep -q 'function install_error' "$ROOT/includes/class-webino-dashboard-rest-marketplace.php" \
  && { echo "FAIL: install_error() should be removed" >&2; exit 1; } || true
echo "OK: module registry/marketplace hygiene"

if ! grep -q 'compile-languages.sh' "$ROOT/scripts/build-release-zip.sh"; then
  echo "FAIL: build-release-zip must run compile-languages.sh" >&2
  exit 1
fi
if grep -q 'compile-languages.sh.*2>/dev/null' "$ROOT/scripts/build-release-zip.sh"; then
  echo "FAIL: compile-languages must not be silenced in build-release-zip" >&2
  exit 1
fi
echo "OK: release zip requires .mo compile"

python3 - "$ROOT/../Modules" "$EN" <<'PY' || { echo "FAIL: manifest headerTitleKey not in en.json" >&2; exit 1; }
import json, sys, glob, os
modules_dir, en_path = sys.argv[1], sys.argv[2]
keys = set(json.load(open(en_path)).keys())
failed = []
for manifest_path in glob.glob(os.path.join(modules_dir, '*/manifest.json')):
    m = json.load(open(manifest_path))
    slug = m.get('slug', os.path.basename(os.path.dirname(manifest_path)))
    for route in m.get('client', {}).get('routes', []):
        hk = route.get('headerTitleKey')
        if hk and hk not in keys:
            failed.append(f"{slug}: {hk}")
if failed:
    print("Missing keys:", ", ".join(failed), file=sys.stderr)
    sys.exit(1)
print("OK: all module headerTitleKey values exist in en.json")
PY

echo "== smoke PASSED =="
