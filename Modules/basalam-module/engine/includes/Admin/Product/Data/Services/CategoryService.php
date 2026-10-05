<?php

namespace WebinoBasalam\Admin\Product\Data\Services;

use WebinoBasalam\Admin\Product\Category\CategoryMapping;
use WebinoBasalam\Admin\Settings\SettingsConfig;
use WebinoBasalam\Config\Endpoints;
use WebinoBasalam\Services\Products\GetCategoryId;

defined('ABSPATH') || exit;

class CategoryService
{
    private static array $resolvedCategoryCache = [];

    public function getPrimaryCategoryId($product): ?int
    {
        $categoryIds = $this->getCategoryIds($product);
        if (empty($categoryIds)) return null;

        $lastCategoryId = end($categoryIds);
        return is_numeric($lastCategoryId) ? intval($lastCategoryId) : null;
    }

    public function getCategoryIds($product): array
    {
        $categoryProduct = $this->resolveCategoryProduct($product);
        $productId = $this->resolveProductId($categoryProduct);

        if ($productId !== null && array_key_exists($productId, self::$resolvedCategoryCache)) {
            return self::$resolvedCategoryCache[$productId];
        }

        $mappedCategories = $this->normalizeCategoryIds($this->getMappedCategories($categoryProduct));
        if (!empty($mappedCategories)) {
            return $this->storeCache($productId, $mappedCategories);
        }

        if (!is_object($categoryProduct) || !method_exists($categoryProduct, 'get_name')) {
            return $this->storeCache($productId, []);
        }

        $productTitle = $categoryProduct->get_name();

        $prefix = webinoBasalamSettings()->getSettings(SettingsConfig::PRODUCT_PREFIX_TITLE);
        $suffix = webinoBasalamSettings()->getSettings(SettingsConfig::PRODUCT_SUFFIX_TITLE);

        if (!empty($prefix)) $productTitle = $prefix . ' ' . $productTitle;
        if (!empty($suffix)) $productTitle = $productTitle . ' ' . $suffix;

        $productTitle = mb_substr($productTitle, 0, 120);
        $detectUrl = Endpoints::CATEGORY_DETECT . '?title=' . urlencode($productTitle);

        try {
            $detectedCategories = GetCategoryId::getCategoryIdFromBasalam(urlencode($productTitle), 'multi', false, true);
        } catch (\Throwable $e) {
            $msg = sprintf(
                '[category_detect] %s | URL: %s',
                $e->getMessage(),
                $detectUrl
            );
            throw new \RuntimeException(esc_html($msg), 0, $e);
        }

        $detectedCategories = $this->normalizeCategoryIds(is_array($detectedCategories) ? $detectedCategories : []);

        return $this->storeCache($productId, $detectedCategories);
    }

    private function storeCache(?int $productId, array $categoryIds): array
    {
        if ($productId !== null) {
            self::$resolvedCategoryCache[$productId] = $categoryIds;
        }

        return $categoryIds;
    }

    private function resolveCategoryProduct($product)
    {
        if (!is_object($product)) {
            return $product;
        }

        if ($product instanceof \WC_Product_Variation) {
            $parentId = $product->get_parent_id();
            if ($parentId > 0) {
                $parentProduct = wc_get_product($parentId);
                if ($parentProduct) {
                    return $parentProduct;
                }
            }
        }

        return $product;
    }

    private function resolveProductId($product): ?int
    {
        if (!is_object($product) || !method_exists($product, 'get_id')) return null;

        $productId = $product->get_id();
        if (!is_numeric($productId)) return null;

        return intval($productId);
    }

    private function normalizeCategoryIds(array $categoryIds): array
    {
        $normalized = [];

        foreach ($categoryIds as $categoryId) {
            if (!is_numeric($categoryId)) continue;

            $categoryId = intval($categoryId);
            if ($categoryId > 0) $normalized[] = $categoryId;
        }

        return array_values(array_unique($normalized));
    }

    private function getMappedCategories($product): array
    {
        if (!is_object($product) || !method_exists($product, 'get_category_ids')) {
            return [];
        }

        $wooCategories = $product->get_category_ids();

        if (empty($wooCategories)) return [];

        foreach ($wooCategories as $wooCategoryId) {
            $mappedCategory = CategoryMapping::getBasalamCategoryForWooCategory($wooCategoryId);

            if ($mappedCategory && !empty($mappedCategory->basalam_category_ids)) return $mappedCategory->basalam_category_ids;
        }

        return [];
    }
}
