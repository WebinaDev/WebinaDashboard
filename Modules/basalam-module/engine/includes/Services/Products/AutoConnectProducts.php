<?php

namespace WebinoBasalam\Services\Products;

use WebinoBasalam\Admin\Product\Data\Services\VariantService;
use WebinoBasalam\Logger\Logger;
use WebinoBasalam\Jobs\Exceptions\RetryableException;
use WebinoBasalam\Jobs\Exceptions\NonRetryableException;
use WebinoBasalam\Utilities\ProductMetaKey;

defined('ABSPATH') || exit;

class AutoConnectProducts
{
    public function checkSameProduct($title = null, $cursor = null)
    {
        try {
            $getProductData = new FetchProductsData();
            if ($title) {
                $title = mb_substr($title, 0, 120);
                $syncBasalamProducts = $getProductData->getProductData($title);
            } else {
                $syncBasalamProducts = $getProductData->getProductData(null, $cursor);
            }

            if (!is_array($syncBasalamProducts) || !isset($syncBasalamProducts['data'])) {
                return $title ? [] : [
                    'error' => true,
                    'message' => 'خطا در دریافت اطلاعات محصولات',
                    'status_code' => 400,
                    'has_more' => false,
                    'next_cursor' => null,
                ];
            }

            if ($title) {
                return $syncBasalamProducts['data'];
            }

            $matchedProducts = [];
            $skipped         = 0;
            $productIdMetaKey = ProductMetaKey::basalamProductId();

            foreach ($syncBasalamProducts['data'] as $syncBasalamProduct) {
                if (!is_array($syncBasalamProduct) || empty($syncBasalamProduct['id'])) {
                    ++$skipped;
                    continue;
                }

                $productId = $this->findWooProductId($syncBasalamProduct, $productIdMetaKey);
                if (!$productId) {
                    ++$skipped;
                    continue;
                }

                $connectProductService = new ConnectSingleProductService();
                $result = $connectProductService->connectProductById($productId, $syncBasalamProduct['id']);

                if ($result) {
                    Logger::info(($syncBasalamProduct['title'] ?? '') . ' به محصول مشابه خود در باسلام متصل شد', [
                        'product_id' => $productId,
                        'basalam_id' => $syncBasalamProduct['id'],
                        'عملیات'     => "اتصال اتوماتیک محصولات ووکامرس و باسلام",
                    ]);
                    $matchedProducts[] = $syncBasalamProduct;
                } else {
                    Logger::warning('اتصال خودکار رد شد: شناسه باسلام قبلاً به محصول دیگری متصل است', [
                        'product_id' => $productId,
                        'basalam_id' => $syncBasalamProduct['id'],
                        'operation'  => 'auto_connect_duplicate',
                    ]);
                    ++$skipped;
                }
            }

            Logger::info(
                sprintf('اتصال خودکار: matched=%d skipped=%d', count($matchedProducts), $skipped),
                array('operation' => 'auto_connect_batch')
            );

            $hasMore = !empty($syncBasalamProducts['has_more']);
            $nextCursor = $syncBasalamProducts['next_cursor'] ?? null;

            if ($hasMore && !empty($nextCursor)) {
                return [
                    'success'     => true,
                    'message'     => 'محصولات با موفقیت به صف اتصال افزوده شدند.',
                    'status_code' => 200,
                    'has_more'    => true,
                    'next_cursor' => $nextCursor,
                    'matched'     => count($matchedProducts),
                    'skipped'     => $skipped,
                ];
            }

            if (!empty($matchedProducts) || $skipped > 0) {
                return [
                    'success'     => true,
                    'message'     => empty($matchedProducts)
                        ? 'در این دسته محصول مشابهی یافت نشد؛ ادامه صف.'
                        : 'اتصال محصولات کامل شد.',
                    'status_code' => 200,
                    'has_more'    => false,
                    'next_cursor' => null,
                    'matched'     => count($matchedProducts),
                    'skipped'     => $skipped,
                ];
            }

            return [
                'error'       => true,
                'message'     => 'محصول مشابهی یافت نشد.',
                'status_code' => 404,
                'has_more'    => false,
                'next_cursor' => null,
                'matched'     => 0,
                'skipped'     => $skipped,
            ];
        } catch (RetryableException $e) {
            Logger::error("خطا در اتصال خودکار محصولات: " . $e->getMessage(), [
                'operation' => 'اتصال خودکار محصولات',
            ]);
            throw $e;
        } catch (NonRetryableException $e) {
            Logger::error("خطا در اتصال خودکار محصولات: " . $e->getMessage(), [
                'operation' => 'اتصال خودکار محصولات',
            ]);
            throw $e;
        } catch (\Exception $e) {
            Logger::error("خطا در اتصال خودکار محصولات: " . $e->getMessage(), [
                'operation' => 'اتصال خودکار محصولات',
            ]);
            throw $e;
        }
    }

