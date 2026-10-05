<?php

namespace WebinoBasalam\Jobs\Types;

use WebinoBasalam\Jobs\AbstractJobType;
use WebinoBasalam\Jobs\JobResult;
use WebinoBasalam\Jobs\Exceptions\RetryableException;
use WebinoBasalam\Jobs\Exceptions\NonRetryableException;
use WebinoBasalam\Logger\Logger;

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
            if (is_array($result) && array_key_exists('success', $result) && false === $result['success']) {
                $message = '';
                if (!empty($result['message']) && is_string($result['message'])) {
                    $message = $result['message'];
                } elseif (!empty($result['error']) && is_string($result['error'])) {
                    $message = $result['error'];
                } else {
                    $message = 'بروزرسانی محصول در باسلام ناموفق بود';
                }
                throw NonRetryableException::invalidData($message);
            }
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
