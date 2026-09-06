# ماژول امنیت Webino Shield (`security-module`)

سند پیاده‌سازی کامل، فازبندی‌شده و الزام‌آور برای ماژول امنیت داشبورد.  
هدف: پوشش **فایروال / اسکن سایت / ابزارها / گزارش / تنظیمات** به‌همراه **ترمیم و بهبود سایت**، با عمقی بیشتر از Wordfence، Sucuri، Solid Security، Patchstack Protect و iThemes Security — بدون نقص، بدون صفحهٔ نیمه‌کاره، و با تازه‌ترین فیدهای تهدید.

این سند جایگزین حدس در زمان کدنویسی است. هر فاز فقط وقتی بسته می‌شود که معیارهای همان فاز **و** [PAGE-DONE-CRITERIA.md](./PAGE-DONE-CRITERIA.md) برای مسیرهای UI آن فاز برقرار باشد.

---

## ۱. خلاصه محصول

| مورد | مقدار |
|------|--------|
| نام محصول (EN) | Webino Shield |
| عنوان UI | امنیت / Security |
| اسلاگ بسته | `security-module` |
| مسیر روی دیسک | `WebinaDashboard/Modules/security-module/` |
| `is_builtin` | `true` |
| `default_active` | `true` |
| `requires_woocommerce` | `false` (حفاظت ووکامرس اختیاری و شرطی است) |
| Namespace REST | `webino-dashboard/v1` با پیشوند `/security/*` |
| Capability پایهٔ مشاهده | `webino_view_security` |
| Capability مدیریت | `webino_manage_security` |
| Capability تخریبی (ترمیم/قرنطینه/حذف) | `webino_heal_security` |
| نگاشت پیش‌فرض نقش‌ها | `administrator` همه؛ `shop_manager` فقط مشاهدهٔ گزارش در صورت روشن بودن تنظیم |
| گروه سایدبار | `tools` |
| آیکون manifest | `shield` (باید به `client/src/lib/module-icons.ts` اضافه شود) |
| Option تنظیمات | `webino_dashboard_security` |
| نسخهٔ اسکیما DB | `webino_dashboard_security_db_version` |
| پیشوند جداول | `{wpdb_prefix}webino_shield_` |

محصول یک **موتور امنیت لایه‌ای** است، نه یک صفحهٔ تنظیمات. WAF باید قبل از بوت کامل وردپرس قابل اجرا باشد؛ اسکنر باید فایل + دیتابیس + پیکربندی + آسیب‌پذیری را ببیند؛ ترمیم باید برگشت‌پذیر باشد؛ فیدها باید چندمنبعی، نسخه‌دار و قابل کار آفلاین (برای ایران) باشند.

---

## ۲. اصول غیرقابل‌مذاکره

1. **بدون قفل‌کردن ادمین.** هر اکشن مسدودکننده باید Panic URL، فایل Unlock و Allowlist داشبورد داشته باشد. اگر WAF خطای داخلی بدهد، مدارشکن باز می‌شود و درخواست عبور می‌کند — سایت نباید به‌خاطر باگ امنیت از کار بیفتد.
2. **بدون کپی امضای اختصاصی رقبا.** امضاها، قوانین و فیدهای Wordfence / Sucuri proprietary استفاده یا scrape نمی‌شوند. فقط منبع رسمی، مجوزدار، یا متن‌باز.
3. **تعمیر برگشت‌پذیر.** هر Heal یک Snapshot می‌سازد (فایل/ردیف/option) و Rollback دارد. حذف دائمی فقط بعد از تأیید دوم و capability `webino_heal_security`.
4. **داشبورد خودش قربانی نشود.** مسیر `/dashboard`، REST خود ماژول، cron، WP-CLI، Action Scheduler و IPهای Allowlist هرگز با قانون پیش‌فرض مسدود نمی‌شوند.
5. **کار در ایران.** فیدها اول از **آینهٔ WebinaCRM** می‌آیند؛ منبع مستقیم اینترنت فقط fallback است. کش محلی اجباری است. قطع بودن یک فید کل موتور را خاموش نمی‌کند.
6. **بدون placeholder.** هیچ مسیر «به‌زودی» مجاز نیست. فاز یعنی برش کامل و قابل استفاده.
7. **i18n کامل.** همهٔ رشته‌های UI در `en.json` و `fa.json`. تاریخ/عدد مطابق زبان داشبورد.
8. **کمترین بار روی فروش.** WAF در مسیر داغ (checkout، REST عمومی، assets) باید زیر بودجهٔ تأخیر تعریف‌شده بماند. اسکن سنگین فقط در صف پس‌زمینه.
9. **ممیزی همه‌چیز.** تغییر تنظیمات، بلاک، آنبلاک، ترمیم، قرنطینه، ایمپورت قانون، چرخش salt، و به‌روزرسانی فید در Audit Log ثبت می‌شود.
10. **خود ماژول ضددستکاری است.** checksum فایل‌های Shield، محافظت از drop-in و MU-plugin، و هشدار در صورت تغییر غیرمنتظره.

---

## ۳. مقایسه هدف با Wordfence و رقبا

هدف «کامل‌تر بودن» یعنی **پوشش بیشتر + کنترل ریزتر + ترمیم واقعی + فید چندمنبعی + یکپارچگی بومی**، نه کپی UI.

| قابلیت | Wordfence | Sucuri | Patchstack | Solid Security | Webino Shield (الزام) |
|--------|-----------|--------|------------|----------------|------------------------|
| WAF PHP زودهنگام / auto_prepend | بله | ابری | محدود | محدود | بله + MU-plugin + drop-in + prepend |
| OWASP CRS | خیر | خیر | خیر | خیر | بله (پروفایل‌شده) |
| Virtual patch از چند CVE DB | محدود | ابری | بله | خیر | بله (Patchstack/WPScan/NVD/OSV/CISA KEV/WPVulnerability) |
| اسکن یکپارچگی هسته/افزونه/پوسته | بله | بله | محدود | بله | بله + SBOM + drop-in + MU + vendor |
| بدافزار دیتابیس (پست/آپشن/کاربر) | محدود | بله | خیر | محدود | بله + پاکسازی برگشت‌پذیر |
| ترمیم رسمی فایل از wordpress.org | محدود | ابری | خیر | خیر | بله + quarantine + rollback |
| هدرهای امنیتی / CSP | خیر | محدود | خیر | محدود | سازندهٔ کامل CSP/Permissions-Policy |
| SPF/DKIM/DMARC و DNS | خیر | محدود | خیر | خیر | بله در اسکن و گزارش |
| حفاظت ووکامرس (چک‌اوت، XML، webhook) | ضعیف | ضعیف | CVE | ضعیف | بله، اختصاصی |
| اعلان SMS / بله / تلگرام | خیر | خیر | خیر | خیر | از طریق ماژول‌های موجود |
| فید آینهٔ داخلی (ایران) | خیر | خیر | خیر | خیر | WebinaCRM Intel Mirror |
| Canary / Honeypot / فریب | خیر | خیر | خیر | محدود | بله |
| WebAuthn / Passkeys | 2FA کلاسیک | خیر | خیر | 2FA | 2FA + WebAuthn + کد پشتیبان |
| امتیاز انطباق (CIS/ASVS/PCI-hint) | خیر | محدود | خیر | محدود | بله در گزارش |
| Live Traffic + Forensic export | بله / پریمیوم | ابری | خیر | محدود | بله + تایم‌لاین حادثه |
| CrowdSec / AbuseIPDB / abuse.ch | خیر | ابری | خیر | خیر | بله، چند فید همزمان |
| یادگیری (Learning mode) | بله | خیر | خیر | خیر | بله + امتیاز شهرت + مدارشکن |
| پروفایل تنظیمات (مبتدی تا Paranoid) | ضعیف | ضعیف | ضعیف | متوسط | چهار پروفایل + Custom |

Wordfence را باید در **همهٔ مسیرهای رایگان و پریمیوم پرکاربرد** پوشش داد، سپس لایه‌های بالا را اضافه کرد. پوشش حداقلی Wordfence در فازهای ۱ تا ۴ اجباری است؛ برتری در فازهای ۵ تا ۸ تکمیل می‌شود.

---

## ۴. قرارداد ماژول (مطابق رجیستری داشبورد)

قرارداد همان [MODULES.md](./MODULES.md) است.

```text
WebinaDashboard/Modules/security-module/
  manifest.json
  bootstrap.php
  includes/
  engine/                 # هستهٔ WAF مستقل از وردپرس (قابل prepend)
  rules/                  # CRS compileشده، قوانین بومی، YARA
  feeds/                  # کش نسخه‌دار فیدها (gitignore محتوای حجیم)
  client/
    module-entry.tsx
    pages/
    components/
    dist/module.js
  wp-cli/
  uninstall.php           # فقط پاک‌سازی در صورت تأیید تنظیم
```

### ۴.۱ `manifest.json` هدف

