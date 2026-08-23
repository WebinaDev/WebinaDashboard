<?php

namespace WncBasalam\Actions\Controller\ProductActions;

use WncBasalam\Services\Products\GetCategoryId;
use WncBasalam\Actions\Controller\ActionController;
use WncBasalam\Admin\Settings\SettingsConfig;

defined('ABSPATH') || exit;

class DetectionProductCategories extends ActionController
{
    public function __invoke()
    {
        if (!isset($_POST['productTitle'])) {
            wp_send_json_error(['message' => 'عنوان محصول ارسال نشده است.'], 400);
        }

        $productTitle = sanitize_text_field(wp_unslash($_POST['productTitle']));

        $prefix = wncBasalamSettings()->getSettings(SettingsConfig::PRODUCT_PREFIX_TITLE);
        $suffix = wncBasalamSettings()->getSettings(SettingsConfig::PRODUCT_SUFFIX_TITLE);

        if (!empty($prefix)) $productTitle = $prefix . ' ' . $productTitle;
        if (!empty($suffix)) $productTitle = $productTitle . ' ' . $suffix;

        $productTitle = mb_substr($productTitle, 0, 120);

        try {
            $categoryIds = GetCategoryId::getCategoryIdFromBasalam($productTitle, 'all', true, true);
        } catch (\Exception $e) {
            wp_send_json_error(['message' => 'خطا در دریافت دسته‌بندی خودکار محصول: ' . $e->getMessage()], 500);
        }

        if ($categoryIds && is_array($categoryIds)) {
            $categories = array_map(function ($category) {
                return [
                    'cat_id'    => $category['cat_id'],
                    'cat_title' => $category['cat_title'],
                ];
            }, $categoryIds);

            wp_send_json_success($categories);
        }

        wp_send_json_error(['message' => 'دسته‌بندی مناسبی برای این محصول پیدا نشد.'], 404);
    }
}
