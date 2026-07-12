# ربات‌های بله و تلگرام (داخل Webino Dashboard)

## منبع کد

منطق ربات از افزونهٔ **[WooBale](https://github.com/)** (مسیر جدا در ریپوی `woobale`) به ماژول‌های داشبورد منتقل شده است:

- `Modules/bale-bot-module/engine/` — namespace `Webino_Dashboard_Bots_Bale\`، API بله: `https://tapi.bale.ai/bot{TOKEN}/…`
- `Modules/telegram-bot-module/engine/` — namespace `Webino_Dashboard_Bots_Telegram\`، API تلگرام: `https://api.telegram.org/bot{TOKEN}/…`

لودر مشترک REST و migration: `Modules/bale-bot-module/includes/` (`Webino_Dashboard_Bots_Loader`, `Webino_Dashboard_REST_Bots`). bootstrap هر ماژول از `manifest.json` + `bootstrap.php` توسط `Webino_Dashboard_Module_Registry` اجرا می‌شود.

تنظیمات در optionهای جدا ذخیره می‌شوند: `webino_dashboard_bale_bot_settings` و `webino_dashboard_telegram_bot_settings`.

جدول سشن مشترک: `wp_webino_dashboard_bot_sessions` با ستون `provider` (`bale` | `telegram`).

## کمپین و مخاطبین واردشده (جداسازی داده)

- کمپین‌های ذخیره‌شدهٔ قدیمی تحت `woobale_campaign_*` در صورت **نبودن** افزونهٔ standalone WooBale، یک‌بار به optionهای جدا مهاجرت می‌کنند:
  - بله: `webino_dashboard_bale_campaign_items`، `webino_dashboard_bale_campaign_last_id`، هوک `webino_dashboard_bale_campaign_launch`
  - تلگرام: `webino_dashboard_telegram_campaign_items`، …، `webino_dashboard_telegram_campaign_launch`
- مخاطبین CSV (برای کمپین «فقط واردشده») per-provider: `webino_dashboard_bale_imported_user_ids` و `webino_dashboard_telegram_imported_user_ids` (برای بله، در صورت خالی بودن، یک‌بار از `woobale_imported_user_ids` قدیمی خوانده می‌شود).

**هشدار production:** قبل از به‌روزرسانی داشبورد روی سایت زنده، از optionهای کمپین و cron مربوط به `woobale_campaign_launch` بکاپ بگیرید. مهاجرت یک‌بار همهٔ زمان‌بندی‌های `woobale_campaign_launch` را پاک می‌کند و دادهٔ قدیمی را به کلیدهای بله منتقل می‌کند.

**wp-admin (غیر embedded):** فرم ایجاد کمپین برای بله اکشن `webino_dashboard_bale_campaign_create` و برای تلگرام `webino_dashboard_telegram_campaign_create` است تا با هم و با WooBale تداخل نداشته باشد.

## آمار سفارش در REST

شمارش سفارش‌های «از ربات» در هر دو provider فعلاً با متای سفارش ووکامرس **`_woobale_source`** انجام می‌شود؛ تفکیک آماری فقط-تلگرام / فقط-بله در این نسخه وارد نشده است.

## وب‌هوک و سلامت (REST)

| Provider | Webhook | Health |
|----------|---------|--------|
| Bale | `POST /wp-json/webino-dashboard/v1/bots/bale/webhook` | `GET …/bots/bale/health?token=…` |
| Telegram | `POST …/bots/telegram/webhook` | `GET …/bots/telegram/health?token=…` |

هدر اختیاری امنیتی: `X-Telegram-Bot-Api-Secret-Token` باید با `webhook_secret` ذخیره‌شده در تنظیمات یکی باشد (همان رفتار WooBale).

## داشبورد SPA

ماژول **ربات‌ها** در سایدبار (دو آیتم جدا: بله / تلگرام). مسیرهای جدید:

| قابلیت | مسیر |
|--------|------|
| داشبورد بله | `/dashboard/bots/bale` |
| داشبورد تلگرام | `/dashboard/bots/telegram` |
| تنظیمات ربات | `/dashboard/settings/site/bots?provider=bale\|telegram` |
| کاربران متصل + CSV | `/dashboard/users/list?bot=bale\|telegram` |
| پیام همگانی | `/dashboard/marketing/bot-broadcast?provider=…` |
| کمپین‌ها | `/dashboard/marketing/bot-campaigns?provider=…` |
| لاگ سیستم | `/dashboard/settings/site/system-logs?provider=…` |

**Redirectهای قدیمی** (bookmark): `/dashboard/shop/bots/{provider}/{tab}` → مسیرهای بالا (مثلاً `…/dashboard` → `/bots/bale`، `…/settings` → تنظیمات سایت، و غیره).

## REST مدیریت

همه با `manage_woocommerce`، هدر `X-WP-Nonce`، و **ماژول فعال** (`bale-bot` | `telegram-bot`)؛ در غیر این صورت **403**.

پایه: `…/wp-json/webino-dashboard/v1/bots/{bale|telegram}/…`

| Method | Path | توضیح |
|--------|------|--------|
| GET | `…/dashboard-stats` | آمار داشبورد، سفارشات اخیر، کاربران اخیر |
| GET | `…/users?page=&search=` | کاربران با `chat_id` غیرخالی؛ صفحه ۳۰تایی؛ `total_users` = تعداد مطابق **همان** فیلتر جستجو |
| POST | `…/users/import` | `multipart/form-data`، فیلد فایل: `contacts_csv` (نیاز به طرح پیشرفته برای campaigns) |
| GET | `…/broadcast` | وضعیت job + پرچم‌های قابلیت |
| POST | `…/broadcast/start` | JSON: `type`, `text`, `media` (رسانه در طرح پیشرفته) |
| POST | `…/broadcast/cancel` | لغو job |
| GET | `…/logs?from=&to=&channel=` | timestamp یونیکس اختیاری برای from/to |
| GET | `…/campaigns` | `{ enabled, items }` — اگر طرح پایه، `enabled: false` |
| POST | `…/campaigns` | JSON: `name`, `scheduled_at` (unix), `type`, `text`, `media`, `audience` (`all` \| `imported`) |
| GET\|POST | `…/settings` | POST با sanitize همان `SettingsPage` (تمام فیلدهای تنظیمات) |
| GET | `…/webhook-urls` | آدرس وب‌هوک REST و health |
| POST | `…/set-webhook` | ثبت وب‌هوک |
| POST | `…/delete-webhook` | حذف وب‌هوک |

**Polling پیام همگانی:** SPA هر چند ثانیه `GET …/broadcast` را وقتی `job.active` است صدا می‌زند.

## تداخل با WooBale

اگر افزونهٔ **WooBale** (`woobale/woobale.php`) فعال باشد، **موتور تعبیه‌شدهٔ بله در داشبورد لود نمی‌شود** تا هوک و REST تکراری نداشته باشید. ربات **تلگرام** همچنان از داشبورد لود می‌شود. **مهاجرت option کمپین** در این حالت اجرا نمی‌شود تا دادهٔ WooBale دست نخورد.

از **یک توکن روی دو وب‌هوک** (مثلاً همزمان WooBale و داشبورد) خودداری کنید.

## QA چک‌لیست

1. ووکامرس فعال؛ ماژول‌های «Bale bot» و «Telegram bot» در تنظیمات داشبورد روشن باشند.
2. هر provider: داشبورد (`/bots/…`)، تنظیمات (`/settings/site/bots`)، کاربران (`/users/list?bot=`)، همگانی/کمپین (بازاریابی)، لاگ (`/settings/site/system-logs`).
3. توکن را در تب تنظیمات ذخیره کنید؛ «ثبت وب‌هوک» را بزنید؛ از پنل بله/تلگرام یک پیام تست بفرستید.
4. با **خاموش کردن** هر ماژول، همهٔ `GET/POST …/bots/{bale|telegram}/…` مدیریتی (به‌جز وب‌هوک دریافت پیام در مسیر عمومی webhook) باید **403** شوند.
5. طرح پایه: `POST …/users/import` و `POST …/campaigns` و رسانه در broadcast باید رد شوند یا غیرفعال در UI باشند.
