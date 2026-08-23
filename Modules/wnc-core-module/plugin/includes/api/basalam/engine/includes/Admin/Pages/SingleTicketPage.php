<?php

namespace WncBasalam\Admin\Pages;

defined('ABSPATH') || exit;

class SingleTicketPage extends AdminPageAbstract
{
    public $checkToken = true;

    protected function renderContent()
    {
        $template = wncBasalamPlugin()->templatePath("admin/Ticket/Single.php");
        if (file_exists($template)) require_once($template);
    }
}