```json
{
  "slug": "security-module",
  "name": "Security",
  "version": "1.0.0",
  "is_builtin": true,
  "default_active": true,
  "bootstrap": "bootstrap.php",
  "settings": {
    "area": "site",
    "title": "Security",
    "sections": [
      { "id": "overview", "route": "/security", "title": "Security" },
      { "id": "settings", "route": "/security/settings", "title": "Security settings" }
    ]
  },
  "sidebar": {
    "module_id": "security-module",
    "title": "Security",
    "path": "/security",
    "capability": "webino_view_security",
    "icon": "shield",
    "nav_group": "tools",
    "children": [
      { "id": "security-overview", "title": "Overview", "path": "/security", "capability": "webino_view_security", "exclude_from_module_toggle": true },
      { "id": "security-firewall", "title": "Firewall", "path": "/security/firewall", "capability": "webino_manage_security", "exclude_from_module_toggle": true },
      { "id": "security-scan", "title": "Site scan", "path": "/security/scan", "capability": "webino_manage_security", "exclude_from_module_toggle": true },
      { "id": "security-tools", "title": "Tools", "path": "/security/tools", "capability": "webino_manage_security", "exclude_from_module_toggle": true },
      { "id": "security-reports", "title": "Reports", "path": "/security/reports", "capability": "webino_view_security", "exclude_from_module_toggle": true },
      { "id": "security-settings", "title": "Settings", "path": "/security/settings", "capability": "webino_manage_security", "exclude_from_module_toggle": true }
    ]
  },
  "client": {
    "entry": "client/dist/module.js",
    "routes": [
      { "path": "security", "capability": "webino_view_security", "headerTitleKey": "security.overviewTitle" },
      { "path": "security/firewall", "capability": "webino_manage_security", "headerTitleKey": "security.firewallTitle" },
      { "path": "security/firewall/live", "capability": "webino_manage_security", "headerTitleKey": "security.liveTrafficTitle" },
      { "path": "security/firewall/rules", "capability": "webino_manage_security", "headerTitleKey": "security.rulesTitle" },
      { "path": "security/firewall/blocking", "capability": "webino_manage_security", "headerTitleKey": "security.blockingTitle" },
      { "path": "security/scan", "capability": "webino_manage_security", "headerTitleKey": "security.scanTitle" },
      { "path": "security/scan/:jobId", "capability": "webino_manage_security", "headerTitleKey": "security.scanJobTitle", "headerParamKeys": { "jobId": "jobId" } },
      { "path": "security/tools", "capability": "webino_manage_security", "headerTitleKey": "security.toolsTitle" },
      { "path": "security/tools/:tool", "capability": "webino_manage_security", "headerTitleKey": "security.toolTitle", "headerParamKeys": { "tool": "tool" } },
      { "path": "security/reports", "capability": "webino_view_security", "headerTitleKey": "security.reportsTitle" },
      { "path": "security/reports/:reportId", "capability": "webino_view_security", "headerTitleKey": "security.reportDetailTitle", "headerParamKeys": { "reportId": "reportId" } },
      { "path": "security/settings", "capability": "webino_manage_security", "headerTitleKey": "security.settingsTitle" }
    ]
  }
}
```

`bootstrap.php` فقط از `Webino_Dashboard_Module_Registry::require_module_files` استفاده می‌کند و کلاس‌های هسته + REST را `init` می‌کند. هیچ `require` به مسیر ماژول دیگر مجاز نیست.

### ۴.۲ بارگذاری زودهنگام (حیاتی‌تر از Wordfence)

رجیستری ماژول‌ها روی `init` لود می‌شود؛ برای WAF دیر است. در فعال‌سازی ماژول باید سه مکانیزم نوشته شود:

| لایه | فایل | زمان اجرا | مسئولیت |
|------|------|-----------|----------|
| L0 Prepend | `wp-content/webino-shield-waf.php` + `.user.ini` / `.htaccess` `auto_prepend_file` (اختیاری) | قبل از وردپرس | IP/CIDR/ASN/UA/rate، قوانین کامپایل‌شدهٔ بدون DB |
| L1 Drop-in | `wp-content/advanced-cache.php` (زنجیره با کش موجود) یا `object-cache.php` wrapper نیست — فقط advanced-cache زنجیره‌ای | خیلی زود | همان قوانین + خواندن کش object اگر موجود |
| L2 MU-plugin | `wp-content/mu-plugins/000-webino-shield.php` | `muplugins_loaded` | قوانین نیازمند حداقل وردپرس |
| L3 Plugin | bootstrap ماژول | `init` و هوک‌های تخصصی | لاگین، REST، XML-RPC، ووکامرس، اسکن، UI |

اگر `advanced-cache.php` از قبل متعلق به افزونهٔ کش باشد، Shield باید **زنجیره** شود (اصل فایل را نگه دارد و خودش را صدا بزند)، نه جایگزین کور.

Panic Unlock:

- URL یک‌بارمصرف: `/?webino-shield-unlock={64-hex}` که در `wp-content/webino-shield-unlock.php` یا option امضاشده ذخیره است.
- فایل: `wp-content/webino-shield.disable` — وجود فایل WAF را در حالت عبور کامل می‌گذارد و رویداد بحرانی می‌نویسد.
- WP-CLI: `wp webino shield unlock`.

---

## ۵. معماری اجرا

```text
[درخواست]
   │
   ▼
L0 Prepend / compiled rules + bloom(IP, hash)
   │ allow / challenge / block / log
   ▼
L1 Drop-in (اگر وردپرس شروع شده)
   ▼
L2 MU-plugin: GeoIP, session, logged-in bypass, REST class
   ▼
L3 Application hooks
   ├─ login / xmlrpc / rest / admin-ajax / upload
   ├─ Woo checkout / pay / webhook
   └─ Shield REST + cron + UI
   ▼
[اسکنر و Heal در صف Action Scheduler]
   ▼
[فیدها ← CRM Mirror ← fallback مستقیم]
```

### ۵.۱ کلاس‌های PHP (حداقل مجموعه)

| کلاس | مسئولیت |
|------|----------|
| `Webino_Dashboard_Security` | Facade، init، capability، activation |
| `Webino_Dashboard_Security_Install` | جداول، capability، drop-in، MU-plugin |
| `Webino_Dashboard_Security_Settings` | schema تنظیمات، پروفایل‌ها، validate |
| `Webino_Dashboard_Security_Db` | نام جداول، migrate |
| `Webino_Dashboard_REST_Security` | همهٔ routeها |
| `Webino_Shield_Waf` | ارکستراسیون لایه‌ها |
| `Webino_Shield_Waf_Request` | نرمال‌سازی HTTP (method, uri, headers, body, files, cookies, ip) |
| `Webino_Shield_Waf_Engine` | ارزیابی قانون، امتیاز، اقدام |
| `Webino_Shield_Waf_Compiler` | CRS + قوانین سفارشی → بایت‌کد/آرایهٔ کش‌شده |
| `Webino_Shield_Rate_Limiter` | محدودیت نرخ چندسطحی |
| `Webino_Shield_Blocklist` | IP/CIDR/UA/ASN/کشور/اثر انگشت |
| `Webino_Shield_Reputation` | امتیاز تجمعی IP/حساب |
| `Webino_Shield_Challenge` | JS challenge، captcha، rate-delay |
| `Webino_Shield_Geo` | MaxMind / IP2Location / CF-IPCountry / Arvan |
| `Webino_Shield_Bot_Manager` | ربات خوب/بد، ai.robots، verified bots |
| `Webino_Shield_Login` | brute force، 2FA، WebAuthn، honeypot |
| `Webino_Shield_Headers` | CSP و بقیه |
| `Webino_Shield_Scanner` | ارکستراسیون اسکن |
| `Webino_Shield_Integrity` | checksum هسته/افزونه/پوسته |
| `Webino_Shield_Malware` | امضا + heuristic + YARA |
| `Webino_Shield_Vuln` | CVE/پلاگین/پوسته/PHP/WP core |
| `Webino_Shield_Db_Scan` | بدافزار داخل DB |
| `Webino_Shield_Config_Audit` | hardening و پیکربندی |
| `Webino_Shield_Secrets` | کلید، salt، توکن در فایل و option |
| `Webino_Shield_Heal` | ترمیم، quarantine، rollback |
| `Webino_Shield_Snapshot` | اسنپ‌شات قبل از Heal |
| `Webino_Shield_Feeds` | همگام‌سازی فیدها |
| `Webino_Shield_Feed_Normalizer` | تبدیل منابع به مدل واحد |
| `Webino_Shield_Notify` | اتصال به Notify / SMS / Bots |
| `Webino_Shield_Audit` | لاگ ممیزی |
| `Webino_Shield_Reports` | امتیاز، PDF/CSV، زمان‌بندی |
| `Webino_Shield_Forensics` | تایم‌لاین حادثه |
| `Webino_Shield_Self_Guard` | یکپارچگی خود ماژول |
| `Webino_Shield_Cli` | WP-CLI |

موتور L0 (`engine/`) نباید به `ABSPATH` یا `$wpdb` وابسته باشد. تنظیمات داغ WAF در یک فایل JSON اتمیک (`wp-content/uploads/webino-shield/runtime-waf.json` با permission 0600) یا object cache منتشر می‌شود تا prepend بدون وردپرس کار کند.

---

## ۶. مدل داده

همهٔ جداول با `dbDelta` و نسخهٔ اسکیما. Retention پیش‌فرض قابل تنظیم است.

| جدول | نقش |
|------|-----|
| `webino_shield_events` | هر رویداد WAF/لاگین/اسکن/Heal (hot) |
| `webino_shield_event_payloads` | بدنهٔ درخواست، هدر، تطبیق قانون (جدا برای حجم) |
| `webino_shield_blocks` | بلاک‌های دستی و خودکار (IP/CIDR/UA/ASN/country/fingerprint) |
| `webino_shield_allow` | Allowlist متناظر |
| `webino_shield_rate` | شمارنده‌های نرخ (یا object-cache اگر موجود) |
| `webino_shield_reputation` | امتیاز IP و حساب |
| `webino_shield_rules` | قوانین سفارشی و override روی CRS |
| `webino_shield_rule_hits` | شمارش برخورد برای یادگیری |
| `webino_shield_scans` | شغل اسکن |
| `webino_shield_findings` | یافته‌ها (malware, vuln, config, secret, db, header, dns) |
| `webino_shield_file_index` | ایندکس فایل (path, hash, size, mtime, origin) |
| `webino_shield_quarantine` | فایل/ردیف قرنطینه |
| `webino_shield_snapshots` | اسنپ‌شات Heal |
| `webino_shield_feeds` | وضعیت هر فید (etag, version, last_ok, last_error) |
| `webino_shield_intel_ip` | مجموعهٔ IP از فیدها (یا فایل MMDB/روکِس فشرده) |
| `webino_shield_intel_hash` | هش بدافزار |
| `webino_shield_intel_cve` | آسیب‌پذیری نرمال‌شده |
| `webino_shield_intel_yara` | متادیتای قوانین YARA |
| `webino_shield_audit` | ممیزی مدیریتی |
| `webino_shield_reports` | گزارش‌های تولیدشده |
| `webino_shield_incidents` | حادثه (گروه رویدادها) |
| `webino_shield_canaries` | توکن و مسیر فریب |
| `webino_shield_2fa` | تنظیم 2FA/WebAuthn کاربران |
| `webino_shield_sessions` | نشست‌های اجباری/باطل‌شده |

ایندکس‌های اجباری: `events(created_at, action, ip_hash)`، `findings(scan_id, severity, status)`، `blocks(type, value_hash, expires_at)`، `intel_cve(slug, affected_version)`.

