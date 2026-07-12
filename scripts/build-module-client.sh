#!/usr/bin/env bash
# Build a single module client bundle to Modules/{slug}/client/dist/module.js
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SLUG="${1:-}"

if [[ -z "$SLUG" ]]; then
  echo "Usage: $0 <module-slug>" >&2
  exit 1
fi

ENTRY="$ROOT/../Modules/$SLUG/client/module-entry.tsx"
if [[ ! -f "$ENTRY" ]]; then
  echo "FAIL: missing $ENTRY" >&2
  exit 1
fi

if [[ ! -d "$ROOT/client/node_modules" ]]; then
  echo "Installing dashboard client dependencies…"
  (cd "$ROOT/client" && npm ci)
fi

echo "== Building module client: $SLUG =="
(cd "$ROOT/client" && MODULE_SLUG="$SLUG" npx vite build --config "$ROOT/scripts/module-client-vite.config.mjs")

OUT="$ROOT/../Modules/$SLUG/client/dist/module.js"
if [[ -s "$OUT" ]]; then
  rm -f "$ROOT/../Modules/$SLUG/client/dist/dashboard-sw.js"
fi
if [[ ! -s "$OUT" ]]; then
  echo "FAIL: empty or missing $OUT" >&2
  exit 1
fi

echo "OK: $OUT ($(wc -c < "$OUT") bytes)"
