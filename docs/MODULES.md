# Dashboard extension modules (`Modules/`)

All dashboard modules live **inside** the WebinoDashboard plugin tree.

```text
wp-content/plugins/
  WebinaDashboard/           # Core plugin
    Modules/                 # Extension modules (bundled / marketplace-installed)
      {slug}/
        manifest.json
        bootstrap.php
        includes/
        client/dist/module.js
```

## Runtime contract

1. Core resolves module path from `WEBINO_MODULES_DIR` (= `WEBINO_DASHBOARD_DIR . 'Modules/'`, filter: `webino_dashboard_modules_dir`).
2. Marketplace installer extracts package into `WebinaDashboard/Modules/{slug}/`.
3. Core validates package (`manifest.json`, manifest bootstrap path, `includes/`; `client.entry` when `client.routes` is non-empty).
4. On `init`, active module `bootstrap.php` files are loaded.
5. Sidebar/settings/routes are injected from manifest only.
6. Core updates copy the plugin tree but **skip overwriting** existing `Modules/{slug}/` installs.

## Package contract for each module ZIP

- `manifest.json` (required)
- `bootstrap` path from manifest (default `bootstrap.php`)
- `includes/` (required for PHP services)
- `client/dist/module.js` when `client.routes` is non-empty

## Building a module client

From `WebinaDashboard/`:

```bash
bash scripts/build-module-client.sh wfcp-module
```

Output: `Modules/{slug}/client/dist/module.js`
