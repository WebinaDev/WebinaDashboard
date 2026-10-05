<?php
/**
 * Loads bundled Torob products extractor vendor plugin or defers to standalone install.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Vendor bootstrap for Torob products extractor module.
 */
final class Webino_Torob_Extractor_Vendor_Loader {

	const STANDALONE_PLUGIN = 'products-extractor-for-woocommerce/wcpe.php';

	const BUNDLED_ENTRY = 'products-extractor-for-woocommerce/wcpe.php';

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'plugins_loaded', array( __CLASS__, 'maybe_load' ), 21 );
	}

	/**
	 * @return string
	 */
	public static function vendor_dir() {
		return trailingslashit( dirname( __DIR__ ) ) . 'vendor/';
	}

	/**
	 * @return bool
	 */
	public static function woocommerce_ready() {
		return class_exists( 'WooCommerce', false );
	}

	/**
	 * @return bool
	 */
	public static function is_plugin_loaded() {
		return (bool) apply_filters( 'webino_torob_extractor_loaded', defined( 'TOROB_EXTRACTOR_WC_LOADED' ) && TOROB_EXTRACTOR_WC_LOADED );
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function status() {
		return array(
			'woocommerce_ready' => self::woocommerce_ready(),
			'plugin_loaded'     => self::is_plugin_loaded(),
			'plugin_source'     => self::plugin_source(),
			'standalone_active' => self::standalone_plugin_active(),
			'bundled_present'   => is_readable( self::vendor_dir() . self::BUNDLED_ENTRY ),
		);
	}

	/**
	 * @return void
	 */
	public static function maybe_load() {
		if ( ! self::woocommerce_ready() || self::is_plugin_loaded() || self::standalone_plugin_active() ) {
			return;
		}
		$path = self::vendor_dir() . self::BUNDLED_ENTRY;
		if ( is_readable( $path ) ) {
			require_once $path;
			if ( ! defined( 'TOROB_EXTRACTOR_WC_LOADED' ) ) {
				define( 'TOROB_EXTRACTOR_WC_LOADED', true );
			}
		}
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
	 * @return string
	 */
	private static function plugin_source() {
		if ( self::is_plugin_loaded() ) {
			return self::standalone_plugin_active() ? 'standalone' : 'bundled';
		}
		if ( self::standalone_plugin_active() ) {
			return 'standalone';
		}
		if ( is_readable( self::vendor_dir() . self::BUNDLED_ENTRY ) ) {
			return 'bundled_pending';
		}
		return 'missing';
	}
}
