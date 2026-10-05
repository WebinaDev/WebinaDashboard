<?php

namespace WebinoBasalam\Actions\Controller\ProductActions;

use WebinoBasalam\Actions\Controller\ActionController;
use WebinoBasalam\Admin\Product\Operations\ConnectProduct;

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
