<?php

namespace WebinoBasalam\Jobs\Types;

use WebinoBasalam\Jobs\AbstractJobType;
use WebinoBasalam\Jobs\JobResult;
use WebinoBasalam\Jobs\Exceptions\NonRetryableException;
use WebinoBasalam\Admin\ProductService;
use WebinoBasalam\Logger\Logger;

defined('ABSPATH') || exit;

class CreateAllProductsJob extends AbstractJobType
{
    public function __construct($jobManager)
    {
        parent::__construct($jobManager);
    }

    public function getType(): string
    {
        return 'sync_basalam_create_all_products';
    }

    public function getPriority(): int
    {
        return 5;
    }

    public function canRun(): bool
    {
        return $this->areAllSingleJobsCompleted('sync_basalam_create_single_product');
    }

    public function execute(array $payload): JobResult
    {
        $lastId = $payload['last_creatable_product_id'] ?? 0;
        $postsPerPage = 100;
        $includeOutOfStock = $payload['include_out_of_stock'] ?? false;

        try {
            $batchData = [
                'posts_per_page' => $postsPerPage,
                'include_out_of_stock' => $includeOutOfStock,
                'last_creatable_product_id' => $lastId,
            ];

            $productIds = ProductService::getCreatableProducts($batchData);

            if (!$productIds) {
                // First batch with nothing eligible → keep a failed row so the merchant sees why.
                if ((int) $lastId <= 0) {
                    throw NonRetryableException::invalidData(
                        'هیچ محصول واجدشرایطی برای افزودن به باسلام نیست. محصول باید منتشر باشد، تصویر شاخص داشته باشد، به باسلام وصل نشده باشد، قیمت بیشتر از ۱۰۰۰ تومان و (مگر تنظیم خلاف) موجود باشد.'
                    );
                }
                return $this->success(['completed' => true, 'message' => 'All products created']);
            }

            foreach ($productIds as $productId) {
                if (!$this->hasProductJobInProgress($productId, 'sync_basalam_create_single_product')) {
                    $this->jobManager->createJob(
                        'sync_basalam_create_single_product',
                        'pending',
                        json_encode(['product_id' => $productId])
                    );
                }
            }

            $newLastId = max($productIds);

            $this->jobManager->createJob(
                'sync_basalam_create_all_products',
                'pending',
                json_encode([
                    'posts_per_page' => $postsPerPage,
                    'include_out_of_stock' => $includeOutOfStock,
                    'last_creatable_product_id' => $newLastId,
                ])
            );

            return $this->success(['last_id' => $newLastId, 'count' => count($productIds)]);
        } catch (\Exception $e) {
            Logger::error("خطا در ایجاد تسک های بروزرسانی محصولات: " . $e->getMessage(), [
                'operation' => 'ایجاد تسک های بروزرسانی محصولات',
            ]);
            throw $e;
        }
    }
}