IP خام در گزارش UI فقط برای نقش Heal دیده می‌شود اگر `privacy.anonymize_ip` روشن باشد؛ در DB به‌صورت `ip` + `ip_hash` ذخیره می‌شود و anonymize قابل برگشت نیست وقتی گزینهٔ سخت فعال است.

حجم بالا: `events` و `event_payloads` باید پارتیشن منطقی روزانه + purge cron داشته باشند. در نصب‌های بزرگ، payload فقط برای `block`/`challenge` و نمونهٔ `log` نگه داشته می‌شود.

---

## ۷. فیدها و دیتابیس‌های تهدید (الزام چندمنبعی)

هر فید یک **اداپتر** دارد: `id`, `license`, `refresh_cron`, `timeout`, `etag`, `signature`, `enabled`, `priority`, `fallback`.  
نرمال‌سازی به چهار موجودیت: `ipset` | `hash` | `cve` | `rule`.

آینهٔ CRM مسیر پیشنهادی: `POST/GET webinocrm/v1/intel/{feed}` با امضای Ed25519. سایت مشتری کلید عمومی CRM را دارد.

### ۷.۱ آسیب‌پذیری و Virtual Patch

| شناسه فید | منبع | نوع | کلید | نقش |
|-----------|------|-----|------|-----|
| `wp_core_checksums` | api.wordpress.org | hash/integrity | خیر | مقایسهٔ هسته |
| `wp_plugin_checksums` | downloads.w.org + plugin API | hash | خیر | یکپارچگی افزونه |
| `wp_theme_checksums` | api.wordpress.org | hash | خیر | یکپارچگی پوسته |
| `wpvulnerability` | api.wpvulnerability.net | cve | خیر | CVE وردپرس متن‌باز |
| `wpscan` | WPScan API | cve | اختیاری | پلاگین/پوسته/هسته |
| `patchstack` | Patchstack API | cve + virtual-patch | اختیاری | وصلهٔ مجازی باکیفیت |
| `nvd` | NIST NVD 2.0 | cve | اختیاری (نرخ) | CVE عمومی |
| `osv` | osv.dev | cve | خیر | اکوسیستم PHP/composer/npm |
| `ghsa` | GitHub Advisory | cve | اختیاری | advisories |
| `cisa_kev` | CISA KEV | cve | خیر | درحال‌بهره‌برداری واقعی |
| `epss` | FIRST EPSS | score | خیر | احتمال بهره‌برداری |
| `cveorg` | CVE Services | cve | خیر | رکورد رسمی |
| `composer_audit` | composer.lock محلی | cve | خیر | vendor PHP |
| `npm_audit` | package-lock در پوسته/افزونه | cve | خیر | JS supply chain |

Virtual Patch: اگر CVE روی نسخهٔ نصب‌شده match شود و قانون WAF متناظر وجود داشته باشد، قانون با تگ `virtual_patch` و اولویت بالا فعال می‌شود — حتی قبل از به‌روزرسانی افزونه.

### ۷.۲ بدافزار، هش، YARA

| شناسه | منبع | نوع |
|--------|------|-----|
| `malwarebazaar` | abuse.ch MalwareBazaar | hash |
| `threatfox` | abuse.ch ThreatFox | ioc |
| `urlhaus` | abuse.ch URLhaus | url |
| `yaraify` | abuse.ch YARAify | yara |
| `sslbl` | abuse.ch SSLBL | cert/ip |
| `feodo` | abuse.ch Feodo | ip |
| `circl_hashlookup` | CIRCL | hash |
| `clamav_unofficial` | unofficial signatures (مجوزدار) | sig |
| `pmf` | PHP Malware Finder | yara |
| `lmd` | Linux Malware Detect subset | sig |
| `neo23x0_yara` | YARA community | yara |
| `shield_native` | امضاهای بومی Webino | sig/yara |
| `virustotal` | VT API | hash/url (اختیاری، on-demand) |

اسکنر فایل: SHA256 + fuzzy (ssdeep اگر ext موجود باشد) + heuristic PHP (eval/gzinflate/str_rot13/create_function/assert/preg_replace /e / `$_COOKIE` launcher) + YARA در CLI اگر باینری موجود باشد، وگرنه subset PHP.

### ۷.۳ IP / ربات / شهرت

| شناسه | منبع | نوع |
|--------|------|-----|
| `spamhaus_drop` | DROP / EDROP / ASN-DROP | ipset |
| `firehol_l1` | FireHOL level1 | ipset |
| `ipsum` | IPsum aggregated | ipset |
| `emerging_compromised` | Proofpoint ET | ipset |
| `abuseipdb` | AbuseIPDB | reputation (کلید) |
| `greynoise` | GreyNoise | noise vs targeted (کلید) |
| `otx` | AlienVault OTX | pulse (کلید) |
| `tor_exits` | TOR bulk exit | ipset |
| `datacenter_asn` | DB-IP / IPinfo / MaxMind | asn class |
| `crowdsec` | CrowdSec CAPI (اختیاری) | ipset |
| `stopforumspam` | StopForumSpam | ip/email |
| `ai_robots` | ai.robots.txt / dark visitors | ua |
| `good_bots` | Google/Bing/Apple verified (رنج رسمی) | allow |
| `cloudflare_threat` | اگر سایت پشت CF باشد از هدرها | hint |
| `arvan_threat` | اگر پشت آروان باشد از هدرها | hint |

### ۷.۴ Geo / هویت شبکه

| شناسه | منبع | نقش |
|--------|------|-----|
| `maxmind_city` | GeoLite2-City | کشور/شهر |
| `maxmind_asn` | GeoLite2-ASN | ASN |
| `ip2location_lite` | IP2Location LITE | fallback |
| `dbip_lite` | DB-IP lite | fallback |
| `cf_ipcountry` | هدر CF | سریع |
| `arvan_country` | هدر آروان | سریع |

پیش‌فرض: **کشور ایران هرگز در بلاک پیش‌فرض نیست.** پروفایل‌ها کشور را خالی می‌گذارند مگر اپراتور صریحاً انتخاب کند.

### ۷.۵ محتوا، فیشینگ، مرورگر

| شناسه | منبع | نقش |
|--------|------|-----|
| `gsb` | Google Safe Browsing v5 | URL سایت در بلک‌لیست |
| `openphish` | OpenPhish | فیشینگ |
| `phishtank` | PhishTank | فیشینگ |
| `observatory` | Mozilla HTTP Observatory logic (محلی) | نمرهٔ هدر |

### ۷.۶ سیاست همگام‌سازی

- Cron: `webino_shield_feeds_sync` هر ۶ ساعت + دستی از UI.
- هر فید مستقل fail می‌شود؛ وضعیت در `/security/settings` → Feeds.
- بستهٔ روزانهٔ CRM: یک tarball امضاشده شامل ipset + cve delta + yara. سایت‌های بدون کلید تجاری فقط بستهٔ متن‌باز را می‌گیرند.
- Integrity: Ed25519 + SHA256. فید بدون امضا در حالت سخت رد می‌شود.
- بودجهٔ دیسک: فشرده‌سازی (zstd/gz)، سقف قابل تنظیم، LRU برای hashهای کم‌استفاده.
- حالت آفلاین: آخرین فید موفق تا `feeds.stale_warn_hours` (پیش‌فرض ۷۲) معتبر است؛ بعد هشدار، نه خاموشی.

---

## ۸. فایروال

### ۸.۱ مدل اقدام

`allow` | `log` | `throttle` | `challenge_js` | `challenge_captcha` | `block` | `tarpit` | `virtual_patch_block`

اولویت: Allowlist دستی > Panic > Logged-in trusted > Virtual patch > Blocklist دستی > فید > CRS/سفارشی > Rate > Reputation > Allow.

### ۸.۲ موتور قوانین

- سازگار با **OWASP CRS 4.x** (پروفایل‌های `paranoia_level` 1..4).
- قوانین بومی وردپرس/ووکامرس (xmlrpc multicall، author enum، `file=../`، `rest_route` سوءاستفاده، install.php، timthumb، `wp-config` probe).
- قانون سفارشی UI: شرط روی method, path, query, header, cookie, body, ip, cidr, asn, country, ua, content-type, file ext, user role, rest namespace.
- اپراتورها: equals, contains, regex (ReDoS-safe با timeout و رد الگوی خطرناک), exists, gt/lt, in_set, threat_feed.
- اقدامات و استثنا per-rule.
- Learning mode: قانون جدید یا CRS سطح بالا فقط log می‌شود تا آستانهٔ FP.
- Compiler هر تغییر را به runtime JSON اتمیک می‌نویسد.

دسته‌های حمله (همه باید قانون داشته باشند):

SQLi, XSS, RCE, LFI, RFI, Path traversal, XXE, SSRF, CSRF (سخت‌گیری روی state-changing بدون nonce), HTTP parameter pollution, request smuggling hints, header injection, file upload (polyglot, double ext, php in image), deserialization PHP, template injection, open redirect, session fixation, xmlrpc brute, user enum, wp-login brute, rest user listing, Woo webhook spoof, payment callback replay.

### ۸.۳ محدودیت نرخ (چندسطحی)

ابعاد: IP، حساب کاربری، fingerprint، مسیر، کلاس مسیر.

کلاس‌های پیش‌فرض:

| کلاس | نمونه | پیش‌فرض (پروفایل Recommended) |
|------|--------|-------------------------------|
| `login` | wp-login, Woo login, OTP | 5 / 10min سپس challenge، 15 / 1h بلاک ۳۰دقیقه |
| `xmlrpc` | xmlrpc.php | 10 / 5min یا خاموش کامل |
| `rest_auth` | JWT/OTP/app passwords | 20 / 10min |
| `rest_public` | Store API | 120 / min |
| `checkout` | checkout/pay | 10 / 10min per IP |
| `search` | `?s=` | 30 / min |
| `comment` | wp-comments-post | 5 / 10min |
| `admin_ajax` | admin-ajax عمومی | 60 / min |
| `upload` | async-upload | 20 / 10min |
| `shield_public` | اگر endpoint عمومی باشد | جدا و سخت |

پشت‌صحنه شمارنده: object cache (Redis/Memcached) اگر باشد، وگرنه جدول `rate` با GC.

