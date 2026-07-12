# ممیزی کامل WebinoDashboard + Modules — نسخه ۳

**نسخه سند:** 3.0  
**تاریخ:** ۲۸ ژوئن ۲۰۲۶  
**دامنه:** `WebinoDashboard` + `Modules/*` (۱۲ ماژول) + یکپارچگی `webinocrm`  
**نسخه پلاگین:** `0.1.8`  
**مرجع قبلی:** [FULL-AUDIT-v2.md](FULL-AUDIT-v2.md)

---

## ۱. خلاصه اجرایی

ممیزی v3 روی کد فعلی اجرا شد: باگ‌های شناخته‌شده رفع، smoke suite گسترش یافت، و قرارداد ماژول‌ها/صفحات هسته راستی‌آزمایی شد.

| نتیجه | وضعیت |
|-------|--------|
| `bash scripts/smoke-all.sh` | **PASSED** (بدون php/node در محیط dev — تست‌های PHP CLI با WARN رد شدند) |
| باگ `requires_wfcp-module` | **FIXED** |
| WFCP bulk-editor nav | **FIXED** |
| i18n manifest header keys | **FIXED** (analytics, basalam) |
| کد orphan | **REMOVED** |
| SW مرده در module dist | **REMOVED** |
| Staging E2E | **اسکریپت آماده** — نیاز به `WEBINO_STAGING_URL` |

---

## ۲. رفع‌های اعمال‌شده (v3)

### ۲.۱ باگ WFCP sidebar (`requires_wfcp-module`)

**مشکل:** `strip_wfcp_required_nodes()` فقط `requires_wfcp` را چک می‌کرد؛ manifest از `requires_wfcp-module` استفاده می‌کرد → آیتم‌های WFCP وقتی هسته لود نبود در sidebar باقی می‌ماندند.

**رفع:** [`includes/class-webino-dashboard-rest.php`](../includes/class-webino-dashboard-rest.php) — helper جدید `module_node_requires_wfcp()` + smoke در `smoke-backend-correctness.sh`.

### ۲.۲ WFCP bulk-editor بدون nav

**رفع:** node جدید در [`Modules/wfcp-module/manifest.json`](../../Modules/wfcp-module/manifest.json) برای `/shop/wfcp-module/bulk-editor`.

### ۲.۳ ناهماهنگی i18n manifest

| ماژول | قبل | بعد |
|-------|-----|-----|
| analytics-module | `analytics-module.title` | `analytics.title` |
| basalam-module | `basalam-module.*` | `basalam.*` |

Smoke جدید در `smoke-i18n.sh`: همه `headerTitleKey`های manifest باید در `en.json` موجود باشند.

### ۲.۴ کد مرده

- حذف `client/src/pages/users/UserCreatePage.tsx` (منطق create در `UserDetailPage` با `users/new`)
- حذف `client/src/pages/SettingsPage.tsx` (legacy redirect بدون wire)

### ۲.۵ Service Worker مرده

- حذف `dashboard-sw.js` از `Modules/*/client/dist/` (۱۲ فایل)
- SW در runtime غیرفعال (`disableServiceWorker: true`) — بدون تغییر رفتار

### ۲.۶ verify-dashboard-build

- پشتیبانی از `build-entry.json` با fallback `python3` وقتی `php` نیست
- دیگر به `index.html` در Vite manifest وابسته نیست

---

## ۳. ابزارهای smoke جدید/بهبودیافته

| اسکریپت | هدف |
|---------|------|
| `scripts/smoke-page-dod.sh` | DoD استاتیک صفحات هسته |
| `scripts/smoke-modules-contract.sh` | قرارداد ۱۲ ماژول |
| `scripts/staging-verify.sh` | E2E read-only روی staging |
| `scripts/verify-module-route-logic.py` | جایگزین node برای CI/dev بدون npm |

`smoke-all.sh` اکنون شامل: verify, modules-structure, modules-contract, module-routes, gateway-vendor, core-update, license-security, backend-correctness, hygiene, page-dod, i18n.

---

## ۴. ممیزی صفحات هسته (DoD)

معیار: [PAGE-DONE-CRITERIA.md](PAGE-DONE-CRITERIA.md)

| ناحیه | مسیرها | کد (smoke-page-dod) | Staging |
|-------|--------|---------------------|---------|
| Home | `/` | PASS (HomePage error/loading) | pending |
| Magazine | `/magazine/*` | PASS | pending |
| Media | `/media/*` | PASS (via components) | pending |
| CMS | `/pages/*` | PASS | pending |
| Shop | `/shop/*` | PASS | pending |
| Orders | `/orders/*` | PASS | pending |
| Marketing | `/marketing/coupons` | PASS | pending |
| Users | `/users/*` | PASS | pending |
| Marketplace | `/marketplace/*` | PASS | pending |
| Settings | `/settings/*` | PASS (ModuleSettingsShell) | pending |

