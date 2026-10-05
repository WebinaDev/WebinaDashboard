# ماژول SMS Panel

## معرفی
این ماژول پنل پیامکی داشبورد را برای ارسال، گزارش‌گیری، خبرنامه، الگوها، دفترچه تلفن و عملیات شارژ فعال می‌کند.

## امکانات
- داشبورد پیامک (وضعیت حساب، آمار ارسال، گزارش‌ها)
- ارسال پیامک تکی/گروهی، مدیریت پیام‌های زمان‌بندی‌شده
- مدیریت الگوها، شماره‌ها، دفترچه تلفن و پیام‌نویس
- خبرنامه پیامکی (عضوگیری و ارسال)
- جریان شارژ کیف پول/تاپ‌آپ و callback پرداخت
- OTP (ارسال و تایید) و اعلان‌های رویدادهای سفارش/انبار
- Proxy امن به سرویس CRM برای عملیات ModirPayamak

## معماری و اجزای اصلی
- REST: `includes/class-webino-dashboard-rest-modirpayamak.php`
- هسته پیامک: `includes/class-webino-dashboard-sms.php`
- تنظیمات: `includes/class-webino-dashboard-sms-settings.php`
- hookهای سفارش: `includes/class-webino-dashboard-sms-order-hooks.php`
- صفحات UI:
  - `client/pages/sms/SmsPanelDashboardPage.tsx`
  - `client/pages/sms/SmsSendPage.tsx`
  - `client/pages/sms/SmsReportsPage.tsx`
  - `client/pages/sms/SmsTopupPage.tsx`

## مسیرهای کلیدی
- `manifest.json`
- `bootstrap.php`
- `includes/`
- `client/module-entry.tsx`

## تنظیمات و پیش‌نیازها
- نیازمند لایسنس فعال و ارتباط CRM
- capability مدیریتی: `manage_options`
- تنظیم provider/token و mapping الگوها در تنظیمات پیامک

## مسیرهای REST مهم
- `GET /wp-json/webino-dashboard/v1/modirpayamak/admin/dashboard`
- `POST /wp-json/webino-dashboard/v1/modirpayamak/admin/send`
- `GET /wp-json/webino-dashboard/v1/modirpayamak/admin/messages`
- `GET /wp-json/webino-dashboard/v1/modirpayamak/admin/patterns`
- `GET /wp-json/webino-dashboard/v1/modirpayamak/admin/phonebooks`
- `POST /wp-json/webino-dashboard/v1/modirpayamak/admin/orders/notify`
- `POST /wp-json/webino-dashboard/v1/modirpayamak/admin/auth/send-otp`
- `POST /wp-json/webino-dashboard/v1/modirpayamak/admin/auth/verify-otp`

## عیب‌یابی سریع
- اگر API پاسخ نمی‌دهد، اتصال CRM و تنظیمات Gitea/Marketplace را چک کنید.
- اگر اعلان سفارش ارسال نمی‌شود، hookهای سفارش و تنظیم template را بررسی کنید.
- اگر Topup تکمیل نمی‌شود، مسیر callback و وضعیت verify پرداخت را کنترل کنید.

## نکات امنیتی
- tokenها و secretها باید در خروجی API ماسک شوند.
- دسترسی endpointهای مدیریتی فقط برای نقش‌های مجاز فعال باشد.
