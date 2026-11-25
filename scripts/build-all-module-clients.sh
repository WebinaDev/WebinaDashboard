#!/usr/bin/env bash
# Build client/dist/module.js for every marketplace module in the monorepo.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

SLUGS=(
  # Keep in sync with scripts/module-client-vite.config.mjs MODULE_SLUGS.
  # scripts/verify-module-build-matrix.mjs fails the build when this drifts.
  ai-content-module
  analytics-module
  bale-bot-module
  basalam-module
  digikala-sellers-module
  digipay-upg-module
  sms-panel-module
  snapppay-gateway-module
  snapppay-search-module
  telegram-bot-module
  torobpay-gateway-module
  torob-products-extractor-module
  torob-connector-module
  wfcp-module
  zarinpal-gateway-module
  coffee-profile-module
  bale-pay-gateway-module
  card-to-card-gateway-module
  wallet-gateway-module
  emalls-module
  snappshop-module
  tapsishop-module
  technolife-module
  zarehbin-module
  accounting-module
  product-catalog-module
  security-module
  shipping-module
  tapin-module
)

for slug in "${SLUGS[@]}"; do
  bash "$ROOT/scripts/build-module-client.sh" "$slug"
done

echo "== All module clients built =="
