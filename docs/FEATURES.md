# فهرست جامع امکانات پلاگین WebinaDashboard (برای هم‌ترازی SiteBuilder و داشبورد مستقل)

> مبنا: `main` @ `f1fa2b8` (ریپو WebinaDev/WebinaDashboard). ۳۱ ماژول در `Modules/`، ۷۰ کلاس در `includes/`، SPA در `client/src` (React/Vite).
> «ERP» یعنی WebinoERP روی `webina.dev`. هر جا ستون «وابستگی» خالی است، امکان کاملاً محلی (WooCommerce/WordPress) است.
> این سند با اسکن خودکار کد + README و manifestهای هر ماژول تهیه شده؛ مسیرها دقیق‌اند، اما رفتار جزئی هر امکان باید هنگام پیاده‌سازی با کد تطبیق داده شود.

## ۰. معماری و هسته
| # | امکان | کاربرد | محل کد | تنظیمات | وابستگی |
|---|---|---|---|---|---|
| 1 | داشبورد SPA مستقل در `/dashboard` | پنل مدیریت خارج از wp-admin با RTL/LTR، تم روشن/تیره، accent، فول‌اسکرین | `includes/class-webino-dashboard-rewrite.php`, `-assets.php`, `client/src/App.tsx`, `routes/routes.config.tsx` | `webino_dashboard_rewrite_version` | — |
| 2 | SSR اولین رندر + payload صفحه | سرعت اولیه پنل | `class-webino-dashboard-ssr.php` | — | — |
| 3 | Bootstrap امن | جلوگیری از fatal در دیپلوی ناقص | `class-webino-dashboard-bootstrap.php` | `webino_dashboard_runtime_schema` | — |
| 4 | Module Registry مبتنی بر `manifest.json` | بارگذاری/فعال‌سازی ماژول‌ها و منوی سایدبار | `class-webino-dashboard-module-registry.php`, `-modules.php`, `client/src/routes/ModuleDynamicRoutes.tsx` | `webino_dashboard_module_{slug}_active` | — |
| 5 | Marketplace ماژول‌ها | نصب/حذف/فعال‌سازی ماژول از کاتالوگ ERP، نصب پس‌زمینه، پرداخت | `class-webino-dashboard-rest-marketplace.php`, `-marketplace-install-job.php`, `marketplace-install-worker.php`; مسیر `marketplace`, `marketplace/installed`, `marketplace/payment-callback` | — | ERP |
| 6 | آپدیت درجای هسته | آپدیت پلاگین از git/ZIP ERP با rollback | `class-webino-dashboard-core-updater.php`, `-rest-core-update.php` | — | ERP |
| 7 | Build pipeline | ساخت ماژول‌ها+داشبورد+verify+zip+smoke | `class-webino-dashboard-build-pipeline.php`, `build-pipeline-worker.php` | — | — |
| 8 | لایسنس | فعال‌سازی/چک لایسنس؛ فقط یک چک اولیه و بعد دستی؛ circuit breaker، هرگز نباید داشبورد را قفل کند | `class-webino-dashboard-license.php`; AJAX `webino_dashboard_license_remote_activate/check/diagnostics/webhook` | `webino_dashboard_license_status`, فیلتر `webino_dashboard_crm_circuit_ttl` | ERP (Edge) |
| 9 | احراز HMAC هر سایت | امضای درخواست‌های Dashboard→ERP | `class-webino-dashboard-site-auth.php` | secret سایت | ERP |
| 10 | AJAX JSON guard | تضمین JSON بودن پاسخ‌های admin-ajax | `class-webino-dashboard-ajax-guard.php` | — | — |
| 11 | SSRF allowlist / Safe ZIP | امنیت دانلود و استخراج | `-remote-url.php`, `-zip.php` | — | — |
| 12 | نقش‌ها و ACL منو | نقش seller و accountant، PermissionGate | `class-webino-dashboard-roles.php`, `client/src/components/PermissionGate.tsx` | — | — |
| 13 | i18n، اعداد فارسی، تاریخ جلالی | | `-i18n.php`, `-locale.php`, `languages/` | `date_format` | — |
| 14 | PWA | manifest، service worker، splash، بنر نصب | `class-webino-dashboard-pwa.php`; `settings/site/pwa` | — | — |
| 15 | استایل برند | accent، پالت، لوگو/فاوآیکن، فونت | `-brand-style.php`; `settings/site/style` | — | — |
| 16 | SMTP اختیاری | ارسال ایمیل | `-mailer.php` | تنظیمات SMTP | سرور SMTP |
| 17 | ابزار مهاجرت (Migrate) | انتقال داده از سایت دیگر با start/pause/tick/reset | `includes/migrate`, AJAX `webino_migrate_*`, cron `webino_migrate_minute`; مسیر `tools/migrate` | — | سایت مبدأ |
| 18 | لاگ سیستم | | `settings/site/system-logs` | — | — |

