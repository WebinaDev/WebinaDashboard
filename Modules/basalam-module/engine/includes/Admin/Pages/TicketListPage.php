<?php

namespace WebinoBasalam\Admin\Pages;

defined('ABSPATH') || exit;

class TicketListPage extends AdminPageAbstract
{
    public $checkToken = true;

    protected function renderContent()
    {
        $template = webinoBasalamPlugin()->templatePath("admin/Ticket/List.php");
        if (file_exists($template)) require_once($template);
    }
}
