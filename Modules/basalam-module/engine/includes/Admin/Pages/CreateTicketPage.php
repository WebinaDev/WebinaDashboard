<?php

namespace WebinoBasalam\Admin\Pages;

defined('ABSPATH') || exit;

class CreateTicketPage extends AdminPageAbstract
{
    public $checkToken = true;

    protected function renderContent()
    {
        $template = webinoBasalamPlugin()->templatePath("admin/Ticket/Create.php");
        if (file_exists($template)) {
            require_once($template);
        }
    }
}
