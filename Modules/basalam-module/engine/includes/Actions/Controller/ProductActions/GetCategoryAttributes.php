<?php

namespace WebinoBasalam\Actions\Controller\ProductActions;

use WebinoBasalam\Services\Products\GetCategoryAttr;
use WebinoBasalam\Actions\Controller\ActionController;

defined('ABSPATH') || exit;

class GetCategoryAttributes extends ActionController
{
    public function __invoke()
    {
        if (isset($_POST['catID'])) {
            $catId = sanitize_text_field(wp_unslash($_POST['catID']));
        } else {
            return false;
        }

        $categoryAttrs = GetCategoryAttr::getAttr($catId);

        if ($categoryAttrs['body']) {
            wp_send_json_success(['attributes' => $categoryAttrs['body']]);
        } else {
            wp_send_json_success([
                [
                    'attributes' => [],
                ],
            ]);
        }
    }
}
