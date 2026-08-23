<?php

namespace WncBasalam\Admin\Pages;

defined('ABSPATH') || exit;

class UnsyncedProductsPage extends AdminPageAbstract
{
    public $checkToken = true;

    protected function renderContent()
    {
        $template = wncBasalamPlugin()->templatePath("admin/ProductSync.php");
        if (file_exists($template)) {
            require_once($template);
        }
    }
}
