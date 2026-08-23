<?php

namespace WncBasalam\Admin\Pages;

defined('ABSPATH') || exit;

class InfoPage extends AdminPageAbstract
{
    public $checkToken = true;

    protected function renderContent()
    {
        $template = wncBasalamPlugin()->templatePath("admin/info/Info.php");
        if (file_exists($template)) {
            require_once($template);
        }
    }
}