### ۸.۴ مدیریت ربات

- Allow ربات‌های تأییدشده با تطبیق UA **و** رنج IP رسمی (نه فقط UA).
- بلاک خزندهٔ AI در صورت تنظیم (مطابق لیست `ai_robots`).
- امتیازدهی رفتار: نرخ ۴۰۴، hit به honeypot، تنوع path، نبود Accept-Language.
- حالت «فقط مرورگر واقعی»: JS challenge برای UA مشکوک.

### ۸.۵ چالش‌ها

- JS Proof (cookie امضاشده، TTL کوتاه، HttpOnly, SameSite).
- Cloudflare Turnstile / hCaptcha / reCAPTCHA v3 — کلید در تنظیمات.
- صفحهٔ بلاک بومی، قابل ترجمه، بدون لیک از stack یا مسیر فایل.
- کد HTTP قابل تنظیم (403/429/444-like).

### ۸.۶ حفاظت ورود (فراتر از Wordfence)

- قفل بعد از N شکست، جدا برای username موجود / ناموجود (ضد enumeration زمانی: پاسخ یکسان و delay ثابت).
- غیرفعال‌کردن `login` با `?author=` و REST `/wp/v2/users` برای ناشناس.
- XML-RPC: خاموش، فقط pingback، یا Allowlist.
- Application Passwords: محدود به نقش / قابلیت خاموشی.
- 2FA TOTP + backup codes + WebAuthn.
- اجبار 2FA برای `administrator` و نقش‌های انتخابی.
- Remember-device با cookie امضاشده.
- Session control: یک نشست، logout از همه، idle timeout.
- CAPTCHA روی login/register/lostpassword/Woo checkout login.
- OTP موجود داشبورد (`Webino_Dashboard_Auth_Otp`) باید با این لایه سازگار بماند نه شکسته شود.
- Honeypot فیلد مخفی + مسیر جعلی `wp-login-protected.php`.

### ۸.۷ ووکامرس و پرداخت

- محدودیت نرخ checkout و `wc-ajax`.
- اعتبارسنجی webhook (Zarinpal, SnappPay, TorobPay, DigiPay, Bale Pay, card-to-card) — امضا/IP در صورت وجود.
- ضد carding: تنوع کارت/شماره موبایل در پنجرهٔ زمانی (بدون ذخیرهٔ PAN).
- مسدود کردن کشور/ASN فقط برای checkout اگر اپراتور بخواهد.
- محافظت از endpointهای ماژول‌های پرداخت داشبورد (هرگز با CRS خام کور بسته نشوند؛ Allow داخلی + قانون اختصاصی).

### ۸.۸ Live Traffic

جدول زنده با فیلتر: action, path, ip, country, rule, user, bot, period.  
از همین داده Forensic Timeline ساخته می‌شود. به‌روزرسانی با polling ۲–۵ ثانیه (نه websocket اجباری). قابلیت pause و export.

---

## ۹. اسکن سایت

اسکن همیشه شغل صف‌شده است (Action Scheduler اگر باشد، وگرنه WP-Cron تکه‌تکه). UI پیشرفت realtime دارد: درصد، فایل جاری، یافته‌های زنده.

### ۹.۱ پروفایل اسکن

| پروفایل | محتوا | زمان هدف روی سایت متوسط |
|---------|--------|-------------------------|
| `quick` | هسته + فایل‌های تغییر هفتهٔ اخیر + CVE نسخه‌ها + هدر + پیکربندی | < ۲ دقیقه |
| `standard` | quick + همهٔ PHP/JS در wp-content + DB options/posts excerpts + permissions | < ۲۰ دقیقه |
| `deep` | standard + uploads images (polyglot) + vendor + MU + drop-ins + revisions + cron + users + secrets + DNS | ساعتی، تکه‌تکه |
| `custom` | انتخاب دستی ماژول‌های اسکن | — |

قابل زمان‌بندی: hourly/daily/weekly + پنجرهٔ کم‌ترافیک (مثلاً ۰۲:۰۰–۰۶:۰۰ به وقت سایت).

### ۹.۲ ماژول‌های اسکن (همه باید پیاده شوند)

**یکپارچگی**

- هسته در برابر checksums.wordpress.org (هر فایل رسمی).
- افزونه‌ها و پوسته‌های موجود در wordpress.org.
- هشدار برای افزونه/پوستهٔ سفارشی یا نال‌شده (بدون checksum) با hash baseline اول.
- Drop-inها: `advanced-cache.php`, `object-cache.php`, `db.php`, `sunrise.php`, `maintenance.php`.
- MU-plugins و `index.php`های محافظ.
- `wp-config.php` (وجود، permission، کلیدها، debug).
- `.htaccess` / `nginx.conf` قابل‌خواندن / `.user.ini`.

**بدافزار فایل**

- امضا بومی + YARA + hash intel.
- Web shell، backdoor، miner، spam SEO hidden، pharma hack، iframe تزریقی.
- PHP داخل `uploads`.
- فایل با پسوند دوگانه و MIME mismatch.
- زمان ایجاد مشکوک (فایل PHP جدید بعد از آخرین به‌روزرسانی رسمی).

**بدافزار دیتابیس**

- `posts`, `postmeta`, `options`, `usermeta`, `comments`, `woocommerce` tables.
- `eval`, `base64_decode`, `document.write`, دامنه‌های فید URLhaus داخل محتوا.
- کاربر ادمین ناشناخته، `user_pass` ریست‌شده، نقش اضافه‌شده.
- Cron جعلی در `cron` option.
- `active_plugins` / `stylesheet` / `template` غیرمنتظره.
- widget و theme_mod آلوده.

**آسیب‌پذیری**

- نسخهٔ WP، PHP، WooCommerce، هر افزونه و پوسته.
- match به همهٔ فیدهای CVE فعال.
- اولویت با CISA KEV و EPSS بالا.
- افزونهٔ Abandoned (آخرین به‌روزرسانی > N روز، پیش‌فرض ۳۶۵).
- PHP خارج از ServeHappy.

**پیکربندی و سخت‌سازی**

- `DISALLOW_FILE_EDIT`, `DISALLOW_FILE_MODS`, `FORCE_SSL_ADMIN`, `WP_DEBUG` روی production.
- نمایش نسخهٔ WP، `readme.html`, `license.txt`, installer.
- Directory listing، `xmlrpc`, user enum، REST index.
- Permission فایل/پوشه (0755/0644 استاندارد، 0777 جرم).
- وجود بکاپ `.sql`, `.zip`, `.tar.gz`, `dump`, `wp-config.bak` در webroot.
- `debug.log` وب‌خوان.
- Salt ضعیف / کلید تکراری.
- Admin با ID=1 و username=`admin`.
- کاربر بدون 2FA در نقش حساس.
- افزونه‌های تداخلی امنیت (Wordfence/Sucuri/Solid) — هشدار همزیستی، نه حذف خودکار.

**اسرار**

- regex برای `AKIA`, `sk_live`, `ghp_`, `AIza`, توکن بله/تلگرام، کلید زرین‌پال، SMTP password در پوسته.
- `.env` وب‌خوان.
- `wp-config` کپی در backups.

**هدر و TLS و DNS**

- HSTS, CSP, X-Content-Type-Options, X-Frame-Options / frame-ancestors, Referrer-Policy, Permissions-Policy, COOP/COEP (اختیاری).
- گواهی TLS (انقضا، chain, protocol).
- SPF / DKIM / DMARC / CAA / DNSSEC در صورت امکان.
- MX و دامنهٔ مشابه (typosquat) — فاز ۸.

**ووکامرس**

- صفحات checkout روی HTTPS.
- ثبت‌نام نقش مشتری.
- webhookهای بدون secret.
- REST Store API بدون محدودیت نرخ (پیشنهاد).
- Pedidos/سفارش با وضعیت مشکوک تکرار بالا — فقط گزارش.

### ۹.۳ شدت و وضعیت یافته

`severity`: `critical` | `high` | `medium` | `low` | `info`  
`status`: `open` | `acknowledged` | `ignored` | `fixed` | `healed` | `false_positive`  
هر یافته باید `evidence`, `path_or_object`, `remediation`, `auto_heal_available`, `cve_ids`, `feed_ids` داشته باشد.

---

## ۱۰. ترمیم و بهبود (Heal)

این بخش تمایز اصلی با Wordfence است. Wordfence بیشتر «پیدا کن و فایل را حذف/overwrite کن» است؛ Shield باید **بهبود ساخت‌یافته و برگشت‌پذیر** بدهد.

### ۱۰.۱ اقدامات Heal

| اقدام | ورودی | پیش‌شرط | برگشت |
|-------|--------|---------|--------|
| `restore_core_file` | path | checksum رسمی | snapshot |
| `restore_plugin_file` | slug+path | بستهٔ رسمی wordpress.org | snapshot |
| `restore_theme_file` | stylesheet+path | بستهٔ رسمی | snapshot |
| `quarantine_file` | path | خارج از هستهٔ حیاتی | restore from quarantine |
| `delete_file` | path | فقط بعد از quarantine یا تأیید دوم | snapshot محتوا |
| `chmod_harden` | path+mode | — | snapshot mode |
| `clean_db_field` | table/pk/column | الگوی match | snapshot value |
| `disable_plugin` | slug | — | re-enable |
| `remove_user_role` / `disable_user` | user_id | نه کاربر جاری | snapshot roles |
| `rotate_salts` | — | تأیید دوم | مقادیر قبلی در snapshot رمزشده |
| `invalidate_sessions` | user/all | — | — |
| `regenerate_htaccess` | — | Apache | snapshot |
| `regenerate_index_guards` | dirs | — | — |
| `remove_readme` | — | — | snapshot |
| `apply_hardening_profile` | profile id | — | snapshot دسته‌ای |
| `enable_virtual_patch` | cve | قانون موجود | disable |
| `kill_rogue_cron` | hook | — | re-add snapshot |
| `replace_infected_option` | option_name | — | snapshot |
| `rebuild_author_permalinks` | — | ضد enum | — |

### ۱۰.۲ پروفایل‌های بهبود یک‌کلیکی

