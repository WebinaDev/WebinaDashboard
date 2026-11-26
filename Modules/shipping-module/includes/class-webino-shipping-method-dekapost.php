<?php
/**
 * Registers the webino_dekapost shipping method and its settings screen hooks.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Dekapost shipping method registration.
 */
class Webino_Shipping_Method_Dekapost {

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
		if ( class_exists( 'WC_Shipping_Webino_Dekapost', false ) ) {
			return;
		}
		require_once dirname( __FILE__ ) . '/class-wc-shipping-webino-dekapost.php';
	}

	/**
	 * @param array<string, string> $methods Methods.
	 * @return array<string, string>
	 */
	public static function add_method( $methods ) {
		$methods['webino_dekapost'] = 'WC_Shipping_Webino_Dekapost';
		return $methods;
	}
}
