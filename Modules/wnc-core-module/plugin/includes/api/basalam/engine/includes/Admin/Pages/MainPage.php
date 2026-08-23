<?php

namespace WncBasalam\Admin\Pages;

defined('ABSPATH') || exit;
class MainPage extends AdminPageAbstract
{
    public $checkToken = false;

    protected function renderContent()
    {
        $template = wncBasalamPlugin()->templatePath("admin/Dashboard.php");
        if (file_exists($template)) {
            require_once($template);
        }
    }
}
