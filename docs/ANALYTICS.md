# آمار بومی (Webino Dashboard)

موتور آمار بازدید **داخل افزونه** است (فاز ۱ — parity امکانات **رایگان** WP Statistics). Premium (Data Plus، export، email reports) در فاز بعد.

## IA داشبورد

| بخش | مسیر |
|-----|------|
| مرور کلی | `/dashboard/analytics/overview` |
| بازدیدکنندگان | `/dashboard/analytics/visitors` |
| صفحه‌ها | `/dashboard/analytics/pages` |
| ارجاع‌ها | `/dashboard/analytics/referrals` |
| جغرافیایی | `/dashboard/analytics/geo` |
| دستگاه‌ها | `/dashboard/analytics/devices` |
| تنظیمات | `/dashboard/settings/site/analytics` |

`/dashboard/analytics` → `/dashboard/analytics/overview`  
`/dashboard/analytics/bots` → `/dashboard/bots/bale` (legacy redirect)

## ردیابی (front-end سایت)

- اسکریپت: `assets/analytics-tracker.js` (با گزینه نام تصادفی برای adblock)
- `POST /wp-json/webino-dashboard/v1/analytics/hit` با توکن `hit_token` از تنظیمات
- بدون کوکی؛ `visitor_hash = SHA256(ip + ua + daily_salt)`
- روی SPA داشبورد (`/dashboard`) enqueue نمی‌شود

## جداول

پیشوند: `wp_webino_dashboard_analytics_`

- `events` — hit خام
- `visitors` — تجمیع per visitor
- `daily_totals`, `page_daily`, `referrer_daily`, `device_daily`, `geo_daily` — rollup روزانه

Cron: `webino_dashboard_analytics_daily` — rollup دیروز + purge بر اساس retention.

## REST (مدیریت)

Capability: `view_woocommerce_reports` (ماژول `analytics` فعال).

- `GET analytics/overview|visitors|pages|referrals|geo|devices|online`
- `GET|POST analytics/settings` — `manage_options`
- `POST analytics/purge-cache` — بازسازی تجمیع
- `GET analytics/summary?days=` — KPI فروش WooCommerce (کارت جدا در مرور کلی)

## GeoIP

1. هدر `CF-IPCountry` (Cloudflare)
2. اختیاری: مسیر فایل GeoLite2 در تنظیمات (نیاز به کتابخانه MaxMind در سرور)

## حریم خصوصی

- anonymize IP (پیش‌فرض روشن)
- exclude roles / IPs / URL patterns
- فیلتر `webino_dashboard_analytics_track_allowed`
