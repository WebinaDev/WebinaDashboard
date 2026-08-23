<?php

namespace WncBasalam\Admin;

use WncBasalam\Admin\Pages\CategoryMappingPage;
use WncBasalam\Admin\Pages\HelpPage;
use WncBasalam\Admin\Pages\InfoPage;
use WncBasalam\Admin\Pages\LogsPage;
use WncBasalam\Admin\Pages\MainPage;
use WncBasalam\Admin\Pages\OnboardingPage;
use WncBasalam\Admin\Pages\UnsyncedProductsPage;
use WncBasalam\Admin\Pages\TicketListPage;
use WncBasalam\Admin\Pages\CreateTicketPage;
use WncBasalam\Admin\Pages\SingleTicketPage;
use WncBasalam\Admin\Settings;
use WncBasalam\Admin\Components\CommonComponents;
use WncBasalam\Admin\FinancialManagement\Menu as FinancialManagementMenu;

class Pages
{
    private $renderUi;

    public function __construct()
    {
        $this->renderUi = new CommonComponents();
    }

    public function registerMenus()
    {
        add_menu_page(
            'ووسلام',
            'ووسلام',
            'manage_options',
            'wnc_basalam',
            [new MainPage(), 'render'],
            plugin_dir_url(__FILE__) . '../../assets/images/woosalam.png',
            4
        );

        add_submenu_page(
            'wnc_basalam',
            'خانه',
            $this->renderUi->renderIcon('dashicons-admin-home') . 'خانه',
            'manage_options',
            'wnc_basalam',
            [new MainPage(), 'render']
        );

        add_submenu_page(
            'wnc_basalam',
            'لاگ ها',
            $this->renderUi->renderIcon('dashicons-list-view') . 'لاگ ها',
            'manage_options',
            'wnc_basalam_logs',
            [new LogsPage(), 'render']
        );

        add_submenu_page(
            'wnc_basalam',
            'اطلاعات',
            $this->renderUi->renderIcon('dashicons-info') . 'اطلاعات',
            'manage_options',
            'wnc_basalam_vendor_info',
            [new InfoPage(), 'render']
        );

        add_submenu_page(
            'wnc_basalam',
            'راهنما',
            $this->renderUi->renderIcon('dashicons-book-alt') . 'راهنما',
            'manage_options',
            'wnc_basalam_help',
            [new HelpPage(), 'render']
        );

        add_submenu_page(
            'wnc_basalam',
            'اتصال دسته‌بندی‌ها',
            $this->renderUi->renderIcon('dashicons-category') . 'اتصال دسته‌بندی‌ها',
            'manage_options',
            'wnc_basalam_category_mapping',
            [new CategoryMappingPage(), 'render']
        );

        add_submenu_page(
            'wnc_basalam',
            'مدیریت مالی',
            $this->renderUi->renderIcon('dashicons-chart-line') . 'مدیریت مالی',
            'manage_options',
            FinancialManagementMenu::PAGE_SLUG,
            [FinancialManagementMenu::class, 'renderMainPage']
        );

        if (class_exists('Digikala\Admin\Menus')) \Digikala\Admin\Menus::register();

        add_submenu_page(
            'آنبوردینگ',
            'آنبوردینگ باسلام',
            'آموزش باسلام',
            'manage_options',
            'wnc_basalam-onboarding',
            [new OnboardingPage(), 'render']
        );

        add_submenu_page(
            'ذخیره اطلاعات',
            'ذخیره اطلاعات',
            'ذخیره اطلاعات',
            'manage_options',
            'wnc_basalam-save-token',
            [Settings::class, 'saveOauthData']
        );

        // Legacy WooSalam / Hamsalam callback slug (unprefixed).
        add_submenu_page(
            'ذخیره اطلاعات',
            'ذخیره اطلاعات',
            'ذخیره اطلاعات',
            'manage_options',
            'basalam-save-token',
            [Settings::class, 'saveOauthData']
        );

        add_submenu_page(
            'محصولات باسلام سینک نشده با ووکامرس',
            'محصولات باسلام سینک نشده با ووکامرس',
            'محصولات باسلام سینک نشده با ووکامرس',
            'manage_options',
            'wnc_basalam-show-products',
            [new UnsyncedProductsPage(), 'render']
        );


        // Ticket
        add_submenu_page(
            'wnc_basalam',
            'پشتیبانی',
            $this->renderUi->renderIcon('dashicons-book-alt') . 'پشتیبانی',
            'manage_options',
            'wnc_basalam_tickets',
            [new TicketListPage(), 'render']
        );

        add_submenu_page(
            'اطلاعات تیکت',
            'اطلاعات تیکت',
            'اطلاعات تیکت',
            'manage_options',
            'wnc_basalam_ticket',
            [new SingleTicketPage(), 'render']
        );

        add_submenu_page(
            'ایجاد تیکت',
            'ایجاد تیکت',
            'ایجاد تیکت',
            'manage_options',
            'wnc_basalam_new_ticket',
            [new CreateTicketPage(), 'render']
        );
        do_action('wnc_basalam_after_register_menus');
    }
}
