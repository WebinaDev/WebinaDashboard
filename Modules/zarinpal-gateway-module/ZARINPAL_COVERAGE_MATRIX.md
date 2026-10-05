# Zarinpal Coverage Contract

Status legend: `implemented`, `queued`, `pending`.

- `POST /payment/request.json` -> `Zarinpal_Gateway_Service::request_payment` (`implemented`)
- `POST /payment/verify.json` -> `Zarinpal_Gateway_Service::verify_payment` (`implemented`)
- `POST /payment/refund.json` -> `Zarinpal_Gateway_Service::refund` (`implemented`)

Dashboard/Woo mapping:
- Woo gateway: `WC_Gateway_Zarinpal`
- Callback: `woocommerce_api_webino_zarinpal_gateway`
- Dashboard REST:
  - `GET/POST /webino-dashboard/v1/zarinpal/settings`
  - `GET /webino-dashboard/v1/zarinpal/status`
  - `GET /webino-dashboard/v1/zarinpal/coverage/endpoints`
  - `POST /webino-dashboard/v1/zarinpal/reconcile`
