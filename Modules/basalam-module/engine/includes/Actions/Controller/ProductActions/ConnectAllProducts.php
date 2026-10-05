<?php

namespace WebinoBasalam\Actions\Controller\ProductActions;

use WebinoBasalam\Admin\ProductService;
use WebinoBasalam\Actions\Controller\ActionController;

defined('ABSPATH') || exit;

class ConnectAllProducts extends ActionController
{
    public function __invoke()
    {
        ProductService::autoConnectAllProducts();
        wp_send_json_success(['message' => 'فرایند اتصال اتوماتیک محصولات با موفقیت آغاز شد.'], 200);
    }
}
