#!/usr/bin/env bash
# Sync client/package.json version from webino-dashboard.php (single source of truth).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION="$(php -r "preg_match(\"/define\\s*\\(\\s*'WEBINO_DASHBOARD_VERSION'\\s*,\\s*'([^']+)'/\", file_get_contents('$ROOT/webino-dashboard.php'), \$m); echo \$m[1] ?? '0.0.0';")"

if [[ -z "$VERSION" || "$VERSION" == "0.0.0" ]]; then
  echo "Could not read WEBINO_DASHBOARD_VERSION from webino-dashboard.php" >&2
  exit 1
fi

node -e "
const fs = require('fs');
const path = process.argv[1];
const version = process.argv[2];
const pkg = JSON.parse(fs.readFileSync(path, 'utf8'));
pkg.version = version;
fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + '\n');
" "$ROOT/client/package.json" "$VERSION"

echo "Synced client/package.json -> $VERSION"
