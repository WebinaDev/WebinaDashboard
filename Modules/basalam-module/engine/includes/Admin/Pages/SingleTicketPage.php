<?php

namespace WebinoBasalam\Admin\Pages;

defined('ABSPATH') || exit;

class SingleTicketPage extends AdminPageAbstract
{
    public $checkToken = true;

    protected function renderContent()
    {
        $template = webinoBasalamPlugin()->templatePath("admin/Ticket/Single.php");
        if (file_exists($template)) require_once($template);
    }
}
