# ممیزی PAGE-DONE در برابر [PAGE-DONE-CRITERIA.md](PAGE-DONE-CRITERIA.md)

جدول زیر وضعیت **مسیرهای README** را بعد از به‌روزرسانی اخیر نشان می‌دهد. علامت «بخشی» یعنی هنوز با معیار کامل فاصله دارد (مثلاً CRUD کامل admin ووکامرس).

| مسیر / صفحه | داده + toast خطا | empty + CTA | CRUD README | i18n | ریسپانسیو جدول |
|-------------|------------------|-------------|-------------|------|----------------|
| پیشخوان `/` | ok | ok | N/A | ok | ok — overview V2: moderation نظرات، جداول تعاملی، صف کار |
| نوشته‌ها | ok | ok | ok | ok | overflow-x |
| نوشته جدید/ویرایش | ok | — | ok | ok | ok |
| دستهٔ نوشته | ok | ok | ok | ok | overflow-x |
| رسانه | ok | ok | بخشی | ok | ok |
| برگه‌ها | ok | ok | ok | ok | overflow-x |
| محصولات | ok | ok | بخشی | ok | overflow-x |
| ویرایش محصول | ok | — | بخشی | ok | ok |
| برندها | ok | ok | ok | ok | overflow-x |
| دسته محصول | ok | ok | فقط لیست | ok | overflow-x |
| ویژگی‌ها | ok | ok | فقط لیست | ok | overflow-x |
| سفارشات | ok | ok | بخشی | ok | overflow-x |
| جزئی سفارش | ok | empty جایگزین | بخشی | ok | ok |
| گزارش فروش | ok | hint اگر صفر | فقط گزارش | ok | ok |
| کوپن‌ها | ok | ok | ok | ok | overflow-x |
| کاربران | ok | ok | بخشی | ok | overflow-x |
| افزودن کاربر | ok | — | ok | ok | ok |
| دیدگاه‌ها | ok | ok | ok | ok | overflow-x |
| آمار `/analytics/overview` | ok | ok | فقط گزارش | ok | overflow-x |
| آمار بازدید `/analytics/visitors` | ok | ok | فقط گزارش | ok | overflow-x |
| صفحات `/analytics/pages` | ok | ok | فقط گزارش | ok | overflow-x |
| ارجاع `/analytics/referrals` | ok | ok | فقط گزارش | ok | overflow-x |
| جغرافیا `/analytics/geo` | ok | ok | فقط گزارش | ok | overflow-x |
| دستگاه `/analytics/devices` | ok | ok | فقط گزارش | ok | overflow-x |
| تنظیمات آمار `/settings/site/analytics` | ok | — | ok | ok | ok |
| تنظیمات | بخشی | — | ok | ok | ok |
| ربات بله `/bots/bale` | ok | ok | بخشی | ok | overflow-x |
| ربات تلگرام `/bots/telegram` | ok | ok | بخشی | ok | overflow-x |
| پیام همگانی ربات `/marketing/bot-broadcast` | ok | ok | بخشی | ok | ok |
| کمپین ربات `/marketing/bot-campaigns` | ok | ok | بخشی | ok | overflow-x |
| تنظیمات ربات `/settings/site/bots` | ok | — | بخشی | ok | ok |
| لاگ ربات `/settings/site/system-logs` | ok | ok | فقط خواندن | ok | overflow-x |
| ورود `/login` | ok | — | — | ok | ok |
| تنظیمات پیامک سایت `/settings/site/sms` | ok | — | ok (CRM) | ok | ok |
| تنظیمات پیامک فروشگاه `/settings/shop/sms` | ok | — | ok (CRM) | ok | ok |
| پنل پیامک `/marketing/sms/*` | ok | ok | ok (CRM proxy) | ok | ok |

**جمع‌بندی:** برای اکثر **لیست‌ها**، اسکلت (`TableListSkeleton` یا `Skeleton`)، `useQueryErrorToast`، و empty راهنما اضافه شده است. فرم‌های ویرایش طولانی (محصول/نوشته/برگه) اکنون `toastApiError` روی mutationها و skeleton بارگذاری اولیه (شامل sidebar) دارند.

**SEO (مکمل معیار ۱۱ README):** با ناوبری SPA، `applyDashboardDocumentSeo` در [`client/src/lib/dashboard-seo.ts`](../client/src/lib/dashboard-seo.ts) عنوان، توضیح، canonical و Open Graph را به‌روز می‌کند ([`DashboardLayout`](../client/src/layouts/DashboardLayout.tsx)، [`LoginPage`](../client/src/pages/LoginPage.tsx)).
