<?php

namespace WebinoBasalam\Admin\Product\Operations;

use WebinoBasalam\Admin\Product\Operations\AbstractProductOperation;
use WebinoBasalam\Services\Products\CreateSingleProductService;
use WebinoBasalam\Services\Products\Discount\DiscountTaskProcessor;
use WebinoBasalam\Services\VendorGate;
use WebinoBasalam\Logger\Logger;
use WebinoBasalam\Admin\Product\Data\ProductDataFacade;
use WebinoBasalam\Utilities\ProductMetaKey;

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
        $this->createProductService = $createProductService ?: webinoBasalamContainer()->get(CreateSingleProductService::class);
        $this->discountProcessor = $discountProcessor ?: webinoBasalamContainer()->get(DiscountTaskProcessor::class);
    }


    protected function run(int $product_id, array $args = []): array
    {
        VendorGate::requireVendorId();
        VendorGate::assertVendorExistsOnBasalam();

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
        $pending   = 0;

        foreach ($product->get_children() as $variationId) {
            $variationId = (int) $variationId;
            if ($variationId < 1) {
                continue;
            }
            if (!empty(get_post_meta($variationId, ProductMetaKey::basalamProductId(), true))) {
                $skipped++;
                continue;
            }

            $pending++;
            $productData = null;

            try {
                $productData = ProductDataFacade::getForVariation($parentId, $variationId, $categoryIds);
            } catch (\Throwable $e) {
                $errors[] = sprintf('#%d [payload]: %s', $variationId, $e->getMessage());
                Logger::warning(
                    sprintf('ساخت payload متغیر %d ناموفق بود: %s', $variationId, $e->getMessage()),
                    array(
                        'product_id'   => $parentId,
                        'variation_id' => $variationId,
                        'step'         => 'payload',
                        'عملیات'       => $this->getOperationNameFromClass(),
                    )
                );
                continue;
            }

            try {
                $createResult = $this->createProductService->createProductInBasalam($productData, $variationId);
                if (!empty($createResult['success'])) {
                    $created++;
                    $lastOk = $createResult;
                    $this->discountProcessor->handleProductDiscount($variationId);
                } else {
                    $msg = is_array($createResult) && !empty($createResult['message'])
                        ? (string) $createResult['message']
                        : 'ایجاد ناموفق بدون پیام';
                    $errors[] = sprintf('#%d [api_create]: %s', $variationId, $msg);
                }
            } catch (\Throwable $e) {
                $errors[] = sprintf('#%d [api_create]: %s', $variationId, $e->getMessage());
                Logger::warning(
                    sprintf('ایجاد متغیر %d به‌عنوان محصول باسلام ناموفق بود: %s', $variationId, $e->getMessage()),
                    array(
                        'product_id'   => $parentId,
                        'variation_id' => $variationId,
                        'step'         => 'api_create',
                        'عملیات'       => $this->getOperationNameFromClass(),
                    )
                );
            }
        }

        update_post_meta($parentId, ProductMetaKey::basalamProductSyncStatus(), $created > 0 || $skipped > 0 ? 'synced' : 'failed');

        if ($pending > 0 && $created < 1) {
            $detail = !empty($errors)
                ? implode(' | ', $errors)
                : 'هیچ تنوع واجدشرایطی برای ایجاد یافت نشد.';
            throw new \Exception(esc_html('ایجاد محصولات متغیر ناموفق بود: ' . $detail));
        }

        return array(
            'success'     => $created > 0 || ($pending < 1 && $skipped > 0),
            'message'     => sprintf('تعداد %d متغیر به‌صورت محصول جدا در باسلام ثبت شد.', $created),
            'status_code' => 200,
            'created'     => $created,
            'skipped'     => $skipped,
            'errors'      => $errors,
            'partial'     => $created > 0 && !empty($errors),
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
