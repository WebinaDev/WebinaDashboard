#!/usr/bin/env bash
# Emergency: disable a marketplace module bootstrap without wp-admin (rename module dir).
# Usage: ./scripts/recovery-disable-module.sh zarinpal-gateway-module
set -euo pipefail

SLUG="${1:-}"
if [[ -z "$SLUG" ]]; then
  echo "Usage: $0 <module-slug>" >&2
  exit 1
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Modules ship inside the plugin (Modules/). The old sibling layout
# (wp-content/plugins/Modules) is only honoured when it still exists, so this
# script never reports "disabled" for a directory the plugin does not load.
MODULES="$ROOT/Modules"
if [[ ! -d "$MODULES" ]]; then
  LEGACY_MODULES="$(cd "$ROOT/.." && pwd)/Modules"
  if [[ -d "$LEGACY_MODULES" ]]; then
    MODULES="$LEGACY_MODULES"
  fi
fi
SRC="${MODULES}/${SLUG}"
DEST="${MODULES}/${SLUG}.off"

if [[ ! -d "$SRC" ]]; then
  echo "Module directory not found: $SRC" >&2
  exit 1
fi

mv "$SRC" "$DEST"
echo "Disabled: $SRC -> $DEST"
echo "Note: the module registry only scans Modules/*/manifest.json — a renamed directory is ignored."
echo "Re-enable: mv \"$DEST\" \"$SRC\""
