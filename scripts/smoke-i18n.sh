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
grep -q 'function prune_unregistered_module_dirs' "$ROOT/includes/class-webino-dashboard-module-registry.php" \
  || { echo "FAIL: prune_unregistered_module_dirs missing" >&2; exit 1; }
grep -A5 'function prune_unregistered_module_dirs' "$ROOT/includes/class-webino-dashboard-module-registry.php" | grep -q 'Intentionally no-op' \
  || { echo "FAIL: prune_unregistered_module_dirs must remain a no-op (do not auto-delete Modules/)" >&2; exit 1; }
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

python3 - "$ROOT/Modules" "$EN" "$FA" <<'PY' || { echo "FAIL: module menu/header i18n keys incomplete" >&2; exit 1; }
import json, sys, glob, os

modules_dir, en_path, fa_path = sys.argv[1], sys.argv[2], sys.argv[3]
en_keys = set(json.load(open(en_path)).keys())
fa_keys = set(json.load(open(fa_path)).keys())
failed = []

def need(key: str, where: str) -> None:
    if key not in en_keys:
        failed.append(f"en missing {key} ({where})")
    if key not in fa_keys:
        failed.append(f"fa missing {key} ({where})")

def collect_sidebar_ids(sidebar, out: set) -> None:
    if isinstance(sidebar, dict):
        mid = sidebar.get("module_id")
        if mid:
            out.add(str(mid))
        for c in sidebar.get("children") or []:
            if isinstance(c, dict) and c.get("id"):
                out.add(str(c["id"]))
    elif isinstance(sidebar, list):
        for block in sidebar:
            if not isinstance(block, dict):
                continue
            for n in block.get("nodes") or []:
                if isinstance(n, dict) and n.get("id"):
                    out.add(str(n["id"]))

for manifest_path in glob.glob(os.path.join(modules_dir, "*/manifest.json")):
    m = json.load(open(manifest_path))
    slug = m.get("slug", os.path.basename(os.path.dirname(manifest_path)))

    for route in m.get("client", {}).get("routes", []):
        hk = route.get("headerTitleKey")
        if hk:
            need(hk, f"{slug} headerTitleKey")

    nav_ids = set()
    collect_sidebar_ids(m.get("sidebar"), nav_ids)
    for nid in sorted(nav_ids):
        need(f"nav.module.{nid}", f"{slug} sidebar id")

    settings = m.get("settings") or {}
    sections = settings.get("sections") or []
    if sections:
        for sec in sections:
            if not isinstance(sec, dict):
                continue
            sid = sec.get("id") or ""
            section_slug = f"{slug}-{sid}" if sid else slug
            need(f"marketplace.module.{section_slug}", f"{slug} settings section")
    else:
        need(f"marketplace.module.{slug}", f"{slug} settings")

# Core bots sidebar children from class-webino-dashboard-modules.php
for nid in ("bots-bale", "bots-telegram", "bots"):
    need(f"nav.module.{nid}", "core bots nav")

if failed:
    print("Missing keys:", file=sys.stderr)
    for line in failed:
        print(f"  {line}", file=sys.stderr)
    sys.exit(1)
print("OK: module headerTitleKey, nav.module.*, and marketplace.module.* keys in fa/en")
PY

echo "== smoke PASSED =="
