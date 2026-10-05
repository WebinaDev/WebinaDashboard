# Architecture.md: WP-Fa-Currency-Pro (Advanced Pricing System)

## 1. نمای کلی پروژه (Project Overview)
ما در حال توسعه یک پلاگین پیشرفته ووکامرس برای مدیریت قیمت‌گذاری چند لایه (تکی، اعتباری، اقساطی، عمده) هستیم. این پلاگین باید بر پایه **معماری شیءگرا (OOP)**، استاندارد و ماژولار باشد.

**هدف اصلی:** مدیریت قیمت پایه (خرید/دلار) و محاسبه اتوماتیک قیمت‌های فروش بر اساس فرمول‌های تنظیم شده، به همراه رابط کاربری مدرن (Card View) در ادمین و نمایش باکس‌های فروش در فرانت‌‌اند.

**نکات کلیدی:**
* **زبان:** تمام رابط کاربری (UI) باید **فارسی** باشد.
* **طراحی:** مدرن، فلت، سایه‌دار (مشابه پنل‌های وبینا/تکنولایف).
* **پرفرمنس:** استفاده سنگین از AJAX برای ویرایش گروهی و Transients برای کش کردن محاسبات.

---

## 2. ساختار فایل و دایرکتوری (File Structure)

```text
wp-fa-currency-pro/
├── wp-fa-currency-pro.php           # Bootstrap file
├── includes/
│   ├── class-wfcp-activator.php     # DB setup & Default options
│   ├── class-wfcp-deactivator.php
│   ├── class-wfcp-i18n.php
│   ├── class-wfcp-loader.php        # Hook Orchestrator
│   ├── class-wfcp-main.php          # Main Logic Controller
│   ├── services/
│   │   ├── class-wfcp-calculator.php    # Central Pricing Logic Engine
│   │   ├── class-wfcp-cart-manager.php  # Cart Conflict Logic
│   │   └── class-wfcp-batch-process.php # Background processing (Dry Run/Recalc)
│   └── utilities/
│       └── class-wfcp-helper.php        # Helper functions (Sanitizers, Formatters)
├── admin/
│   ├── class-wfcp-admin.php         # Admin Controller
│   ├── css/
│   │   └── wfcp-admin-style.css     # Modern/Card UI styles
│   ├── js/
│   │   ├── wfcp-admin-general.js    # Tabs & Toggles logic
│   │   └── wfcp-admin-bulk.js       # AJAX Bulk Editor logic
│   └── partials/
│       ├── wfcp-admin-wrap.php      # Main Wrapper (Header/Tabs)
│       ├── tabs/
│       │   ├── wfcp-tab-general.php
│       │   ├── wfcp-tab-retail.php
│       │   ├── wfcp-tab-credit.php
│       │   ├── wfcp-tab-installment.php
│       │   ├── wfcp-tab-wholesale.php
│       │   ├── wfcp-tab-notifications.php
│       │   └── wfcp-tab-advanced.php
│       └── wfcp-page-bulk-editor.php # The Bulk Editor Table
├── public/
│   ├── class-wfcp-public.php        # Frontend Controller
│   ├── css/
│   │   └── wfcp-public-style.css    # Technolife/Digikala style boxes
│   ├── js/
│   │   └── wfcp-public.js           # Add to cart handlers
│   └── partials/
│       └── wfcp-product-display.php # The Pricing Box Template
└── assets/
    └── images/                      # Icons for Installment/Credit methods


3. طراحی دیتابیس و تنظیمات (Data Schema)
الف) تنظیمات (Global Options - wp_options)
تمام تنظیمات در یک آرایه اصلی با کلید wfcp_settings ذخیره شوند تا دیتابیس شلوغ نشود. ساختار آرایه:

general: (فعال/غیرفعال، واحد پول، نرخ تبدیل ارز).

retail: (درصد سود، رند کردن).

credit: (فعال‌سازی، درصد افزایش، درگاه‌ها، متن‌ها).

installment: (فعال‌سازی، بازه‌های زمانی، سود ماهانه).

wholesale: (فعال‌سازی، استراتژی تخفیف).

ب) متای محصول (post_meta)
برای هر محصول فیلدهای زیر ذخیره می‌شود:

_wfcp_purchase_price: قیمت خرید (پایه/دلاری).

_wfcp_lock_price: (Boolean) قفل کردن قیمت (عدم آپدیت اتوماتیک).

_wfcp_wholesale_custom_rule: قوانین خاص عمده برای محصول تکی.

4. رابط کاربری مدیریت (Admin UI/UX)
ساختار کلی
یک منوی اصلی: "مدیریت قیمت".

زیرمنو ۱: "داشبورد و تنظیمات".

زیرمنو ۲: "لیست قیمت" (Bulk Editor).

الف) صفحه تنظیمات (Modern Card View)
استایل: پس‌زمینه خاکستری روشن، باکس‌های سفید با box-shadow نرم، border-radius: 8px.

فونت: استفاده از فونت وزیر یا ایران‌سنس (تزریق فونت توسط CSS افزونه).

تب‌ها (Tabs): ناوبری افقی یا عمودی سمت راست. تغییر تب‌ها باید بدون ریلود صفحه (JS Tabs) باشد.

جزئیات تب‌ها:

عمومی: فیلد نرخ ارز، انتخاب واحد پول نمایشی.

تکی (Retail): ورودی درصد سود، چک‌باکس رند کردن قیمت (مثلاً ۳ صفر آخر).

اعتباری (Credit): سوییچ (Toggle Switch) فعال‌سازی، درصد افزایش، انتخاب چندگانه (Select2) درگاه‌های پرداخت.

اقساطی (Installment): تعریف پلن‌ها (مثلاً ۳ ماهه = ۵٪ سود، ۶ ماهه = ۱۰٪ سود).

عمده (Wholesale):

دراپ‌داون "استراتژی": (سراسری / دسته‌بندی / محصول).

اگر "دسته‌بندی" انتخاب شد: لیست دسته‌ها لود شود و جلوی هر کدام فیلد درصد بیاید.

متن‌ها: تمام لیبل‌های فرانت (مثل "خرید اقساطی"، "نیاز به بررسی") اینجا Input Text داشته باشند.

پیشرفته:

دکمه "محاسبه مجدد" (Recalculate All): اجرای AJAX Batch Processing.

حالت Dry Run: چک‌باکس. اگر فعال باشد، تغییرات در دیتابیس ذخیره نمی‌شود و فقط در فایل Log (در پوشه uploads) نوشته می‌شود.

دکمه "حذف کش" (Delete Transients).

دکمه "بکاپ JSON".

ب) ویرایشگر گروهی (Bulk Editor)
این صفحه باید شبیه یک اپلیکیشن تک‌صفحه‌ای (SPA) عمل کند.

هدر:

فیلترها: جستجوی زنده (Live Search)، دراپ‌داون دسته، برند، موجودی.

Toggle Columns: دکمه‌هایی برای مخفی/ظاهر کردن ستون‌های جدول (برای خلوت کردن دید).

جدول:

ردیف‌ها شامل: عکس، نام، SKU، موجودی، قیمت خرید (Input)، قیمت تکی (Text)، قیمت اعتباری (Text)، قیمت عمده (Text).

منطق AJAX:

کاربر در فیلد "قیمت خرید" عدد را تغییر می‌دهد -> on('change') یا Enter.

نمایش آیکون اسپینر.

ارسال درخواست به سرور -> محاسبه قیمت‌های جدید بر اساس تنظیمات -> ذخیره در دیتابیس.

برگشت داده -> آپدیت سلول‌های قیمت تکی/عمده در همان ردیف.

نمایش تیک سبز ✅ یا خطای قرمز ❌ به صورت Toast.

5. رابط کاربری فرانت‌‌اند (Frontend UI)
محل نمایش
استفاده از هوک woocommerce_single_product_summary با اولویت بالا (زیر قیمت یا دکمه افزودن به سبد).

طراحی باکس (Technolife Style)
استفاده از Flexbox/Grid.

باکس اصلی: Border خاکستری، گوشه‌های گرد.

ردیف ۱ (نقدی): نمایش قیمت اصلی ووکامرس.

ردیف ۲ (اقساطی):

آیکون/لوگو (سمت راست).

عنوان "خرید اقساطی" + مبلغ قسط.

دکمه "افزودن اقساطی".

ردیف ۳ (اعتباری): مشابه بالا.

6. منطق‌های حیاتی (Core Logic)
الف) محاسبه‌گر قیمت (Calculator Service)
کلاس WFCP_Calculator باید متدی داشته باشد مثل: calculate_price($base_price, $type = 'retail', $product_id = null) این متد باید تمام قوانین (سود، نرخ ارز، رند کردن) را اعمال کند و خروجی نهایی را بدهد.

ب) مدیریت سبد خرید (Cart Conflict Handler)
در هوک woocommerce_add_to_cart_validation:

چک کن سبد خرید خالی است؟

اگر نیست، محصول داخل سبد چه نوعی است؟ (متای _purchase_type).

محصول جدید چه نوعی است؟

اگر متفاوت بودند (مثلاً یکی نقدی، یکی اقساطی) -> جلوگیری کن و پیام خطا بده: "امکان خرید همزمان محصول اقساطی و نقدی وجود ندارد. سبد خرید را خالی کنید."

زمانی که دکمه "افزودن اقساطی" زده می‌شود، باید add_to_cart با داده‌های سفارشی (Custom Cart Item Data) فراخوانی شود تا نوع خرید مشخص شود.

7. دستورالعمل اجرایی (Prompt Instructions)
به عنوان یک توسعه‌دهنده ارشد وردپرس، کدها را با رعایت موارد زیر تولید کن:

امنیت: تمام ورودی‌های $_POST و $_GET باید Sanitize شوند. تمام درخواست‌های AJAX و فرم‌ها باید nonce داشته باشند.

شکل ظاهری: کدهای CSS باید کامل نوشته شوند تا دقیقاً ظاهر "Card View" و "Clean" ایجاد شود (از !important پرهیز کن، از سلکتورهای دقیق استفاده کن).

کامنت‌گذاری: توضیحات کد به انگلیسی، اما متون نمایشی به فارسی.

مرحله‌بندی:

فاز ۱: ساختار فایل و کلاس‌های اصلی و منوی ادمین.

فاز ۲: پیاده‌سازی تب‌های تنظیمات و ذخیره‌سازی.

فاز ۳: پیاده‌سازی ویرایشگر گروهی (Bulk Editor) و AJAX.

فاز ۴: نمایش در فرانت‌‌اند و منطق سبد خرید.