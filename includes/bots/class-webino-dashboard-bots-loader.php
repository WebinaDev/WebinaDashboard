<?php
/**
 * Bale bot engine loader + shared bot autoload / migrations.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Autoloads bot trees and boots Bale engine when WooCommerce is active.
 */
final class Webino_Dashboard_Bots_Loader {

	const WOOBALE_STANDALONE = 'woobale/woobale.php';

	/**
	 * @return void
	 */
	public static function register_autoloaders(): void {
		static $registered = false;
		if ( $registered ) {
			return;
		}
		$registered = true;

		if ( ! defined( 'WEBINO_DASHBOARD_BOTS_BALE_DIR' ) ) {
			define( 'WEBINO_DASHBOARD_BOTS_BALE_DIR', self::bale_engine_dir() );
		}
		if ( ! defined( 'WEBINO_DASHBOARD_BOTS_TELEGRAM_DIR' ) ) {
			define( 'WEBINO_DASHBOARD_BOTS_TELEGRAM_DIR', self::telegram_engine_dir() );
		}

		spl_autoload_register( array( __CLASS__, 'autoload_bale' ), true, true );
		spl_autoload_register( array( __CLASS__, 'autoload_telegram' ), true, true );
	}

	/**
	 * @return string
	 */
	private static function bale_engine_dir() {
		if ( class_exists( 'Webino_Dashboard_Module_Registry', false ) ) {
			return Webino_Dashboard_Module_Registry::module_dir( 'bale-bot-module' ) . 'engine/';
		}
		return trailingslashit( WEBINO_DASHBOARD_DIR ) . 'Modules/bale-bot-module/engine/';
	}

	/**
	 * @return string
	 */
	private static function telegram_engine_dir() {
		if ( class_exists( 'Webino_Dashboard_Module_Registry', false ) ) {
			return Webino_Dashboard_Module_Registry::module_dir( 'telegram-bot-module' ) . 'engine/';
		}
		return trailingslashit( WEBINO_DASHBOARD_DIR ) . 'Modules/telegram-bot-module/engine/';
	}

	/**
	 * @param string $class Class name.
	 * @return void
	 */
	public static function autoload_bale( $class ) {
		$prefix = 'Webino_Dashboard_Bots_Bale\\';
		$len    = strlen( $prefix );
		if ( strncmp( $prefix, $class, $len ) !== 0 ) {
			return;
		}
		$relative = substr( $class, $len );
		$file     = WEBINO_DASHBOARD_BOTS_BALE_DIR . str_replace( '\\', '/', $relative ) . '.php';
		if ( is_readable( $file ) ) {
			require_once $file;
		}
	}

	/**
	 * @param string $class Class name.
	 * @return void
	 */
	public static function autoload_telegram( $class ) {
		$prefix = 'Webino_Dashboard_Bots_Telegram\\';
		$len    = strlen( $prefix );
		if ( strncmp( $prefix, $class, $len ) !== 0 ) {
			return;
		}
		$relative = substr( $class, $len );
		$file     = WEBINO_DASHBOARD_BOTS_TELEGRAM_DIR . str_replace( '\\', '/', $relative ) . '.php';
		if ( is_readable( $file ) ) {
			require_once $file;
		}
	}

	/**
	 * @return bool
	 */
	private static function standalone_woobale_active(): bool {
		if ( ! function_exists( 'is_plugin_active' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}
		return is_plugin_active( self::WOOBALE_STANDALONE );
	}

	/**
	 * Shared migrations and session table (once per request).
	 *
	 * @return void
	 */
	public static function boot_shared(): void {
		static $done = false;
		if ( $done || ! class_exists( 'WooCommerce', false ) ) {
			return;
		}
		$done = true;

		self::register_autoloaders();

		if ( ! self::standalone_woobale_active() ) {
			$migrate = dirname( __FILE__ ) . '/class-webino-dashboard-bots-campaign-migrate.php';
			if ( is_readable( $migrate ) ) {
				require_once $migrate;
				Webino_Dashboard_Bots_Campaign_Migration::run();
			}
		}

		Webino_Dashboard_Install::ensure_dashboard_bot_sessions_table();

		if ( ! defined( 'WEBINO_DASHBOARD_BOTS_EMBEDDED' ) ) {
			define( 'WEBINO_DASHBOARD_BOTS_EMBEDDED', true );
		}
	}

	/**
	 * @return void
	 */
	public static function boot_bale(): void {
		static $done = false;
		if ( $done || ! class_exists( 'WooCommerce', false ) ) {
			return;
		}
		$done = true;

		self::boot_shared();

		if ( ! self::standalone_woobale_active() && class_exists( 'Webino_Dashboard_Bots_Bale\Core\Plugin', false ) ) {
			\Webino_Dashboard_Bots_Bale\Core\Plugin::bootstrap_secrets();
			\Webino_Dashboard_Bots_Bale\Core\Plugin::instance()->init();
		}
	}

	/**
	 * @return void
	 */
	public static function boot_telegram(): void {
		static $done = false;
		if ( $done || ! class_exists( 'WooCommerce', false ) ) {
			return;
		}
		$done = true;

		self::boot_shared();

		if ( class_exists( 'Webino_Dashboard_Bots_Telegram\Core\Plugin', false ) ) {
			\Webino_Dashboard_Bots_Telegram\Core\Plugin::bootstrap_secrets();
			\Webino_Dashboard_Bots_Telegram\Core\Plugin::instance()->init();
		}
	}
}
