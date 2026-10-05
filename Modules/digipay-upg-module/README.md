# ماژول DigiPay UPG

## معرفی
ماژول DigiPay UPG چهار مدل درگاه اقساطی/پرداخت دیجی‌پی را برای WooCommerce فعال می‌کند و مدیریت آن را در Dashboard ارائه می‌دهد.

## امکانات
- پشتیبانی کامل از 4 مدل:
  - DigiPay BPG
  - DigiPay CPG
  - DigiPay Wallet
  - DigiPay IPG
- اتصال OAuth و کلاینت API دیجی‌پی
- callback/verify سفارش بعد از بازگشت کاربر
- لاگ تراکنش‌ها در داشبورد
- سازگاری با WFCP برای سناریوهای فروش اقساطی
- lifecycle سفارش: complete/refund/deliver

## معماری و اجزای اصلی
- هسته: `includes/class-digipay-upg-module.php`
- REST: `includes/class-webino-dashboard-rest-digipay.php`
- gatewayها: `includes/woocommerce/`
- سرویس‌ها: `Digipay_OAuth`, `Digipay_Api_Client`, `Digipay_Lifecycle`
- UI: `client/pages/digipay/DigipaySettingsPage.tsx`

## مسیرهای کلیدی
- `manifest.json`
- `bootstrap.php`
- `includes/`
- `client/module-entry.tsx`

## تنظیمات و پیش‌نیازها
- نیازمند WooCommerce و credential معتبر DigiPay
- تنظیمات در:
  - `/settings/shop/digipay`
  - `/settings/shop/digipay/transactions`
- برای اقساط WFCP، gateway mapping باید در تنظیمات WFCP انجام شود

## مسیرهای REST مهم
- `GET|POST /wp-json/webino-dashboard/v1/digipay/settings`
- `POST /wp-json/webino-dashboard/v1/digipay/test-connection`
- `GET /wp-json/webino-dashboard/v1/digipay/transactions`

## عیب‌یابی سریع
- اگر callback ناموفق است، endpoint ووکامرس و verify response را بررسی کنید.
- اگر درگاه‌ها نمایش داده نمی‌شوند، تنظیمات WFCP و eligibility سبد را چک کنید.
- اگر لاگ‌ها خالی‌اند، lifecycle hookهای order را بررسی کنید.
