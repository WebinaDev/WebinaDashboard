# Module Repository Runbook (Dashboard View)

## Goal

Dashboard is runtime-only. Module build/template/release tooling lives in CRM and module repositories.

## 1) Package release ZIP

ZIP root must include:

- `manifest.json`
- `bootstrap.php`
- `includes/`
- `client/dist/module.js`

Build and packaging are handled in module repository CI and CRM release pipeline.

## 2) Publish in Gitea/CRM

1. Push module repo and create release.
2. Register module in CRM catalog with:
   - `slug`
   - `version`
   - `package_source=gitea`
   - `gitea_owner`, `gitea_repo`
3. Mark pricing/entitlements as needed.

## 3) Customer install flow

1. Dashboard requests CRM download token.
2. ZIP downloads and installs into external `Modules/{slug}`.
3. Core validates package and marks module installed/active.
4. Module routes/settings appear from manifest.

## 4) Upgrade flow

1. Publish new release ZIP in module repo.
2. Update CRM release metadata.
3. Customer installs update from marketplace (no dashboard core update needed).

For full authoring/build/release details, see `webinocrm/docs/module-release-pipeline.md`.
