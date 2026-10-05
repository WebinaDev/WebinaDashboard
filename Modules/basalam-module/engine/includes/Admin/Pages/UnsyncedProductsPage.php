<?php

namespace WebinoBasalam\Admin\Pages;

defined('ABSPATH') || exit;

class UnsyncedProductsPage extends AdminPageAbstract
{
    public $checkToken = true;

    protected function renderContent()
    {
        $template = webinoBasalamPlugin()->templatePath("admin/ProductSync.php");
        if (file_exists($template)) {
            require_once($template);
        }
    }
}
