<?php

namespace WebinoBasalam\Admin\Product\Data\Validators;

use WebinoBasalam\Utilities\ProductMetaKey;

defined('ABSPATH') || exit;

class ImageValidator implements ValidatorInterface
{
    public function validate($product): void
    {
        $basalamProductId = get_post_meta($product->get_id(), ProductMetaKey::basalamProductId(), true);
        
        if (!empty($basalamProductId)) return;

        if (!$this->hasUsableImage($product)) {
            throw new \InvalidArgumentException('محصول فاقد تصویر است.');
        }
    }

    /**
     * Variable products often keep the photo on a variation, not the parent.
     */
    private function hasUsableImage($product): bool
    {
        if ($product->get_image_id()) {
            return true;
        }

        if ($product->is_type('variation')) {
            $parent = wc_get_product((int) $product->get_parent_id());
            return $parent && (bool) $parent->get_image_id();
        }

        if (!$product->is_type('variable')) {
            return false;
        }

        foreach ($product->get_children() as $childId) {
            $child = wc_get_product((int) $childId);
            if ($child && $child->get_image_id()) {
                return true;
            }
        }

        return false;
    }
}
