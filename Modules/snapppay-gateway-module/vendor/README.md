# Vendor bundle (SnappPay)

The module ships first-party REST/config code and needs the upstream
`snapppay-woocommerce-gateway` plugin for the actual gateway class. `manifest.json`
declares `vendor.required_paths`, so a release ZIP missing the file is rejected
before install.

## Required (declared in manifest.json)

```
vendor/snapppay-woocommerce-gateway/index.php
```

## Optional (Searchwise feed)

```
vendor/searchwise-woocommerce-plugin/searchwise-api-data-feed.php
```

## Standalone install

Customers may instead install the plugin under `wp-content/plugins/`:

- `snapppay-woocommerce-gateway/index.php`

`Webino_SnappPay_Vendor_Loader` prefers an active standalone plugin; otherwise it
loads the bundled copy from `vendor/`. `status()` reports which source won, and a
missing vendor file degrades to "standalone install required" instead of a fatal.
