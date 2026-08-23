<?php

namespace WncBasalam\Admin\Pages;

defined('ABSPATH') || exit;

class HelpPage extends AdminPageAbstract
{
    public $checkToken = false;

    protected function renderContent()
    {
        $template = wncBasalamPlugin()->templatePath("admin/Help/Main.php");
        if (file_exists($template)) require_once($template);
    }
}
