# Vendor bundle (SnappPay)

Place licensed upstream WooCommerce plugins in this directory before publishing the module ZIP.

## Required

```
vendor/snapppay-woocommerce-gateway/index.php
```

## Optional (Searchwise feed)

```
vendor/searchwise-woocommerce-plugin/searchwise-api-data-feed.php
```

## Standalone install

Customers may instead install the same plugins under `wp-content/plugins/`:

- `snapppay-woocommerce-gateway/index.php`
- `searchwise-woocommerce-plugin-main/searchwise-api-data-feed.php`

The module bootstrap prefers an active standalone plugin; otherwise it loads from `vendor/`.
