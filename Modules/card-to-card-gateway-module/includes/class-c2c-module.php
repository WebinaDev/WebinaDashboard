<?php
/**
 * Register card-to-card WooCommerce gateway.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Module hooks.
 */
final class Webino_C2C_Module {

	/**
	 * @return void
	 */
	public static function init() {
		add_filter( 'woocommerce_payment_gateways', array( __CLASS__, 'register_gateway' ) );
		Webino_C2C_Receipts::init();
	}

	/**
	 * @param list<string> $methods Methods.
	 * @return list<string>
	 */
	public static function register_gateway( $methods ) {
		if ( class_exists( 'WC_Gateway_C2C', false ) ) {
			$methods[] = 'WC_Gateway_C2C';
		}
		return $methods;
	}
}