- `baseline`: DISALLOW_FILE_EDIT، مخفی‌کردن نسخه، بستن XML-RPC multicall، index.html خالی، permission، حذف readme، HSTS preload-ready (بدون preload اجباری).
- `store`: baseline + نرخ checkout + بستن REST users + اجبار HTTPS + 2FA ادمین پیشنهادی.
- `paranoid`: store + CRS paranoia 3 در learning + بلاک datacenter برای login + CSP report-only سپس enforce.
- هیچ پروفایلی کشور یا ASN را بدون تأیید جدا مسدود نمی‌کند.

### ۱۰.۳ ایمنی Heal

- مسیرهای ممنوع برای delete: `wp-config.php`, `wp-settings.php`, `wp-admin/`, `wp-includes/`, فایل‌های خود Shield، MU-plugin قفل.
- هسته فقط از بستهٔ رسمی همان نسخه restore می‌شود؛ هرگز از «نسخهٔ دیگر».
- قبل از هر دسته Heal، `Snapshot` با TTL قابل تنظیم (پیش‌فرض ۱۴ روز).
- Heal دسته‌ای روی production نیاز به checkbox «می‌دانم بکاپ دارم» دارد. پیشنهاد بکاپ واقعی اگر افزونهٔ بکاپ شناخته‌شده فعال باشد.
- اجرای Heal از REST باید nonce + capability + confirmation token داشته باشد (anti CSRF + anti replay).

---

## ۱۱. ابزارها

هر ابزار یک زیرمسیر `/security/tools/:tool` و REST متناظر دارد. همه کامل، با empty/error/loading.

| شناسه | کار |
|--------|-----|
| `whois` | WHOIS / RDAP + Geo + ASN + فیدهای intel برای یک IP |
| `ip-lookup` | شهرت تجمعی، تاریخچهٔ رویداد روی همین سایت |
| `diagnostics` | نسخهٔ PHP/WP، لایهٔ WAF فعال (L0–L3)، object cache، cron، permission، prepend status، تداخل افزونه |
| `integrity-diff` | diff فایل با نسخهٔ رسمی |
| `file-browser` | مرور فقط‌خواندنی داخل ABSPATH با محدودیت و جستجوی hash |
| `quarantine` | لیست، restore، destroy |
| `snapshots` | لیست و rollback |
| `sessions` | نشست‌های فعال وردپرس، ابطال |
| `password-audit` | کاربران با رمز ضعیف/رایج (hash در برابر top-lists محلی، نه ارسال به ابر) |
| `headers-tester` | درخواست به front و گزارش هدر |
| `tls-dns` | گواهی + SPF/DKIM/DMARC |
| `secrets-search` | اجرای on-demand اسکن اسرار |
| `canary` | ساخت مسیر/کاربر/فایل فریب |
| `honeypot` | وضعیت و برخوردها |
| `import-export` | خروجی/ورود تنظیمات و قوانین (بدون کلیدهای محرمانه مگر با تأیید) |
| `waf-learning` | تبدیل hitهای learning به قانون/استثنا |
| `incident` | باز کردن حادثه از رویدادها + export JSON/PDF |
| `compat` | تشخیص Wordfence/Sucuri/Solid و راهنمای همزیستی یا مهاجرت |
| `cli-recipes` | نمایش دستورهای WP-CLI معادل |
| `heal-wizard` | ویزارد بهبود از روی یافته‌های باز |

---

## ۱۲. گزارش

### ۱۲.۱ نمای کلی `/security`

کارت‌ها:

- امتیاز امنیت ۰–۱۰۰ (وزن‌دار: vulns باز، بدافزار، WAF mode، 2FA ادمین، هدر، فید تازه).
- وضعیت WAF (off / learning / enforce) و لایهٔ فعال.
- آخرین اسکن و تعداد یافتهٔ باز به تفکیک شدت.
- بلاک ۲۴ساعته و top قوانین.
- تازگی فیدها.
- حوادث باز.
- میانبر Heal پیشنهادی (اگر یافتهٔ auto_heal موجود باشد).

کارت خلاصه باید به `GET dashboard/overview` هم تزریق شود (پنل `security`) تا در خانهٔ داشبورد دیده شود.

### ۱۲.۲ گزارش‌های ساخت‌یافته

| گزارش | محتوا |
|--------|--------|
| `executive` | امتیاز، روند ۷/۳۰ روز، ۳ اقدام پیشنهادی — زبان مدیر غیر فنی |
| `firewall` | hit، block، FP، کشورها، ASN، قوانین |
| `vulnerabilities` | CVE با KEV/EPSS، وضعیت وصلهٔ مجازی |
| `malware` | یافته + Heal |
| `hardening` | چک‌لیست CIS WordPress + ASVS mapping |
| `compliance_hint` | اشاره‌های PCI-DSS برای فروشگاه (نه گواهی رسمی) + GDPR (retention لاگ، anonymize IP) |
| `incident` | تایم‌لاین یک حادثه |
| `feed_health` |uptime فیدها |

خروجی: مشاهده در UI، CSV، JSON، PDF (نسل سمت سرور ساده یا HTML print-ready).  
زمان‌بندی ایمیل + SMS/ربات خلاصهٔ روزانه/هفتگی.

---

## ۱۳. تنظیمات (سطح دانه‌ریز الزامی)

همهٔ کلیدها زیر option `webino_dashboard_security` با schema نسخه‌دار. UI به‌صورت بخش/زیربخش/جستجوی تنظیمات. چهار پروفایل مقدار پیش‌فرض را پر می‌کنند؛ بعد Custom می‌شود.

پروفایل‌ها: `beginner` | `recommended` | `store` | `paranoid`.

در زیر، کلیدها به صورت نقطه‌ای آمده‌اند. نوع در پرانتز است. مقدار پیش‌فرض پروفایل `recommended` ذکر شده مگر خلافش گفته شود.

### ۱۳.۱ عمومی

| کلید | نوع | پیش‌فرض | توضیح |
|------|-----|---------|--------|
| `general.enabled` | bool | true | خاموشی کل موتور (به‌جز Self-Guard و Unlock) |
| `general.profile` | enum | recommended | |
| `general.learning_mode` | bool | true برای ۷ روز اول | |
| `general.learning_days` | int | 7 | |
| `general.timezone_window` | string | site | پنجرهٔ cron |
| `general.data_region` | enum | local | local یا crm_mirror |
| `general.language_alerts` | enum | dashboard | |
| `general.self_guard` | bool | true | |
| `general.panic_unlock_enabled` | bool | true | |
| `general.panic_unlock_ttl_hours` | int | 2 | |
| `general.uninstall_wipe` | bool | false | |

### ۱۳.۲ حریم خصوصی

| کلید | پیش‌فرض |
|------|---------|
| `privacy.anonymize_ip` | true |
| `privacy.store_request_body` | false (true فقط برای block) |
| `privacy.body_max_bytes` | 4096 |
| `privacy.mask_query_secrets` | true |
| `privacy.retention_events_days` | 30 |
| `privacy.retention_payloads_days` | 7 |
| `privacy.retention_findings_days` | 365 |
| `privacy.retention_audit_days` | 365 |
| `privacy.retention_snapshots_days` | 14 |
| `privacy.hash_usernames_in_export` | false |

### ۱۳.۳ لایه‌های WAF

| کلید | پیش‌فرض |
|------|---------|
| `waf.enabled` | true |
| `waf.layer0_prepend` | false (پیشنهاد با هشدار سازگاری) |
| `waf.layer1_dropin` | true اگر advanced-cache خالی یا زنجیره‌پذیر |
| `waf.layer2_mu` | true |
| `waf.layer3_hooks` | true |
| `waf.mode` | learning → بعد از N روز enforce |
| `waf.fail_open` | true |
| `waf.circuit_breaker_errors` | 20 در ۶۰ثانیه |
| `waf.max_request_inspect_bytes` | 131072 |
| `waf.inspect_uploads` | true |
| `waf.inspect_json` | true |
| `waf.inspect_xml` | true |
| `waf.skip_media_ext` | jpg,jpeg,png,webp,woff2,mp4 |
| `waf.skip_paths` | /dashboard, /wp-cron.php |
| `waf.skip_rest_namespaces` | webino-dashboard/v1 |
| `waf.challenge_provider` | turnstile یا none |
| `waf.block_http_code` | 403 |
| `waf.tarpit_seconds` | 0 |
| `waf.page_branding` | true |

### ۱۳.۴ CRS و قوانین

| کلید | پیش‌فرض |
|------|---------|
| `rules.crs_enabled` | true |
| `rules.crs_paranoia` | 1 (paranoid: 3) |
| `rules.crs_anomaly_in` | 5 |
| `rules.crs_anomaly_out` | 4 |
| `rules.wp_ruleset` | true |
| `rules.woo_ruleset` | auto اگر Woo |
| `rules.virtual_patch` | true |
| `rules.virtual_patch_min_severity` | high |
| `rules.custom_enabled` | true |
| `rules.regex_timeout_ms` | 20 |
| `rules.max_rules_per_req` | 500 |
| `rules.log_only_ids` | [] |
| `rules.disabled_ids` | [] |

### ۱۳.۵ بلاک و اجازه

| کلید | پیش‌فرض |
|------|---------|
| `access.allow_ips` | [] (IP فعلی ادمین در ویزارد پیشنهاد می‌شود) |
| `access.allow_cidrs` | [] |
| `access.allow_asns` | [] |
| `access.allow_countries` | [] |
| `access.block_ips` | [] |
| `access.block_cidrs` | [] |
| `access.block_asns` | [] |
| `access.block_countries` | [] |
| `access.block_continents` | [] |
| `access.block_ua` | [] |
| `access.block_referrers` | [] |
| `access.block_tor` | false |
| `access.block_vpn` | false (نیاز فید) |
| `access.block_datacenter_on_login` | false |
| `access.auto_block_enabled` | true |
| `access.auto_block_threshold` | 8 events / 10min |
| `access.auto_block_duration_min` | 30 |
| `access.auto_block_max_duration_min` | 1440 |
| `access.auto_block_escalate` | true |
| `access.never_block_private_ip` | true |
| `access.never_block_allowlisted_role` | administrator |

### ۱۳.۶ نرخ و ربات

کلیدهای `rate.{class}.limit`, `rate.{class}.window_sec`, `rate.{class}.action`, `rate.{class}.block_min` برای هر کلاس بخش ۸.۳.

