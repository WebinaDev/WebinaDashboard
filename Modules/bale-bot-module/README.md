# ماژول Bale Bot

## معرفی
این ماژول زیرساخت مدیریت ربات فروشگاهی (به‌صورت اصلی برای Bale و با context مشترک برای Telegram) را داخل داشبورد فعال می‌کند.

## امکانات
- داشبورد آماری ربات (کاربران لینک‌شده، سفارش‌ها، وضعیت فعالیت)
- مدیریت کاربران ربات و ایمپورت لیست هدف
- اجرای Broadcast و لغو Broadcast در حال اجرا
- مدیریت کمپین‌های پیام‌رسانی
- مشاهده لاگ‌های فعالیت ربات
- مدیریت تنظیمات و webhook از داخل داشبورد

## معماری و اجزای اصلی
- REST مرکزی: `includes/class-webino-dashboard-rest-bots.php`
- لودر ماژول: `includes/class-webino-dashboard-bots-loader.php`
- context provider: `includes/class-webino-dashboard-bots-rest-context.php`
- صفحات UI:
  - `client/pages/bots/BaleBotDashboardPage.tsx`
  - `client/pages/marketing/BotBroadcastPage.tsx`
  - `client/pages/marketing/BotCampaignsPage.tsx`

## مسیرهای کلیدی
- `manifest.json`
- `bootstrap.php`
- `includes/`
- `client/module-entry.tsx`
- `engine/`

## تنظیمات و پیش‌نیازها
- نیازمند فعال بودن Dashboard و WooCommerce
- دسترسی مدیریت با capability سطح فروشگاه
- تنظیم token/webhook در صفحه تنظیمات ماژول

## مسیرهای REST مهم
- `GET /wp-json/webino-dashboard/v1/bots/{provider}/dashboard-stats`
- `GET /wp-json/webino-dashboard/v1/bots/{provider}/users`
- `POST /wp-json/webino-dashboard/v1/bots/{provider}/users/import`
- `GET /wp-json/webino-dashboard/v1/bots/{provider}/broadcast`
- `POST /wp-json/webino-dashboard/v1/bots/{provider}/broadcast/start`
- `POST /wp-json/webino-dashboard/v1/bots/{provider}/broadcast/cancel`
- `GET|POST /wp-json/webino-dashboard/v1/bots/{provider}/campaigns`
- `GET|POST|PUT|PATCH /wp-json/webino-dashboard/v1/bots/{provider}/settings`
- `GET /wp-json/webino-dashboard/v1/bots/{provider}/logs`
- `POST /wp-json/webino-dashboard/v1/bots/{provider}/set-webhook`
- `POST /wp-json/webino-dashboard/v1/bots/{provider}/delete-webhook`

## عیب‌یابی سریع
- اگر webhook کار نمی‌کند، ابتدا `webhook-urls` و secret را بررسی کنید.
- اگر ارسال‌ها صف می‌شوند ولی اجرا نمی‌شوند، وضعیت queue/campaign را در لاگ‌ها چک کنید.
- اگر پنل کمپین خالی است، دسترسی feature plan را بررسی کنید.

## نکات امنیتی
- secretها در UI باید masked باشند.
- endpointهای مدیریتی باید فقط با دسترسی ادمین فروشگاه در دسترس باشند.
