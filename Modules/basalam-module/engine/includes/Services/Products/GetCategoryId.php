<?php

namespace WebinoBasalam\Services\Products;

use WebinoBasalam\Config\Endpoints;
use WebinoBasalam\Logger\Logger;
use WebinoBasalam\Services\ApiServiceManager;

defined('ABSPATH') || exit;
class GetCategoryId
{
    private static array $loggedErrors = [];

    public static function getCategoryIdFromBasalam($productTitle, $mode = 'all', bool $logErrors = false, bool $throwErrors = false)
    {
        $apiservice = webinoBasalamContainer()->get(ApiServiceManager::class);

        $url = Endpoints::CATEGORY_DETECT . '?title=' . $productTitle;

        try {
            $result = $apiservice->get($url, []);
        } catch (\Exception $e) {
            if ($logErrors) {
                self::logErrorOnce('خطا در دریافت دسته‌بندی خودکار محصول: ' . $e->getMessage());
            }

            if ($throwErrors) {
                $msg = $e->getMessage();
                if (false === strpos($msg, '[category_detect]')) {
                    $msg = '[category_detect] ' . $msg;
                }
                if (false === strpos($msg, 'URL:')) {
                    $msg .= ' | URL: ' . $url;
                }
                throw new \RuntimeException(esc_html($msg), (int) $e->getCode(), $e);
            }

            return false;
        }

        if (!is_array($result) || !isset($result['body']) || $result['body'] === null) return false;

        $decodedBody = json_decode($result['body'], true);
        if (!is_array($decodedBody)) return false;

        if ($mode == 'all') {
            if (isset($decodedBody['result']) && is_array($decodedBody['result']) && count($decodedBody['result']) > 0) {
                $categories = [];

                foreach ($decodedBody['result'] as $category) {
                    $catIds = [];

                    self::extractCategoryIds([$category], $catIds);

                    $categoryData = [
                        'cat_id'    => array_reverse($catIds),
                        'cat_title' => self::getCombinedTitles($category['cat_parent'], $category['cat_title']),
                    ];
                    $categories[] = $categoryData;
                }

                return $categories;
            }
        } else {
            if (isset($decodedBody['result']) && is_array($decodedBody['result']) && count($decodedBody['result']) > 0) {
                $categoryIds = [];

                self::extractCategoryIds([$decodedBody['result'][0]], $categoryIds);

                return array_reverse($categoryIds);
            }
        }

        return false;
    }

    private static function logErrorOnce(string $message): void
    {
        if (isset(self::$loggedErrors[$message])) {
            return;
        }

        self::$loggedErrors[$message] = true;
        Logger::error($message);
    }

    public static function extractCategoryIds($categories, &$categoryIds)
    {
        foreach ($categories as $category) {
            $categoryIds[] = $category['cat_id'];

            if (isset($category['cat_parent']) && $category['cat_parent'] !== null) {
                self::extractCategoryIds([$category['cat_parent']], $categoryIds);
            }
        }
    }

    public static function getCombinedTitles($categoryParent, $currentTitle)
    {
        if ($categoryParent === null) {
            return $currentTitle;
        }

        return self::getCombinedTitles($categoryParent['cat_parent'], $categoryParent['cat_title']) . ' > ' . $currentTitle;
    }
}
