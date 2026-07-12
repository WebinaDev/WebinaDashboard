# Dashboard extension modules (`Modules/`)

All dashboard modules are marketplace packages and are installed independently from core.

```text
wp-content/plugins/
  WebinoDashboard/     # Core plugin
  Modules/             # Installed marketplace modules
    {slug}/
      manifest.json
      bootstrap.php
      includes/
      client/dist/module.js
```

## Runtime contract

1. Core resolves module path from `WEBINO_MODULES_DIR` (filter: `webino_dashboard_modules_dir`).
2. Marketplace installer extracts package into `Modules/{slug}/`.
3. Core validates package (`manifest.json`, manifest bootstrap path, `includes/`; `client.entry` when `client.routes` is non-empty).
4. On `plugins_loaded`, active module `bootstrap.php` files are loaded.
5. Sidebar/settings/routes are injected from manifest only.

No dashboard core update is required to install future modules, as long as packages follow this contract.

## Package contract for each module ZIP

- `manifest.json` (required)
- `bootstrap` path from manifest (default `bootstrap.php`)
- `includes/` (required for PHP services)
- `client.entry` (default `client/dist/module.js`) — **required only when** `client.routes` is non-empty

CRM `validate_zip_contract()` mirrors Dashboard `module_package_is_complete()` using manifest-aware paths.

Gateway modules that bundle licensed WooCommerce upstream code may declare `vendor.required_paths` in `manifest.json`. CRM enforces those paths at publish time; runtime bootstraps load from `vendor/` or defer to an active standalone plugin in `wp-content/plugins/`.

ZIP can have either:
- files at archive root, or
- one top-level folder (core flattens it automatically).

## SPA client bundle contract

- `client/module-entry.tsx` exports `default: { routes, components? }` where **`routes` is a `Record<string, ComponentType>`**.
- Each **key must exactly match** `manifest.json` → `client.routes[].path` (no leading slash; registry uses `ltrim('/')`).
- Parameterized routes use React Router patterns in the key (e.g. `analytics-module/:section`, `settings/wfcp-module/:tab`).
- Dashboard loads bundles dynamically via `client/dist/module.js` and registers routes from bootstrap `activeModuleClients`.

Array-shaped `routes` exports are normalized at runtime but **must not** be used in new modules.

## Build module clients (monorepo)

From `WebinoDashboard/`:

```bash
cd client && npm install   # or npm ci when lockfile present
bash scripts/build-module-client.sh wfcp-module
bash scripts/build-all-module-clients.sh
```

Output: `../Modules/{slug}/client/dist/module.js`

## Shared tooling

- Monorepo build: `scripts/build-module-client.sh`, `scripts/build-all-module-clients.sh`, `scripts/module-client-vite.config.mjs`
- Release packaging remains in CRM (`webinocrm/docs/module-release-pipeline.md`).
- `WebinoDashboard/scripts/build-all-modules.sh` is deprecated in three-repo architecture.
- Static validation: `scripts/smoke-module-routes.sh` (manifest ↔ entry ↔ dist, no stubs)

For full onboarding/release flow, see `webinocrm/docs/module-release-pipeline.md`.
