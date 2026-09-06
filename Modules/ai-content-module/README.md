# ماژول AI Content

## معرفی
تولید و تکمیل محتوای سئو‌محور برای محصولات، بلاگ، برند و دسته‌ها با Grok (پیش‌فرض)، Gemini، ChatGPT و GapGPT.

## امکانات
- تقویم محتوایی روزانه برای بلاگ و محصول
- تکمیل دسته‌ای محصولات ناقص (توضیحات، Rank Math، FAQ، ویژگی‌ها)
- پیشنهاد دسته بلاگ/محصول و تولید محتوای برند و دسته
- پیشنهاد موضوع بلاگ از موضوع سایت و دسته‌ها، تأیید تک‌به‌تک و نوشتن محتوا
- قالب ویژگی ووکامرس به‌ازای هر دسته محصول
- صف کار با Action Scheduler / WP-Cron و گیت کیفیت سئو

## مسیرهای کلیدی
- `manifest.json`
- `bootstrap.php`
- `includes/`
- `client/module-entry.tsx`

## REST
- `GET/POST /wp-json/webino-dashboard/v1/ai-content/settings`
- `GET /wp-json/webino-dashboard/v1/ai-content/gapgpt/models`
- `GET /wp-json/webino-dashboard/v1/ai-content/overview`
- `GET/POST /wp-json/webino-dashboard/v1/ai-content/jobs`
- `POST /wp-json/webino-dashboard/v1/ai-content/generate`
- `GET/POST/PATCH/DELETE /wp-json/webino-dashboard/v1/ai-content/calendar`
- `GET/POST /wp-json/webino-dashboard/v1/ai-content/attribute-templates`
- `POST /wp-json/webino-dashboard/v1/ai-content/suggest-categories`
- `GET/POST /wp-json/webino-dashboard/v1/ai-content/blog-topics` (+ suggest / approve / skip)

## پیش‌نیاز
- کلید API حداقل یک پروایدر
- capabilityهای ویرایش محتوا / محصولات
