<?php
/**
 * Core bootstrap for shared dashboard bot services (REST + Bale engine hooks).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Loads bot includes from core and wires init hooks when bot modules are installed.
 */
final class Webino_Dashboard_Bots_Core {

	/**
	 * @return void
	 */
	public static function init() {
		static $done = false;
		if ( $done ) {
			return;
		}
		$done = true;

		self::require_includes();

		add_action( 'init', array( __CLASS__, 'boot_when_needed' ), 20 );
	}

	/**
	 * @return void
	 */
	private static function require_includes() {
		$dir = WEBINO_DASHBOARD_DIR . 'includes/bots/';
		$files = array(
			'class-webino-dashboard-bots-loader.php',
			'class-webino-dashboard-bots-rest-context.php',
			'class-webino-dashboard-rest-bots.php',
			'class-webino-dashboard-bots-campaign-migrate.php',
		);
		foreach ( $files as $file ) {
			$path = $dir . $file;
			if ( is_readable( $path ) ) {
				require_once $path;
			}
		}
	}

	/**
	 * @return bool
	 */
	private static function bale_module_active() {
		return class_exists( 'Webino_Dashboard_Module_Registry', false )
			&& Webino_Dashboard_Module_Registry::is_active( 'bale-bot-module' );
	}

	/**
	 * @return bool
	 */
	private static function telegram_module_active() {
		return class_exists( 'Webino_Dashboard_Module_Registry', false )
			&& Webino_Dashboard_Module_Registry::is_active( 'telegram-bot-module' );
	}

	/**
	 * @return bool
	 */
	private static function any_bot_module_active() {
		return self::bale_module_active() || self::telegram_module_active();
	}

	/**
	 * @return void
	 */
	public static function boot_when_needed() {
		if ( ! self::any_bot_module_active() ) {
			return;
		}

		if ( class_exists( 'Webino_Dashboard_REST_Bots', false ) ) {
			Webino_Dashboard_REST_Bots::init();
		}

		if ( ! class_exists( 'Webino_Dashboard_Bots_Loader', false ) ) {
			return;
		}

		if ( self::bale_module_active() ) {
			Webino_Dashboard_Bots_Loader::boot_bale();
		}
		if ( self::telegram_module_active() ) {
			Webino_Dashboard_Bots_Loader::boot_telegram();
		}
	}
}
