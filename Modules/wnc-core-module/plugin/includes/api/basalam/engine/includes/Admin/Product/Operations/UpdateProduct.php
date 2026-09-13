<?php

namespace WncBasalam\Admin\Product\Operations;

use WncBasalam\Admin\Product\Operations\AbstractProductOperation;
use WncBasalam\Services\Products\UpdateSingleProductService;
use WncBasalam\Admin\Product\Data\ProductDataFacade;
use WncBasalam\Logger\Logger;
use WncBasalam\Services\Products\Discount\DiscountTaskProcessor;
use WncBasalam\Utilities\ProductMetaKey;

defined('ABSPATH') || exit;

class UpdateProduct extends AbstractProductOperation
{
    private $updateProductService;
    private $discountProcessor;

    public function __construct(
        $updateProductService = null,
        $discountProcessor = null
    )
    {
        parent::__construct();
        $this->updateProductService = $updateProductService ?: wncBasalamContainer()->get(UpdateSingleProductService::class);
        $this->discountProcessor = $discountProcessor ?: wncBasalamContainer()->get(DiscountTaskProcessor::class);
    }


    protected function run(int $productId, array $args = []): array
    {
        $categoryIds = $args['category_ids'] ?? null;
        $product     = wc_get_product($productId);

        if ($product && $product->is_type('variable')) {
            return $this->updateVariationsAsProducts($product, $categoryIds);
        }

        $productData = ProductDataFacade::get($productId, $categoryIds);

        $updateResult = $this->updateProductService->updateProductInBasalam($productData, $productId);

        if ($updateResult['success']) $this->discountProcessor->handleProductDiscount($productId);

        return $updateResult;
    }

    /**
     * @param \WC_Product_Variable $product Parent.
     * @param array|null           $categoryIds Categories.
     * @return array<string,mixed>
     */
    private function updateVariationsAsProducts($product, $categoryIds): array
    {
        $updated = 0;
        $errors  = [];
        $lastOk  = null;

        foreach ($product->get_children() as $variationId) {
            $variationId = (int) $variationId;
            if (empty(get_post_meta($variationId, ProductMetaKey::basalamProductId(), true))) {
                continue;
            }
            try {
                $productData  = ProductDataFacade::getForVariation($product->get_id(), $variationId, $categoryIds);
                $updateResult = $this->updateProductService->updateProductInBasalam($productData, $variationId);
                if (!empty($updateResult['success'])) {
                    $updated++;
                    $lastOk = $updateResult;
                    $this->discountProcessor->handleProductDiscount($variationId);
                }
            } catch (\Throwable $e) {
                $errors[] = sprintf('#%d: %s', $variationId, $e->getMessage());
                Logger::warning(
                    sprintf('بروزرسانی متغیر %d به‌عنوان محصول باسلام ناموفق بود: %s', $variationId, $e->getMessage()),
                    array(
                        'product_id'   => $product->get_id(),
                        'variation_id' => $variationId,
                        'عملیات'       => $this->getOperationNameFromClass(),
                    )
                );
            }
        }

        if ($updated < 1 && !empty($errors)) {
            throw new \Exception(esc_html('بروزرسانی محصولات متغیر ناموفق بود: ' . implode(' | ', $errors)));
        }

        return array(
            'success'     => true,
            'message'     => sprintf('تعداد %d محصول متغیر در باسلام بروزرسانی شد.', $updated),
            'status_code' => 200,
            'updated'     => $updated,
            'errors'      => $errors,
        );
    }

    public function validate(int $productId): bool
    {
        if (!parent::validate($productId)) return false;

        $validation = $this->validator->validateBasalamConnection($productId);
        if (!$validation['valid']) {
            $this->validator->logValidationResult($productId, $validation, $this->getOperationNameFromClass());
            return false;
        }

        return true;
    }
}
