# ماژول Basalam

## معرفی
ماژول Basalam یکپارچه‌سازی کامل باسلام را برای پرداخت، کیف پول، اشتراک‌ها، webhook و عملیات پشتیبانی داخل Dashboard فراهم می‌کند.

## امکانات
- ثبت و مدیریت تنظیمات اتصال باسلام با redaction مقادیر حساس
- درگاه پرداخت ووکامرس (`WC_Gateway_Basalam`) و جریان callback/verify
- نمایش وضعیت عملیاتی (wallet/subscriptions/queue)
- اجرای reconcile دستی از پنل
- registry پوشش endpointها برای پایش میزان پیاده‌سازی
- صف job داخلی و پردازش دوره‌ای برای همگام‌سازی

## معماری و اجزای اصلی
- هسته ماژول: `includes/class-basalam-module.php`
- REST: `includes/class-webino-dashboard-rest-basalam.php`
- سرویس‌ها: `Basalam_Gateway_Service`, `Basalam_Wallet_Service`, `Basalam_Subscriptions_Service`
- صف و پردازش: `includes/class-basalam-jobs.php`
- UI: `client/pages/basalam/BasalamSettingsPage.tsx`

## مسیرهای کلیدی
- `manifest.json`
- `bootstrap.php`
- `includes/`
- `client/module-entry.tsx`

## تنظیمات و پیش‌نیازها
- نیازمند WooCommerce
- نیازمند مقادیر merchant/token و تنظیم sandbox/live
- capability مدیریتی: `manage_woocommerce`

## مسیرهای REST مهم
- `GET|POST /wp-json/webino-dashboard/v1/basalam/settings`
- `GET /wp-json/webino-dashboard/v1/basalam/status`
- `GET /wp-json/webino-dashboard/v1/basalam/coverage/endpoints`
- `POST /wp-json/webino-dashboard/v1/basalam/reconcile`

## سناریوی استفاده روزانه
1. اتصال API را در صفحه تنظیمات انجام دهید.
2. پرداخت تستی ووکامرس را اجرا کنید.
3. وضعیت wallet/subscription را از صفحه عملیات مانیتور کنید.
4. در صورت مغایرت، reconcile دستی را اجرا کنید.

## عیب‌یابی سریع
- اگر callback انجام نمی‌شود، مسیر callback ووکامرس و logها را بررسی کنید.
- اگر status ناقص است، queue و cron minute را بررسی کنید.
- اگر endpoint coverage قدیمی است، کش/transient مربوطه را پاک کنید.

## نکات امنیتی
- secretها باید mask شوند.
- webhookها باید با اعتبارسنجی امضا/secret پردازش شوند.
