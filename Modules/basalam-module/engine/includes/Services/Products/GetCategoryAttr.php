<?php

namespace WebinoBasalam\Services\Products;

use WebinoBasalam\Config\Endpoints;
use WebinoBasalam\Services\ApiServiceManager;

defined('ABSPATH') || exit;
class GetCategoryAttr
{
    public static function getAttr($categoryId)
    {
        $url = sprintf(Endpoints::CATEGORY_ATTRIBUTES, $categoryId);
        $apiservice = webinoBasalamContainer()->get(ApiServiceManager::class);

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
