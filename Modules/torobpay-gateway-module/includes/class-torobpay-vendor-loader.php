<?php
/**
 * Loads the bundled TorobPay vendor plugin or defers to a standalone install.
 *
 * The module ships first-party REST/config code and needs the upstream
 * `torobpay-woocommerce-gateway` plugin for the actual gateway class. It may live
 * either in this module's vendor/ ZIP payload or in wp-content/plugins/.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Vendor bootstrap for the TorobPay gateway module.
 */
final class Webino_TorobPay_Vendor_Loader {

	const STANDALONE_PLUGIN = 'torobpay-woocommerce-gateway/index.php';

	/** @var list<string> */
	const BUNDLED_ENTRIES = array(
		'torobpay-woocommerce-gateway/index.php',
		'torobpay-woocommerce-gateway/torobpay-woocommerce-gateway.php',
	);

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'plugins_loaded', array( __CLASS__, 'maybe_load' ), 20 );
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
	 * Upstream plugin already loaded (bundled or standalone).
	 *
	 * @return bool
	 */
	public static function is_plugin_loaded() {
		return (bool) apply_filters(
			'webino_torobpay_vendor_loaded',
			defined( 'TOROBPAY_WC_LOADED' ) && TOROBPAY_WC_LOADED
		);
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
			'bundled_present'   => null !== self::bundled_path(),
		);
	}

	/**
	 * @return void
	 */
	public static function maybe_load() {
		if ( ! self::woocommerce_ready() || self::is_plugin_loaded() || self::standalone_plugin_active() ) {
			return;
		}
		$path = self::bundled_path();
		if ( null === $path ) {
			return;
		}
		require_once $path;
		if ( ! defined( 'TOROBPAY_WC_LOADED' ) ) {
			define( 'TOROBPAY_WC_LOADED', true );
		}
	}

	/**
	 * First readable bundled entry, or null.
	 *
	 * @return string|null
	 */
	private static function bundled_path() {
		foreach ( self::BUNDLED_ENTRIES as $relative ) {
			$path = self::vendor_dir() . $relative;
			if ( is_readable( $path ) ) {
				return $path;
			}
		}
		return null;
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
		if ( null !== self::bundled_path() ) {
			return 'bundled_pending';
		}
		return 'missing';
	}
}
