<?php

namespace WebinoBasalam\Admin\Pages;

defined('ABSPATH') || exit;

class LogsPage extends AdminPageAbstract
{
    public $checkToken = false;

    protected function renderContent()
    {
        $template = webinoBasalamPlugin()->templatePath("admin/Logs.php");
        if (file_exists($template)) {
            require_once($template);
        }
    }
}
