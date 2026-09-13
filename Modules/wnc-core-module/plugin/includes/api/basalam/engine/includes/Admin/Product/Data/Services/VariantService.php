<?php

namespace WncBasalam\Admin\Product\Data\Services;

use WncBasalam\Admin\Product\Data\Handlers\SimpleProductHandler;
use WncBasalam\Admin\Product\Data\Handlers\VariableProductHandler;
use WncBasalam\Admin\Product\Data\Strategies\CreateProductStrategy;
use WncBasalam\Admin\Product\Data\Strategies\CustomUpdateProductStrategy;
use WncBasalam\Admin\Product\Data\Strategies\QuickUpdateProductStrategy;
use WncBasalam\Admin\Product\Data\Strategies\UpdateProductStrategy;
use WncBasalam\Admin\Settings\SettingsConfig;

defined('ABSPATH') || exit;

class VariantService
{
    private $priceService;
    private array $settings;

    public function __construct()
    {
        $this->priceService = new PriceService();
        $this->settings = wncBasalamSettings()->getSettings();
    }

    public function getVariants($product): array
    {
        // Variations are synced as standalone Basalam products (not nested variants[]).
        return [];
    }

    /**
     * Build Basalam product payload for one WooCommerce variation (as its own product).
     *
     * @param \WC_Product $variation Variation.
     * @param \WC_Product $parent    Variable parent.
     * @param string      $mode      create|update|quick_update|custom_update
     * @return array<string,mixed>
     */
    public function buildStandaloneProductData($variation, $parent, string $mode = 'create'): array
    {
        $strategy = $this->resolveStrategy($mode);
        $data     = $strategy->collect($parent, new VariableProductHandler());

        unset($data['variants']);

        $data['name']          = $this->buildVariationTitle($parent, $variation);
        $data['primary_price'] = $this->priceService->calculateFinalPrice($variation);
        $data['stock']         = $this->getVariantStock($variation, $parent);

        $simple = new SimpleProductHandler();
        $data['weight']         = $simple->getWeight($variation);
        $data['package_weight'] = $simple->getPackageWeight($variation);

        $photo = $simple->getMainPhoto($variation);
        if ($photo) {
            $data['photo'] = $photo;
        }

        $data['variants'] = [];

        return array_filter(
            $data,
            static function ($value) {
                return $value !== null;
            }
        );
    }

    /**
     * Title: parent name + variation attribute display values.
     */
    public function buildVariationTitle($parent, $variation): string
    {
        $baseName = $parent->get_name();
        $parts    = [];
        foreach ($this->getVariantProperties($variation, $parent) as $property) {
            $value = isset($property['value']) ? trim((string) $property['value']) : '';
            if ($value !== '') {
                $parts[] = $value;
            }
        }

        $combined = $parts ? trim($baseName . ' ' . implode(' ', $parts)) : $baseName;

        $prefix = $this->settings[SettingsConfig::PRODUCT_PREFIX_TITLE] ?? '';
        $suffix = $this->settings[SettingsConfig::PRODUCT_SUFFIX_TITLE] ?? '';

        $name = $prefix ? "{$prefix} {$combined}" : $combined;
        $name = $suffix ? "{$name} {$suffix}" : $name;

        return mb_substr($name, 0, 120);
    }

    private function resolveStrategy(string $mode)
    {
        switch ($mode) {
            case 'update':
                return new UpdateProductStrategy();
            case 'quick_update':
                return new QuickUpdateProductStrategy();
            case 'custom_update':
                return new CustomUpdateProductStrategy();
            case 'create':
            default:
                return new CreateProductStrategy();
        }
    }

    private function getVariantStock($variation, $parentProduct): int
    {
        $defaultStock = $this->settings[SettingsConfig::DEFAULT_STOCK_QUANTITY];
        $safeStock = $this->settings[SettingsConfig::SAFE_STOCK];
        $stockSource = $this->settings[SettingsConfig::VARIABLE_PRODUCT_STOCK_SOURCE];

        [$stock, $stockStatus] = $this->resolveStockByPriority($stockSource, $variation, $parentProduct);

        $calculatedStock = $stockStatus === 'instock' ? $stock ?? $defaultStock : 0;

        if ($safeStock > 0 && $calculatedStock <= $safeStock) {
            return 0;
        }

        return $calculatedStock;
    }

    private function resolveStockByPriority(string $stockSource, $variation, $parentProduct): array
    {
        $preferredProduct = $stockSource === 'product' ? $parentProduct : $variation;
        $fallbackProduct = $stockSource === 'product' ? $variation : $parentProduct;

        $stock = $preferredProduct->get_stock_quantity();
        $stockStatus = $preferredProduct->get_stock_status();

        if ($stock === null && $stockStatus === 'instock') {
            $fallbackStock = $fallbackProduct->get_stock_quantity();
            $fallbackStockStatus = $fallbackProduct->get_stock_status();

            if ($fallbackStock !== null || $fallbackStockStatus !== 'instock') {
                $stock = $fallbackStock;
                $stockStatus = $fallbackStockStatus;
            }
        }

        return [$stock, $stockStatus];
    }

    /**
     * @return array<int,array{property:string,value:string}>
     */
    public function getVariantProperties($variation, $parentProduct): array
    {
        $properties = [];
        $variationData = $variation->get_variation_attributes();

        foreach ($variationData as $attributeName => $attributeValue) {
            $taxonomyName = str_replace('attribute_', '', $attributeName);
            $attributeLabel = str_replace(['pa_', '-'], ' ', wc_attribute_label($taxonomyName, $parentProduct));

            $valueName = rawurldecode((string) $attributeValue);
            if (taxonomy_exists($taxonomyName)) {
                $term = get_term_by('slug', $attributeValue, $taxonomyName);
                if ($term && !is_wp_error($term)) {
                    $valueName = $term->name;
                }
            }

            $properties[] = [
                'property' => $attributeLabel,
                'value' => str_replace('-', ' ', mb_convert_encoding($valueName, 'UTF-8', 'auto')),
            ];
        }

        return $properties;
    }
}
