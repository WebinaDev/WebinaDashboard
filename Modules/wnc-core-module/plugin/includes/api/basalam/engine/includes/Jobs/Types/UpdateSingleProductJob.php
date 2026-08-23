<?php

namespace WncBasalam\Jobs\Types;

use WncBasalam\Jobs\AbstractJobType;
use WncBasalam\Jobs\JobResult;
use WncBasalam\Jobs\Exceptions\RetryableException;
use WncBasalam\Jobs\Exceptions\NonRetryableException;
use WncBasalam\Logger\Logger;

defined('ABSPATH') || exit;

class UpdateSingleProductJob extends AbstractJobType
{
    private $productOperations;

    public function __construct($jobManager, $productOperations)
    {
        parent::__construct($jobManager);
        $this->productOperations = $productOperations;
    }

    public function getType(): string
    {
        return 'sync_basalam_update_single_product';
    }

    public function getPriority(): int
    {
        return 3;
    }

    public function execute(array $payload): JobResult
    {
        $productId = $payload['product_id'] ?? $payload;

        if (!$productId) {
            throw NonRetryableException::invalidData('شناسه محصول الزامی است');
        }

        $product = \wc_get_product($productId);
        if (!$product) {
            throw NonRetryableException::productNotFound(esc_html($productId));
        }

        try {
            $result = $this->productOperations->updateExistProduct($productId, null);
            return $this->success(['product_id' => $productId, 'result' => $result]);
        } catch (RetryableException $e) {
            Logger::error("خطا در بروزرسانی محصول: " . $e->getMessage(), [
                'product_id' => $productId,
                'operation' => 'بروزرسانی محصول',
            ]);
            throw $e;
        } catch (NonRetryableException $e) {
            Logger::error("خطا در بروزرسانی محصول: " . $e->getMessage(), [
                'product_id' => $productId,
                'operation' => 'بروزرسانی محصول',
            ]);
            throw $e;
        } catch (\Exception $e) {
            Logger::error("خطا در بروزرسانی محصول:: " . $e->getMessage(), [
                'product_id' => $productId,
                'operation' => 'بروزرسانی محصول',
            ]);
            throw $e;
        }
    }
}
