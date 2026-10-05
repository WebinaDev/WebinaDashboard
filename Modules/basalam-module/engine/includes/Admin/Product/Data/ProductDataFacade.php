<?php

namespace WebinoBasalam\Admin\Product\Data;

use WebinoBasalam\Admin\Product\Data\Services\VariantService;
use WebinoBasalam\Admin\Product\Data\Validators\ValidatorChain;
use WebinoBasalam\Admin\Product\Data\Validators\ImageValidator;
use WebinoBasalam\Admin\Product\Data\Validators\ProductExistenceValidator;
use WebinoBasalam\Admin\Product\Data\Validators\ProductStatusValidator;
use WebinoBasalam\Admin\Product\Data\Validators\WeightValidator;
use WebinoBasalam\Admin\Product\ProductDataFactory;
use WebinoBasalam\Admin\Settings\SettingsConfig;
use WebinoBasalam\Admin\Settings\SettingsManager;
use WebinoBasalam\Jobs\Exceptions\NonRetryableException;
use WebinoBasalam\Utilities\ProductMetaKey;

defined('ABSPATH') || exit;

class ProductDataFacade
{
    private static $builder = null;
    private static $factory = null;
    private static $validator = null;

    private static function initialize(): void
    {
        if (self::$builder === null) {
            self::$factory = new ProductDataFactory();
            self::$validator = new ValidatorChain();

            self::$validator->add(new ProductExistenceValidator())
                ->add(new ProductStatusValidator())
                ->add(new ImageValidator())
                ->add(new WeightValidator());

            self::$builder = new ProductDataBuilder(self::$validator, self::$factory);
        }
    }

    public static function get(int $productId, ?array $categoryIds = null): array
    {
        self::initialize();

        $product = wc_get_product($productId);
        if (!$product) throw new \InvalidArgumentException(esc_html("Product with ID {$productId} not found"));

        $basalamProductId = get_post_meta($productId, ProductMetaKey::basalamProductId(), true);
        $isUpdate = !empty($basalamProductId);

        $settings = SettingsManager::getSettings();
        $syncFields = $settings[SettingsConfig::SYNC_PRODUCT_FIELDS] ?? 'all';

        if ($isUpdate && !SettingsManager::isProductUpdateSelectionValid($settings)) {
            throw NonRetryableException::invalidData(SettingsConfig::CUSTOM_PRODUCT_UPDATE_REQUIRED_MESSAGE);
        }

        $strategy = 'create';
        if ($isUpdate) {
            if ($syncFields === 'price_stock') $strategy = 'quick_update';
            elseif ($syncFields === 'custom') $strategy = 'custom_update';
            else $strategy = 'update';
        }

        return self::$builder
            ->reset()
            ->setStrategy(self::$factory->createStrategy($strategy))
            ->fromWooProduct($productId)
            ->withCategoryIds($categoryIds)
            ->build();
    }

    /**
     * Payload for one WC variation as a standalone Basalam product.
     *
     * @param int        $parentId    Variable product ID.
     * @param int        $variationId Variation ID.
     * @param array|null $categoryIds Optional category override.
     * @return array<string,mixed>
     */
    public static function getForVariation(int $parentId, int $variationId, ?array $categoryIds = null): array
    {
        self::initialize();

        $parent = wc_get_product($parentId);
        $variation = wc_get_product($variationId);
        if (!$parent || !$variation || !$parent->is_type('variable') || !$variation->is_type('variation')) {
            throw new \InvalidArgumentException(esc_html("Invalid parent/variation pair {$parentId}/{$variationId}"));
        }

        self::$validator->validate($parent);

        $basalamProductId = get_post_meta($variationId, ProductMetaKey::basalamProductId(), true);
        $isUpdate = !empty($basalamProductId);

        $settings = SettingsManager::getSettings();
        $syncFields = $settings[SettingsConfig::SYNC_PRODUCT_FIELDS] ?? 'all';

        if ($isUpdate && !SettingsManager::isProductUpdateSelectionValid($settings)) {
            throw NonRetryableException::invalidData(SettingsConfig::CUSTOM_PRODUCT_UPDATE_REQUIRED_MESSAGE);
        }

        $mode = 'create';
        if ($isUpdate) {
            if ($syncFields === 'price_stock') {
                $mode = 'quick_update';
            } elseif ($syncFields === 'custom') {
                $mode = 'custom_update';
            } else {
                $mode = 'update';
            }
        }

        $svc  = new VariantService();
        $data = $svc->buildStandaloneProductData($variation, $parent, $mode);
        if ($categoryIds !== null) {
            $normalized = array_values(array_filter(array_map('intval', (array) $categoryIds)));
            $data['category_ids'] = $normalized;
            if (!empty($normalized)) {
                $data['category_id'] = (int) end($normalized);
            }
        }

        return $data;
    }

    public static function validateProduct($product): void
    {
        self::initialize();
        self::$validator->validate($product);
    }
}
