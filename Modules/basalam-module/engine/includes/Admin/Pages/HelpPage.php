<?php

namespace WebinoBasalam\Admin\Pages;

defined('ABSPATH') || exit;

class HelpPage extends AdminPageAbstract
{
    public $checkToken = false;

    protected function renderContent()
    {
        $template = webinoBasalamPlugin()->templatePath("admin/Help/Main.php");
        if (file_exists($template)) require_once($template);
    }
}
