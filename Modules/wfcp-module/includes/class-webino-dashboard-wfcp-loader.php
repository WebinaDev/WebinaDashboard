<?php
/**
 * Loads bundled webina-woo-core when the standalone plugin is not active.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Defines WFCP_* constants and bootstraps WFCP_Main after WooCommerce.
 */
final class Webino_Dashboard_WFCP_Loader {

	const STANDALONE_PLUGIN = 'webina-woo-core/webina-woo-core.php';

	/**
	 * @return void
	 */
	public static function init() {
		// Declare WC compatibility from the dashboard plugin file when bundling WFCP.
		add_action( 'before_woocommerce_init', array( __CLASS__, 'declare_wc_compatibility' ) );

		// Modules load on `init`; plugins_loaded has already fired by then.
		if ( did_action( 'plugins_loaded' ) ) {
			self::maybe_load_bundled();
			return;
		}
		add_action( 'plugins_loaded', array( __CLASS__, 'maybe_load_bundled' ), 21 );
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
		return is_plugin_active( self::STANDALONE_PLUGIN );
	}

	/**
	 * Skip bundled boot when the dashboard module is inactive.
	 *
	 * @return bool
	 */
	private static function module_should_boot() {
		if ( class_exists( 'Webino_Dashboard_Module_Registry', false )
			&& method_exists( 'Webino_Dashboard_Module_Registry', 'is_active' ) ) {
			return Webino_Dashboard_Module_Registry::is_active( 'wfcp-module' );
		}
		if ( class_exists( 'Webino_Dashboard_Modules', false )
			&& method_exists( 'Webino_Dashboard_Modules', 'is_module_enabled' ) ) {
			return Webino_Dashboard_Modules::is_module_enabled( 'wfcp-module' );
		}
		return true;
	}

	/**
	 * @return void
	 */
	public static function maybe_load_bundled() {
		if ( self::standalone_plugin_active() ) {
			return;
		}

		if ( ! self::module_should_boot() ) {
			return;
		}

		if ( class_exists( 'WFCP_Main', false ) ) {
			return;
		}

		if ( ! self::woocommerce_ready() ) {
			add_action( 'woocommerce_loaded', array( __CLASS__, 'maybe_load_bundled' ), 5 );
			return;
		}

		$dir = self::bundled_plugin_dir();
		if ( ! is_dir( $dir ) || ! is_readable( $dir . 'includes/class-wfcp-main.php' ) ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( '[Webino Dashboard] WFCP plugin dir missing: ' . $dir );
			return;
		}

		if ( ! defined( 'WEBINO_DASHBOARD_BUNDLED_WFCP' ) ) {
			define( 'WEBINO_DASHBOARD_BUNDLED_WFCP', true );
		}

		self::define_wfcp_constants( $dir );
		self::run_wfcp();
		add_action( 'admin_menu', array( __CLASS__, 'remove_wp_admin_menus' ), 999 );
	}

	/**
	 * @return bool
	 */
	private static function woocommerce_ready() {
		if ( ! did_action( 'plugins_loaded' ) ) {
			return false;
		}
		if ( ! class_exists( 'WooCommerce', false ) ) {
			return false;
		}
		return true;
	}

	/**
	 * @param string $dir Absolute path to bundled plugin root (trailing slash).
	 * @return void
	 */
	private static function define_wfcp_constants( $dir ) {
		if ( defined( 'WFCP_PLUGIN_DIR' ) ) {
			return;
		}
		$ver  = '2.0.1';
		$main = $dir . 'webina-woo-core.php';
		if ( is_readable( $main ) && preg_match( '/Version:\\s*([0-9.]+)/', (string) file_get_contents( $main ), $m ) ) {
			$ver = $m[1];
		}
		define( 'WFCP_VERSION', $ver );
		define( 'WFCP_PLUGIN_NAME', 'webina-woo-core' );
		define( 'WFCP_PLUGIN_DIR', $dir );
		$plugin_url = '';
		if ( defined( 'WEBINO_DASHBOARD_URL' ) ) {
			$plugin_url = trailingslashit( WEBINO_DASHBOARD_URL ) . 'Modules/wfcp-module/plugin/';
		} elseif ( defined( 'WEBINO_DASHBOARD_FILE' ) ) {
			$plugin_url = plugins_url( 'Modules/wfcp-module/plugin/', WEBINO_DASHBOARD_FILE );
		} else {
			$plugin_url = plugins_url( '/', $dir . 'webina-woo-core.php' );
		}
		define( 'WFCP_PLUGIN_URL', trailingslashit( $plugin_url ) );
		define( 'WFCP_PLUGIN_BASENAME', plugin_basename( $dir . 'webina-woo-core.php' ) );
	}

