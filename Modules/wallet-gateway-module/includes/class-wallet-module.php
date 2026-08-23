<?php
/**
 * Register store wallet WooCommerce gateway.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Module hooks.
 */
final class Webino_Wallet_Module {

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
		if ( ! class_exists( 'WC_Gateway_Webino_Wallet', false ) ) {
			$file = WEBINO_DASHBOARD_DIR . 'includes/woocommerce/class-wc-gateway-webino-wallet.php';
			if ( is_readable( $file ) ) {
				require_once $file;
			}
		}
		if ( class_exists( 'WC_Gateway_Webino_Wallet', false ) ) {
			$methods[] = 'WC_Gateway_Webino_Wallet';
		}
		return $methods;
	}
}
