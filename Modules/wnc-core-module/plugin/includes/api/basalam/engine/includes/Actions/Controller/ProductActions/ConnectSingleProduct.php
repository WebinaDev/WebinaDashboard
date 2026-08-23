<?php

namespace WncBasalam\Actions\Controller\ProductActions;

use WncBasalam\Actions\Controller\ActionController;
use WncBasalam\Admin\Product\Operations\ConnectProduct;

defined('ABSPATH') || exit;

class ConnectSingleProduct extends ActionController
{
    public function __invoke()
    {
        $handler = new ConnectProduct();
        $result = $handler->handleConnectProduct();

        if (!$result['success']) {
            wp_send_json_error(['message' => $result['message']], $result['status_code'] ?? 500);
        }

        wp_send_json_success(['message' => $result['message']], $result['status_code'] ?? 200);
    }
}
