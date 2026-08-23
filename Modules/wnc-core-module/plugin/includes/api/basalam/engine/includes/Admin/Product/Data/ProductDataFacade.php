<?php

namespace WncBasalam\Admin\Product\Data;

use WncBasalam\Admin\Product\Data\Validators\ValidatorChain;
use WncBasalam\Admin\Product\Data\Validators\ImageValidator;
use WncBasalam\Admin\Product\Data\Validators\ProductExistenceValidator;
use WncBasalam\Admin\Product\Data\Validators\ProductStatusValidator;
use WncBasalam\Admin\Product\Data\Validators\WeightValidator;
use WncBasalam\Admin\Product\ProductDataFactory;
use WncBasalam\Admin\Settings\SettingsConfig;
use WncBasalam\Admin\Settings\SettingsManager;
use WncBasalam\Jobs\Exceptions\NonRetryableException;
use WncBasalam\Utilities\ProductMetaKey;

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

    public static function validateProduct($product): void
    {
        self::initialize();
        self::$validator->validate($product);
    }
}