## ۱. محصولات و کاتالوگ
| # | امکان | کاربرد | محل کد | تنظیمات | وابستگی |
|---|---|---|---|---|---|
| 19 | CRUD محصول (ساده/متغیر) | لیست، فیلتر، مرتب‌سازی (date/name/price)، ویرایش | `class-webino-dashboard-rest.php`; `client/src/components/products`; `shop/products*` | `settings/shop/products` | — |
| 20 | دسته‌بندی محصول | | `shop/product-categories*` | — | — |
| 21 | برند (taxonomy اختیاری) | | `-taxonomies.php`; `shop/brands*` | — | — |
| 22 | ویژگی‌ها و گروه ویژگی | presetهای ویژگی سراسری | `-attribute-groups.php`; `shop/attributes*` | — | — |
| 23 | Variation swatches (فروشگاه) | رنگ/تصویر/برچسب به جای dropdown | `-variation-swatches.php` (`woocommerce_dropdown_variation_attribute_options_html`) | — | — |
| 24 | Order-config attributes | گزینه‌های سفارشی سبد/سفارش غیر از variation | `-order-configs.php` (`woocommerce_add_cart_item_data`, `get_item_data`) | — | — |
| 25 | اسلاگ انگلیسی + ریدایرکت 301 Rank Math | سئو | `-product-slugs.php` | — | Rank Math |
| 26 | فروش ویژه گروهی (Bulk sale) | اعمال/حذف/پیش‌نمایش قیمت خط‌خورده | `-bulk-sale.php`; `marketing/sale-prices` | — | — |
| 27 | بارکد Code128 | چاپ برچسب | `-barcode.php` | — | — |
| 28 | Product catalog import | ایمپورت از providerهای کاتالوگ | `Modules/product-catalog-module` | تنظیمات provider | ERP/provider |
| 29 | گزارش موجودی و ارزش انبار | | `-inventory-reports.php`; `reports/stock` | — | — |
| 30 | AI Content | تولید محتوای سئو برای محصول/بلاگ/برند/دسته، تقویم محتوا، تکمیل دسته‌ای، FAQ، Rank Math | `Modules/ai-content-module` | کلید Grok/Gemini/ChatGPT/GapGPT | سرویس AI |
| 31 | Coffee profile | پروفایل قهوه، blend ساز، جست‌وجو، قیمت blend | `Modules/coffee-profile-module`; شورت‌کد `webino_coffee_profile/blend/search`; AJAX `webino_coffee_blend_add` | — | — |