    /**
     * @param array<string,mixed> $basalamProduct Basalam product row.
     * @param string              $metaKey        Unlinked meta key.
     * @return int Woo product/variation id or 0.
     */
    private function findWooProductId(array $basalamProduct, string $metaKey): int
    {
        global $wpdb;

        $sku = '';
        foreach (array('sku', 'product_sku', 'barcode') as $skuKey) {
            if (!empty($basalamProduct[$skuKey]) && is_scalar($basalamProduct[$skuKey])) {
                $sku = trim((string) $basalamProduct[$skuKey]);
                break;
            }
        }
        if ('' !== $sku) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $bySku = (int) $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT p.ID
                    FROM {$wpdb->posts} p
                    INNER JOIN {$wpdb->postmeta} sku ON p.ID = sku.post_id AND sku.meta_key = '_sku' AND sku.meta_value = %s
                    LEFT JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id AND pm.meta_key = %s
                    WHERE p.post_type IN ('product','product_variation')
                    AND p.post_status IN ('publish','private')
                    AND pm.post_id IS NULL
                    LIMIT 1",
                    $sku,
                    $metaKey
                )
            );
            if ($bySku > 0) {
                return $bySku;
            }
        }

        $rawTitle = trim((string) ($basalamProduct['title'] ?? ''));
        if ('' === $rawTitle) {
            return 0;
        }

        // Prefer variation titles matching createVariationsAsProducts (Parent Attr1 Attr2).
        $variationId = $this->matchVariationBuiltTitle($rawTitle, $metaKey);
        if ($variationId > 0) {
            return $variationId;
        }

        $candidates = array($rawTitle);
        // Strip common " - attr" / " | attr" suffixes for variation-style titles.
        $stripped = preg_replace('/\s*[\|\-–—]\s*[^\|\-–—]{1,40}$/u', '', $rawTitle);
        if (is_string($stripped) && $stripped !== '' && $stripped !== $rawTitle) {
            $candidates[] = trim($stripped);
        }

        foreach ($candidates as $candidate) {
            $id = $this->matchTitle($candidate, $metaKey);
            if ($id > 0) {
                return $id;
            }
        }

        return 0;
    }

    /**
     * Match Basalam title against VariantService::buildVariationTitle for unlinked variations.
     *
     * @param string $basalamTitle Basalam product title.
     * @param string $metaKey      Unlinked meta key.
     * @return int Variation id or 0.
     */
    private function matchVariationBuiltTitle(string $basalamTitle, string $metaKey): int
    {
        $normTarget = CommissionRates::normalizeName($basalamTitle);
        if ('' === $normTarget || !function_exists('wc_get_products')) {
            return 0;
        }

        $variantService = new VariantService();
        $parents = wc_get_products([
            'type'   => 'variable',
            'status' => ['publish', 'private'],
            'limit'  => 200,
            'return' => 'objects',
        ]);
        if (!is_array($parents)) {
            return 0;
        }

        foreach ($parents as $parent) {
            if (!$parent || !method_exists($parent, 'get_children')) {
                continue;
            }
            foreach ($parent->get_children() as $vid) {
                $vid = (int) $vid;
                if ($vid < 1) {
                    continue;
                }
                if (!empty(get_post_meta($vid, $metaKey, true))) {
                    continue;
                }
                $variation = wc_get_product($vid);
                if (!$variation || !$variation->is_type('variation')) {
                    continue;
                }
                $built = $variantService->buildVariationTitle($parent, $variation);
                if (CommissionRates::normalizeName($built) === $normTarget) {
                    return $vid;
                }
                // Also accept exact trimmed case-insensitive match (within 120 chars like create).
                if (mb_strtolower(mb_substr(trim($built), 0, 120)) === mb_strtolower(mb_substr($basalamTitle, 0, 120))) {
                    return $vid;
                }
            }
        }

        return 0;
    }

    /**
     * @param string $title   Title candidate.
     * @param string $metaKey Meta key for unlinked products.
     * @return int
     */
    private function matchTitle(string $title, string $metaKey): int
    {
        global $wpdb;

        $normalizedTitle = trim($title);
        if ('' === $normalizedTitle) {
            return 0;
        }

        if (mb_strlen($normalizedTitle) >= 120) {
            $likeTitle = mb_substr($normalizedTitle, 0, 120) . '%';
        } else {
            $likeTitle = $normalizedTitle;
        }

        // Prefer exact product/variation title match (unlinked only).
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $productId = (int) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT p.ID
                FROM {$wpdb->posts} p
                LEFT JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id AND pm.meta_key = %s
                WHERE p.post_type IN ('product','product_variation')
                AND p.post_status IN ('publish','private')
                AND pm.post_id IS NULL
                AND LOWER(p.post_title) LIKE LOWER(%s)
                ORDER BY CASE WHEN p.post_type = 'product_variation' THEN 0 ELSE 1 END, p.ID ASC
                LIMIT 1",
                $metaKey,
                $likeTitle
            )
        );
        if ($productId > 0) {
            return $productId;
        }

        // Normalized Persian match in PHP for a limited unlinked set.
        $normTarget = CommissionRates::normalizeName($normalizedTitle);
        if ('' === $normTarget) {
            return 0;
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $rows = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT p.ID, p.post_title, p.post_type
                FROM {$wpdb->posts} p
                LEFT JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id AND pm.meta_key = %s
                WHERE p.post_type IN ('product','product_variation')
                AND p.post_status IN ('publish','private')
                AND pm.post_id IS NULL
                ORDER BY CASE WHEN p.post_type = 'product_variation' THEN 0 ELSE 1 END, p.ID ASC
                LIMIT 800",
                $metaKey
            ),
            ARRAY_A
        );
        if (!is_array($rows)) {
            return 0;
        }
        foreach ($rows as $row) {
            if (CommissionRates::normalizeName((string) ($row['post_title'] ?? '')) === $normTarget) {
                return (int) $row['ID'];
            }
        }

        return 0;
    }
}
