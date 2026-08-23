<?php

namespace WncBasalam\Services\Products;

use WncBasalam\Config\Endpoints;
use WncBasalam\Services\ApiServiceManager;

defined('ABSPATH') || exit;
class GetCategoryAttr
{
    public static function getAttr($categoryId)
    {
        $url = sprintf(Endpoints::CATEGORY_ATTRIBUTES, $categoryId);
        $apiservice = wncBasalamContainer()->get(ApiServiceManager::class);

        try {
            $data = $apiservice->get($url, []);
        } catch (\Exception $e) {
            return [
                'body' => null,
                'status_code' => 500,
                'error' => 'خطا در دریافت ویژگی‌های دسته‌بندی: ' . $e->getMessage()
            ];
        }

        return $data;
    }
}
