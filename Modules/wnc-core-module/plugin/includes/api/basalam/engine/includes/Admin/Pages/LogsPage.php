<?php

namespace WncBasalam\Admin\Pages;

defined('ABSPATH') || exit;

class LogsPage extends AdminPageAbstract
{
    public $checkToken = false;

    protected function renderContent()
    {
        $template = wncBasalamPlugin()->templatePath("admin/Logs.php");
        if (file_exists($template)) {
            require_once($template);
        }
    }
}
