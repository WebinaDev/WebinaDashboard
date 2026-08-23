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

        $productData = ProductDataFacade::get($product_id, $categoryIds);

        $createResult = $this->createProductService->createProductInBasalam($productData, $product_id);

        if ($createResult['success']) $this->discountProcessor->handleProductDiscount($product_id);

        return $createResult;
    }

    public function validate(int $product_id): bool
    {
        if (!parent::validate($product_id)) return false;

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
