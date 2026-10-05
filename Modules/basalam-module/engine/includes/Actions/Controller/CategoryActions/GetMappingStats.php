<?php

namespace WebinoBasalam\Actions\Controller\CategoryActions;

use WebinoBasalam\Admin\Product\Category\CategoryMapping;
use WebinoBasalam\Actions\Controller\ActionController;

defined('ABSPATH') || exit;

class GetMappingStats extends ActionController
{
    public function __invoke()
    {
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }

        try {
            $stats = CategoryMapping::getMappingStats();
            wp_send_json_success($stats);
        } catch (\Exception $e) {
            wp_send_json_error($e->getMessage());
        }
    }
}
