<?php

namespace WebinoBasalam\Admin\Pages;

defined('ABSPATH') || exit;

class InfoPage extends AdminPageAbstract
{
    public $checkToken = true;

    protected function renderContent()
    {
        $template = webinoBasalamPlugin()->templatePath("admin/info/Info.php");
        if (file_exists($template)) {
            require_once($template);
        }
    }
}
