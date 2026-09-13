<?php
/**
 * Register WooCommerce shipping methods for Tapin.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * WC method registration.
 */
class Webino_Tapin_Shipping_Methods {

	/**
	 * @return void
	 */
	public static function register() {
		add_action( 'woocommerce_shipping_init', array( __CLASS__, 'load_classes' ) );
		add_filter( 'woocommerce_shipping_methods', array( __CLASS__, 'add_methods' ) );
	}

	/**
	 * @return void
	 */
	public static function load_classes() {
		if ( class_exists( 'WC_Shipping_Webino_Tapin_Base', false ) ) {
			return;
		}
		require_once dirname( __FILE__ ) . '/class-wc-shipping-webino-tapin-methods.php';
	}

	/**
	 * @param array<string, string> $methods Methods.
	 * @return array<string, string>
	 */
	public static function add_methods( $methods ) {
		$methods['webino_tapin_pishtaz']   = 'WC_Shipping_Webino_Tapin_Pishtaz';
		$methods['webino_tapin_vip']       = 'WC_Shipping_Webino_Tapin_Vip';
		$methods['webino_tapin_tipax']     = 'WC_Shipping_Webino_Tapin_Tipax';
		$methods['webino_courier']        = 'WC_Shipping_Webino_Courier';
		$methods['webino_tapin_tipax_api'] = 'WC_Shipping_Webino_Tapin_Tipax_Api';
		$methods['webino_tapin_alonomic']  = 'WC_Shipping_Webino_Tapin_Alonomic';
		$methods['webino_pishtaz_1405']   = 'WC_Shipping_Webino_Pishtaz_1405';
		return $methods;
	}
}
