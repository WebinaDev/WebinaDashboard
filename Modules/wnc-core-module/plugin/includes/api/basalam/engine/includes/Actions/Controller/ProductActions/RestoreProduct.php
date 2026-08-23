<?php

namespace WncBasalam\Actions\Controller\ProductActions;

use WncBasalam\Admin\Product\ProductOperations;
use WncBasalam\Actions\Controller\ActionController;

defined('ABSPATH') || exit;

class RestoreProduct extends ActionController
{
    public function __invoke()
    {
        $productOperations = wncBasalamContainer()->get(ProductOperations::class);
        $productId = isset($_POST['product_id']) ? sanitize_text_field(wp_unslash($_POST['product_id'])) : null;

        if (!$productId) {
            wp_send_json_error(['message' => 'آیدی محصول الزامی است.'], 400);
        }

        try {
            $result = $productOperations->restoreExistProduct($productId);
        } catch (\Exception $e) {
            wp_send_json_error($e->getMessage(), 500);
        }
        if (!$result['success']) {
            wp_send_json_error(['message' => $result['message']], $result['status_code'] ?? 500);
        }

        wp_send_json_success(['message' => $result['message']], $result['status_code'] ?? 200);
    }
}
