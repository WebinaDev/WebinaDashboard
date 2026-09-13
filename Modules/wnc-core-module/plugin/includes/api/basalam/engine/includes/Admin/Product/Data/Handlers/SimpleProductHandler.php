<?php

namespace WncBasalam\Admin\Product\Data\Handlers;

use WncBasalam\Admin\Product\Data\Services\CategoryService;
use WncBasalam\Admin\Product\Data\Services\PriceService;
use WncBasalam\Admin\Product\Data\Services\PhotoService;
use WncBasalam\Admin\Product\Data\Services\VideoService;
use WncBasalam\Admin\Product\Data\Services\AttributeService;
use WncBasalam\Admin\Settings\SettingsConfig;
use WncBasalam\Services\Products\PreparationDaysGuard;

defined('ABSPATH') || exit;

class SimpleProductHandler implements ProductDataHandlerInterface
{
    private $categoryService;
    private $priceService;
    private $photoService;
    private $videoService;
    private $attributeService;
    private $preparationGuard;
    private array $settings;

    public function __construct()
    {
        $this->categoryService = new CategoryService();
        $this->priceService = new PriceService();
        $this->photoService = new PhotoService();
        $this->videoService = new VideoService();
        $this->attributeService = new AttributeService();
        $this->preparationGuard = new PreparationDaysGuard();
        $this->settings = wncBasalamSettings()->getSettings();
    }

    public function getName($product): string
    {
        $baseName = $product->get_name();

        $prefix = $this->settings[SettingsConfig::PRODUCT_PREFIX_TITLE];
        $suffix = $this->settings[SettingsConfig::PRODUCT_SUFFIX_TITLE];

        $name = $prefix ? "{$prefix} {$baseName}" : $baseName;
        $name = $suffix ? "{$name} {$suffix}" : $name;

        $attributeSuffix = $this->attributeService->getAttributeSuffix($product);
        if ($attributeSuffix) $name .= " ({$attributeSuffix})";

        return mb_substr($name, 0, 120);
    }

    public function getDescription($product): string
    {
        return $this->attributeService->generateDescription($product);
    }

    public function getCategoryId($product): ?int
    {
        return $this->categoryService->getPrimaryCategoryId($product);
    }

    public function getCategoryIds($product): array
    {
        return $this->categoryService->getCategoryIds($product);
    }

    public function getPrice($product): ?int
    {
        return $this->priceService->calculateFinalPrice($product);
    }

    public function getStock($product): int
    {
        $defaultStock = $this->settings[SettingsConfig::DEFAULT_STOCK_QUANTITY];
        $safeStock = $this->settings[SettingsConfig::SAFE_STOCK];
        $stock = $product->get_stock_quantity();
        $stockStatus = $product->get_stock_status();

        $calculatedStock = $stockStatus === 'instock' ? $stock ?? $defaultStock : 0;

        if ($safeStock > 0 && $calculatedStock <= $safeStock) return 0;

        return $calculatedStock;
    }

    public function getWeight($product): ?int
    {
        $raw = is_a($product, 'WC_Product') ? $product->get_weight() : '';
        if (($raw === '' || $raw === null) && is_a($product, 'WC_Product') && $product->is_type('variation')) {
            $parent = wc_get_product((int) $product->get_parent_id());
            if (is_a($parent, 'WC_Product') && $parent->get_weight() !== '' && $parent->get_weight() !== null) {
                $raw = $parent->get_weight();
            }
        }
        if ($raw === '' || $raw === null || $raw === false) {
            return isset($this->settings[SettingsConfig::DEFAULT_WEIGHT])
                ? (int) $this->settings[SettingsConfig::DEFAULT_WEIGHT]
                : null;
        }

        if (class_exists('Webino_Shipping_Weight', false)) {
            $grams = Webino_Shipping_Weight::to_grams($raw);
            return $grams > 0 ? $grams : (int) ($this->settings[SettingsConfig::DEFAULT_WEIGHT] ?? 0);
        }

        $weight = str_replace(',', '.', (string) $raw);
        $weightUnit = get_option('woocommerce_weight_unit');

        return ($weightUnit === 'kg') ? (int) round(floatval($weight) * 1000) : (int) round(floatval($weight));
    }

    public function getPackageWeight($product): int
    {
        $weight = $this->getWeight($product) ?? 0;

        if (class_exists('Webino_Shipping_Weight', false) && is_a($product, 'WC_Product')) {
            $estimate = Webino_Shipping_Weight::estimate_unit_package($product);
            $tare = isset($estimate['tare_g']) ? (int) $estimate['tare_g'] : 0;
            return (int) ($weight + max(0, $tare));
        }

        $packageWeight = isset($this->settings[SettingsConfig::DEFAULT_PACKAGE_WEIGHT])
            ? (int) $this->settings[SettingsConfig::DEFAULT_PACKAGE_WEIGHT]
            : 0;

        return (int) ($weight + $packageWeight);
    }

    public function getMainPhoto($product): ?int
    {
        return $this->photoService->getMainPhotoId($product);
    }

    public function getGalleryPhotos($product): array
    {
        return $this->photoService->getGalleryPhotoIds($product);
    }

    public function getVideo($product): ?int
    {
        return $this->videoService->getVideoFileId($product);
    }

    public function getPreparationDays($product): int
    {
        $preparationDays = (int) $this->settings[SettingsConfig::DEFAULT_PREPARATION];

        return $this->preparationGuard->enforce($preparationDays, $product);
    }

    public function getUnitType($product): int
    {
        $unitType = get_post_meta($product->get_id(), '_sync_basalam_product_unit', true);
        return ($unitType && is_numeric($unitType)) ? intval($unitType) : 6304;
    }

    public function getUnitQuantity($product): int
    {
        $quantity = get_post_meta($product->get_id(), '_sync_basalam_product_value', true);
        return is_numeric($quantity) ? intval($quantity) : 1;
    }

    public function isWholesale($product): bool
    {
        $globalSetting = $this->settings[SettingsConfig::ALL_PRODUCTS_WHOLESALE];

        if ($globalSetting === 'all') return true;

        return get_post_meta($product->get_id(), '_sync_basalam_is_wholesale', true) === 'yes';
    }

    public function getVariants($product): array
    {
        return [];
    }

    public function getAttributes($product): array
    {
        return $this->attributeService->getBasalamAttributes($product);
    }
}
