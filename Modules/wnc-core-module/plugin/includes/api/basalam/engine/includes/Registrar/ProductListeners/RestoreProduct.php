<?php

namespace WncBasalam\Registrar\ProductListeners;

use WncBasalam\Admin\Product\ProductOperations;

defined('ABSPATH') || exit;

class RestoreProduct extends ProductListenerAbstract
{
    private $productOperations;

    public function __construct($productOperations = null)
    {
        $this->productOperations = $productOperations ?: wncBasalamContainer()->get(ProductOperations::class);
    }

    public function handle($productId)
    {
        $product = wc_get_product($productId);

        if (!$product || $product->is_type('variation')) {
            return;
        }

        $syncStatus = $this->isProductSyncEnabled();

        if (!$syncStatus || !wc_get_product($productId)) {
            return;
        }

        $this->productOperations->restoreExistProduct($productId);
    }
}