## ۲. قیمت‌گذاری (WFCP)
| # | امکان | کاربرد | محل کد | تنظیمات | وابستگی |
|---|---|---|---|---|---|
| 32 | موتور قیمت ارزی/فرمولی | قیمت فروش از قیمت خرید × نرخ ارز + سود | `Modules/wfcp-module/plugin/webina-woo-core.php`, `includes/class-webino-dashboard-pricing.php` | `settings/shop/pricing/:tab`, `settings/shop/wfcp` | API نرخ ارز |
| 33 | آپدیت خودکار نرخ ارز | | cron `wfcp_auto_update_exchange_rate`; AJAX `wfcp_update_exchange_rate` | — | منبع نرخ |
| 34 | Quick Add / Bulk Editor / Price Changer | ویرایش گروهی قیمت خرید/فروش/موجودی/برند، قفل قیمت | AJAX `wfcp_quick_add_product`, `wfcp_pm_*`, `wfcp_update_lock_price`, `wfcp_update_all_prices`, `wfcp_recalculate_all` | — | — |
| 35 | مرجع قیمت (reference) | همگام‌سازی قیمت از مرجع | `wfcp_fetch_reference`, `wfcp_sync_all_references`, `wfcp_test_api` | — | API مرجع |
| 36 | نوع سبد/قیمت variation در فروشگاه | | AJAX nopriv `wfcp_add_to_cart`, `wfcp_get_variation_prices`, `wfcp_update_cart_type` | — | — |
| 37 | Export/Import تنظیمات WFCP | | `wfcp_export_settings`, `wfcp_import_settings`, `wfcp_delete_transients` | — | — |

## ۳. سفارش‌ها، POS و اسناد
| # | امکان | کاربرد | محل کد | تنظیمات | وابستگی |
|---|---|---|---|---|---|
| 38 | لیست/جزئیات/ویرایش سفارش (HPOS) | | `-orders.php`, `-order-aggregates.php`; `orders/list*` | — | — |
| 39 | ساخت سفارش دستی (Order composer) | | `-order-writer.php`; `orders/new` | — | — |
| 40 | POS فروش حضوری | | `pos` | — | — |
| 41 | لینک پرداخت POS + صفحه پرداخت عمومی + SMS لینک | | `-pay-order.php`, `-sms-pos-payment.php`; `pos/pay-link` | — | SMS |
| 42 | وضعیت‌های سفارشی | `wc-webino-need-review`, `-in-stock`, `-packaged`, `-ready-to-ship`, `-shipping`, `-post`, `-tipax`, `-courier`, `-returned`, `-deleted` + وضعیت‌های باسلام `bslm-preparation/shipping/completed` | `Modules/shipping-module/includes/class-webino-shipping-order-statuses.php`; فیلتر `woocommerce_order_is_paid_statuses` | — | — |
| 43 | یادداشت‌های سفارش (فرمت‌شده برای پنل و مشتری) | | `-order-notes.php` | — | — |
| 44 | مرجوعی تک‌قلمی | درخواست، تأیید، دریافت، استرداد، تعویض | `-order-returns.php` | — | — |
| 45 | اسناد چاپی (فاکتور، رسید، برچسب، سبک Parisma) | | `-order-documents.php`, `-order-document-settings.php`; `settings/shop/invoices` | `woocommerce_store_*` | — |
| 46 | تشخیص پلتفرم مارکت‌پلیس سفارش/محصول | برچسب منبع (باسلام/دیجی‌کالا/...) | `-marketplace.php` | — | — |

## ۴. گزارش‌ها و آمار
| # | امکان | کاربرد | محل کد | تنظیمات | وابستگی |
|---|---|---|---|---|---|
| 47 | Home overview | KPIهای فروش/سفارش با allowlist وضعیت‌های موفق `sales_statuses()` و `wc_get_orders` | `-home-overview.php`, `client/src/components/home` | cache keys overview v5 | — |
| 48 | گزارش‌های سفارش/فروش/درآمد/مالی | `reports/overview|sales|revenue|financial|orders|stock` | `-order-reports.php`, `orders/reports`, `reports/:section` | — | — |
| 49 | Analytics داخلی | ثبت بازدید، منابع، جغرافیا، دستگاه، آنلاین‌ها | `Modules/analytics-module`; AJAX `webino_dashboard_analytics_hit` | `settings/site/analytics` (حریم خصوصی، نگه‌داری، فیلتر) | — |

