<?php

namespace Webino_Dashboard_Bots_Bale\Admin;

/**
 * Registers plugin admin pages under a dedicated top-level menu.
 */
class Menu {

	public static function init(): void {
		add_action( 'admin_menu', array( __CLASS__, 'register' ), 60 );
	}

	public static function register(): void {
		if ( ! class_exists( '\WooCommerce' ) ) {
			return;
		}

		add_menu_page(
			__( 'بازوی بله — داشبورد', 'webino-dashboard' ),
			__( 'بازوی بله', 'webino-dashboard' ),
			'manage_woocommerce',
			'woobale-dashboard',
			array( __CLASS__, 'render_dashboard' ),
			'dashicons-format-chat',
			56
		);

		add_submenu_page(
			'woobale-dashboard',
			__( 'بازوی بله — داشبورد', 'webino-dashboard' ),
			__( 'داشبورد', 'webino-dashboard' ),
			'manage_woocommerce',
			'woobale-dashboard',
			array( __CLASS__, 'render_dashboard' )
		);

		add_submenu_page(
			'woobale-dashboard',
			__( 'بازوی بله — تنظیمات', 'webino-dashboard' ),
			__( 'تنظیمات', 'webino-dashboard' ),
			'manage_woocommerce',
			'woobale-settings',
			array( __CLASS__, 'render_settings' )
		);

		add_submenu_page(
			'woobale-dashboard',
			__( 'بازوی بله — کاربران بازو', 'webino-dashboard' ),
			__( 'کاربران بازو', 'webino-dashboard' ),
			'manage_woocommerce',
			'woobale-users',
			array( __CLASS__, 'render_users' )
		);

		add_submenu_page(
			'woobale-dashboard',
			__( 'بازوی بله — پیام همگانی', 'webino-dashboard' ),
			__( 'پیام همگانی بله', 'webino-dashboard' ),
			'manage_woocommerce',
			'woobale-broadcast',
			array( __CLASS__, 'render_broadcast' )
		);

		add_submenu_page(
			'woobale-dashboard',
			__( 'بازوی بله — کمپین‌ها', 'webino-dashboard' ),
			__( 'کمپین‌ها', 'webino-dashboard' ),
			'manage_woocommerce',
			'woobale-campaigns',
			array( __CLASS__, 'render_campaigns' )
		);

		add_submenu_page(
			'woobale-dashboard',
			__( 'بازوی بله — لاگ و خطاها', 'webino-dashboard' ),
			__( 'لاگ بله', 'webino-dashboard' ),
			'manage_woocommerce',
			'woobale-logs',
			array( __CLASS__, 'render_logs' )
		);
	}

	public static function render_dashboard(): void {
		DashboardPage::render();
	}

	public static function render_settings(): void {
		SettingsPage::instance()->render_tabbed_page();
	}

	public static function render_users(): void {
		BotUsersPage::render();
	}

	public static function render_broadcast(): void {
		BroadcastPage::render();
	}

	public static function render_campaigns(): void {
		CampaignPage::render();
	}

	public static function render_logs(): void {
		LogsPage::render();
	}
}
