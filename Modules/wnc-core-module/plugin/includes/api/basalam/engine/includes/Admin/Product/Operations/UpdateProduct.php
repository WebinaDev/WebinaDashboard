<?php

namespace WncBasalam\Admin\Product\Operations;

use WncBasalam\Admin\Product\Operations\AbstractProductOperation;
use WncBasalam\Services\Products\UpdateSingleProductService;
use WncBasalam\Admin\Product\Data\ProductDataFacade;
use WncBasalam\Logger\Logger;
use WncBasalam\Services\Products\Discount\DiscountTaskProcessor;

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

        $productData = ProductDataFacade::get($productId, $categoryIds);

        $updateResult = $this->updateProductService->updateProductInBasalam($productData, $productId);

        if ($updateResult['success']) $this->discountProcessor->handleProductDiscount($productId);

        return $updateResult;
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
