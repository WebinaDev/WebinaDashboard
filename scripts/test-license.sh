#!/usr/bin/env bash
# Smoke-test WebinoERP license Edge (domain + product; HMAC optional).
# Usage: WEBINO_LICENSE_DOMAIN=example.com ./scripts/test-license.sh [check|activate]

set -euo pipefail

DOMAIN="${WEBINO_LICENSE_DOMAIN:-}"
BASE="${WEBINO_LICENSE_BASE:-https://webinaagency.ir}"
PRODUCT="${WEBINO_LICENSE_PRODUCT:-webinodashboard}"
ACTION="${1:-check}"
TS="$(date +%s)"

if [[ -z "$DOMAIN" ]]; then
  echo "Set WEBINO_LICENSE_DOMAIN" >&2
  exit 1
fi

if [[ "$ACTION" != "check" && "$ACTION" != "activate" ]]; then
  echo "Action must be check or activate" >&2
  exit 1
fi

PATH_SEG="api/webinocrm/v1/license/${ACTION}"
BODY="{\"domain\":\"${DOMAIN}\",\"product\":\"${PRODUCT}\",\"ts\":${TS}}"

echo "POST ${BASE}/${PATH_SEG}"
curl -sS -w "\nHTTP %{http_code}\n" -X POST "${BASE}/${PATH_SEG}" \
  -H 'Content-Type: application/json' \
  -d "${BODY}"
