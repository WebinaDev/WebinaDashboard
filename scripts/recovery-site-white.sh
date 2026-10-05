#!/usr/bin/env bash
# Emergency recovery when storefront/dashboard return blank 200 responses.
# Run ON THE SERVER (SSH), from WordPress root (parent of wp-content/).
set -euo pipefail

WP_ROOT="${1:-.}"
cd "$WP_ROOT"

echo "== Webino emergency recovery =="

# 1. Remove runaway debug log (prior builds wrote on every PDP render).
LOG="wp-content/uploads/webino-debug-ff9619.log"
if [[ -f "$LOG" ]]; then
  SIZE=$(stat -c%s "$LOG" 2>/dev/null || stat -f%z "$LOG")
  echo "Deleting $LOG (${SIZE} bytes)"
  rm -f "$LOG"
else
  echo "No debug log at $LOG"
fi

# 2. Optional: disable plugin until fixed build is uploaded.
# mv wp-content/plugins/WebinaDashboard wp-content/plugins/WebinoDashboard.off

echo ""
echo "Next steps:"
echo "  1. Upload webino-dashboard-0.7.42.zip (or newer)"
echo "  2. LiteSpeed Cache → Purge All (or: wp litespeed-purge all)"
echo "  3. Restart PHP-FPM: sudo systemctl restart php*-fpm || sudo service php-fpm restart"
echo "  4. Hard refresh browser / incognito test"
