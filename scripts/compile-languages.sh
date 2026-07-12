#!/usr/bin/env bash
# Compile .po gettext catalogs to .mo (requires gettext msgfmt).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LANG_DIR="$ROOT/languages"

if ! command -v msgfmt >/dev/null 2>&1; then
  echo "msgfmt not found. Install gettext (e.g. apt install gettext)." >&2
  exit 1
fi

echo "== Compiling dashboard gettext catalogs =="

for po in "$LANG_DIR"/webino-dashboard-*.po; do
  [[ -f "$po" ]] || continue
  base="$(basename "$po" .po)"
  mo="$LANG_DIR/${base}.mo"
  msgfmt -o "$mo" "$po"
  echo "OK: $base.mo"
done

echo "== compile-languages PASSED =="
