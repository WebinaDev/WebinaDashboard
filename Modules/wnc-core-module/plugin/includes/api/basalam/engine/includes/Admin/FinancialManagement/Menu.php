<?php

namespace WncBasalam\Admin\FinancialManagement;

defined('ABSPATH') || exit;

class Menu
{
    public const PAGE_SLUG = 'wnc_basalam_financial_management';

    public static function renderMainPage(): void
    {
        $template = dirname(__DIR__, 3) . '/templates/FinancialManagement/main-page.php';
        if (file_exists($template)) {
            require $template;
        }
    }
}
