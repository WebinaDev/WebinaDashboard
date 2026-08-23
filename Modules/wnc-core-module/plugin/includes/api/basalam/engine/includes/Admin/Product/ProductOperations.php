<?php

namespace WncBasalam\Admin\Product;

use WncBasalam\Admin\Product\Operations\UpdateProduct;
use WncBasalam\Admin\Product\Operations\CreateProduct;
use WncBasalam\Admin\Product\Operations\ArchiveProduct;
use WncBasalam\Admin\Product\Operations\RestoreProduct;
use WncBasalam\Jobs\Exceptions\RetryableException;
use WncBasalam\Jobs\Exceptions\NonRetryableException;
use WncBasalam\Services\Products\ProductConnection;

defined('ABSPATH') || exit;

class ProductOperations
{
    private $updateOperation;
    private $createOperation;
    private $archiveOperation;
    private $restoreOperation;

    public function __construct(
        $updateOperation = null,
        $createOperation = null,
        $archiveOperation = null,
        $restoreOperation = null
    ) {
        $this->updateOperation = $updateOperation ?: wncBasalamContainer()->get(UpdateProduct::class);
        $this->createOperation = $createOperation ?: wncBasalamContainer()->get(CreateProduct::class);
        $this->archiveOperation = $archiveOperation ?: wncBasalamContainer()->get(ArchiveProduct::class);
        $this->restoreOperation = $restoreOperation ?: wncBasalamContainer()->get(RestoreProduct::class);
    }

    public function updateExistProduct($product_id, $category_ids = null)
    {
        try {
            return $this->updateOperation->execute($product_id, ['category_ids' => $category_ids]);
        } catch (RetryableException $e) {
            throw $e;
        } catch (NonRetryableException $e) {
            throw $e;
        } catch (\Exception $e) {
            throw new \Exception(esc_html($e->getMessage()));
        }
    }

    public function createNewProduct($product_id, $category_ids)
    {
        try {
            return $this->createOperation->execute($product_id, ['category_ids' => $category_ids]);
        } catch (RetryableException $e) {
            throw $e;
        } catch (NonRetryableException $e) {
            throw $e;
        } catch (\Exception $e) {
            throw new \Exception(esc_html($e->getMessage()));
        }
    }

    public function restoreExistProduct($product_id)
    {
        try {
            return $this->restoreOperation->execute($product_id);
        } catch (RetryableException $e) {
            throw $e;
        } catch (NonRetryableException $e) {
            throw $e;
        } catch (\Exception $e) {
            throw new \Exception(esc_html($e->getMessage()));
        }
    }

    public function archiveExistProduct($product_id)
    {
        try {
            return $this->archiveOperation->execute($product_id);
        } catch (RetryableException $e) {
            throw $e;
        } catch (NonRetryableException $e) {
            throw $e;
        } catch (\Exception $e) {
            throw new \Exception(esc_html($e->getMessage()));
        }
    }


    public static function disconnectProduct($product_id)
    {
        do_action('wnc_basalam_before_disconnect_product', $product_id);

        ProductConnection::purge($product_id);

        $result = [
            'success'     => true,
            'message'     => 'اتصال محصولات با موفقیت حذف شد.',
            'status_code' => 200,
        ];

        $result = apply_filters('wnc_basalam_disconnect_product_result', $result, $product_id);

        do_action('wnc_basalam_after_disconnect_product', $result, $product_id);

        return $result;
    }
}
