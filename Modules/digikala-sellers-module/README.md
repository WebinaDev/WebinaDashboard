# ماژول Digikala Sellers

## معرفی
این ماژول اتصال کامل فروشندگان دیجیکالا به Webino Dashboard را برای همگام‌سازی محصول، موجودی، سفارش، عملیات phase2 و پایش سلامت فراهم می‌کند.

## امکانات
- مدیریت OAuth و نگه‌داری token/scopes
- import/export محصول بین WooCommerce و Digikala
- همگام‌سازی موجودی و سفارش (pull/push)
- job queue دیتابیسی با retry/backoff
- endpoint-level coverage با trace فایل/dispatcher/job_type
- ماتریس webhook و endpoint registry
- health/alerts/logs/jobs dashboard برای عملیات
- reconcile دستی (all/products/orders/inventory)

## معماری و اجزای اصلی
- هسته ماژول: `includes/class-digikala-module.php`
- REST: `includes/class-webino-dashboard-rest-digikala.php`
- صف و لاگ: `includes/class-digikala-jobs.php`
- registry: `includes/class-digikala-endpoint-registry.php`
- UI: `client/pages/digikala/DigikalaSettingsPage.tsx`

## مسیرهای کلیدی
- `manifest.json`
- `bootstrap.php`
- `includes/`
- `client/module-entry.tsx`
- `docs/ENDPOINT_COVERAGE_RUNBOOK.md`

## تنظیمات و پیش‌نیازها
- نیازمند WooCommerce و اعتبارنامه Digikala Open API
- مسیر webhook: `/webino/digikala-webhook/`
- secret اختیاری HMAC: `webhook_secret`

## مسیرهای REST مهم
- `GET|POST /wp-json/webino-dashboard/v1/digikala/settings`
- `POST /wp-json/webino-dashboard/v1/digikala/test-connection`
- `GET /wp-json/webino-dashboard/v1/digikala/scopes`
- `POST /wp-json/webino-dashboard/v1/digikala/sync/products/import`
- `POST /wp-json/webino-dashboard/v1/digikala/sync/products/export`
- `POST /wp-json/webino-dashboard/v1/digikala/sync/inventory`
- `POST /wp-json/webino-dashboard/v1/digikala/sync/orders/pull`
- `POST /wp-json/webino-dashboard/v1/digikala/reconcile`
- `GET /wp-json/webino-dashboard/v1/digikala/jobs`
- `GET /wp-json/webino-dashboard/v1/digikala/logs`
- `GET /wp-json/webino-dashboard/v1/digikala/health`
- `GET /wp-json/webino-dashboard/v1/digikala/coverage/endpoints`

## عیب‌یابی سریع
- اگر sync عقب می‌افتد، جدول jobs و وضعیت retry را بررسی کنید.
- اگر webhook نمی‌رسد، rewrite و secret verification را تست کنید.
- اگر coverage ناقص است، refresh registry و dispatcher mapping را اجرا کنید.
