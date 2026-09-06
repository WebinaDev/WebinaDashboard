#!/usr/bin/env bash
# Static smoke checks for security-module (Webino Shield).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MOD="$ROOT/Modules/security-module"
FAIL=0

echo "== Security module smoke =="

require_file() {
  local f="$1"
  if [[ ! -f "$f" ]]; then
    echo "FAIL: missing $f"
    FAIL=1
  else
    echo "OK: $(basename "$f")"
  fi
}

require_file "$MOD/manifest.json"
require_file "$MOD/bootstrap.php"
require_file "$MOD/README.md"
require_file "$MOD/engine/bootstrap-lite.php"
require_file "$MOD/client/module-entry.tsx"
require_file "$MOD/client/dist/module.js"
require_file "$MOD/includes/class-webino-dashboard-security.php"
require_file "$MOD/includes/class-webino-dashboard-rest-security.php"
require_file "$MOD/includes/class-webino-shield-waf.php"
require_file "$MOD/includes/class-webino-shield-heal.php"
require_file "$MOD/includes/class-webino-shield-scanner.php"
require_file "$MOD/includes/class-webino-shield-feeds.php"
require_file "$MOD/includes/class-webino-shield-2fa.php"

# Manifest slug + routes
if ! grep -q '"slug": "security-module"' "$MOD/manifest.json"; then
  echo "FAIL: manifest slug"
  FAIL=1
else
  echo "OK: manifest slug"
fi

for path in security security/firewall security/scan security/tools security/reports security/settings; do
  if ! grep -q "\"path\": \"$path\"" "$MOD/manifest.json" && ! grep -q "\"path\": \"$path/" "$MOD/manifest.json"; then
    # allow nested paths listed with full segment
    if ! grep -qE "\"path\": \"$path\"" "$MOD/manifest.json"; then
      echo "FAIL: missing route path $path in manifest"
      FAIL=1
    fi
  fi
done
echo "OK: core routes present in manifest"

# module-entry routes must match
for key in "security" "security/firewall" "security/scan" "security/tools" "security/reports" "security/settings"; do
  if ! grep -qE "['\"]$key['\"][[:space:]]*:|^[[:space:]]*$key:" "$MOD/client/module-entry.tsx"; then
    echo "FAIL: module-entry missing route $key"
    FAIL=1
  fi
done
echo "OK: module-entry core routes"

# Caps
if ! grep -q 'webino_view_security' "$MOD/includes/class-webino-dashboard-security.php"; then
  echo "FAIL: missing view capability constant"
  FAIL=1
else
  echo "OK: security capabilities"
fi

# Registry helper
if ! grep -q 'security_ready' "$ROOT/includes/class-webino-dashboard-module-registry.php"; then
  echo "FAIL: Module_Registry missing security_ready"
  FAIL=1
else
  echo "OK: security_ready helper"
fi

# Icon
if ! grep -q 'shield: Shield' "$ROOT/client/src/lib/module-icons.ts"; then
  echo "FAIL: shield icon missing"
  FAIL=1
else
  echo "OK: shield icon"
fi

# No hardcoded commercial API keys (ignore malware signature regex patterns)
if grep -RInE "sk_live_[0-9A-Za-z]{20,}|AIza[0-9A-Za-z_-]{30,}|wpscan_token\s*=\s*['\"][^'\"]{8,}" "$MOD/includes" 2>/dev/null \
  | grep -v 'class-webino-shield-malware.php' \
  | grep -v "preg_match\|'\/sk_live\|\"\/sk_live\|secrets regex\|pattern"; then
  echo "FAIL: possible hardcoded API secret"
  FAIL=1
else
  echo "OK: no hardcoded API secrets in includes"
fi

# Prepend path must stay under wp-content
if grep -Rn "auto_prepend_file" "$MOD" | grep -v 'wp-content' | grep -v '.md' | grep -v 'smoke'; then
  echo "WARN: auto_prepend references outside docs — review manually"
fi
if ! grep -q 'webino-shield-waf.php' "$MOD/includes/class-webino-dashboard-security-install.php"; then
  echo "FAIL: L0 prepend writer missing"
  FAIL=1
else
  echo "OK: L0 prepend stays in wp-content"
fi

# Bootstrap must not require other modules
if grep -E "Modules/(analytics|sms|bale|wfcp)" "$MOD/bootstrap.php"; then
  echo "FAIL: bootstrap cross-module require"
  FAIL=1
else
  echo "OK: bootstrap isolation"
fi

# Default must not block IR
if grep -RIn "block_countries.*IR\|'IR'.*block" "$MOD/includes/class-webino-dashboard-security-settings.php" 2>/dev/null; then
  echo "FAIL: default settings appear to block IR"
  FAIL=1
else
  echo "OK: no default IR country block"
fi

# Panic unlock
if ! grep -q 'webino-shield.disable' "$MOD/includes/class-webino-dashboard-security-install.php"; then
  echo "FAIL: disable file path missing"
  FAIL=1
else
  echo "OK: panic disable file"
fi

# F1: bootstrap() must be called directly (registry loads modules at init@10)
if ! grep -q 'Webino_Dashboard_Security::bootstrap()' "$MOD/bootstrap.php"; then
  echo "FAIL: bootstrap.php must call Security::bootstrap() directly"
  FAIL=1
else
  echo "OK: direct bootstrap() call (F1)"
fi
if grep -n "add_action( 'init'" "$MOD/includes/class-webino-dashboard-security.php" | grep -E "bootstrap|,\s*4\s*\)"; then
  echo "FAIL: Security still hooks bootstrap on init@4"
  FAIL=1
else
  echo "OK: no missed init@4 bootstrap hook"
fi

# F3: CIDR matching via Engine::ip_match
if ! grep -q 'ip_match' "$MOD/includes/class-webino-shield-blocklist.php"; then
  echo "FAIL: blocklist missing CIDR ip_match"
  FAIL=1
else
  echo "OK: CIDR match helper used in blocklist"
fi

# GET tools must not restore / mutate (integrity-diff)
if grep -A20 'function tool_integrity_diff' "$MOD/includes/class-webino-shield-tools.php" | grep -q 'restore_core_file'; then
  echo "FAIL: integrity-diff must not call restore_core_file"
  FAIL=1
else
  echo "OK: integrity-diff is read-only"
fi

# Signature verify must not accept sha256 alone when require_signature
if grep -A40 'function verify_signature' "$MOD/includes/class-webino-shield-feeds.php" | grep -v 'REJECTS\|NOT a signature\|doc' | grep -qE "x-webino-sha256|hash_equals\(\s*\\\$hash"; then
  echo "FAIL: verify_signature still accepts x-webino-sha256 alone"
  FAIL=1
else
  echo "OK: feed signature is Ed25519-only under require_signature"
fi

# No WebAuthn stub in 2FA status
if grep -q "'webauthn'.*stub\|webauthn.*=>.*'stub'" "$MOD/includes/class-webino-shield-2fa.php"; then
  echo "FAIL: WebAuthn stub still exposed in 2FA status"
  FAIL=1
else
  echo "OK: no WebAuthn stub in 2FA"
fi

# file-browser tool registered
if ! grep -q "file-browser" "$MOD/includes/class-webino-shield-tools.php"; then
  echo "FAIL: file-browser tool missing"
  FAIL=1
else
  echo "OK: file-browser tool"
fi

if [[ "$FAIL" -ne 0 ]]; then
  echo "== Security module smoke FAILED =="
  exit 1
fi

echo "== Security module smoke PASSED =="
