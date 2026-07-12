#!/usr/bin/env bash
# Build client/dist/module.js for every marketplace module in the monorepo.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

SLUGS=(
  analytics-module
  bale-bot-module
  basalam-module
  digikala-sellers-module
  digipay-upg-module
  sms-panel-module
  snapppay-gateway-module
  telegram-bot-module
  torobpay-gateway-module
  torob-products-extractor-module
  wfcp-module
  zarinpal-gateway-module
)

for slug in "${SLUGS[@]}"; do
  bash "$ROOT/scripts/build-module-client.sh" "$slug"
done

echo "== All module clients built =="
