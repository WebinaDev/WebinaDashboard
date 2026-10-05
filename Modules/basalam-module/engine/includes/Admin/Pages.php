<?php

namespace WebinoBasalam\Admin;

use WebinoBasalam\Admin\Pages\CategoryMappingPage;
use WebinoBasalam\Admin\Pages\HelpPage;
use WebinoBasalam\Admin\Pages\InfoPage;
use WebinoBasalam\Admin\Pages\LogsPage;
use WebinoBasalam\Admin\Pages\MainPage;
use WebinoBasalam\Admin\Pages\OnboardingPage;
use WebinoBasalam\Admin\Pages\UnsyncedProductsPage;
use WebinoBasalam\Admin\Pages\TicketListPage;
use WebinoBasalam\Admin\Pages\CreateTicketPage;
use WebinoBasalam\Admin\Pages\SingleTicketPage;
use WebinoBasalam\Admin\Settings;
use WebinoBasalam\Admin\Components\CommonComponents;
use WebinoBasalam\Admin\FinancialManagement\Menu as FinancialManagementMenu;

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
            'باسلام',
            'باسلام',
            'manage_options',
            'webino_basalam',
            [new MainPage(), 'render'],
            plugin_dir_url(__FILE__) . '../../assets/images/basalam.svg',
            4
        );

        add_submenu_page(
            'webino_basalam',
            'خانه',
            $this->renderUi->renderIcon('dashicons-admin-home') . 'خانه',
            'manage_options',
            'webino_basalam',
            [new MainPage(), 'render']
        );

        add_submenu_page(
            'webino_basalam',
            'لاگ ها',
            $this->renderUi->renderIcon('dashicons-list-view') . 'لاگ ها',
            'manage_options',
            'webino_basalam_logs',
            [new LogsPage(), 'render']
        );

        add_submenu_page(
            'webino_basalam',
            'اطلاعات',
            $this->renderUi->renderIcon('dashicons-info') . 'اطلاعات',
            'manage_options',
            'webino_basalam_vendor_info',
            [new InfoPage(), 'render']
        );

        add_submenu_page(
            'webino_basalam',
            'راهنما',
            $this->renderUi->renderIcon('dashicons-book-alt') . 'راهنما',
            'manage_options',
            'webino_basalam_help',
            [new HelpPage(), 'render']
        );

        add_submenu_page(
            'webino_basalam',
            'اتصال دسته‌بندی‌ها',
            $this->renderUi->renderIcon('dashicons-category') . 'اتصال دسته‌بندی‌ها',
            'manage_options',
            'webino_basalam_category_mapping',
            [new CategoryMappingPage(), 'render']
        );

        add_submenu_page(
            'webino_basalam',
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
            'webino_basalam-onboarding',
            [new OnboardingPage(), 'render']
        );

        add_submenu_page(
            'ذخیره اطلاعات',
            'ذخیره اطلاعات',
            'ذخیره اطلاعات',
            'manage_options',
            'webino_basalam-save-token',
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
            'webino_basalam-show-products',
            [new UnsyncedProductsPage(), 'render']
        );


        // Ticket
        add_submenu_page(
            'webino_basalam',
            'پشتیبانی',
            $this->renderUi->renderIcon('dashicons-book-alt') . 'پشتیبانی',
            'manage_options',
            'webino_basalam_tickets',
            [new TicketListPage(), 'render']
        );

        add_submenu_page(
            'اطلاعات تیکت',
            'اطلاعات تیکت',
            'اطلاعات تیکت',
            'manage_options',
            'webino_basalam_ticket',
            [new SingleTicketPage(), 'render']
        );

        add_submenu_page(
            'ایجاد تیکت',
            'ایجاد تیکت',
            'ایجاد تیکت',
            'manage_options',
            'webino_basalam_new_ticket',
            [new CreateTicketPage(), 'render']
        );
        do_action('webino_basalam_after_register_menus');
    }
}
