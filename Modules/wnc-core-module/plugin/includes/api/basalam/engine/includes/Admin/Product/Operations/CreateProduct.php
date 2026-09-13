<?php

namespace WncBasalam\Admin\Product\Operations;

use WncBasalam\Admin\Product\Operations\AbstractProductOperation;
use WncBasalam\Services\Products\CreateSingleProductService;
use WncBasalam\Services\Products\Discount\DiscountTaskProcessor;
use WncBasalam\Logger\Logger;
use WncBasalam\Admin\Product\Data\ProductDataFacade;
use WncBasalam\Utilities\ProductMetaKey;

defined('ABSPATH') || exit;

class CreateProduct extends AbstractProductOperation
{
    private $createProductService;
    private $discountProcessor;

    public function __construct(
        $createProductService = null,
        $discountProcessor = null
    )
    {
        parent::__construct();
        $this->createProductService = $createProductService ?: wncBasalamContainer()->get(CreateSingleProductService::class);
        $this->discountProcessor = $discountProcessor ?: wncBasalamContainer()->get(DiscountTaskProcessor::class);
    }


    protected function run(int $product_id, array $args = []): array
    {
        $categoryIds = $args['category_ids'] ?? [];
        $product     = wc_get_product($product_id);

        if ($product && $product->is_type('variable')) {
            return $this->createVariationsAsProducts($product, is_array($categoryIds) ? $categoryIds : []);
        }

        $productData = ProductDataFacade::get($product_id, $categoryIds);

        $createResult = $this->createProductService->createProductInBasalam($productData, $product_id);

        if ($createResult['success']) $this->discountProcessor->handleProductDiscount($product_id);

        return $createResult;
    }

    /**
     * Each WC variation becomes its own Basalam product (title = parent + attributes).
     *
     * @param \WC_Product_Variable $product Parent.
     * @param array                $categoryIds Categories.
     * @return array<string,mixed>
     */
    private function createVariationsAsProducts($product, array $categoryIds): array
    {
        $created   = 0;
        $skipped   = 0;
        $errors    = [];
        $lastOk    = null;
        $parentId  = $product->get_id();

        foreach ($product->get_children() as $variationId) {
            $variationId = (int) $variationId;
            if ($variationId < 1) {
                continue;
            }
            if (!empty(get_post_meta($variationId, ProductMetaKey::basalamProductId(), true))) {
                $skipped++;
                continue;
            }

            try {
                $productData  = ProductDataFacade::getForVariation($parentId, $variationId, $categoryIds);
                $createResult = $this->createProductService->createProductInBasalam($productData, $variationId);
                if (!empty($createResult['success'])) {
                    $created++;
                    $lastOk = $createResult;
                    $this->discountProcessor->handleProductDiscount($variationId);
                }
            } catch (\Throwable $e) {
                $errors[] = sprintf('#%d: %s', $variationId, $e->getMessage());
                Logger::warning(
                    sprintf('ایجاد متغیر %d به‌عنوان محصول باسلام ناموفق بود: %s', $variationId, $e->getMessage()),
                    array(
                        'product_id'   => $parentId,
                        'variation_id' => $variationId,
                        'عملیات'       => $this->getOperationNameFromClass(),
                    )
                );
            }
        }

        update_post_meta($parentId, ProductMetaKey::basalamProductSyncStatus(), $created > 0 || $skipped > 0 ? 'synced' : 'failed');

        if ($created < 1 && !empty($errors)) {
            throw new \Exception(esc_html('ایجاد محصولات متغیر ناموفق بود: ' . implode(' | ', $errors)));
        }

        return array(
            'success'     => true,
            'message'     => sprintf('تعداد %d متغیر به‌صورت محصول جدا در باسلام ثبت شد.', $created),
            'status_code' => 200,
            'created'     => $created,
            'skipped'     => $skipped,
            'errors'      => $errors,
            'basalam_id'  => $lastOk['basalam_id'] ?? null,
        );
    }

    public function validate(int $product_id): bool
    {
        if (!parent::validate($product_id)) return false;

        $product = wc_get_product($product_id);
        if ($product && $product->is_type('variable')) {
            $parentBasalamId = get_post_meta($product_id, ProductMetaKey::basalamProductId(), true);
            if (!empty($parentBasalamId)) {
                Logger::warning(
                    sprintf('محصول متغیر %d هنوز با مدل قدیمی (یک محصول + variants) متصل است. ابتدا قطع اتصال کنید.', $product_id),
                    array(
                        'product_id' => $product_id,
                        'شناسه_محصول_باسلام' => $parentBasalamId,
                        'عملیات' => $this->getOperationNameFromClass(),
                    )
                );
                return false;
            }

            $pending = false;
            foreach ($product->get_children() as $variationId) {
                if (empty(get_post_meta((int) $variationId, ProductMetaKey::basalamProductId(), true))) {
                    $pending = true;
                    break;
                }
            }
            if (!$pending) {
                Logger::warning(
                    sprintf('همهٔ متغیرهای محصول %d از قبل در باسلام ثبت شده‌اند.', $product_id),
                    array(
                        'product_id' => $product_id,
                        'عملیات' => $this->getOperationNameFromClass(),
                    )
                );
                return false;
            }

            return true;
        }

        $basalamProductId = get_post_meta($product_id, ProductMetaKey::basalamProductId(), true);
        if (!empty($basalamProductId)) {
            Logger::warning(sprintf('محصول %d از قبل به باسلام متصل است.', $product_id), [
                'product_id' => $product_id,
                'شناسه_محصول_باسلام' => $basalamProductId,
                'عملیات' => $this->getOperationNameFromClass()
            ]);
            return false;
        }

        return true;
    }
}
