<?php

namespace WebinoBasalam\Admin\Product\Data\Services;

use WebinoBasalam\Admin\Product\Data\Handlers\SimpleProductHandler;
use WebinoBasalam\Admin\Product\Data\Handlers\VariableProductHandler;
use WebinoBasalam\Admin\Product\Data\Strategies\CreateProductStrategy;
use WebinoBasalam\Admin\Product\Data\Strategies\CustomUpdateProductStrategy;
use WebinoBasalam\Admin\Product\Data\Strategies\QuickUpdateProductStrategy;
use WebinoBasalam\Admin\Product\Data\Strategies\UpdateProductStrategy;
use WebinoBasalam\Admin\Settings\SettingsConfig;

defined('ABSPATH') || exit;

class VariantService
{
    private $priceService;
    private array $settings;

    public function __construct()
    {
        $this->priceService = new PriceService();
        $this->settings = webinoBasalamSettings()->getSettings();
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
        $simple = new SimpleProductHandler();

        // Price/stock-only sync must not rename the Basalam product or send the parent id.
        if ($mode === 'quick_update') {
            return array_filter(
                array(
                    'primary_price' => $this->priceService->calculateFinalPrice($variation),
                    'stock'         => $this->getVariantStock($variation, $parent),
                ),
                static function ($value) {
                    return $value !== null;
                }
            );
        }

        $strategy = $this->resolveStrategy($mode);
        $data     = $strategy->collect($parent, new VariableProductHandler());

        // Strategies run on the variable parent, so id/type/variants belong to the parent, not this product.
        unset($data['variants'], $data['id'], $data['type']);

        $custom     = $mode === 'custom_update';
        $syncName   = !$custom || $this->shouldSync(SettingsConfig::SYNC_PRODUCT_FIELD_NAME);
        $syncPrice  = !$custom || $this->shouldSync(SettingsConfig::SYNC_PRODUCT_FIELD_PRICE) || $this->shouldSync(SettingsConfig::SYNC_PRODUCT_FIELD_VARIANT_PRICE);
        $syncStock  = !$custom || $this->shouldSync(SettingsConfig::SYNC_PRODUCT_FIELD_STOCK) || $this->shouldSync(SettingsConfig::SYNC_PRODUCT_FIELD_VARIANT_STOCK);
        $syncWeight = !$custom || $this->shouldSync(SettingsConfig::SYNC_PRODUCT_FIELD_WEIGHT);
        $syncPhotos = !$custom || $this->shouldSync(SettingsConfig::SYNC_PRODUCT_FIELD_PHOTOS);

        if ($syncName) {
            $data['name'] = $this->buildVariationTitle($parent, $variation);
        }

        if ($syncPrice) {
            $data['primary_price'] = $this->priceService->calculateFinalPrice($variation);
        }

        if ($syncStock) {
            $data['stock'] = $this->getVariantStock($variation, $parent);
        }

        if ($syncWeight) {
            $weight = $simple->getWeight($variation);
            $package = $simple->getPackageWeight($variation);
            $data['weight'] = $weight;
            $data['package_weight'] = max((int) $package, (int) ($weight ?? 0));
        } else {
            unset($data['weight'], $data['package_weight']);
        }

        if ($syncPhotos) {
            $photo = $simple->getMainPhoto($variation);
            if ($photo) {
                $data['photo'] = $photo;
            } elseif (!$parent->get_image_id()) {
                unset($data['photo']);
            }
        }

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

    private function shouldSync(string $fieldKey): bool
    {
        $setting = $this->settings[$fieldKey] ?? null;
        return $setting == true || $setting === '1' || $setting === 1;
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

        $calculatedStock = $stockStatus === 'instock' ? (int) ($stock ?? $defaultStock) : 0;
        $calculatedStock = max(0, $calculatedStock);

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