| کلید | پیش‌فرض |
|------|---------|
| `bots.verified_allow` | true |
| `bots.verify_ip_ranges` | true |
| `bots.block_empty_ua` | true |
| `bots.block_ai_crawlers` | false |
| `bots.challenge_unknown` | false |
| `bots.score_404_threshold` | 30 / 5min |

### ۱۳.۷ ورود و هویت

| کلید | پیش‌فرض |
|------|---------|
| `login.protect` | true |
| `login.max_fail` | 5 |
| `login.window_min` | 10 |
| `login.lock_min` | 30 |
| `login.same_response_time_ms` | 250 |
| `login.hide_errors` | true |
| `login.disable_xmlrpc` | true |
| `login.xmlrpc_pingback_only` | false |
| `login.disable_app_passwords` | false |
| `login.disable_rest_users` | true |
| `login.disable_author_enum` | true |
| `login.captcha` | false |
| `login.honeypot` | true |
| `login.2fa_optional` | true |
| `login.2fa_required_roles` | [administrator] در store/paranoid |
| `login.webauthn` | true |
| `login.idle_timeout_min` | 0 (paranoid: 30) |
| `login.single_session` | false |
| `login.limit_username` | [] |
| `login.rename_not_supported` | — wp-login rename عمداً پشتیبانی نمی‌شود (شکستن ووکامرس/OTP). به‌جای آن challenge و honeypot. |

### ۱۳.۸ هدرها

| کلید | پیش‌فرض |
|------|---------|
| `headers.enabled` | true |
| `headers.hsts` | false (true در store اگر HTTPS قطعی) |
| `headers.hsts_max_age` | 15552000 |
| `headers.hsts_subdomains` | false |
| `headers.hsts_preload` | false |
| `headers.xcto` | true |
| `headers.referrer` | strict-origin-when-cross-origin |
| `headers.frame` | sameorigin |
| `headers.csp_mode` | off \| report-only \| enforce |
| `headers.csp` | object ساخته‌شده در UI |
| `headers.permissions_policy` | camera=(), microphone=(), geolocation=() |
| `headers.coop` | off |
| `headers.remove_powered_by` | true |
| `headers.remove_wp_version` | true |

### ۱۳.۹ اسکن

| کلید | پیش‌فرض |
|------|---------|
| `scan.default_profile` | standard |
| `scan.schedule` | daily |
| `scan.schedule_hour` | 3 |
| `scan.low_traffic_only` | true |
| `scan.include_uploads` | true |
| `scan.include_db` | true |
| `scan.include_vuln` | true |
| `scan.include_secrets` | true |
| `scan.include_dns` | true |
| `scan.follow_symlinks` | false |
| `scan.exclude_globs` | node_modules, .git, cache, backup* |
| `scan.max_file_mb` | 8 |
| `scan.chunk_files` | 200 |
| `scan.yara_enabled` | true |
| `scan.clam_enabled` | false |
| `scan.abandoned_days` | 365 |
| `scan.auto_heal_safe` | false (فقط restore رسمی و chmod) |
| `scan.notify_on` | [critical, high] |

### ۱۳.۱۰ Heal

| کلید | پیش‌فرض |
|------|---------|
| `heal.require_reconfirm` | true |
| `heal.allow_delete` | false |
| `heal.allow_salt_rotate` | true |
| `heal.allow_user_disable` | true |
| `heal.snapshot_always` | true |
| `heal.max_batch` | 50 |
| `heal.forbid_paths` | لیست داخلی + سفارشی |

### ۱۳.۱۱ فیدها

برای هر فید: `feeds.{id}.enabled`, `.api_key`, `.priority`, `.max_age_hours`.

کلیدهای سراسری:

| کلید | پیش‌فرض |
|------|---------|
| `feeds.crm_mirror` | true |
| `feeds.direct_fallback` | true |
| `feeds.require_signature` | true |
| `feeds.sync_hours` | 6 |
| `feeds.stale_warn_hours` | 72 |
| `feeds.disk_quota_mb` | 256 |

### ۱۳.۱۲ اعلان

| کلید | پیش‌فرض |
|------|---------|
| `notify.email` | true |
| `notify.site` | true |
| `notify.sms` | false (اگر sms-panel فعال) |
| `notify.telegram` | false |
| `notify.bale` | false |
| `notify.digest` | daily |
| `notify.events.block_auto` | true |
| `notify.events.malware` | true |
| `notify.events.kev` | true |
| `notify.events.admin_login` | true |
| `notify.events.heal` | true |
| `notify.events.feed_fail` | true |
| `notify.events.canary` | true |
| `notify.throttle_min` | 15 |

رویدادها باید روی `Webino_Dashboard_Notify` و در صورت فعال بودن ماژول‌ها روی SMS/Bale/Telegram بنشینند. کلیدهای قالب: `{site}`, `{severity}`, `{summary}`, `{url}`.

### ۱۳.۱۳ عملکرد

| کلید | پیش‌فرض |
|------|---------|
| `perf.budget_ms_l0` | 8 |
| `perf.budget_ms_l3` | 20 |
| `perf.sample_log_rate` | 0.1 برای allow |
| `perf.use_object_cache` | true |
| `perf.use_bloom` | true |
| `perf.disable_on_wp_cli` | true (به‌جز فرمان‌های خود) |
| `perf.disable_on_cron` | false (نرخ جدا) |

### ۱۳.۱۴ همزیستی

| کلید | پیش‌فرض |
|------|---------|
| `compat.detect_other_waf` | true |
| `compat.auto_downgrade_if_cf_waf` | false — فقط پیشنهاد |
| `compat.trust_cf_connecting_ip` | true اگر هدر و secret/range معتبر |
| `compat.trust_arvan` | true مشابه |
| `compat.trust_x_forwarded_for` | false مگر محدودهٔ پروکسی تعریف شود |

IP واقعی: ترتیب `Arvan/CF` تأییدشده → `REMOTE_ADDR`. هرگز XFF باز از اینترنت بدون پروکسی مورد اعتماد.

---

## ۱۴. یکپارچگی با هسته و ماژول‌ها

| سیستم | یکپارچگی |
|--------|-----------|
| Home overview | پنل امتیاز + یافتهٔ بحرانی + وضعیت WAF |
| Notify | رویدادهای امنیت |
| SMS panel | خلاصه و هشدار بحرانی |
| Bale / Telegram | همان |
| Analytics | WAF نباید tracker hit را بشکند؛ مسیر analytics/hit Allow با نرخ |
| Payment modules | قوانین اختصاصی، نه CRS کور |
| OTP login | brute-force مشترک، نه قفل متقابل |
| License / CRM | آینهٔ فید + گزارش telemetry اختیاری (opt-in) |
| Core updater | اسکن بعد از به‌روزرسانی هسته/ماژول |
| PWA / SW | SW داشبورد در WAF استثنا |

قابلیت‌ها در activate به نقش ادمین اضافه می‌شوند و در `bootstrap` payload برای PermissionGate فرستاده می‌شوند.

آیکون `shield` به `module-icons.ts` و کلیدهای `nav.module.security-*` به `en.json` / `fa.json` اضافه می‌شود. alias در `NAV_MODULE_ID_ALIASES` لازم نیست مگر مهاجرت بعدی.

---

## ۱۵. REST API

پایه: `/wp-json/webino-dashboard/v1/security/...`  
همه به‌جز Unlock: nonce + capability. ورودی validate و escape. خروجی بدون path داخلی سرور برای نقش view.

| روش | مسیر | Cap | کار |
|-----|------|-----|-----|
| GET | `/security/overview` | view | امتیاز، KPI، پیشنهادها |
| GET/POST | `/security/settings` | manage | خواندن/نوشتن schema |
| POST | `/security/settings/profile` | manage | اعمال پروفایل |
| GET | `/security/settings/schema` | manage | برای ساخت UI پویا |
| GET | `/security/firewall/live` | manage | ترافیک زنده |
| GET/POST/DELETE | `/security/firewall/blocks` | manage | بلاک‌ها |
| GET/POST/DELETE | `/security/firewall/allows` | manage | اجازه |
| GET/POST/PATCH/DELETE | `/security/firewall/rules` | manage | قوانین سفارشی |
| POST | `/security/firewall/rules/test` | manage | تست قانون روی request نمونه |
| POST | `/security/firewall/learning/promote` | manage | ارتقای learning |
| GET | `/security/firewall/status` | manage | لایه‌ها، prepend، fail-open |
| POST | `/security/scan` | manage | شروع شغل |
| GET | `/security/scan` | manage | لیست شغل‌ها |
| GET | `/security/scan/{id}` | manage | جزئیات + پیشرفت |
| POST | `/security/scan/{id}/cancel` | manage | لغو |
| GET | `/security/findings` | view | فیلترپذیر |
| POST | `/security/findings/{id}` | manage | ack/ignore/fp |
| POST | `/security/heal/preview` | heal | پیش‌نمایش |
| POST | `/security/heal/apply` | heal | اجرا با confirmation |
| POST | `/security/heal/rollback` | heal | برگرداندن snapshot |
| GET | `/security/quarantine` | heal | |
| POST | `/security/quarantine/{id}/restore` | heal | |
| GET | `/security/snapshots` | heal | |
| GET | `/security/feeds` | manage | سلامت فید |
| POST | `/security/feeds/sync` | manage | همگام دستی |
| GET | `/security/tools/{tool}` | manage | |
| POST | `/security/tools/{tool}` | manage | |
| GET | `/security/reports` | view | |
| POST | `/security/reports` | manage | تولید |
| GET | `/security/reports/{id}` | view | |
| GET | `/security/audit` | manage | |
| GET | `/security/incidents` | view | |
| POST | `/security/incidents` | manage | |
| GET | `/security/2fa` | manage | وضعیت نقش‌ها (نه secret) |
| POST | `/security/unlock` | special | Panic، بدون نشست اگر توکن معتبر |
| GET | `/security/diagnostics` | manage | |

خطاها: `403` capability، `409` مدارشکن/قفل، `422` اعتبارسنجی، `423` فایل unlock، `429` نرخ خود API.

---

## ۱۶. UI و معیار صفحه

Shell شبیه Analytics: `SecurityShell.tsx` با زیرناوبری داخلی + outlet.

