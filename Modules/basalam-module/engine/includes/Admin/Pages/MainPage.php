<?php

namespace WebinoBasalam\Admin\Pages;

defined('ABSPATH') || exit;
class MainPage extends AdminPageAbstract
{
    public $checkToken = false;

    protected function renderContent()
    {
        $template = webinoBasalamPlugin()->templatePath("admin/Dashboard.php");
        if (file_exists($template)) {
            require_once($template);
        }
    }
}
