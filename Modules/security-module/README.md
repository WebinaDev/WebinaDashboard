# Webino Shield (`security-module`)

Webino Shield is the Webina Dashboard security module — layered WAF, site scanning, heal/rollback, threat feeds, and admin tools.

## Layout

```
security-module/
  manifest.json
  bootstrap.php
  includes/          # PHP classes (facade, REST, WAF, scanner, heal, …)
  engine/            # L0 prepend bootstrap (no full WP)
  uninstall.php
```

## Capabilities

| Capability | Purpose |
|------------|---------|
| `webino_view_security` | Overview, reports, findings (read) |
| `webino_manage_security` | Firewall, scan, settings, tools |
| `webino_heal_security` | Quarantine, heal, rollback |

Administrators receive all three on bootstrap. Optionally grant `webino_view_security` to `shop_manager` via settings.

## REST API

Base: `/wp-json/webino-dashboard/v1/security/`

Key routes: `overview`, `settings`, `diagnostics`, `firewall/*`, `scan`, `findings`, `heal/*`, `feeds`, `tools/{tool}`, `reports`, `audit`, `incidents`, `unlock`.

## Panic / unlock

If the WAF locks you out:

1. **Disable file** — create `wp-content/webino-shield.disable` (empty file). WAF passes all traffic.
2. **Unlock URL** — `POST /security/unlock` with a one-time token from `Webino_Dashboard_Security_Install::generate_unlock_token()`.
3. **WP-CLI** — `wp webino shield unlock`

## WAF layers

| Layer | Mechanism |
|-------|-----------|
| L0 | `engine/bootstrap-lite.php` + optional prepend |
| L2 | MU-plugin `000-webino-shield.php` |
| L3 | Module hooks (`Webino_Shield_Waf`) |

Runtime rules: `wp-content/uploads/webino-shield/runtime-waf.json` (compiled from DB + settings).

## WP-CLI

```bash
wp webino shield status
wp webino shield unlock
wp webino shield waf mode enforce|learning|off
wp webino shield block ip 1.2.3.4 --minutes=30
wp webino shield allow ip 1.2.3.4
wp webino shield scan --profile=quick
wp webino shield heal apply --finding=123 --yes
wp webino shield feeds sync
wp webino shield export --file=shield.json
```

## Phases (implementation map)

| Phase | Scope |
|-------|--------|
| 0 | Module shell, DB, settings, overview/diagnostics REST |
| 1–4 | WAF, login, rate limit, blocklist, rules, feeds |
| 5–7 | Scanner, malware, heal, reports |
| 8–10 | 2FA, canary, forensics, tools, self-guard, CLI |

This package implements Phases 0–10 backend (PHP). Client UI lives under `client/` (build separately).

## Uninstall

If `general.uninstall_wipe` is enabled in settings, `uninstall.php` drops Shield tables and options. Default is **keep data**.

## Options

- Settings: `webino_dashboard_security`
- DB schema: `webino_dashboard_security_db_version`

## Tables

Prefix: `{wpdb_prefix}webino_shield_*` (events, blocks, scans, findings, quarantine, feeds, audit, …).

See [SECURITY-MODULE.md](../../docs/SECURITY-MODULE.md) for the full specification.
See [SECURITY-HOSTING.md](../../docs/SECURITY-HOSTING.md) for Apache/nginx/php-fpm and Iranian host notes.

## Client UI

```bash
bash scripts/build-module-client.sh security-module
```

Routes: `/dashboard/security`, `/firewall`, `/scan`, `/tools`, `/reports`, `/settings`.

