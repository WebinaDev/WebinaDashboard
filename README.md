# WebinoDashboard

## معرفی
`WebinoDashboard` داشبورد مستقل مشتری در مسیر `/dashboard` است که خارج از `wp-admin` کار می‌کند و مدیریت فروشگاه/محتوا/کاربران/ماژول‌ها را به‌صورت SPA ارائه می‌دهد.

## مسئولیت در معماری سه‌ریپویی
- این ریپو فقط **runtime dashboard** است.
- تولید، انتشار و مدیریت پکیج ماژول‌ها در CRM انجام می‌شود.
- داشبورد فقط از Marketplace نصب/فعال‌سازی/غیرفعال‌سازی/حذف انجام می‌دهد.

## امکانات اصلی
- داشبورد SPA با i18n، RTL/LTR، تم روشن/تیره، فول‌اسکرین و accent
- مدیریت فروشگاه (محصول، سفارش، گزارش سفارش، کوپن)
- مدیریت محتوا (نوشته، برگه، رسانه)، کاربران و دیدگاه‌ها
- بارگذاری ماژول‌های خارجی بر اساس `manifest.json` (manifest-driven)
- Marketplace runtime برای نصب/حذف/فعال‌سازی ماژول‌ها
- آپدیت هسته Dashboard از Marketplace (CRM ZIP) با rollback

## معماری و اجزای کلیدی
- entry plugin: `webino-dashboard.php`
- REST اصلی: `includes/class-webino-dashboard-rest.php`
- Marketplace REST: `includes/class-webino-dashboard-rest-marketplace.php`
- Core updater: `includes/class-webino-dashboard-core-updater.php`
- Core update REST: `includes/class-webino-dashboard-rest-core-update.php`
- module registry: `includes/class-webino-dashboard-module-registry.php`
- client routes: `client/src/routes/routes.config.tsx`

## مسیرهای REST مهم
- Bootstrap/Settings:
  - `GET /wp-json/webino-dashboard/v1/bootstrap`
  - `GET|POST /wp-json/webino-dashboard/v1/settings`
- Marketplace:
  - `GET /wp-json/webino-dashboard/v1/marketplace/catalog`
  - `GET /wp-json/webino-dashboard/v1/marketplace/installed`
  - `POST /wp-json/webino-dashboard/v1/marketplace/install/{slug}`
  - `POST /wp-json/webino-dashboard/v1/marketplace/toggle/{slug}`
  - `POST /wp-json/webino-dashboard/v1/marketplace/uninstall/{slug}`
- Core update:
  - `GET /wp-json/webino-dashboard/v1/core/update-status`
  - `POST /wp-json/webino-dashboard/v1/core/update`

## Core Update Flow
1. بررسی نسخه جدید با `core/update-status`
2. دریافت download token از CRM
3. دانلود ZIP و extract در staging
4. اعتبارسنجی package + نسخه
5. backup از پلاگین فعلی
6. کپی هسته جدید، clear cache، flush rewrite
7. rollback خودکار در صورت خطا

## License webhook (CRM)
CRM می‌تواند پس از فعال‌سازی/تمدید لایسنس، داشبورد را مطلع کند:

- `POST /wp-admin/admin-ajax.php?action=maneli_license_webhook`
- پارامترهای لازم: `domain` (باید با `home_url()` سایت مطابقت داشته باشد)، `action_type`
- اختیاری (توصیه production): هدر `X-Webino-Webhook-Secret` وقتی در `wp-config.php` تعریف شده:
  - `define('WEBINO_DASHBOARD_LICENSE_WEBHOOK_SECRET', '...');`
  - CRM متناظر: `WEBINOCRM_LICENSE_WEBHOOK_SECRET` در webinocrm

در [`includes/class-webino-dashboard-license.php`](includes/class-webino-dashboard-license.php) این درخواست فقط `remote_license_check()` outbound را اجرا می‌کند (بدون اعتماد به body برای state). endpoint داخلی `webino_dashboard_license_webhook` فقط با فیلتر `webino_dashboard_license_webhook_enabled` فعال می‌شود.

## Build و انتشار

### دستی (توصیه‌شده برای release)
```bash
cd client && npm ci && npm run build
bash scripts/extract-php-i18n.sh    # استخراج رشته‌های PHP به languages/*.po
bash scripts/compile-languages.sh    # ساخت languages/*.mo (نیاز به gettext)
bash scripts/verify-dashboard-build.sh
bash scripts/build-release-zip.sh
bash scripts/smoke-all.sh            # در monorepo با ../Modules و ../webinocrm
```

### خط لوله UI (فقط محیط توسعه)
از تنظیمات سایت → خط لوله ساخت ریلیز. فقط وقتی یکی از این‌ها برقرار است:
- `WP_DEBUG` فعال
- host محلی (`localhost`, `*.local`, `*.test`)
- `define('WEBINO_DASHBOARD_ALLOW_BUILD_PIPELINE', true);` در `wp-config.php`

گام‌ها: `npm ci` → build کلاینت → verify → ZIP ریلیز → smoke ساختار ماژول.

`scripts/build-all-modules.sh` منسوخ است — ماژول‌ها در ریپوی CRM ساخته می‌شوند.

### CI
GitHub Actions: [`.github/workflows/dashboard-ci.yml`](.github/workflows/dashboard-ci.yml) — `php -l`, build کلاینت، `smoke-all.sh`.

**محدودیت monorepo:** اگر CI فقط ریپوی `WebinoDashboard` را checkout کند، `smoke-modules-structure` و `smoke-core-update` برای `../Modules` و `../webinocrm` skip می‌شوند (warning). برای smoke کامل، sibling repos را در کنار checkout قرار دهید یا workflow را از root `Wordpress/` اجرا کنید.

- خروجی build: `assets/dashboard-build/`
- مستندات: `docs/MODULES.md`, `docs/WOO_CORE_SYNC.md`, `docs/MODULE_REPO_RUNBOOK.md`

## پیش‌نیازها
- WordPress + WooCommerce
- لایسنس فعال برای Marketplace و Core Update
- ارتباط سالم با CRM API

## عیب‌یابی سریع
- اگر ماژول نصب نمی‌شود: قرارداد ZIP (manifest/bootstrap/includes/client dist) را بررسی کنید.
- اگر core update خطا دارد: مجوز `manage_options`، لایسنس و writable بودن مسیر پلاگین را چک کنید.
- اگر route ماژول دیده نمی‌شود: صحت manifest و مسیر client build را بررسی کنید.

## نکات امنیتی
- نصب/آپدیت هسته و ماژول فقط با دسترسی مدیریتی انجام شود.
- pipeline ساخت ریلیز را روی production فعال نکنید مگر با آگاهی کامل.
- package validation و backup/rollback همیشه فعال نگه داشته شود.