	/**
	 * @return void
	 */
	private static function run_wfcp() {
		if ( ! self::wfcp_check_woocommerce() ) {
			return;
		}

		$required = array(
			'includes/class-wfcp-loader.php',
			'includes/class-wfcp-i18n.php',
			'includes/class-wfcp-activator.php',
			'includes/utilities/class-wfcp-helper.php',
			'includes/services/class-wfcp-calculator.php',
			'includes/services/class-wfcp-cart-manager.php',
			'includes/services/class-wfcp-gateway-manager.php',
			'includes/class-wfcp-storefront-price.php',
			'includes/services/class-wfcp-batch-process.php',
			'includes/services/class-wfcp-bulk-price-change.php',
			'includes/services/class-wfcp-multi-cart.php',
		);

		$optional = array(
			'includes/integrations/class-wfcp-ishop-theme-compat.php',
			'includes/integrations/class-wfcp-ishop-script-compat.php',
			'includes/utilities/class-wfcp-diagnostics.php',
		);

		foreach ( $required as $rel ) {
			$path = WFCP_PLUGIN_DIR . $rel;
			if ( ! is_readable( $path ) ) {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				error_log( '[Webino Dashboard] WFCP required file missing: ' . $path );
				return;
			}
			require_once $path;
		}

		foreach ( $optional as $rel ) {
			$path = WFCP_PLUGIN_DIR . $rel;
			if ( is_readable( $path ) ) {
				require_once $path;
			}
		}

		$main = WFCP_PLUGIN_DIR . 'includes/class-wfcp-main.php';
		if ( ! is_readable( $main ) ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( '[Webino Dashboard] WFCP main missing: ' . $main );
			return;
		}
		require_once $main;

		try {
			if ( class_exists( 'WFCP_Activator', false ) ) {
				WFCP_Activator::maybe_upgrade_settings();
			}
			if ( class_exists( 'WFCP_Batch_Process', false ) ) {
				WFCP_Batch_Process::init();
			}
			$loader = new WFCP_Loader();
			$plugin = new WFCP_Main( $loader );
			$plugin->run();
		} catch ( Throwable $e ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( '[Webino Dashboard] WFCP boot failed: ' . $e->getMessage() );
		}
	}

	/**
	 * @return bool
	 */
	private static function wfcp_check_woocommerce() {
		$active = (array) get_option( 'active_plugins', array() );
		if ( ! in_array( 'woocommerce/woocommerce.php', $active, true ) ) {
			if ( is_multisite() ) {
				$net = (array) get_site_option( 'active_sitewide_plugins', array() );
				if ( ! isset( $net['woocommerce/woocommerce.php'] ) ) {
					return false;
				}
			} else {
				return false;
			}
		}
		return class_exists( 'WooCommerce', false );
	}

	/**
	 * @return string
	 */
	private static function bundled_plugin_dir() {
		if ( class_exists( 'Webino_Dashboard_Module_Registry', false ) ) {
			return Webino_Dashboard_Module_Registry::module_dir( 'wfcp-module' ) . 'plugin/';
		}
		if ( defined( 'WEBINO_MODULES_DIR' ) ) {
			return trailingslashit( WEBINO_MODULES_DIR ) . 'wfcp-module/plugin/';
		}
		return trailingslashit( WEBINO_DASHBOARD_DIR ) . 'Modules/wfcp-module/plugin/';
	}

	/**
	 * @return void
	 */
	public static function remove_wp_admin_menus() {
		if ( ! defined( 'WEBINO_DASHBOARD_BUNDLED_WFCP' ) || ! WEBINO_DASHBOARD_BUNDLED_WFCP ) {
			return;
		}
		remove_menu_page( 'wfcp-settings' );
	}
}
