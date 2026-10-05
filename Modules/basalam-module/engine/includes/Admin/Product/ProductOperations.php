<?php

namespace WebinoBasalam\Admin\Product;

use WebinoBasalam\Admin\Product\Operations\UpdateProduct;
use WebinoBasalam\Admin\Product\Operations\CreateProduct;
use WebinoBasalam\Admin\Product\Operations\ArchiveProduct;
use WebinoBasalam\Admin\Product\Operations\RestoreProduct;
use WebinoBasalam\Jobs\Exceptions\RetryableException;
use WebinoBasalam\Jobs\Exceptions\NonRetryableException;
use WebinoBasalam\Services\Products\ProductConnection;

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
        $this->updateOperation = $updateOperation ?: webinoBasalamContainer()->get(UpdateProduct::class);
        $this->createOperation = $createOperation ?: webinoBasalamContainer()->get(CreateProduct::class);
        $this->archiveOperation = $archiveOperation ?: webinoBasalamContainer()->get(ArchiveProduct::class);
        $this->restoreOperation = $restoreOperation ?: webinoBasalamContainer()->get(RestoreProduct::class);
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
        do_action('webino_basalam_before_disconnect_product', $product_id);

        ProductConnection::purge($product_id);

        $result = [
            'success'     => true,
            'message'     => 'اتصال محصولات با موفقیت حذف شد.',
            'status_code' => 200,
        ];

        $result = apply_filters('webino_basalam_disconnect_product_result', $result, $product_id);

        do_action('webino_basalam_after_disconnect_product', $result, $product_id);

        return $result;
    }
}
