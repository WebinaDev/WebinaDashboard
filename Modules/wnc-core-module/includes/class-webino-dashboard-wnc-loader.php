<?php
/**
 * Loads bundled WebinaConnector when the standalone plugin is not active.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Defines WNC_* constants and bootstraps WNC_Main after WooCommerce.
 */
final class Webino_Dashboard_WNC_Loader {

	const STANDALONE_PLUGIN = 'WebinaConnector/webinaconnector.php';
	const STANDALONE_PLUGIN_ALT = 'webinaconnector/webinaconnector.php';

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'before_woocommerce_init', array( __CLASS__, 'declare_wc_compatibility' ) );

		if ( did_action( 'plugins_loaded' ) ) {
			self::maybe_load_bundled();
			return;
		}
		add_action( 'plugins_loaded', array( __CLASS__, 'maybe_load_bundled' ), 26 );
	}

	/**
	 * @return void
	 */
	public static function declare_wc_compatibility() {
		if ( ! class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) {
			return;
		}
		$file = defined( 'WEBINO_DASHBOARD_FILE' ) ? WEBINO_DASHBOARD_FILE : __FILE__;
		\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', $file, true );
		\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'cart_checkout_blocks', $file, true );
	}

	/**
	 * @return bool
	 */
	private static function standalone_plugin_active() {
		if ( ! function_exists( 'is_plugin_active' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}
		return is_plugin_active( self::STANDALONE_PLUGIN ) || is_plugin_active( self::STANDALONE_PLUGIN_ALT );
	}

	/**
	 * @return void
	 */
	public static function maybe_load_bundled() {
		if ( self::standalone_plugin_active() ) {
			return;
		}
		if ( class_exists( 'WNC_Main', false ) ) {
			return;
		}
		if ( ! class_exists( 'WooCommerce', false ) ) {
			return;
		}

		$dir = self::bundled_plugin_dir();
		if ( ! is_dir( $dir ) || ! is_readable( $dir . 'includes/class-wnc-main.php' ) ) {
			return;
		}

		if ( ! defined( 'WEBINO_DASHBOARD_BUNDLED_WNC' ) ) {
			define( 'WEBINO_DASHBOARD_BUNDLED_WNC', true );
		}

		self::define_wnc_constants( $dir );
		self::run_wnc();
		add_action( 'admin_menu', array( __CLASS__, 'remove_wp_admin_menus' ), 999 );
	}

	/**
	 * @param string $dir Dir.
	 * @return void
	 */
	private static function define_wnc_constants( $dir ) {
		if ( defined( 'WNC_PLUGIN_DIR' ) ) {
			return;
		}
		$ver  = '1.5.0';
		$main = $dir . 'webinaconnector.php';
		if ( is_readable( $main ) && preg_match( '/Version:\\s*([0-9.]+)/', (string) file_get_contents( $main ), $m ) ) {
			$ver = $m[1];
		}
		define( 'WNC_VERSION', $ver );
		define( 'WNC_PLUGIN_NAME', 'webinaconnector' );
		define( 'WNC_PLUGIN_DIR', $dir );
		define( 'WNC_PLUGIN_URL', plugins_url( 'Modules/wnc-core-module/plugin/', WEBINO_DASHBOARD_FILE ) );
		define( 'WNC_PLUGIN_BASENAME', plugin_basename( $dir . 'webinaconnector.php' ) );
	}

	/**
	 * @return void
	 */
	private static function run_wnc() {
		require_once WNC_PLUGIN_DIR . 'includes/class-wnc-loader.php';
		require_once WNC_PLUGIN_DIR . 'includes/class-wnc-main.php';

		try {
			if ( class_exists( 'WNC_Activator', false ) || is_readable( WNC_PLUGIN_DIR . 'includes/class-wnc-activator.php' ) ) {
				require_once WNC_PLUGIN_DIR . 'includes/class-wnc-activator.php';
				if ( method_exists( 'WNC_Activator', 'activate' ) && ! get_option( 'wnc_version' ) ) {
					WNC_Activator::activate();
				}
			}
			$loader = new WNC_Loader();
			$plugin = new WNC_Main( $loader );
			$plugin->run();
		} catch ( Throwable $e ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( '[Webino Dashboard] WNC boot failed: ' . $e->getMessage() );
		}
	}

	/**
	 * @return string
	 */
	private static function bundled_plugin_dir() {
		if ( class_exists( 'Webino_Dashboard_Module_Registry', false ) ) {
			return Webino_Dashboard_Module_Registry::module_dir( 'wnc-core-module' ) . 'plugin/';
		}
		return trailingslashit( WEBINO_DASHBOARD_DIR ) . 'Modules/wnc-core-module/plugin/';
	}

	/**
	 * @return void
	 */
	public static function remove_wp_admin_menus() {
		if ( ! defined( 'WEBINO_DASHBOARD_BUNDLED_WNC' ) || ! WEBINO_DASHBOARD_BUNDLED_WNC ) {
			return;
		}
		remove_menu_page( 'wnc-dashboard' );
	}

	/**
	 * @return bool
	 */
	public static function ready() {
		return class_exists( 'WNC_Platform_Registry', false ) || class_exists( 'WNC_Settings', false );
	}
}