الزام هر صفحه مطابق PAGE-DONE:

1. داده از REST، toast خطا، skeleton.
2. empty state با اقدام بعدی.
3. CRUD واقعی همان صفحه.
4. PermissionGate با capability درست.
5. i18n en/fa.
6. ریسپانسیو (جدول با scroll افقی / کارت موبایل).
7. بدون ModulePlaceholder.

الگوی بصری: KPI بالا، فیلتر، جدول، پنل جزئیات. تنظیمات: جستجو + گروه‌های جمع‌شو + «بازگشت به پیش‌فرض این گروه».

ویزارد اولین ورود (فقط یک‌بار):

1. تشخیص IP ادمین و پیشنهاد Allowlist.
2. انتخاب پروفایل.
3. روشن/خاموش XML-RPC.
4. زمان اسکن روزانه.
5. کانال اعلان.
6. هشدار همزیستی با Wordfence در صورت فعال بودن.

---

## ۱۷. WP-CLI

```text
wp webino shield status
wp webino shield unlock
wp webino shield waf mode enforce|learning|off
wp webino shield block ip 1.2.3.4 --minutes=30
wp webino shield allow ip 1.2.3.4
wp webino shield scan --profile=quick
wp webino shield heal apply --finding=123 --yes
wp webino shield heal rollback --snapshot=...
wp webino shield feeds sync
wp webino shield export --file=shield.json
wp webino shield import --file=shield.json
```

همهٔ فرمان‌های تخریبی `--yes` می‌خواهند.

---

## ۱۸. امنیت خود ماژول

- Capabilityهای سفارشی؛ `manage_options` به‌تنهایی برای Heal کافی نیست مگر نقش ادمین آن را داشته باشد.
- Confirmation token یک‌بارمصرف برای Heal و salt rotate.
- کلیدهای فید در option جدا با `yes` autoload=no؛ در REST به‌صورت masked.
- فایل runtime WAF خارج از web root اگر ممکن؛ اگر در uploads است، `index.php` خالی + deny htaccess + نام تصادفی.
- Self-Guard هر روز hash فایل‌های `engine/` و drop-in را با baseline نصب مقایسه می‌کند.
- REST خود Shield rate-limit داخلی دارد.
- Export تنظیمات به‌طور پیش‌فرض API key را خالی می‌کند.
- Audit غیرقابل حذف از UI (فقط purge زمان‌دار).

---

## ۱۹. کارایی و مقیاس

| مسیر | بودجه |
|------|--------|
| L0 allowlist hit | ≤ 2ms |
| L0/L2 ارزیابی معمول | ≤ 8ms |
| L3 هوک | ≤ 20ms |
| Live traffic query | ایندکس‌شده، صفحه ۱۰۰تایی |
| اسکن | چانک، بدون بالا بردن `max_execution` بی‌نهایت؛ resume از file_index |

Bloom filter برای ipset بزرگ. CRS کامپایل‌شده. در صورت عبور از بودجه، قانون‌های paranoia بالا در آن درخواست skip و متریک ثبت می‌شود.

تست بار مصنوعی در فاز ۷: ۱۰۰ req/s اسکریپت لاگین/فروشگاه نباید بیش از بودجهٔ p95 اضافه کند.

---

## ۲۰. Multisite، استیج، کپی سایت

- جداول blog-prefixed در multisite؛ فیدها در site meta شبکه قابل اشتراک (تنظیم `feeds.network_shared`).
- WAF network-activate فقط از Super Admin.
- روی استیج: `general.profile` می‌تواند beginner باشد؛ بلاک کشور پیش‌فرض off.
- تشخیص `WP_ENVIRONMENT_TYPE` برای سخت‌گیری debug.

---

## ۲۱. فازبندی اجرا

هر فاز PR جدا، قابل انتشار، با تست و ترجمه. فاز بعدی شروع نمی‌شود اگر DoD فاز قبل قرمز باشد.

### فاز ۰ — پی‌ریزی (نیم‌اسپرینت)

**هدف:** ماژول روی دیسک، در سایدبار، بدون WAF واقعی اما با overview واقعی از وضعیت نصب.

Deliverable:

- `manifest.json`, `bootstrap.php`, Install, Settings defaults, Db tables خالی.
- Capabilityها.
- REST `overview`, `settings`, `diagnostics` (تشخیص لایه و تداخل).
- UI: Overview + Settings عمومی/حریم‌خصوصی (کامل، نه خالی).
- آیکون `shield` + i18n nav.
- ویزارد اولین ورود (Allowlist IP + پروفایل).
- Unlock file و گزینهٔ disable.
- Smoke: `smoke-modules-structure`, `smoke-module-routes`.

پذیرش: ماژول در Marketplace داخلی installed/active، مسیر `/security` و `/security/settings` مطابق PAGE-DONE، خاموش کردن ماژول overview خانه را fatals نمی‌کند.

### فاز ۱ — فایروال پایه (معادل و فراتر از Wordfence Free WAF سبک)

**هدف:** brute-force، XML-RPC، rate، block/allow IP، Live Traffic اولیه، MU-plugin.

Deliverable:

- L2 MU + L3 hooks.
- Login protection + honeypot + hide errors + author/REST users.
- Rate classes: login, xmlrpc, rest_public, comment, admin_ajax.
- Block/Allow IP+CIDR+UA.
- Events table + Live Traffic UI (`/security/firewall`, `/live`, `/blocking`).
- صفحهٔ block بومی fa/en.
- Fail-open و skip داشبورد.
- اعلان ایمیل/سایت برای auto-block و admin login.

پذیرش: ۱۰ شکست ورود از یک IP → challenge/block؛ XML-RPC خاموش؛ Allowlist ادمین هرگز قفل نشود؛ Panic file WAF را bypass کند.

### فاز ۲ — موتور قوانین و CRS

**هدف:** WAF واقعی با CRS پروفایل‌شده + قوانین وردپرس/ووکامرس + قانون سفارشی UI.

Deliverable:

- Compiler + runtime JSON.
- CRS paranoia 1–2 enforce، 3–4 learning.
- Ruleset بومی WP/Woo.
- UI `/security/firewall/rules` با تست قانون.
- Learning promote.
- Circuit breaker.
- L1 drop-in زنجیره‌ای (اگر ممکن).

پذیرش: payload شناخته‌شدهٔ SQLi/XSS روی جستجو/کامنت log یا block شود؛ checkout سالم بماند؛ قانون سفارشی path خاص را block کند و در test سبز شود.

### فاز ۳ — اسکن یکپارچگی + پیکربندی + CVE متن‌باز

**هدف:** اسکنر قابل زمان‌بندی که ارزش عملیاتی دارد.

Deliverable:

- Integrity هسته/افزونه/پوسته + drop-in/MU.
- Config audit (فهرست بخش ۹).
- Vuln از `wpvulnerability` + هسته ServeHappy + CISA KEV.
- شغل صف‌شده + UI اسکن و یافته‌ها.
- زمان‌بندی روزانه.
- Ignore / false positive.

پذیرش: تغییر عمدی یک فایل هسته در استیج پیدا شود؛ افزونهٔ با CVE ساختگی در فیکسچر گزارش شود؛ اسکن ناقص resume شود.

### فاز ۴ — بدافزار، YARA، دیتابیس، اسرار، فید هش

**هدف:** اسکنر بدافزار چندموتوره.

Deliverable:

- Heuristic PHP + `shield_native` + PMF subset.
- Hash intel از MalwareBazaar/ThreatFox از طریق CRM mirror (یا مستقیم اگر mirror نبود).
- DB scan + secrets.
- یافته با evidence و لینک به Heal (هنوز apply محدود).

پذیرش: فایل فیکسچر webshell در uploads به‌عنوان critical؛ option آلودهٔ ساختگی پیدا شود؛ `.env` وب‌خوان گزارش شود.

### فاز ۵ — ترمیم و بهبود برگشت‌پذیر

**هدف:** Heal کامل.

Deliverable:

- Snapshot + quarantine + restore رسمی + chmod + clean DB + disable user/plugin + rogue cron + hardening profiles.
- UI ویزارد Heal داخل Tools و از روی یافته.
- Confirmation token.
- Rollback.
- WP-CLI heal.

پذیرش: restore فایل هسته با checksum درست؛ rollback محتوا را برگرداند؛ delete بدون quarantine وقتی `heal.allow_delete=false` رد شود؛ کاربر جاری disable نشود.

### فاز ۶ — فید کامل + Virtual Patch + Geo/ASN/TOR + prepend اختیاری

**هدف:** چندمنبعی واقعی و WAF تهدیدمحور.

Deliverable:

- همهٔ اداپتورهای بخش ۷ با enable مستقل.
- CRM mirror client + verify امضا.
- Virtual patch از Patchstack/WPScan اگر کلید هست؛ بدون کلید از قوانین بومی+KEV.
- GeoLite2 اختیاری، CF/Arvan headers.
- Block کشور/ASN/TOR (پیش‌فرض خالی).
- L0 prepend اختیاری با diagnostics واضح.
- AbuseIPDB/GreyNoise on-demand در ابزار Whois.

پذیرش: فید خاموش کل WAF را نکشد؛ بستهٔ بدامضا رد شود؛ CVE KEV روی افزونهٔ نصب‌شده قانون virtual_patch بسازد؛ prepend در diagnostics درست گزارش شود.

### فاز ۷ — ابزارها + گزارش + Overview خانه + اعلان چندکاناله

**هدف:** سطح عملیاتی کامل برای مشتری.

Deliverable:

- همهٔ ابزارهای بخش ۱۱.
- گزارش‌های بخش ۱۲ + CSV/JSON/print PDF.
- کارت overview خانه.
- SMS / Bale / Telegram اگر ماژول فعال است.
- Digest زمان‌دار.
- Forensic incident.

پذیرش: هر tool مسیر PAGE-DONE؛ خانه امتیاز نشان بدهد؛ قطع SMS ماژول امنیت را خراب نکند.

### فاز ۸ — هویت پیشرفته، فریب، SBOM، انطباق، هدر/DNS/TLS

**هدف:** فاصلهٔ قطعی از Wordfence.

Deliverable:

