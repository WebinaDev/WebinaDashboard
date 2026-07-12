# قرارداد یکپارچگی با Webina Woo Core (WFCP)

## منبع کد داخل WebinoDashboard

کد **webina-woo-core** در ماژول [`Modules/wfcp-module/plugin/`](../../Modules/wfcp-module/plugin/) نگه‌داری می‌شود (vendoring). اگر پلاگین جداگانهٔ `webina-woo-core/webina-woo-core.php` روی سایت **فعال** باشد، نسخهٔ ماژول **لود نمی‌شود** تا تداخل کلاس و هوک پیش نیاید.

وقتی WFCP از ماژول `wfcp-module` لود می‌شود (`Modules/wfcp-module/bootstrap.php`):

- ثابت‌های `WFCP_PLUGIN_DIR` / `WFCP_PLUGIN_URL` به `Modules/wfcp-module/plugin/` اشاره می‌کنند.
- منوهای WFCP از **پیشخوان وردپرس** با `remove_menu_page( 'wfcp-settings' )` حذف می‌شوند؛ مدیریت از طریق **SPA داشبورد** (مسیرهای `/dashboard/settings/wfcp-module/...` و ابزارهای فروشگاه زیر `/dashboard/shop/wfcp-module/...`) انجام می‌شود.

همگام‌سازی با ریپوی upstream **webina-woo-core** اکنون دستی است: بعد از تغییر در آن ریپو، محتوای لازم را به `Modules/wfcp-module/plugin/` کپی کنید و در صورت نیاز نسخه را در `Modules/wfcp-module/manifest.json` یادداشت کنید.

## REST پل ارتباطی

مسیرهای `GET/POST .../webino-dashboard/v1/wfcp-module/*` (کلاس `Webino_Dashboard_REST_WFCP`) تنظیمات و عملیات را به همان `WFCP_Helper`، `WFCP_Admin` (sanitize از طریق Reflection)، سرویس‌های WFCP و گلوبال `wfcp_bulk_price_change` واگذار می‌کنند. اگر ماژول داشبورد مربوطه در تنظیمات کاربر خاموش باشد، این endpointها **403** برمی‌گردانند. منبع حقیقت داده همچنان **optionهای WFCP** و **متای ووکامرس** است.

## اصول باقی‌مانده

1. **منبع حقیقت محصول و سفارش**: دیتابیس وردپرس / ووکامرس. داشبورد از REST یا همان توابع استاندارد WC می‌نویسد.
2. **پرچم قابلیت**: `bootstrap.flags.wfcp` وقتی `class_exists( 'WFCP_Helper' )` باشد true است. اگر WFCP لود نشده، آیتم‌های `requires_wfcp` یا `requires_wfcp-module` در bootstrap حذف می‌شوند.
3. **به‌روزرسانی کد WFCP**: پوشهٔ `Modules/wfcp-module/plugin/` را از منبع upstream به‌روز کنید.

## لایسنس (جدا از inbound CRM)

- **خروجی سایت → CRM**: کلاس `Webino_Dashboard_License` به `https://webina.dev/wp-json/webinocrm/v1/license/check|activate` با بدنهٔ `domain` (hostname از `home_url`، بدون `www`) درخواست می‌زند؛ نتیجه در جدول `wp_webino_dashboard_license` ذخیره می‌شود؛ cron ۱۲ ساعته و فیلترهای `webino_dashboard_license_server_urls` / `webino_dashboard_license_verify_ssl`.
- **ورودی CRM → سایت** (HMAC و مسیرهای داخلی `webino-dashboard/v1/webinocrm/v1/license/*`) همان قرارداد قبلی است و با کلاس لایسنس خروجی اشتباه نشود.

## چک‌لیست QA

1. ووکامرس + WebinoDashboard؛ در صورت عدم نصب پلاگین جدا، WFCP داخل افزونه باید فعال شود و منوی WFCP در wp-admin دیده نشود.
2. `bootstrap.license` و صفحهٔ `/dashboard/license` برای مدیر (`manage_options`) فعال‌سازی/چک از راه دور.
3. ذخیرهٔ تنظیمات از `/dashboard/settings/wfcp-module/...` و مقایسه با `get_option('wfcp_settings')` در دیتابیس.
4. خاموش کردن هر ماژول WFCP در تنظیمات داشبورد و اطمینان از 403 روی REST مربوط.
