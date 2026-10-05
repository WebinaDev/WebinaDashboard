<?php
/**
 * Telegram bot engine loader.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Boots Telegram engine when WooCommerce is active.
 */
final class Webino_Dashboard_Telegram_Bot_Loader {

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'init', array( __CLASS__, 'boot_telegram' ), 21 );
	}

	/**
	 * @return void
	 */
	public static function boot_telegram(): void {
		static $done = false;
		if ( $done || ! class_exists( 'WooCommerce', false ) ) {
			return;
		}
		if ( class_exists( 'Webino_Dashboard_Module_Registry', false )
			&& ! Webino_Dashboard_Module_Registry::is_active( 'telegram-bot-module' ) ) {
			return;
		}
		$done = true;

		if ( class_exists( 'Webino_Dashboard_Bots_Loader', false ) ) {
			Webino_Dashboard_Bots_Loader::boot_shared();
		}

		if ( class_exists( 'Webino_Dashboard_Bots_Telegram\Core\Plugin', false ) ) {
			\Webino_Dashboard_Bots_Telegram\Core\Plugin::bootstrap_secrets();
			\Webino_Dashboard_Bots_Telegram\Core\Plugin::instance()->init();
		}
	}
}
