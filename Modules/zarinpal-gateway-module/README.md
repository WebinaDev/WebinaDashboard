# ماژول Zarinpal Gateway

## معرفی
یکپارچه‌سازی درگاه زرین‌پال (PG v4) برای WooCommerce و داشبورد Webina — هم‌تراز افزونه رسمی ووکامرس زرین‌پال.

## امکانات
- درخواست پرداخت و StartPay (sandbox / live)
- callback سخت‌گیرانه: تطبیق Authority، کدهای verify `100`/`101`
- تبدیل ارز به ریال: IRT/TOMAN×10، IRHR×1000، IRHT×10000، IRR
- کارمزد خریدار (`fee_payer`) + `suggested_amount`
- استرداد GraphQL `AddRefund` با `access_token`
- inquiry / unVerified reconcile / reverse / feeCalculation
- همگام‌سازی تنظیمات با `woocommerce_zarinpal_gateway_settings`
- HPOS و ارزهای IRR/IRT/IRHR/IRHT

## معماری
- هسته: `includes/class-zarinpal-module.php`
- REST: `includes/class-webino-dashboard-rest-zarinpal.php`
- سرویس: `Zarinpal_Client`, `Zarinpal_Gateway_Service`, `Zarinpal_Jobs`
- gateway: `includes/woocommerce/class-wc-gateway-zarinpal.php` (id: `zarinpal_gateway`)
- UI: `client/pages/zarinpal/ZarinpalSettingsPage.tsx`

## مسیرهای داشبورد
- `/settings/shop/zarinpal` — Connection
- `/settings/shop/zarinpal/payments` — Payments
- `/settings/shop/zarinpal/operations` — Operations

## REST
- `GET|POST /wp-json/webino-dashboard/v1/zarinpal/settings`
- `POST /wp-json/webino-dashboard/v1/zarinpal/test-connection`
- `POST /wp-json/webino-dashboard/v1/zarinpal/reconcile`
- `POST /wp-json/webino-dashboard/v1/zarinpal/lookup`
- `GET /wp-json/webino-dashboard/v1/zarinpal/status`
- `GET /wp-json/webino-dashboard/v1/zarinpal/coverage/endpoints`

## نسخه
ماژول **1.1.0**