## ۵. کوپن و بازاریابی
| # | امکان | کاربرد | محل کد | تنظیمات | وابستگی |
|---|---|---|---|---|---|
| 50 | CRUD کوپن (کارتی/جدولی) | | `-coupons.php`; `marketing/coupons*` | — | — |
| 51 | محدودیت‌های اضافه کوپن | کاربر، موقعیت، روش پرداخت/ارسال، کانال، برند | `-coupon-restrictions.php` (`woocommerce_coupon_is_valid*`) | — | — |
| 52 | قوانین فروشگاهی کوپن | فقط یک کوپن فعال، انتخابگر در سبد، progress «کوپن بعدی» | `-coupon-storefront.php` | — | — |
| 53 | Offer engine | قالب پیشنهاد، eligibility، auto-apply، API فروشگاه | `-offer-engine.php` | — | — |
| 54 | تبلیغات پیامکی سگمنت‌شده و بازیابی سبد | | `sms-panel-module/includes/*-sms-ads*.php`, `-sms-recovery.php` | — | ModirPayamak/ERP |

## ۶. ارسال، وزن و بسته‌بندی
| # | امکان | کاربرد | محل کد | تنظیمات | وابستگی |
|---|---|---|---|---|---|
| 55 | روش ارسال نرخ ثابت شهری | | `shipping-module/includes/class-wc-shipping-webino-flat-city.php` | `settings/shop/shipping` | — |
| 56 | استان/شهر/منطقه در checkout | جست‌وجوی شهر، فرزندان، district | `-shipping-cities.php`, `-checkout-district.php`; AJAX `webino_shipping_cities_search/children`; cron `webino_shipping_cities_ensure` | — | — |
| 57 | قوانین ارسال و Packer | محاسبه بسته | `-shipping-rules.php`, `-shipping-packer.php` | — | — |
| 58 | وزن ارسال | | `class-webino-shipping-weight.php` | — | — |
| 59 | روش ارسال بسته‌بندی + هزینه بسته‌بندی | | `class-wc-shipping-webino-packaging.php`, `-packaging-settings.php` | — | — |
| 60 | بسته‌بندی حرفه‌ای (اختیاری/اجباری) | fee در سبد؛ سوئیچ اجباری که مشتری نتواند حذف کند | `class-webino-shipping-professional-packaging.php`; AJAX `webino_professional_packaging_toggle`; فیلتر `webino_professional_packaging_cart_eligible` | فعال، مبلغ، اجباری | — |
| 61 | نقشه آدرس | | `-shipping-map.php` | `webino_dashboard_neshan_api_key` | نشان |
| 62 | سازگاری Dokan | | `-shipping-dokan.php` | — | Dokan |
| 63 | تاپین | نرخ، ثبت مرسوله، همگام وضعیت | `Modules/tapin-module`; cron `webino_tapin_sync_statuses` | کلید تاپین | Tapin |
| 64 | هشدار GEO/VPN در checkout | | `-checkout-geo.php` | — | سرویس GEO |

## ۷. پرداخت
| # | امکان | محل کد | وابستگی |
|---|---|---|---|
| 65 | لایه پرداخت مشترک + REST تراکنش‌ها | `Modules/payment-module`; `settings/shop/payments` | — |
| 66 | زرین‌پال PG v4 (refund، reconcile، fee_payer) | `zarinpal-gateway-module`; cron `webino_zarinpal_process_jobs` | Zarinpal |
| 67 | اسنپ‌پی (اقساطی، eligibility، ویجت PDP) | `snapppay-gateway-module` | SnappPay |
| 68 | ترب‌پی BNPL (ویجت/شورت‌کد `torobpay_widget/topbar`) | `torobpay-gateway-module` | TorobPay |
| 69 | دیجی‌پی UPG (BPG/CPG/Wallet/IPG) | `digipay-upg-module` | DigiPay |
| 70 | بله‌پی | `bale-pay-gateway-module` | Bale |
| 71 | کارت‌به‌کارت | `card-to-card-gateway-module` | — |
| 72 | کیف پول فروشگاه (ledger + برداشت) | `-wallet.php`, `wallet-gateway-module` | — |
| 73 | درگاه پرداخت باسلام | `basalam-module` (`WC_Gateway_Basalam`) | Basalam |

