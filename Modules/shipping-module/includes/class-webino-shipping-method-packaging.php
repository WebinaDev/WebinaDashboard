<?php
/**
 * WooCommerce shipping method: packaging cost from packer.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers webino_packaging shipping method.
 */
class Webino_Shipping_Method_Packaging {

	/**
	 * @return void
	 */
	public static function register() {
		add_action( 'woocommerce_shipping_init', array( __CLASS__, 'load_method_class' ) );
		add_filter( 'woocommerce_shipping_methods', array( __CLASS__, 'add_method' ) );
	}

	/**
	 * @return void
	 */
	public static function load_method_class() {
		if ( class_exists( 'WC_Shipping_Webino_Packaging', false ) ) {
			return;
		}
		require_once dirname( __FILE__ ) . '/class-wc-shipping-webino-packaging.php';
	}

	/**
	 * @param array<string, string> $methods Methods.
	 * @return array<string, string>
	 */
	public static function add_method( $methods ) {
		$methods['webino_packaging'] = 'WC_Shipping_Webino_Packaging';
		return $methods;
	}
}
