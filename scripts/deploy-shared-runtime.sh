#!/usr/bin/env bash
# Atomic deploy package for shared ESM runtime + externalized module clients.
# Incomplete upload (modules without shared/) causes import failures / (h is not a function).
#
# Usage:
#   bash scripts/deploy-shared-runtime.sh              # validate + list + zip
#   WEBINO_DEPLOY_RSYNC='user@host:/path/to/wp-content/plugins/WebinaDashboard' \
#     bash scripts/deploy-shared-runtime.sh            # also rsync
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="${WEBINO_DEPLOY_OUT:-$ROOT/.deploy}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
STAGE="$OUT_DIR/shared-runtime-$STAMP"
ZIP="$OUT_DIR/webina-shared-runtime-$STAMP.zip"

cd "$ROOT"

echo "== Validate local artifacts =="
test -f assets/dashboard-build/build-entry.json
test -f assets/dashboard-build/shared/react.js
test -f assets/dashboard-build/shared/import-map.json
python3 - <<'PY'
import json, glob, os, sys
be = json.load(open("assets/dashboard-build/build-entry.json"))
if not be.get("importMap"):
    sys.exit("build-entry.json missing importMap — rebuild client")
print("build-entry js:", be.get("js"), "importMap keys:", len(be["importMap"]))
missing = []
for p in sorted(glob.glob("Modules/*/client/dist/module.js")):
    t = open(p, encoding="utf-8", errors="replace").read(800)
    if 'from "react"' not in t and "from 'react'" not in t and 'from "react/jsx-runtime"' not in t and "from 'react/jsx-runtime'" not in t and 'from"react"' not in t and 'from"react/jsx-runtime"' not in t:
        # tolerate import * as x from "react"
        if 'from "react"' not in t and 'from "react/jsx-runtime"' not in t and "react" not in t[:400]:
            missing.append(p)
if missing:
    sys.exit("modules not externalized:\n" + "\n".join(missing))
print("OK: all module.js look externalized")
PY
grep -q 'print_shared_runtime_import_map' includes/class-webino-dashboard-assets.php
grep -q 'webino-dashboard-importmap' includes/class-webino-dashboard-assets.php
echo "OK: PHP import map emitter present"

echo ""
echo "== Stage atomic upload set =="
rm -rf "$STAGE"
mkdir -p "$STAGE/assets" "$STAGE/includes" "$STAGE/Modules"

cp -a assets/dashboard-build "$STAGE/assets/"
cp includes/class-webino-dashboard-assets.php "$STAGE/includes/"

for dist in Modules/*/client/dist; do
  slug="$(basename "$(dirname "$(dirname "$dist")")")"
  mkdir -p "$STAGE/Modules/$slug/client"
  cp -a "$dist" "$STAGE/Modules/$slug/client/"
done

mkdir -p "$OUT_DIR"
(
  cd "$STAGE"
  zip -qr "$ZIP" .
)
echo "ZIP: $ZIP"
echo "SIZE: $(du -h "$ZIP" | awk '{print $1}')"

echo ""
echo "== Upload these paths together (same release) =="
echo "  assets/dashboard-build/          # MUST include shared/ + build-entry.json"
echo "  Modules/*/client/dist/           # externalized module.js"
echo "  includes/class-webino-dashboard-assets.php"
echo ""
echo "Then hard-refresh / purge CDN for module.js and build-entry.json."
echo "Verify: bash scripts/verify-live-shared-runtime.sh https://parisma.ir"

if [[ -n "${WEBINO_DEPLOY_RSYNC:-}" ]]; then
  echo ""
  echo "== rsync to $WEBINO_DEPLOY_RSYNC =="
  rsync -avz --delete \
    "$STAGE/assets/dashboard-build/" \
    "$WEBINO_DEPLOY_RSYNC/assets/dashboard-build/"
  rsync -avz \
    "$STAGE/includes/class-webino-dashboard-assets.php" \
    "$WEBINO_DEPLOY_RSYNC/includes/class-webino-dashboard-assets.php"
  for dist in "$STAGE"/Modules/*/client/dist; do
    slug="$(basename "$(dirname "$(dirname "$dist")")")"
    rsync -avz --delete \
      "$dist/" \
      "$WEBINO_DEPLOY_RSYNC/Modules/$slug/client/dist/"
  done
  echo "OK: rsync finished"
fi