## ۸. مارکت‌پلیس‌ها و فیدها
| # | امکان | محل کد | وابستگی |
|---|---|---|---|
| 74 | باسلام: OAuth از طریق ERP، سینک محصول/موجودی/قیمت، سفارش، webhook، صف job، کیف پول | `basalam-module` (REST `class-webino-dashboard-rest-basalam.php`, `engine/`), AJAX `webino_dashboard_basalam_oauth_*`, cron `webino_basalam_process_jobs` | Basalam + ERP |
| 75 | دیجی‌کالا فروشندگان: OAuth، map محصول، سینک، pull سفارش، لغو، SBS، webhook | `digikala-sellers-module`; crons `webino_digikala_orders_pull/process_jobs` | Digikala |
| 76 | WNC Marketplace connector (موتور قدیمی‌تر چندکاناله) | `wnc-core-module`; AJAX `wnc_*`; crons `wnc_*` | — |
| 77 | ترب connector + استخراج محصولات ترب | `torob-connector-module`, `torob-products-extractor-module` | Torob |
| 78 | فید/اتصال ایمالز، اسنپ‌شاپ، تپسی‌شاپ، تکنولایف، ذره‌بین، اسنپ‌پی سرچ | ماژول‌های هم‌نام (`settings/shop/{slug}`) | سرویس مربوط |

## ۹. ارتباط با مشتری: پیامک، اعلان، ربات، تیکت
| # | امکان | محل کد | وابستگی |
|---|---|---|---|
| 79 | پنل پیامک (تکی/گروهی، زمان‌بندی، الگو، دفترچه، خبرنامه، شارژ) | `sms-panel-module`; `reports/inbox|outbox|messages|bulk-*|panels` | ModirPayamak via ERP |
| 80 | پیامک رویداد سفارش و هشدار موجودی | `-sms-order-hooks.php`, `-sms-order-map.php`, `-sms-warehouse-stock.php` | همان |
| 81 | اعلان یکپارچه (سایت+ایمیل+ربات) با متن پیش‌فرض فارسی | `-notify.php`, `-notify-copy.php`, `-notifications.php`; `settings/site/notifications`, `notifications` | — |
| 82 | OTP چندکاناله برای ورود/ثبت‌نام | `-auth-otp.php`; AJAX `webino_dashboard_auth_session`, `webino_bot_otp_*`; شورت‌کد `webino_bot_login` | SMS/ربات |
| 83 | ربات فروشگاهی بله (broadcast، کمپین، تولد، nudge غیرفعال‌ها) | `bale-bot-module`; crons `webino_dashboard_bale_campaign_launch`, `bots_birthday_cron`, `bots_inactive_nudge_cron` | Bale |
| 84 | ربات تلگرام | `telegram-bot-module` | Telegram |
| 85 | دکمه پشتیبانی ربات | شورت‌کد `webino_bot_support_button` | — |
| 86 | تیکت پشتیبانی مشتری/کارمند | `-support-tickets.php`; `shop/tickets*`, `account/tickets*` | — |

## ۱۰. مشتری و پرتال حساب
| # | امکان | محل کد |
|---|---|---|
| 87 | پرتال حساب مشتری: پروفایل، سفارش‌ها، آدرس‌ها، علاقه‌مندی، نظرات، اعلان، تیکت | `-account-portal.php`, `-rest-account.php`, `-addresses.php`; `account/*` |
| 88 | مدیریت کاربران/کارمندان | `-users.php`; `users/list|new|employees|:userId` |
| 89 | مدیریت دیدگاه‌ها | `users/comments` |

## ۱۱. محتوا
| # | امکان | محل کد |
|---|---|---|
| 90 | مجله (نوشته/دسته) | `-rest-crud.php`; `magazine/*` |
| 91 | برگه‌ها | `pages*` |
| 92 | رسانه با پوشه و دسته | `-taxonomies.php`; `media*` |

## ۱۲. حسابداری و امنیت
| # | امکان | محل کد | وابستگی |
|---|---|---|---|
| 93 | حسابداری: دفتر کل، سینک ووکامرس، مالیات/مودیان، حسابفا، حقوق و دستمزد ایرانی، تأمین اجتماعی | `accounting-module`; crons `webino_accounting_process_hesabfa/moadian/tax_tips` | مودیان، حسابفا |
| 94 | Webino Shield: WAF، اسکن، heal/rollback، قرنطینه، 2FA، فید تهدید، audit | `security-module`; REST `/security/*`; crons `webino_shield_*` | فید تهدید |

