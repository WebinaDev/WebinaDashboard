<?php
/**
 * Register Bale Pay WooCommerce gateway.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Module hooks.
 */
final class Webino_Bale_Pay_Module {

	/**
	 * @return void
	 */
	public static function init() {
		add_filter( 'woocommerce_payment_gateways', array( __CLASS__, 'register_gateway' ) );
	}

	/**
	 * @param list<string> $methods Methods.
	 * @return list<string>
	 */
	public static function register_gateway( $methods ) {
		if ( class_exists( 'WC_Gateway_Bale_Pay', false ) ) {
			$methods[] = 'WC_Gateway_Bale_Pay';
		}
		return $methods;
	}
}
