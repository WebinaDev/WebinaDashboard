<?php

namespace WncBasalam\Admin\Product\Validators;

use WncBasalam\Logger\Logger;
use WncBasalam\Services\Products\ProductConnection;
use WncBasalam\Utilities\ProductMetaKey;

defined('ABSPATH') || exit;

class ProductOperationValidator
{
    public function validate(int $product_id): array
    {
        $product = wc_get_product($product_id);
        if (!$product) {
            return [
                'valid' => false,
                'message' => sprintf('محصول با شناسه %d وجود ندارد.', $product_id)
            ];
        }

        if ($product->get_status() !== 'publish') return [
            'valid' => false,
            'message' => sprintf('محصول %d منتشر شده نیست.', $product_id)
        ];

        return [
            'valid' => true,
            'message' => sprintf('محصول %d برای عملیات معتبر است.', $product_id)
        ];
    }

    public function validateBasalamConnection(int $product_id): array
    {
        $product = wc_get_product($product_id);

        // Variable parents: connected when any child has a Basalam product id (standalone model).
        if ($product && $product->is_type('variable')) {
            $connectedChild = null;
            foreach ($product->get_children() as $variationId) {
                $childId = get_post_meta((int) $variationId, ProductMetaKey::basalamProductId(), true);
                if (!empty($childId)) {
                    $connectedChild = (int) $variationId;
                    break;
                }
            }
            if (null === $connectedChild) {
                // Legacy: parent itself may still hold nested product id.
                $basalamProductId = get_post_meta($product_id, ProductMetaKey::basalamProductId(), true);
                if (empty($basalamProductId)) {
                    return [
                        'valid' => false,
                        'message' => sprintf('محصول %d به باسلام متصل نیست.', $product_id)
                    ];
                }
            } else {
                return [
                    'valid' => true,
                    'message' => sprintf('محصول متغیر %d از طریق متغیرها به باسلام متصل است.', $product_id)
                ];
            }
        }

        $basalamProductId = get_post_meta($product_id, ProductMetaKey::basalamProductId(), true);

        if (empty($basalamProductId)) {
            return [
                'valid' => false,
                'message' => sprintf('محصول %d به باسلام متصل نیست.', $product_id)
            ];
        }

        $conflictingIds = ProductConnection::conflictingProductIds($product_id);

        if ($conflictingIds) {
            return [
                'valid' => false,
                'message' => ProductConnection::conflictMessage($basalamProductId, $conflictingIds)
            ];
        }

        return [
            'valid' => true,
            'message' => sprintf('محصول %d به باسلام متصل است.', $product_id)
        ];
    }

    public function logValidationResult(int $product_id, array $result, string $operation): void
    {
        if (!$result['valid']) {
            Logger::warning($result['message'], [
                'product_id' => $product_id,
                'عملیات' => $operation,
                'اعتبارسنجی_ناموفق' => true
            ]);
        }
    }
}
