<?php

namespace WebinoBasalam\Services\Products;

use WebinoBasalam\Utilities\ProductMetaKey;

class ConnectSingleProductService
{
    public static function connectProductById($wooProductId, $syncBasalamProductId)
    {
        $wooProductId = (int) $wooProductId;
        $syncBasalamProductId = is_scalar($syncBasalamProductId) ? (string) $syncBasalamProductId : '';
        if ($wooProductId < 1 || '' === $syncBasalamProductId) {
            return false;
        }

        $existingPosts = get_posts([
            'post_type'      => ['product', 'product_variation'],
            'post_status'    => ['publish', 'private', 'draft'],
            'meta_query'     => [
                [
                    'key'   => ProductMetaKey::basalamProductId(),
                    'value' => $syncBasalamProductId,
                ],
            ],
            'posts_per_page' => 1,
            'fields'         => 'ids',
        ]);

        if ($existingPosts) {
            $existingId = (int) ($existingPosts[0] ?? 0);
            if ($existingId > 0 && $existingId !== $wooProductId) {
                return false;
            }
            // Already linked to the same Woo entity.
            return true;
        }

        update_post_meta($wooProductId, ProductMetaKey::basalamProductId(), $syncBasalamProductId);
        update_post_meta($wooProductId, ProductMetaKey::basalamProductStatus(), 2976);
        update_post_meta($wooProductId, ProductMetaKey::basalamProductSyncStatus(), 'synced');

        return true;
    }
}
