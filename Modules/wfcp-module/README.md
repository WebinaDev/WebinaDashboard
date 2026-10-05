# ماژول WFCP

## معرفی
ماژول WFCP موتور قیمت‌گذاری پیشرفته ووکامرس را داخل داشبورد وبینا یکپارچه می‌کند و ابزارهای سریع مدیریت قیمت/موجودی را در اختیار تیم فروش قرار می‌دهد.

## امکانات
- Quick Add محصول با ساخت سریع SKU/قیمت
- Bulk Editor برای ویرایش گروهی قیمت خرید، قیمت فروش، موجودی و برچسب‌ها
- Price Changer با اجرای jobهای تغییر قیمت
- تنظیمات کامل بخش‌های pricing/currency/exchange
- export/import تنظیمات
- عملیات نگه‌داری: recalculation و پاک‌سازی transientها

## معماری و اجزای اصلی
- لودر: `includes/class-webino-dashboard-wfcp-loader.php`
- REST: `includes/class-webino-dashboard-rest-wfcp.php`
- هسته WFCP: `engine/includes/`
- UI:
  - `client/pages/wfcp/WfcpQuickAddPage.tsx`
  - `client/pages/wfcp/WfcpBulkEditorPage.tsx`
  - `client/pages/wfcp/WfcpPriceChangerPage.tsx`

## مسیرهای کلیدی
- `manifest.json`
- `bootstrap.php`
- `includes/`
- `engine/`
- `client/module-entry.tsx`

## تنظیمات و پیش‌نیازها
- نیازمند WooCommerce
- اگر پلاگین standalone WFCP فعال باشد، این ماژول از double-load جلوگیری می‌کند
- دسترسی endpointها بر اساس capability و flagهای ماژول کنترل می‌شود

## مسیرهای REST مهم
- `GET /wp-json/webino-dashboard/v1/wfcp/lookup`
- `GET /wp-json/webino-dashboard/v1/wfcp/settings`
- `POST|PATCH /wp-json/webino-dashboard/v1/wfcp/settings/{section}`
- `POST /wp-json/webino-dashboard/v1/wfcp/quick-add`
- `GET /wp-json/webino-dashboard/v1/wfcp/bulk-products`
- `PATCH /wp-json/webino-dashboard/v1/wfcp/bulk-products/{id}/purchase-price`
- `PATCH /wp-json/webino-dashboard/v1/wfcp/bulk-products/{id}/wc-price`
- `PATCH /wp-json/webino-dashboard/v1/wfcp/bulk-products/{id}/stock`
- `POST /wp-json/webino-dashboard/v1/wfcp/bulk-price-change/start`
- `GET /wp-json/webino-dashboard/v1/wfcp/bulk-price-change/state`

## عیب‌یابی سریع
- اگر bulk job شروع نمی‌شود، lock/state endpoint را بررسی کنید.
- اگر قیمت نهایی اشتباه است، exchange source و ruleهای calculation را بازبینی کنید.
- اگر endpointها 403 می‌دهند، وضعیت module flag و capability کاربر را چک کنید.

## نکات امنیتی
- عملیات batch فقط برای نقش‌های مجاز فعال باشد.
- import تنظیمات قبل از اجرا در محیط production نسخه پشتیبان داشته باشد.
