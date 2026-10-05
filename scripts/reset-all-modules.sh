#!/usr/bin/env bash
# Reset marketplace module state on a WordPress site (run from server with WP root as cwd or pass WP_ROOT).
# Clears webino_dashboard_marketplace_* options and removes installed module directories.
set -euo pipefail

WP_ROOT="${1:-}"
if [[ -z "$WP_ROOT" ]]; then
  echo "Usage: $0 /path/to/wordpress/public_html" >&2
  echo "" >&2
  echo "Manual steps if WP-CLI unavailable:" >&2
  echo "  1. rm -rf wp-content/plugins/WebinaDashboard/Modules/*" >&2
  echo "  2. touch wp-content/plugins/WebinaDashboard/Modules/.gitkeep" >&2
  echo "  3. Delete options matching webino_dashboard_marketplace_% in wp_options" >&2
  exit 1
fi

WD="${WP_ROOT}/wp-content/plugins/WebinaDashboard"
MODULES="${WD}/Modules"
LEGACY_SIBLING="${WP_ROOT}/wp-content/plugins/Modules"

echo "== Webino Dashboard: reset all marketplace modules =="
echo "WP_ROOT: ${WP_ROOT}"
echo ""

if command -v wp >/dev/null 2>&1 && [[ -f "${WP_ROOT}/wp-config.php" ]]; then
  echo "Clearing marketplace options via WP-CLI..."
  wp option list --path="$WP_ROOT" --search='webino_dashboard_marketplace_' --format=csv --fields=option_name 2>/dev/null \
    | tail -n +2 \
    | while IFS= read -r opt; do
        [[ -n "$opt" ]] && wp option delete "$opt" --path="$WP_ROOT" 2>/dev/null || true
      done
else
  echo "WP-CLI not found — delete options manually (webino_dashboard_marketplace_*)."
fi

if [[ -d "$MODULES" ]]; then
  echo "Removing module directories under ${MODULES}..."
  find "$MODULES" -mindepth 1 -maxdepth 1 ! -name '.gitkeep' -exec rm -rf {} +
  touch "$MODULES/.gitkeep"
else
  echo "Modules dir missing — creating empty ${MODULES}"
  mkdir -p "$MODULES"
  touch "$MODULES/.gitkeep"
fi

if [[ -d "$LEGACY_SIBLING" ]]; then
  echo "Removing obsolete sibling Modules at ${LEGACY_SIBLING}..."
  rm -rf "$LEGACY_SIBLING"
fi

echo ""
echo "Done. Verify:"
echo "  - Marketplace should show all modules as not installed"
echo "  - curl -sI https://YOUR-SITE/ | head -1"
if [[ -f "${WD}/scripts/smoke-modules-structure.sh" ]]; then
  echo "  - bash ${WD}/scripts/smoke-modules-structure.sh (on dev machine)"
fi
