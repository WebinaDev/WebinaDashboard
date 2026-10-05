<?php

namespace WebinoBasalam\Services\Products;

use WebinoBasalam\Config\Endpoints;
use WebinoBasalam\Services\ApiServiceManager;

defined('ABSPATH') || exit;

class FetchCommission
{
    /**
     * Prefer local Mehr tariff table, then live Basalam commission API.
     *
     * @param array<int,int|string> $categoryIds Level path.
     * @return float|false
     */
    public static function fetchCategoryCommission($categoryIds)
    {
        $ids = array();
        foreach ( (array) $categoryIds as $id ) {
            if ( is_numeric( $id ) && (int) $id > 0 ) {
                $ids[] = (int) $id;
            }
        }

        $local = CommissionRates::lookupPercent( $ids );
        if ( $local > 0 && $local < 100 ) {
            return $local;
        }

        $apiservice = webinoBasalamContainer()->get(ApiServiceManager::class);
        $queryParams = [];

        if (isset($ids[0])) {
            $queryParams[] = "product.category.level1=" . $ids[0];
        }
        if (isset($ids[1])) {
            $queryParams[] = "product.category.level2=" . $ids[1];
        }
        if (isset($ids[2])) {
            $queryParams[] = "product.category.level3=" . $ids[2];
        }

        if (empty($queryParams)) return false;

        $url = Endpoints::COMMISSION . '?' . implode("&", $queryParams);

        try {
            $result = $apiservice->get($url);
        } catch (\Exception $e) {
            return 0;
        }

        $decodedBody = is_array( $result['body'] ?? null )
            ? $result['body']
            : json_decode( (string) ( $result['body'] ?? '' ), true );

        if ( ! is_array( $decodedBody ) ) {
            return 0;
        }

        $commissionPercent = $decodedBody['commission_data']['commission_percent'] ?? 0;

        if ($commissionPercent) return $commissionPercent;
        return 0;
    }
}
