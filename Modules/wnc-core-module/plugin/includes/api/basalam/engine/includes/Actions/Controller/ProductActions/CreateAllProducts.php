<?php

namespace WncBasalam\Actions\Controller\ProductActions;

use WncBasalam\Admin\ProductService;
use WncBasalam\Actions\Controller\ActionController;

defined('ABSPATH') || exit;

class CreateAllProducts extends ActionController
{
    public function __invoke()
    {
        $includeOutOfStock = isset($_POST['include_out_of_stock']) ? true : false;
        $postPerPage = 100;
        $result = ProductService::enqueueAllProductsForCreation($includeOutOfStock, $postPerPage);

        if (!$result['success']) {
            wp_send_json_error(['message' => $result['message']], $result['status_code'] ?? 500);
        }

        wp_send_json_success(['message' => $result['message']], $result['status_code'] ?? 200);
    }
}