- TOTP + backup + WebAuthn + اجبار نقش.
- Session control.
- Canary user/path/file.
- CSP builder با report-only.
- TLS/DNS ابزار و اسکن.
- SBOM اسکن composer/npm.
- گزارش CIS/ASVS/PCI-hint.
- Password audit محلی.
- Headers در enforce تدریجی.

پذیرش: ادمین بدون 2FA در پروفایل store به‌صورت finding high؛ برخورد canary حادثه بسازد؛ CSP report-only سایت را نشکند.

### فاز ۹ — سخت‌سازی تولید، Multisite، کارایی، مهاجرت از Wordfence

**هدف:** آمادهٔ فروشگاه‌های پرترافیک.

Deliverable:

- بودجهٔ perf و متریک.
- Bloom + object cache.
- Network settings.
- ایمپورت بلاک/allow از export Wordfence (CSV/JSON عمومی، نه DB proprietary).
- راهنمای همزیستی/مهاجرت در Tools → compat.
- L0 پایدار روی Apache/nginx/php-fpm (مستند per-server).
- آزمون بار و تنظیمات پیشنهادی هاست ایرانی.

پذیرش: p95 مطابق بودجه؛ ایمپورت لیست IP Wordfence؛ multisite blog دوم جداول جدا دارد.

### فاز ۱۰ — قفل کیفیت

**هدف:** «بدون نقص» قابل اثبات.

Deliverable:

- ماتریس تست دستی در `docs/MODULE-MANUAL-TEST-MATRIX.md` (ردیف security-module).
- Smoke اختصاصی `scripts/smoke-security-module.sh` (manifest، capability، ممنوعیت prepend ناامن، عدم نشت کلید).
- بازبینی تنظیمات پیش‌فرض روی سایت تازه (نباید خودش را قفل کند).
- بازبینی i18n و دسترسی صفحه‌ها.
- سند عملیات کوتاه برای پشتیبانی.

پذیرش: smoke-all شامل امنیت؛ چک‌لیست مهاجرت/Unlock در README ماژول؛ هیچ مسیر ناقص.

---

## ۲۲. ترتیب فایل‌های پیاده‌سازی (فاز ۰–۱)

حداقل مجموعهٔ فاز ۰ و ۱:

```text
Modules/security-module/manifest.json
Modules/security-module/bootstrap.php
Modules/security-module/includes/class-webino-dashboard-security.php
Modules/security-module/includes/class-webino-dashboard-security-install.php
Modules/security-module/includes/class-webino-dashboard-security-settings.php
Modules/security-module/includes/class-webino-dashboard-security-db.php
Modules/security-module/includes/class-webino-dashboard-rest-security.php
Modules/security-module/includes/class-webino-shield-waf.php
Modules/security-module/includes/class-webino-shield-login.php
Modules/security-module/includes/class-webino-shield-rate-limiter.php
Modules/security-module/includes/class-webino-shield-blocklist.php
Modules/security-module/includes/class-webino-shield-audit.php
Modules/security-module/includes/class-webino-shield-notify.php
Modules/security-module/engine/bootstrap-lite.php
Modules/security-module/client/module-entry.tsx
Modules/security-module/client/pages/SecurityShell.tsx
Modules/security-module/client/pages/SecurityOverviewPage.tsx
Modules/security-module/client/pages/SecurityFirewallPage.tsx
Modules/security-module/client/pages/SecuritySettingsPage.tsx
Modules/security-module/README.md
client/src/lib/module-icons.ts          # shield
client/src/i18n/locales/en.json
client/src/i18n/locales/fa.json
```

ساخت کلاینت:

```bash
bash scripts/build-module-client.sh security-module
```

---

## ۲۳. تست و Definition of Done

علاوه بر PAGE-DONE برای هر route:

### خودکار (بدون وردپرس)

- ساختار پکیج کامل است (manifest, bootstrap safe, client entry).
- مسیرهای client در manifest با فایل‌های page مطابقت دارند.
- bootstrap به ماژول دیگر require نمی‌کند.
- هیچ کلید API هاردکد نیست.
- `auto_prepend_file` در کد فقط از مسیر داخل wp-content نوشته می‌شود.

### دستی استیج

1. نصب تازه: ویزارد → پروفایل recommended → سایت جلو باز است، داشبورد باز است.
2. brute-force ساختگی → بلاک → Unlock با فایل.
3. Allowlist IP ادمین → brute روی همان IP بلاک نشود.
4. اسکن بعد از دستکاری فایل هسته.
5. Heal + rollback.
6. خاموش کردن ماژول از تنظیمات داشبورد → بدون fatal.
7. همزیستی با یک افزونهٔ کش (زنجیره advanced-cache).
8. پشت Cloudflare تستی: IP واقعی، نه IP لبه.
9. ووکامرس checkout و درگاه تستی موفق.
10. OTP ورود داشبورد سالم.
11. زبان FA/EN.
12. موبایل سایدبار و جداول.

### موارد رد کیفیت (خودکار شکست فاز)

- قفل شدن همهٔ ادمین‌ها.
- شکستن checkout.
- اسکن همزمان کل دیسک در request UI.
- ذخیرهٔ بدنهٔ کارت یا رمز عبور در events.
- بلاک پیش‌فرض کشور IR.
- صفحه با متن به‌زودی.
- فید بدون امضا در حالت `require_signature`.

---

## ۲۴. لایسنس، اخلاق، حقوقی فیدها

- کلیدهای تجاری (WPScan, Patchstack, AbuseIPDB, GreyNoise, VT, MaxMind license) متعلق به مشتری است و در CRM ذخیرهٔ اجباری ندارد مگر آینه با قرارداد.
- MaxMind GeoLite2 نیاز به پذیرش مجوز و حساب دارد؛ بدون کلید، فقط هدر CDN.
- YARA community: حفظ SPDX و فایل NOTICE.
- خروجی VT فقط on-demand و با هشدار حریم خصوصی.
- گزارش PCI «hint» است نه گواهی.
- لاگ ممکن است دادهٔ شخصی باشد؛ retention و anonymize پیش‌فرض روشن است (GDPR-minded).

---

## ۲۵. ریسک‌ها و تصمیم‌های قفل‌شده

| موضوع | تصمیم |
|--------|--------|
| تغییر نام `wp-login.php` | پشتیبانی نمی‌شود |
| جایگزینی کامل advanced-cache | ممنوع؛ فقط زنجیره |
| WAF ابری اجباری | خیر؛ موتور محلی اول است |
| یادگیری خودکار بلاک کشور | خیر |
| حذف خودکار کاربر ادمین ناشناس | خیر؛ فقط پیشنهاد Heal با تأیید |
| اجرای YARA در request فرانت | خیر؛ فقط صف اسکن |
| ذخیرهٔ payload کامل همهٔ allow | خیر |
| وابستگی به Wordfence Central | خیر |
| زبان موتور | PHP 7.4+ مطابق هستهٔ داشبورد؛ بدون سرویس Node سمت سرور |
| UI | React ماژول، نه wp-admin منو |

اگر نسخهٔ PHP سایت قابلیت prepend یا hash را ندارد، diagnostics باید واضح بگوید کدام لایه خاموش است — خاموشی خاموش و بی‌صدا ممنوع است.

---

## ۲۶. نقشهٔ مسیرهای نهایی (بعد از فاز ۷+)

| مسیر | بخش |
|------|-----|
| `/dashboard/security` | نمای کلی |
| `/dashboard/security/firewall` | وضعیت و KPI فایروال |
| `/dashboard/security/firewall/live` | ترافیک زنده |
| `/dashboard/security/firewall/rules` | CRS + سفارشی |
| `/dashboard/security/firewall/blocking` | Block / Allow |
| `/dashboard/security/scan` | اسکن و زمان‌بندی |
| `/dashboard/security/scan/:jobId` | جزئیات شغل |
| `/dashboard/security/tools` | فهرست ابزار + Heal wizard |
| `/dashboard/security/tools/:tool` | ابزار منفرد |
| `/dashboard/security/reports` | گزارش‌ها |
| `/dashboard/security/reports/:reportId` | جزئیات |
| `/dashboard/security/settings` | همهٔ تنظیمات |
| `/dashboard/settings/site/security` | alias به تنظیمات (از manifest settings.sections) |

`/dashboard/security/firewall` بدون زیرمسیر → تب وضعیت.  
`/dashboard/security/tools` بدون زیرمسیر → شبکهٔ ابزارها با جستجو.

---

## ۲۷. معیار «کامل‌تر از Wordfence» برای اعلام نسخهٔ ۱.۰

نسخهٔ `1.0.0` فقط وقتی برچسب می‌خورد که:

1. فازهای ۰ تا ۷ منتشر و روی استیج واقعی یک فروشگاه ووکامرس ایرانی (پشت CDN) تست شده باشند.
2. فاز ۸ حداقل: 2FA TOTP، CSP report-only، canary path، گزارش hardening.
3. فیدها: checksums وردپرس + WPVulnerability + CISA KEV + حداقل یک ipset (Spamhaus DROP یا FireHOL یا بستهٔ CRM) + یک منبع هش abuse.ch یا معادل آینه.
4. Heal restore هسته و quarantine فایل و rollback کار کند.
5. Unlock و fail-open مستند و تست‌شده باشد.
6. هیچ مسیر UI ناقص نباشد.
7. ماتریس دستی و smoke اختصاصی سبز باشد.

فازهای ۸ (باقی) و ۹ می‌توانند `1.1` / `1.2` باشند اما در این سند حذف نمی‌شوند؛ بدهی فنی نیستند، محدودهٔ نسخهٔ بعدی‌اند.

---

## ۲۸. شروع اجرا

پیاده‌سازی باید **دقیقاً از فاز ۰** شروع شود، نه از UI تزئینی بدون REST.  
بعد از ادغام فاز ۰، فاز ۱ بدون فاصلهٔ معماری جدید؛ هر میان‌بر در WAF (مثل بلاک فقط در `init`) مردود است چون از Wordfence ضعیف‌تر می‌شود.

مرجع قرارداد ماژول: [MODULES.md](./MODULES.md)  
مرجع کیفیت صفحه: [PAGE-DONE-CRITERIA.md](./PAGE-DONE-CRITERIA.md)  
مرجع تست ماژول: [MODULE-MANUAL-TEST-MATRIX.md](./MODULE-MANUAL-TEST-MATRIX.md)
