# Webino Shield — hosting notes (Apache / nginx / php-fpm)

## Panic unlock

1. Create `wp-content/webino-shield.disable` (any content) — WAF opens fully.
2. Or use a one-time URL token from Settings → Security diagnostics / WP-CLI:
   `wp webino shield unlock`
3. Remove the disable file when ready to re-enable.

## Layer 0 (optional prepend)

When `waf.layer0_prepend` is enabled, Shield writes `wp-content/webino-shield-waf.php`.

### php-fpm / `.user.ini`

```ini
auto_prepend_file = /absolute/path/to/wp-content/webino-shield-waf.php
```

Path **must** stay under `wp-content`. Never prepend a path outside the site.

### Apache `.htaccess` (PHP module)

```apache
php_value auto_prepend_file "/absolute/path/to/wp-content/webino-shield-waf.php"
```

Prefer `.user.ini` on shared hosts.

## Layer 1 (advanced-cache chain)

Shield **appends** a marker block to `advanced-cache.php` and never replaces an existing cache plugin drop-in. Ensure `WP_CACHE` is true only when your cache plugin expects it.

## Layer 2 (MU-plugin)

`wp-content/mu-plugins/000-webino-shield.php` is written automatically when `waf.layer2_mu` is true.

## CDN (Cloudflare / Arvan)

- Prefer `CF-Connecting-IP` / Arvan real-IP headers only when the edge is trusted (`compat.trust_cf_connecting_ip` / `compat.trust_arvan`).
- Do not enable open `X-Forwarded-For` trust without proxy CIDR allowlist.
- Country Iran is **never** blocked by default profiles.

## Iranian hosts checklist

1. Run first-run wizard → allowlist admin IP.
2. Keep WAF in `learning` for 7 days on new stores.
3. Enable daily scan in low-traffic window (02:00–06:00).
4. Use CRM intel mirror when direct feed URLs are blocked.
5. Confirm checkout + OTP login after enabling enforce mode.

## Multisite

- Tables are blog-prefixed.
- Only Super Admin should network-activate / change network feed sharing.
- Per-site WAF settings remain site-scoped unless `feeds.network_shared` is set.
