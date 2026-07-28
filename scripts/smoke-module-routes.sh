#!/usr/bin/env bash
# Validate manifest routes, module-entry keys, dist bundles, and dashboard slug hygiene.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODULES="$ROOT/Modules"
FAIL=0

SAFE_MODULE_ROUTE='^[a-z0-9][a-z0-9/_:-]*$'

echo "== Module route contract smoke =="

if command -v node >/dev/null 2>&1; then
  node "$ROOT/scripts/verify-module-route-logic.mjs" || FAIL=1
elif command -v python3 >/dev/null 2>&1; then
  python3 "$ROOT/scripts/verify-module-route-logic.py" || FAIL=1
else
  echo "FAIL: need node or python3 for module route logic checks" >&2
  FAIL=1
fi

for dir in "$MODULES"/*/; do
  slug="$(basename "$dir")"
  manifest="$dir/manifest.json"
  entry="$dir/client/module-entry.tsx"
  dist="$dir/client/dist/module.js"

  if [[ ! -f "$manifest" ]]; then
    echo "WARN: skip $slug (no manifest)"
    continue
  fi

  paths="$(python3 - "$manifest" <<'PY'
import json, sys
m = json.load(open(sys.argv[1]))
routes = m.get("client", {}).get("routes", [])
for r in routes:
    if isinstance(r, dict) and r.get("path"):
        print(str(r["path"]).lstrip("/"))
PY
)"

  if [[ -z "$paths" ]]; then
    echo "OK: $slug (no client routes)"
    continue
  fi

  while IFS= read -r path; do
    [[ -z "$path" ]] && continue
    if [[ "$path" == *".."* || "$path" == *"//"* ]]; then
      echo "FAIL: $slug unsafe path: $path"
      FAIL=1
      continue
    fi
    # Public SPA URLs must not include "-module" as a path segment (package slug stays internal).
    if [[ "$path" == *"-module/"* || "$path" == *"-module:"* || "$path" == *"-module" ]]; then
      echo "FAIL: $slug public path still contains -module: $path"
      FAIL=1
      continue
    fi
    if ! [[ "$path" =~ $SAFE_MODULE_ROUTE ]]; then
      echo "FAIL: $slug path fails SAFE_MODULE_ROUTE: $path"
      FAIL=1
    fi
  done <<< "$paths"

  if [[ -f "$entry" ]]; then
    entry_paths="$(python3 - "$entry" <<'PY'
import re, sys
text = open(sys.argv[1]).read()
keys = re.findall(r"['\"]([^'\"]+)['\"]\s*:", text)
array_paths = re.findall(r"path:\s*['\"]([^'\"]+)['\"]", text)
route_keys = [k.lstrip("/") for k in keys if "/" in k or ":" in k]
for p in sorted(set(route_keys + [a.lstrip("/") for a in array_paths])):
    print(p)
PY
)"
    while IFS= read -r mpath; do
      [[ -z "$mpath" ]] && continue
      if ! grep -qxF "$mpath" <<< "$entry_paths"; then
        echo "FAIL: $slug manifest path missing in module-entry: $mpath"
        FAIL=1
      fi
    done <<< "$paths"
  else
    echo "WARN: $slug has routes but no module-entry.tsx"
  fi

  if [[ ! -s "$dist" ]]; then
    echo "FAIL: $slug missing client/dist/module.js"
    FAIL=1
    continue
  fi

  if grep -qE 'mounted:\s*true|routes:\s*\{\s*\}|routes:\s*\[\s*\]|Placeholder bundle' "$dist"; then
    echo "FAIL: $slug dist looks like a stub"
    grep -nE 'mounted:\s*true|routes:\s*\{\s*\}|Placeholder' "$dist" | head -3
    FAIL=1
  else
    echo "OK: $slug dist ($(wc -c < "$dist") bytes)"
  fi

  if [[ -f "$dir/client/dist/dashboard-sw.js" ]]; then
    echo "FAIL: $slug client/dist/dashboard-sw.js should not be shipped (SW disabled)"
    FAIL=1
  fi
done

if grep -R --include='*.tsx' --include='*.ts' -E 'slug="(wfcp|analytics|bale-bot)"' "$ROOT/client/src" 2>/dev/null | grep -q .; then
  echo "FAIL: legacy module slugs in dashboard client"
  grep -R --include='*.tsx' --include='*.ts' -E 'slug="(wfcp|analytics|bale-bot)"' "$ROOT/client/src" || true
  FAIL=1
else
  echo "OK: no legacy slug= in dashboard client"
fi

if [[ "$FAIL" -ne 0 ]]; then
  echo "== smoke-module-routes FAILED =="
  exit 1
fi

echo "== smoke-module-routes PASSED =="