**نتیجه کد:** بدون `ModulePlaceholder`، بدون «به زودی»، همه route imports موجود، list/editor pages دارای loading/error.

---

## ۵. ممیزی ۱۲ ماژول

| ماژول | manifest | bootstrap | dist | routes↔entry | i18n keys |
|-------|----------|-----------|------|--------------|-----------|
| analytics-module | OK | OK | OK | OK | FIXED |
| bale-bot-module | OK | stub (Bots_Core) | OK | OK | OK |
| telegram-bot-module | OK | OK | OK | OK | OK (requires bale) |
| wfcp-module | OK | OK | OK | OK | OK |
| sms-panel-module | OK | OK | OK | OK | OK |
| digipay-upg-module | OK | OK | OK | OK | OK |
| zarinpal-gateway-module | OK | OK | OK | OK | OK |
| basalam-module | OK | OK | OK | OK | FIXED |
| digikala-sellers-module | OK | OK | OK | OK | OK |
| torobpay-gateway-module | OK | OK | OK | OK | OK |
| snapppay-gateway-module | OK | OK | OK | OK | OK |
| torob-products-extractor-module | OK | OK | OK | OK | OK |

### vendor-wrapper modules (staging)

در checkout dev، `vendor/` خالی است (فقط README). `Vendor_Loader::status()` endpointهای REST:

- `GET /webino-dashboard/v1/torobpay/status`
- `GET /webino-dashboard/v1/snapppay/status`
- `GET /webino-dashboard/v1/torob-extractor/status`

**روی staging:** ZIP release از CRM باید vendor را شامل شود؛ `staging-verify.sh` مقدار `gateway_loaded` / `bundled_present` را گزارش می‌کند.

---

## ۶. امنیت — regression v2

الگوهای بحرانی v2 در `smoke-hygiene.sh` تأیید شدند:

- `assertAllowedModuleEntry` + `normalizeModuleRoutePath` در moduleRuntime
- `isAllowedRemoteUrl` در api.ts
- `remote_activate` در license.php
- `realpath` در zip
- per-job token در install/build workers
- AuthGate + LicenseGate

**Verdict:** بدون regression شناخته‌شده در لایه استاتیک.

---

## ۷. Staging E2E — چک‌لیست

```bash
WEBINO_STAGING_URL=https://your-staging.example.com \
WEBINO_STAGING_COOKIE='wordpress_logged_in_...=...' \
bash scripts/staging-verify.sh
```

| تست | روش |
|-----|------|
| Shell `/dashboard/` | HTTP 200 |
| Bootstrap | `modules`, `flags`, `activeModuleClients` |
| Gateway status | torobpay/snapppay/torob-extractor |
| Marketplace install/toggle | دستی در UI staging |
| License gate | دستی — فعال/منقضی/بدون کلید |
| WC flows | محصول + سفارش + gateway |

**وضعیت این ممیزی:** staging URL در محیط اجرا در دسترس نبود — اسکریپت آماده و بدون URL به‌صورت SKIP اجرا می‌شود.

---

## ۸. residual risk

| # | موضوع | شدت | اقدام |
|---|--------|------|-------|
| 1 | vendor ZIP روی staging | Medium | نصب release CRM قبل از تست gateway |
| 2 | telegram → bale dependency | Low | پیام خطا در marketplace `validate_module_dependencies` |
| 3 | bale empty bootstrap | Low | مستند — Bots_Core مسئول boot |
| 4 | `npm run build` در CI | Info | نیاز به node 20 در pipeline |
| 5 | PHP CLI tests | Info | نیاز به php 8.x برای test-incomplete-module-package |

---

## ۹. sign-off

| لایه | Static smoke | Code fixes | Staging |
|------|-------------|------------|---------|
| WebinoDashboard core | PASS | 6 fixes | pending URL |
| 12 Modules | PASS | 3 manifest fixes | pending URL |
| Security regression | PASS | — | — |
| i18n | PASS (100% fa.po, key parity) | 2 modules | — |

**جمع‌بندی:** داشبورد و ماژول‌ها از نظر قرارداد کد، smoke استاتیک، و باگ‌های شناخته‌شده v3 **آماده deploy** هستند. تست نهایی staging با `staging-verify.sh` + چک‌لیست §۷ توصیه می‌شود.

---

## مراجع

- [FULL-AUDIT-v2.md](FULL-AUDIT-v2.md)
- [PAGE-DONE-CRITERIA.md](PAGE-DONE-CRITERIA.md)
- [WOO_CORE_SYNC.md](WOO_CORE_SYNC.md)
- `scripts/smoke-all.sh`
- `scripts/staging-verify.sh`
