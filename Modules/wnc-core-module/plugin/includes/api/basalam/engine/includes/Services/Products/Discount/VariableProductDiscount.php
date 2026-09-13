<?php

namespace WncBasalam\Services\Products\Discount;

use WncBasalam\Utilities\ProductMetaKey;

defined('ABSPATH') || exit;

class VariableProductDiscount implements DiscountInterface
{
    private $discountService;

    public function __construct(DiscountManager $discountService)
    {
        $this->discountService = $discountService;
    }

    public function apply($product): void
    {
        foreach ($product->get_children() as $variation_id) {
            $variation = wc_get_product($variation_id);
            if (!$variation) {
                continue;
            }

            // Standalone model: each variation is a Basalam product.
            $basalam_product_id = get_post_meta($variation_id, ProductMetaKey::basalamProductId(), true);
            if ($basalam_product_id) {
                $regular = $variation->get_regular_price();
                $sale    = $variation->get_sale_price();
                if (!$regular || !$sale) {
                    continue;
                }
                $discount = $this->discountService->calculateDiscountPercent($regular, $sale);
                $this->discountService->apply($discount, [$basalam_product_id], null, null);
                continue;
            }

            // Legacy nested variation id.
            $basalam_id = get_post_meta($variation_id, 'sync_basalam_variation_id', true);
            if (!$basalam_id) {
                continue;
            }

            $regular = $variation->get_regular_price();
            $sale    = $variation->get_sale_price();
            if (!$regular || !$sale) {
                continue;
            }

            $discount = $this->discountService->calculateDiscountPercent($regular, $sale);
            $this->discountService->apply($discount, null, [$basalam_id], null);
        }
    }

    public function remove($product): void
    {
        $product_ids   = [];
        $variation_ids = [];
        foreach ($product->get_children() as $variation_id) {
            $basalam_product_id = get_post_meta($variation_id, ProductMetaKey::basalamProductId(), true);
            if ($basalam_product_id) {
                $product_ids[] = $basalam_product_id;
                continue;
            }
            $basalam_id = get_post_meta($variation_id, 'sync_basalam_variation_id', true);
            if ($basalam_id) {
                $variation_ids[] = $basalam_id;
            }
        }
        if (!empty($product_ids)) {
            $this->discountService->remove($product_ids, null);
        }
        if (!empty($variation_ids)) {
            $this->discountService->remove(null, $variation_ids);
        }
    }
}
