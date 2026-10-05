# ماژول Analytics

## معرفی
این ماژول سیستم آنالیتیکس داخلی داشبورد را برای ثبت رفتار بازدیدکننده و نمایش گزارش‌های تحلیلی در پنل فروشگاه فراهم می‌کند.

## امکانات
- ثبت بازدید صفحات عمومی سایت از طریق endpoint امن `analytics/hit`
- گزارش‌های تفکیکی: نمای کلی، بازدیدکننده‌ها، صفحات، منابع ورودی، جغرافیا، دستگاه‌ها
- نمایش بازدیدکننده‌های آنلاین
- تنظیمات کامل آنالیتیکس (حریم خصوصی، نگه‌داری داده، فیلتر IP/URL/نقش)
- پاک‌سازی کش گزارش‌ها و بازسازی سریع داده‌های تحلیلی

## معماری و اجزای اصلی
- لایه REST: `includes/class-webino-dashboard-rest-analytics.php`
- هسته ماژول: `includes/class-webino-dashboard-analytics.php`
- پردازش و تجمیع: `includes/class-webino-dashboard-analytics-query.php` و `includes/class-webino-dashboard-analytics-cron.php`
- ردیاب سمت سایت: `includes/class-webino-dashboard-analytics-tracker.php`
- UI: `client/pages/AnalyticsShell.tsx`

## مسیرهای کلیدی
- `manifest.json`
- `bootstrap.php`
- `includes/`
- `client/module-entry.tsx`
- `client/pages/AnalyticsShell.tsx`

## تنظیمات و پیش‌نیازها
- نیازمند فعال بودن Dashboard
- دسترسی مشاهده گزارش‌ها با capabilityهای گزارش/مدیریت
- تنظیم مسیرهای داشبورد از بخش تنظیمات سایت

## مسیرهای REST مهم
- `POST /wp-json/webino-dashboard/v1/analytics/hit`
- `GET /wp-json/webino-dashboard/v1/analytics/overview`
- `GET /wp-json/webino-dashboard/v1/analytics/visitors`
- `GET /wp-json/webino-dashboard/v1/analytics/pages`
- `GET /wp-json/webino-dashboard/v1/analytics/referrals`
- `GET /wp-json/webino-dashboard/v1/analytics/geo`
- `GET /wp-json/webino-dashboard/v1/analytics/devices`
- `GET /wp-json/webino-dashboard/v1/analytics/online`
- `GET|POST /wp-json/webino-dashboard/v1/analytics/settings`
- `POST /wp-json/webino-dashboard/v1/analytics/purge-cache`

## عیب‌یابی سریع
- اگر داده جدید نمایش داده نمی‌شود، کش را purge کنید.
- اگر hit ثبت نمی‌شود، بررسی کنید ردیاب در صفحات عمومی enqueue شده باشد.
- اگر نمودارها خالی هستند، فیلترهای IP/URL یا role exclusion را بازبینی کنید.

## نکات امنیتی
- پیشنهاد می‌شود ناشناس‌سازی IP فعال باشد.
- endpoint ثبت hit باید فقط برای سناریوی tracker استفاده شود و abuse مانیتور شود.
