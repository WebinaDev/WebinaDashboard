# ماژول Telegram Bot

## معرفی
این ماژول ربات فروشگاهی تلگرام را در کنار داشبورد فعال می‌کند و امکانات مدیریت پیام، کمپین، کاربران لینک‌شده و webhook را ارائه می‌دهد.

## امکانات
- داشبورد مدیریت ربات تلگرام در مسیر تنظیمات بات‌ها
- مدیریت کاربران ربات، ارسال Broadcast و کمپین
- دریافت و پردازش webhook تلگرام با fallback سازگار
- endpoint سلامت (health) برای مانیتورینگ سرویس
- لاگ فعالیت و کنترل خطاهای صف ارسال
- یکپارچگی با WooCommerce برای رویداد سفارش/سبد خرید

## معماری و اجزای اصلی
- لودر: `includes/class-webino-dashboard-telegram-bot-loader.php`
- هسته ربات: `engine/Core/Plugin.php`
- API: `engine/Api/WebhookController.php`, `engine/Api/HealthController.php`
- پیام‌رسانی/صف: `engine/Messaging/`
- UI: `client/pages/bots/TelegramBotDashboardPage.tsx`

## مسیرهای کلیدی
- `manifest.json`
- `bootstrap.php`
- `includes/`
- `engine/`
- `client/module-entry.tsx`

## تنظیمات و پیش‌نیازها
- نیازمند WooCommerce فعال
- نیازمند تنظیم token و webhook secret
- دسترسی مدیریت با capability فروشگاه

## مسیرهای REST مهم
- `POST /wp-json/webino-dashboard/v1/bots/telegram/webhook`
- `GET /wp-json/webino-dashboard/v1/bots/telegram/health`
- مسیرهای مدیریتی مشترک بات:
  - `GET /bots/telegram/dashboard-stats`
  - `GET /bots/telegram/users`
  - `POST /bots/telegram/broadcast/start`
  - `GET|POST /bots/telegram/campaigns`
  - `GET|POST /bots/telegram/settings`

## عیب‌یابی سریع
- اگر webhook اجرا نمی‌شود، token/secret و URL ثبت‌شده را بررسی کنید.
- اگر health خطا می‌دهد، plugin boot و وابستگی WooCommerce را چک کنید.
- اگر ارسال‌ها عقب می‌مانند، صف پیام و لاگ retry را مانیتور کنید.

## نکات امنیتی
- فعال‌سازی secret validation برای webhook توصیه می‌شود.
- endpoint health باید با token محافظت شود.
