<?php

namespace WncBasalam\Registrar\ProductListeners;

use WncBasalam\JobManager;
use WncBasalam\Admin\Settings\SettingsManager;
use WncBasalam\Utilities\ProductMetaKey;

defined('ABSPATH') || exit;

class UpdateWooProduct extends ProductListenerAbstract
{
    private $jobManager;

    public function __construct($jobManager = null)
    {
        $this->jobManager = $jobManager ?: wncBasalamContainer()->get(JobManager::class);
    }

    public function handle($productId)
    {
        if (
            !$this->isAvailableProduct($productId) ||
            !$this->isProductSyncEnabled() ||
            !SettingsManager::isProductUpdateSelectionValid()
        ) {
            return;
        }

        if (!$this->jobManager->hasProductJobInProgress($productId, 'sync_basalam_update_single_product')) {
            $this->jobManager->createJob(
                'sync_basalam_update_single_product',
                'pending',
                json_encode(['product_id' => $productId]),
            );
        }
    }

    private function isAvailableProduct($productId)
    {
        $product = wc_get_product($productId);
        $syncBasalamProductId = get_post_meta($productId, ProductMetaKey::basalamProductId(), true);

        if (!$product || $product->is_type('variation') || !$syncBasalamProductId) return false;

        return true;
    }
}
