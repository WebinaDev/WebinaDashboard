<?php
/**
 * Professional flat rate from city term meta.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers webino_flat_city shipping method.
 */
class Webino_Shipping_Method_Flat_City {

	/**
	 * @return void
	 */
	public static function register() {
		add_action( 'woocommerce_shipping_init', array( __CLASS__, 'load' ) );
		add_filter( 'woocommerce_shipping_methods', array( __CLASS__, 'add' ) );
	}

	/**
	 * @return void
	 */
	public static function load() {
		if ( class_exists( 'WC_Shipping_Webino_Flat_City', false ) ) {
			return;
		}
		require_once dirname( __FILE__ ) . '/class-wc-shipping-webino-flat-city.php';
	}

	/**
	 * @param array $methods Methods.
	 * @return array
	 */
	public static function add( $methods ) {
		$methods['webino_flat_city'] = 'WC_Shipping_Webino_Flat_City';
		return $methods;
	}
}
