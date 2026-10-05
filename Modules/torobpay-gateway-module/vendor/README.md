# Vendor bundle (TorobPay)

Place the licensed upstream TorobPay WooCommerce gateway in this directory before publishing the module ZIP.

## Required

```
vendor/torobpay-woocommerce-gateway/index.php
```

## Standalone install

Customers may instead install `torobpay-woocommerce-gateway/index.php` under `wp-content/plugins/`.

The module bootstrap prefers an active standalone plugin; otherwise it loads from `vendor/`.
