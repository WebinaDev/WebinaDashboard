<?php

namespace WncBasalam\Admin\Pages;

defined('ABSPATH') || exit;

class CreateTicketPage extends AdminPageAbstract
{
    public $checkToken = true;

    protected function renderContent()
    {
        $template = wncBasalamPlugin()->templatePath("admin/Ticket/Create.php");
        if (file_exists($template)) {
            require_once($template);
        }
    }
}
