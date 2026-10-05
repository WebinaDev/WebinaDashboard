# ماژول Torob Products Extractor

## معرفی
ماژول استخراج محصولات ترب را در Dashboard ثبت می‌کند. کد upstream از `vendor/` داخل ZIP یا نصب standalone بارگذاری می‌شود.

## امکانات
- صفحه تنظیمات extractor در پنل فروشگاه
- REST تنظیمات و وضعیت runtime
- بارگذاری vendor از `vendor/` یا پلاگین standalone

## معماری
- bootstrap: `bootstrap.php`
- vendor loader: `includes/class-torob-extractor-vendor-loader.php`
- config: `includes/class-torob-extractor-config.php`
- REST: `includes/class-webino-dashboard-rest-torob-extractor.php`
- frontend: `client/dist/module.js`

## Vendor bundle
قبل از انتشار ZIP، extractor licensed را در `vendor/` قرار دهید (`vendor/README.md`).

## پیش‌نیازها
- WooCommerce
- `manage_woocommerce`
- مسیر: `/settings/shop/torob-extractor`

## REST
- `GET/POST /wp-json/webino-dashboard/v1/torob-extractor/settings`
- `GET /wp-json/webino-dashboard/v1/torob-extractor/status`
