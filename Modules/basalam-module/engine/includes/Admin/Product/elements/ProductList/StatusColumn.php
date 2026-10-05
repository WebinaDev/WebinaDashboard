<?php

namespace WebinoBasalam\Admin\Product\elements\ProductList;

use WebinoBasalam\Admin\Components\ProductListComponents;
use WebinoBasalam\Utilities\ProductMetaKey;

defined('ABSPATH') || exit;
class StatusColumn
{
    public static function registerStatusColumn($columns)
    {
        $newColumns = [];
        foreach ($columns as $key => $value) {
            $newColumns[$key] = $value;
            if ($key === 'price') {
                $newColumns['webino_basalam_status'] = 'وضعیت محصول';
            }
        }

        return $newColumns;
    }

    public static function renderStatusColumnContent($column, $productId)
    {
        if ($column === 'webino_basalam_status') {
            $product = get_post_meta($productId, ProductMetaKey::basalamProductSyncStatus(), true);
            if ($product && $product == 'synced') {
                ProductListComponents::renderSyncProductStatusSynced();
            } elseif ($product == 'pending') {
                ProductListComponents::renderSyncProductStatusPending();
            } else {
                ProductListComponents::renderSyncProductStatusUnsync();
            }
        }
    }
}
