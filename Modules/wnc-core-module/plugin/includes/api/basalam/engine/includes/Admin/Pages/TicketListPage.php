<?php

namespace WncBasalam\Admin\Pages;

defined('ABSPATH') || exit;

class TicketListPage extends AdminPageAbstract
{
    public $checkToken = true;

    protected function renderContent()
    {
        $template = wncBasalamPlugin()->templatePath("admin/Ticket/List.php");
        if (file_exists($template)) require_once($template);
    }
}
