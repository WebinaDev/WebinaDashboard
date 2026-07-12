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
MODULES="$(cd "$ROOT/.." && pwd)/Modules"
SRC="${MODULES}/${SLUG}"
DEST="${MODULES}/${SLUG}.off"

if [[ ! -d "$SRC" ]]; then
  echo "Module directory not found: $SRC" >&2
  exit 1
fi

mv "$SRC" "$DEST"
echo "Disabled: $SRC -> $DEST"
echo "Re-enable: mv \"$DEST\" \"$SRC\""
