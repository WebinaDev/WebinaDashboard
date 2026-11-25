# Vendor bundle (TorobPay)

The module ships first-party REST/config/refund code and needs the upstream
`torobpay-woocommerce-gateway` plugin for the gateway class. `manifest.json`
declares `vendor.required_paths`, so a release ZIP missing the file is rejected
before install.

## Required (declared in manifest.json)

```
vendor/torobpay-woocommerce-gateway/index.php
```

## Standalone install

Customers may instead install `torobpay-woocommerce-gateway/index.php` under
`wp-content/plugins/`.

`Webino_TorobPay_Vendor_Loader` prefers an active standalone plugin; otherwise it
loads the bundled copy from `vendor/`. `status()` reports which source won, and a
missing vendor file degrades to "standalone install required" instead of a fatal.
