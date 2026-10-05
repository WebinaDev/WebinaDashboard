<?php

namespace WebinoBasalam\Admin\Pages;

defined('ABSPATH') || exit;

class CategoryMappingPage extends AdminPageAbstract
{
    public $checkToken = true;

    protected function renderContent()
    {
        $template = webinoBasalamPlugin()->templatePath("admin/CategoryMapping.php");
        if (file_exists($template)) {
            require_once($template);
        }
    }
}