## ۱۳. تنظیمات
| # | امکان | محل کد |
|---|---|---|
| 95 | تنظیمات سایت: general, dashboard, style, pwa, notifications, analytics, bots, license, system-logs | `-rest-site-settings.php`; `settings/site/:section` |
| 96 | تنظیمات فروشگاه (پل WooCommerce): general, products, tax, shipping, payments, emails, invoices, sms, pricing, advanced, marketplace | `-rest-wc-settings.php`; `settings/shop/:section` |
| 97 | ارز تومان (آیکن IRT) و نمایش قیمت | `-currency.php`, `client/src/hooks/useStoreCurrency.ts` |

## ۱۴. سطح فروشگاه (Storefront) — خلاصه هوک‌ها
- سبد/checkout: `woocommerce_cart_calculate_fees` (بسته‌بندی)، `woocommerce_checkout_fields` (شهر/منطقه)، `woocommerce_package_rates`، `woocommerce_available_payment_gateways` (eligibility اقساطی/کوپن)، `woocommerce_coupon_*`، `woocommerce_update_order_review_fragments`.
- صفحه محصول: swatches، order-configs، ویجت اقساطی SnappPay/TorobPay، قیمت WFCP.
- شورت‌کدها: `torobpay_topbar`, `torobpay_widget`, `webino_torobpay_*`, `webino_bot_login`, `webino_bot_support_button`, `webino_coffee_blend`, `webino_coffee_profile`, `webino_coffee_search`.
- ویجت/بلاک وردپرس ثبت نشده است.

## چک‌لیست هم‌ترازی
| امکان | حوزه | اولویت |
|---|---|---|
| CRUD محصول/متغیر/دسته/برند/ویژگی | کاتالوگ | P0 |
| سفارش‌ها + وضعیت‌های سفارشی + یادداشت | سفارش | P0 |
| Checkout با استان/شهر/منطقه و روش‌های ارسال | ارسال | P0 |
| درگاه‌ها (زرین‌پال، اسنپ‌پی، ترب‌پی، دیجی‌پی، کارت‌به‌کارت، کیف پول) | پرداخت | P0 |
| WFCP قیمت‌گذاری ارزی و نرخ خودکار | قیمت | P0 |
| کوپن + محدودیت‌ها + قوانین فروشگاهی | بازاریابی | P0 |
| OTP ورود/ثبت‌نام و پرتال مشتری | مشتری | P0 |
| پیامک رویداد سفارش | ارتباط | P0 |
| بسته‌بندی حرفه‌ای (اجباری) و هزینه بسته‌بندی | ارسال | P0 |
| Home overview و گزارش فروش با allowlist وضعیت | گزارش | P0 |
| باسلام سینک کامل | مارکت‌پلیس | P0 |
| لایسنس غیرمسدودکننده + HMAC به ERP | هسته | P0 |
| POS و لینک پرداخت | سفارش | P1 |
| مرجوعی و اسناد چاپی | سفارش | P1 |
| دیجی‌کالا، ترب، تاپین | مارکت‌پلیس/ارسال | P1 |
| Swatches و order-configs | فروشگاه | P1 |
| اعلان یکپارچه، تیکت | ارتباط | P1 |
| Analytics داخلی | گزارش | P1 |
| Offer engine، فروش ویژه گروهی | بازاریابی | P1 |
| Marketplace ماژول و آپدیت هسته | هسته | P1 |
| مجله/برگه/رسانه | محتوا | P1 |
| نقش‌ها و ACL | هسته | P1 |
| ربات‌های بله/تلگرام | ارتباط | P2 |
| حسابداری و مودیان | مالی | P2 |
| Webino Shield | امنیت | P2 |
| AI Content | محتوا | P2 |
| PWA، استایل برند | هسته | P2 |
| Coffee profile، ایمالز/اسنپ‌شاپ/تپسی/تکنولایف/ذره‌بین | تخصصی | P2 |
| ابزار مهاجرت، GEO/VPN، Dokan | ابزار | P2 |
